/**
 * Usage quota management for AI Podcast Tools.
 * Enforces per-plan transcription minute limits.
 *
 * Plans:
 *   free:     60 min/month
 *   pro:      600 min/month (10 hours)
 *   business: unlimited (999999 min)
 */

export type Plan = 'free' | 'pro' | 'business';

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 60,
  pro: 600,
  business: 999999,
};

interface UsageRecord {
  user_id: string;
  month: string;
  total_seconds: number;
  created_at?: string;
  updated_at?: string;
}

/** Get the plan from a user ID via Supabase users table lookup */
export async function getUserPlan(userId: string): Promise<Plan> {
  try {
    const { serviceRoleClient } = await import('@/lib/supabase/client');

    if (!serviceRoleClient) {
      console.warn('[getUserPlan] serviceRoleClient not available, defaulting to free');
      return 'free';
    }

    // Look up the user's subscription tier using their auth UID
    const { data, error } = await serviceRoleClient
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getUserPlan] Error fetching user plan:', error);
      return 'free';
    }

    if (!data) {
      return 'free';
    }

    return data.subscription_tier as Plan;
  } catch (err) {
    console.error('[getUserPlan] Unexpected error:', err);
    return 'free';
  }
}

/**
 * Check if a user has remaining transcription quota.
 * Returns { allowed: true } or { allowed: false, reason: string }
 */
export async function checkQuota(userId: string, audioDurationSeconds: number): Promise<{
  allowed: boolean;
  reason?: string;
  usedMinutes?: number;
  limitMinutes?: number;
}> {
  const plan = await getUserPlan(userId);
  const limitMinutes = PLAN_LIMITS[plan];
  const audioMinutes = Math.ceil(audioDurationSeconds / 60);

  // For business plan, always allow
  if (plan === 'business') {
    return { allowed: true };
  }

  // Query current month usage
  const usedSeconds = await getCurrentMonthUsage(userId);
  const usedMinutes = Math.ceil(usedSeconds / 60);
  const remainingMinutes = limitMinutes - usedMinutes;

  if (audioMinutes > remainingMinutes) {
    return {
      allowed: false,
      reason: `Over monthly limit. You have used ${usedMinutes}/${limitMinutes} min this month on the ${plan} plan.`,
      usedMinutes,
      limitMinutes,
    };
  }

  return { allowed: true, usedMinutes, limitMinutes };
}

/**
 * Record a transcription usage event.
 * Should be called after a successful transcription.
 */
export async function recordUsage(userId: string, audioDurationSeconds: number): Promise<void> {
  const { supabase } = await import('@/lib/supabase/client');

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { error } = await sb.from('usage_records').upsert(
    [
      {
        user_id: userId,
        month: monthStart,
        total_seconds: audioDurationSeconds,
        updated_at: new Date().toISOString(),
      },
    ],
    {
      onConflict: 'user_id,month',
    }
  );

  if (error) {
    console.error('[Usage Record Error]', error);
    // Non-fatal — don't fail the transcription if usage tracking fails
  }
}

/** Get the total seconds used this month for a user */
export async function getCurrentMonthUsage(userId: string): Promise<number> {
  const { supabase } = await import('@/lib/supabase/client');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const monthStart = getMonthStart();

  const { data, error } = await sb
    .from('usage_records')
    .select('total_seconds')
    .eq('user_id', userId)
    .eq('month', monthStart)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.total_seconds || 0;
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getMonthEnd(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
}
