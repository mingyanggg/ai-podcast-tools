'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mic, Search, Sparkles, Copy, Check, Loader2, AlertCircle, ArrowLeft, RefreshCw, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface SeoResult {
  optimizedTitle: string;
  optimizedDescription: string;
  shortDescription: string;
  tags: string[];
  episodeTitles: string[];
  showNotes: string;
  keywords: string[];
  timestamp: string;
}

export default function SeoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [podcastNiche, setPodcastNiche] = useState('');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTitle.trim() || !currentDescription.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTitle, currentDescription, podcastNiche }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate SEO content');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setCurrentTitle('');
    setCurrentDescription('');
    setPodcastNiche('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Podcast SEO Optimizer</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Podcast SEO Optimizer</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Boost your podcast discoverability with AI-optimized titles, descriptions, tags, and keywords for Apple Podcasts, Spotify, and Google.
          </p>
        </div>

        {!result ? (
          /* Input Form */
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/70 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Episode / Podcast Title
                </label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g., Episode 42: The Future of AI with John Smith"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
                  required
                />
              </div>

              {/* Current Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Description
                </label>
                <textarea
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  placeholder="Paste your current podcast description or episode summary here..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition resize-none"
                  required
                />
              </div>

              {/* Podcast Niche (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Podcast Niche <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={podcastNiche}
                  onChange={(e) => setPodcastNiche(e.target.value)}
                  placeholder="e.g., Technology, Business, True Crime, Comedy"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !currentTitle.trim() || !currentDescription.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium text-sm transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating SEO Optimized Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Optimize for SEO
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Success header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">SEO Optimization Complete</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Optimize Another
              </button>
            </div>

            {/* Optimized Title */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Optimized Title
                </h3>
                <button
                  onClick={() => handleCopy(result.optimizedTitle, 'title')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'title' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xl font-semibold text-white">{result.optimizedTitle}</p>
              <p className="text-xs text-slate-500 mt-2">{result.optimizedTitle.length}/60 characters</p>
            </div>

            {/* Episode Title Variations */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Episode Title Variations
                </h3>
                <button
                  onClick={() => handleCopy(result.episodeTitles.join('\n'), 'titles')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'titles' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'titles' ? 'Copied!' : 'Copy All'}
                </button>
              </div>
              <div className="space-y-2">
                {result.episodeTitles.map((title, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40">
                    <span className="text-xs text-slate-600 font-mono mt-0.5">{i + 1}</span>
                    <p className="text-white text-sm flex-1">{title}</p>
                    <button
                      onClick={() => handleCopy(title, `title-${i}`)}
                      className="text-slate-600 hover:text-slate-400 transition"
                    >
                      {copiedField === `title-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Short Description */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Short Description (for Podcast Directories)
                </h3>
                <button
                  onClick={() => handleCopy(result.shortDescription, 'short')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'short' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed">{result.shortDescription}</p>
              <p className="text-xs text-slate-500 mt-2">{result.shortDescription.length} characters (target: 150-300)</p>
            </div>

            {/* Full Description */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Full Optimized Description
                </h3>
                <button
                  onClick={() => handleCopy(result.optimizedDescription, 'desc')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'desc' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{result.optimizedDescription}</p>
            </div>

            {/* Show Notes */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  AI-Generated Show Notes
                </h3>
                <button
                  onClick={() => handleCopy(result.showNotes, 'shownotes')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'shownotes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'shownotes' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{result.showNotes}</p>
            </div>

            {/* Tags */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-pink-400" />
                  SEO Tags (15 tags for maximum discoverability)
                </h3>
                <button
                  onClick={() => handleCopy(result.tags.join(', '), 'tags')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'tags' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs hover:border-indigo-500/50 hover:text-indigo-300 transition cursor-pointer"
                    onClick={() => handleCopy(tag, `tag-${i}`)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  Top Keywords for Show Notes & Blog Posts
                </h3>
                <button
                  onClick={() => handleCopy(result.keywords.join(', '), 'keywords')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {copiedField === 'keywords' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'keywords' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <Link
                href="/podcast/transcribe"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Or transcribe a podcast episode first
              </Link>
            </div>
          </div>
        )}

        {/* Feature list */}
        <div className="mt-12 grid grid-cols-2 gap-4 text-center">
          {[
            { icon: '🎯', text: 'Apple Podcasts optimization' },
            { icon: '🎵', text: 'Spotify search ranking boost' },
            { icon: '🔍', text: 'Google Podcasts discoverability' },
            { icon: '📈', text: 'Keyword-rich descriptions' },
          ].map((f) => (
            <div key={f.text} className="rounded-xl bg-slate-900/40 border border-slate-800/40 p-4">
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <p className="text-xs text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
