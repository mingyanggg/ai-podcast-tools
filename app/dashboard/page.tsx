'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Upload, FileAudio, Sparkles, LogOut, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface TranscriptionRecord {
  id: string;
  audio_url: string;
  duration_seconds: number | null;
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState<TranscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setUserEmail(user.email ?? null);

    // Load recent transcriptions from the database
    const { data: transcriptions } = await (supabase as any)
      .from('transcriptions')
      .select('id, audio_url, duration_seconds, created_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transcriptions) {
      setRecentTasks(transcriptions as TranscriptionRecord[]);
      setTaskCount(transcriptions.filter((t) => t.status === 'completed').length);
    }

    // Calculate used minutes from usage_records
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const { data: usageData } = await (supabase as any)
      .from('usage_records')
      .select('total_seconds')
      .eq('user_id', user.id)
      .eq('month', monthStart)
      .single();

    if (usageData) {
      setUsedMinutes(Math.ceil((usageData.total_seconds || 0) / 60));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">AI Podcast Tools</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/podcast/transcribe"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              <Upload className="w-4 h-4" />
              New Transcription
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-slate-400">
            {userEmail ? `Managing ${userEmail}` : 'Manage your podcast transcriptions and content'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Transcription Used', value: `${usedMinutes} min`, sub: '60 min included', icon: Mic, color: 'indigo' },
            { label: 'This Month', value: `${taskCount} tasks`, sub: `${taskCount} completed`, icon: CheckCircle2, color: 'emerald' },
            { label: 'Queue', value: '0 pending', sub: 'All clear', icon: Clock, color: 'amber' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl bg-slate-900/80 border border-slate-800/70 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  stat.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400' :
                  stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-slate-500 text-xs">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{loading ? '—' : stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Transcribe & Create</h2>
            <p className="text-slate-400 text-xs mb-4">
              Upload audio and get AI show notes, timestamps, and social clips.
            </p>
            <Link
              href="/podcast/transcribe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Start Transcribing
            </Link>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-amber-600/15 to-orange-600/15 border border-amber-500/20 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Boost Discoverability</h2>
            <p className="text-slate-400 text-xs mb-4">
              Optimize titles, descriptions, and tags for Apple Podcasts & Spotify.
            </p>
            <Link
              href="/podcast/seo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition"
            >
              <Search className="w-3.5 h-3.5" />
              SEO Optimizer
            </Link>
          </div>
        </div>

        {/* Recent tasks */}
        <div>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Tasks
          </h2>
          {!loading && recentTasks.length === 0 ? (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/50 p-8 text-center">
              <FileAudio className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-1">No transcriptions yet</p>
              <p className="text-slate-500 text-sm">Your transcription history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {task.audio_url ? task.audio_url.split('/').pop()?.replace(/^\d+\./, '') ?? 'Transcription' : 'Transcription'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatDuration(task.duration_seconds)} · {formatDate(task.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    task.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {task.status === 'completed' ? 'Done' : task.status === 'processing' ? 'Processing' : 'Error'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
