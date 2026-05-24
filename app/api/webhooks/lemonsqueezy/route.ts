import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { serviceRoleClient } from '@/lib/supabase/client';

/**
 * LemonSqueezy webhook handler for subscription tier sync.
 * Handles: subscription.created, subscription.updated, subscription.deleted
 *
 * Required env vars:
 *   LEMONSQUEEZY_WEBHOOK_SECRET - from LemonSqueezy webhook settings
 */

const VALID_EVENTS = [
  'subscription_created',
  'subscription_updated',
  'subscription_deleted',
] as const;

type LemonSqueezyEvent = typeof VALID_EVENTS[number];

/** Map LemonSqueezy variant names to internal plan tiers */
function mapVariantToPlan(variantName: string | null | undefined): 'free' | 'pro' | 'business' {
  if (!variantName) return 'free';
  const name = variantName.toLowerCase();
  if (name.includes('business')) return 'business';
  if (name.includes('pro')) return 'pro';
  return 'free';
}

/** Verify the HMAC-SHA256 signature on the webhook payload */
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/** Extract the subscriber email from a LemonSqueezy subscription object */
function getSubscriberEmail(body: Record<string, unknown>): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (body as any).data?.attributes;
  return data?.user_email ?? data?.customer_email ?? null;
}

/** Update a user's subscription_tier in the users table */
async function updateUserSubscriptionTier(
  email: string,
  plan: 'free' | 'pro' | 'business'
): Promise<void> {
  if (!serviceRoleClient) {
    console.error('[LemonSqueezy Webhook] serviceRoleClient not initialized — SUPABASE_SERVICE_ROLE_KEY may be missing');
    return;
  }

  const { error } = await serviceRoleClient
    .from('users')
    .update({ subscription_tier: plan, updated_at: new Date().toISOString() })
    .eq('email', email);

  if (error) {
    console.error(`[LemonSqueezy Webhook] Failed to update subscription_tier for ${email}:`, error);
    throw error;
  }

  console.log(`[LemonSqueezy Webhook] Updated ${email} → ${plan}`);
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[LemonSqueezy Webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const signature = req.headers.get('x-signature') ?? '';
  const rawBody = await req.text();

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[LemonSqueezy Webhook] Invalid signature — rejecting request');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventName = (payload as any).meta?.event_name as string | undefined;

  if (!eventName || !VALID_EVENTS.includes(eventName as LemonSqueezyEvent)) {
    // Acknowledge unknown events so LemonSqueezy doesn't retry
    return NextResponse.json({ received: true });
  }

  const email = getSubscriberEmail(payload);
  if (!email) {
    console.error('[LemonSqueezy Webhook] Could not extract subscriber email from payload');
    return NextResponse.json({ error: 'Missing subscriber email' }, { status: 400 });
  }

  try {
    if (eventName === 'subscription_deleted') {
      await updateUserSubscriptionTier(email, 'free');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variantName = (payload as any).data?.attributes?.variant_name as string | undefined;
      const plan = mapVariantToPlan(variantName);
      await updateUserSubscriptionTier(email, plan);
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
