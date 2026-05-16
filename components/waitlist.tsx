'use client';

import { useState, useCallback } from 'react';
import { Mail, Check, Loader2, ArrowRight } from 'lucide-react';

export function WaitlistBanner() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/waitlist');
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch count on mount
  if (count === null) {
    fetchCount();
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setStatus('loading');
      setMessage('');

      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
          setCount(data.count);
          setEmail('');
        } else {
          setStatus('error');
          setMessage(data.error || 'Something went wrong');
        }
      } catch {
        setStatus('error');
        setMessage('Failed to join waitlist. Please try again.');
      }
    },
    [email]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      {status === 'success' ? (
        <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 font-medium text-center">{message}</p>
            {count !== null && (
              <p className="text-emerald-400/70 text-sm text-center mt-0.5">
                {count} {count === 1 ? 'person' : 'people'} already waiting
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-slate-800/60 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 transition"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Join Waitlist <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {status === 'error' && message && (
            <p className="text-red-400 text-xs mt-2 text-center sm:text-left pl-1">{message}</p>
          )}
        </form>
      )}
      {count !== null && status !== 'success' && (
        <p className="text-slate-500 text-xs text-center mt-2">
          Join {count > 0 ? `${count} others already ` : ''}waiting for early access
        </p>
      )}
    </div>
  );
}
