import { NextRequest, NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
  onError: (error) => console.error('LemonSqueezy API error:', error),
});

const VARIANT_IDS: Record<string, string> = {
  'free': 'free-plan',
  'pro-monthly': 'pro-monthly', // Replace with actual variant ID from LemonSqueezy
  'business': 'business-monthly', // Replace with actual variant ID from LemonSqueezy
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get('variant') || 'pro-monthly';

  const variantId = VARIANT_IDS[variant] || variant;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!storeId) {
    return NextResponse.json(
      { error: 'LemonSqueezy store not configured' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: undefined, // Will be collected by LemonSqueezy
        custom: {
          source: 'landing-page',
        },
      },
    });

    if (error) {
      console.error('LemonSqueezy createCheckout error:', error.message || String(error));
      return NextResponse.json(
        { error: 'Failed to create checkout' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data?.data.attributes.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
