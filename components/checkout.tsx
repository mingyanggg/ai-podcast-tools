'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: (options: {
        apiKey: string;
        onError: (error: Error) => void;
      }) => void;
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

interface CheckoutButtonProps {
  variantId: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'outline';
  disabled?: boolean;
}

function loadLemonSqueezyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.LemonSqueezy) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load LemonSqueezy script'));
    document.head.appendChild(script);
  });
}

export function useLemonSqueezy() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
      setError(new Error('LemonSqueezy API key not configured'));
      return;
    }

    loadLemonSqueezyScript()
      .then(() => {
        window.LemonSqueezy?.Setup({
          apiKey,
          onError: (err) => {
            console.error('LemonSqueezy error:', err);
            setError(err);
          },
        });
        setIsReady(true);
      })
      .catch(setError);
  }, []);

  const openCheckout = (url: string) => {
    if (window.LemonSqueezy?.Url) {
      window.LemonSqueezy.Url.Open(url);
    }
  };

  return { isReady, error, openCheckout };
}

export function CheckoutButton({
  variantId,
  children,
  className = '',
  variant = 'default',
  disabled = false,
}: CheckoutButtonProps) {
  const { openCheckout, isReady } = useLemonSqueezy();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL || 'https://ai-podcast-tools.lemonsqueezy.com';

  const handleCheckout = async () => {
    if (!checkoutUrl) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/checkout?variant=${variantId}`);
        const data = await response.json();
        if (data.url) {
          setCheckoutUrl(data.url);
          openCheckout(data.url);
        }
      } catch (err) {
        console.error('Failed to create checkout:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      openCheckout(checkoutUrl);
    }
  };

  const variantStyles = {
    default: 'bg-foreground text-background hover:bg-foreground/90',
    highlight: 'bg-background text-foreground hover:bg-background/90',
    outline: 'border border-foreground/20 hover:bg-foreground/5',
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading || !isReady}
      className={`rounded-full py-2.5 px-6 text-sm font-medium text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

export function ProPlanButton({ className = '' }: { className?: string }) {
  const { openCheckout, isReady } = useLemonSqueezy();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout?variant=pro-monthly');
      const data = await response.json();
      if (data.url) {
        openCheckout(data.url);
      }
    } catch (err) {
      console.error('Failed to open checkout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={!isReady || isLoading}
      className={`rounded-full bg-foreground text-background hover:bg-foreground/90 py-2.5 px-6 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? 'Loading...' : 'Start Free Trial'}
    </button>
  );
}

export function PricingCardCheckout({
  planName,
  variantId,
  cta,
  highlight,
}: {
  planName: string;
  variantId: string;
  cta: string;
  highlight: boolean;
}) {
  const { openCheckout, isReady } = useLemonSqueezy();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/checkout?variant=${variantId}`);
      const data = await response.json();
      if (data.url) {
        openCheckout(data.url);
      }
    } catch (err) {
      console.error('Failed to open checkout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={!isReady || isLoading}
      className={`rounded-full py-2.5 px-6 text-sm font-medium text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        highlight
          ? 'bg-background text-foreground hover:bg-background/90'
          : 'bg-foreground text-background hover:bg-foreground/90'
      }`}
    >
      {isLoading ? 'Loading...' : cta}
    </button>
  );
}
