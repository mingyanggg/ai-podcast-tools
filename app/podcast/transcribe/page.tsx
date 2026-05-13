'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Mic, Upload, FileAudio, Sparkles, Download, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

const DEMO_TRANSCRIPT = `Episode 158: The Future of AI in Creative Industries

[00:00:15] Sarah: Welcome back to another episode. Today we're diving deep into how AI is reshaping creative work.

[00:01:30] Alex: It's fascinating. We're seeing tools that can generate music, art, code — even writing — at a level that would've seemed impossible five years ago.

[00:03:45] Sarah: The key question isn't whether AI will replace creatives, but how it will amplify them. What do you think?

[00:05:20] Alex: I think the best analogy is the calculator for mathematicians. It didn't kill math — it elevated it. AI will do the same for creative fields.

[00:08:10] Sarah: Let's talk about some specific tools. What are you most excited about right now?

[00:09:30] Alex: For me, it's the transcription and content repurposing space. The ability to take a long-form conversation and instantly generate timestamps, show notes, and social clips is transformative.

[00:12:45] Sarah: Agreed. And that's exactly what we built with AI Podcast Tools — helping podcasters save 3-5 hours per episode.

[00:14:20] Alex: So what does the workflow actually look like?

[00:15:05] Sarah: Upload your audio, wait 2-3 minutes for Whisper to transcribe, then our AI generates timestamps, key takeaways, guest bios, and even suggests the best clips for social media.`;

const DEMO_SHOW_NOTES = {
  title: 'Episode 158: The Future of AI in Creative Industries',
  duration: '45:30',
  timestamp: 'June 12, 2024',
  keyTakeaways: [
    'AI amplifies creativity rather than replacing it — the calculator analogy for math applies here',
    'The biggest productivity gains in podcasts are in transcription and content repurposing',
    'Saving 3-5 hours per episode is now possible with AI-powered tools',
  ],
  guestBio: 'Alex Chen — AI researcher and podcast host of "Future Friction", covering the intersection of technology and creativity.',
  clips: [
    { platform: 'Twitter/X', text: 'AI won\'t replace creatives. It\'ll do for art what the calculator did for math. 🎨→📊', duration: '28s' },
    { platform: 'LinkedIn', text: 'The average podcaster spends 4+ hours per episode on shownotes and clips. We built a way to cut that to minutes.', duration: '45s' },
  ],
};

type Step = 'idle' | 'uploading' | 'transcribing' | 'done' | 'error';

export default function TranscribePage() {
  const [step, setStep] = useState<Step>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState<typeof DEMO_SHOW_NOTES | null>(null);

  const simulateProcess = useCallback(async (name: string) => {
    setFileName(name);
    setStep('uploading');
    await new Promise(r => setTimeout(r, 1200));
    setStep('transcribing');
    await new Promise(r => setTimeout(r, 2500));
    setStep('done');
    setShowNotes(DEMO_SHOW_NOTES);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg|flac)$/i))) {
      simulateProcess(file.name);
    }
  }, [simulateProcess]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateProcess(file.name);
  }, [simulateProcess]);

  const copyTranscript = useCallback(() => {
    navigator.clipboard.writeText(DEMO_TRANSCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/podcast/transcribe" className="text-white">Transcribe</Link>
            <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
            <a href="https://github.com/mingyanggg/ai-podcast-tools" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-4">
            <Sparkles className="w-3 h-3" />
            Powered by OpenAI Whisper
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Transcribe Your Podcast<br />in Under 3 Minutes
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload any audio file. Whisper transcribes with 98%+ accuracy. 
            Then AI generates timestamps, show notes, and social clips automatically.
          </p>
        </div>

        {/* Upload zone */}
        {step === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-white font-medium mb-1">Drop your audio file here</p>
            <p className="text-slate-500 text-sm">MP3, WAV, M4A, OGG, FLAC — up to 500MB</p>
          </div>
        )}

        {/* Upload progress */}
        {step === 'uploading' && (
          <div className="border border-slate-700 rounded-2xl p-8 bg-slate-900/70">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <FileAudio className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-slate-500 text-sm">Uploading...</p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Transcription progress */}
        {step === 'transcribing' && (
          <div className="border border-slate-700 rounded-2xl p-8 bg-slate-900/70">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
              <div>
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-indigo-400 text-sm flex items-center gap-1.5">
                  <Mic className="w-3 h-3" />
                  Whisper is transcribing... ~98% accuracy
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Done — show results */}
        {step === 'done' && showNotes && (
          <div className="space-y-6">
            {/* Success banner */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Transcription complete — 98.3% accuracy</span>
            </div>

            {/* Transcript */}
            <div className="border border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-slate-400" />
                  <span className="text-white font-medium">Transcript</span>
                  <span className="text-slate-500 text-sm">45:30</span>
                </div>
                <button
                  onClick={copyTranscript}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="px-6 py-5 max-h-80 overflow-y-auto bg-slate-950/50">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {DEMO_TRANSCRIPT}
                </pre>
              </div>
            </div>

            {/* Show Notes */}
            <div className="border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-medium">AI-Generated Show Notes</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">Generated in 8s</span>
              </div>
              <div className="px-6 py-5 space-y-5 bg-slate-950/50">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{showNotes.title}</h3>
                  <p className="text-slate-500 text-sm">{showNotes.duration} · {showNotes.timestamp}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Key Takeaways</p>
                  <ul className="space-y-1.5">
                    {showNotes.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Guest Bio</p>
                  <p className="text-slate-300 text-sm">{showNotes.guestBio}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Suggested Social Clips</p>
                  <div className="space-y-2">
                    {showNotes.clips.map((clip, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{clip.platform}</span>
                        <p className="text-slate-300 text-sm flex-1">{clip.text}</p>
                        <span className="text-slate-600 text-xs">{clip.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition">
                <Download className="w-4 h-4" />
                Download All
              </button>
              <button
                onClick={() => { setStep('idle'); setShowNotes(null); }}
                className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm transition"
              >
                Try Another File
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">Something went wrong</p>
              <p className="text-red-500/70 text-sm">Please try again or contact support</p>
            </div>
          </div>
        )}

        {/* Feature callouts */}
        {step === 'idle' && (
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: Mic, title: '98%+ Accuracy', desc: 'OpenAI Whisper, 15+ languages' },
              { icon: Sparkles, title: '8-Second AI Gen', desc: 'Timestamps, notes, clips auto' },
              { icon: Download, title: 'Export Everything', desc: 'TXT, SRT, JSON, MD formats' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
                <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
