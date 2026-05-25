'use client';

import { useState } from 'react';
import { Mail, Check, Loader2, AlertCircle, X } from 'lucide-react';

interface WaitlistSignupProps {
  variant?: 'inline' | 'modal';
  source?: string;
  className?: string;
}

export default function WaitlistSignup({
  variant = 'inline',
  source = 'website',
  className = '',
}: WaitlistSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setStatus('success');
      setMessage('🎉 You\'re in! 50% lifetime discount unlocked — check your email for details.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="your@email.com"
              disabled={status === 'loading' || status === 'success'}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition disabled:opacity-50 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success' || !email.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                Joined!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Get 50% Off
              </>
            )}
          </button>
        </form>

        {message && status === 'error' && (
          <p className="mt-2 text-red-400 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {message}
          </p>
        )}

        {message && status === 'success' && (
          <p className="mt-2 text-emerald-400 text-xs">{message}</p>
        )}
      </div>
    );
  }

  // Modal variant trigger
  if (variant === 'modal') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={className}
        >
          Join Waitlist
        </button>

        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/50 p-8 shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get 50% Off Forever</h3>
                <p className="text-slate-400 text-sm">
                  Join the waitlist and lock in a lifetime 50% discount when we launch.
                </p>
              </div>

              {status === 'success' ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-emerald-300 font-medium mb-2">You&apos;re on the list! 🎉</p>
                  <p className="text-slate-400 text-sm">{message}</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-4 text-slate-500 hover:text-white text-sm transition"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="your@email.com"
                      disabled={status === 'loading'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition disabled:opacity-50"
                      autoFocus
                    />
                  </div>

                  {message && status === 'error' && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join the Waitlist'
                    )}
                  </button>

                  <p className="text-center text-slate-600 text-xs">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}