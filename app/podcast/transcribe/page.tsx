'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Mic, Upload, FileAudio, Sparkles, Download, Copy, Check, Loader2, AlertCircle, Scissors, FileText, ClosedCaptioning, FileJson } from 'lucide-react';

type Step = 'idle' | 'uploading' | 'transcribing' | 'generating' | 'extracting' | 'done' | 'error';

interface ShowNotes {
  title: string;
  duration: string;
  timestamp: string;
  keyTakeaways: string[];
  guestBio?: string;
  clips: { platform: string; text: string; duration: string }[];
}

interface ExtractedClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  filename: string | null;
  downloadUrl: string | null;
}

export default function TranscribePage() {
  const [step, setStep] = useState<Step>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showNotes, setShowNotes] = useState<ShowNotes | null>(null);
  const [extractedClips, setExtractedClips] = useState<ExtractedClip[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setError(null);
    setStep('uploading');
    setCurrentFile(file);
    setExtractedClips([]);

    try {
      // Step 1: Upload + Transcribe
      const formData = new FormData();
      formData.append('file', file);

      let transcriptText = '';
      let showNotesData: ShowNotes | null = null;

      // Upload and transcribe
      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      setStep('transcribing');

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error || 'Transcription failed');
      }

      const transcribeData = await transcribeRes.json();

      // Handle quota exceeded
      if (transcribeRes.status === 403 || transcribeData.error?.includes('limit')) {
        throw new Error(
          `Monthly limit reached (${transcribeData.limitMinutes} min). Upgrade to unlock more: https://aitoolsfactory.com/podcast-tools#pricing`
        );
      }

      transcriptText = transcribeData.text;
      setTranscript(transcriptText);

      // Step 2: Generate show notes
      setStep('generating');
      const notesRes = await fetch('/api/show-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText }),
      });

      if (!notesRes.ok) {
        const err = await notesRes.json();
        throw new Error(err.error || 'Failed to generate show notes');
      }

      showNotesData = await notesRes.json();
      setShowNotes(showNotesData);

      // Step 3: Extract audio clips
      setStep('extracting');
      try {
        const clipsFormData = new FormData();
        clipsFormData.append('file', file);
        clipsFormData.append('transcript', transcriptText);

        const clipsRes = await fetch('/api/clips', {
          method: 'POST',
          body: clipsFormData,
        });

        if (clipsRes.ok) {
          const clipsData = await clipsRes.json();
          setExtractedClips(clipsData.clips || []);
        }
      } catch {
        // Clip extraction failed — non-fatal, continue
        setExtractedClips([]);
      }

      setStep('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setStep('error');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg|flac)$/i))) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const copyTranscript = useCallback(() => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transcript]);

  const downloadAll = useCallback(() => {
    if (!transcript || !showNotes) return;

    const content = `
# ${showNotes.title}
Duration: ${showNotes.duration} | ${showNotes.timestamp}

## Transcript
${transcript}

## Key Takeaways
${showNotes.keyTakeaways.map((t) => `- ${t}`).join('\n')}

${showNotes.guestBio ? `## Guest Bio\n${showNotes.guestBio}\n` : ''}
## Suggested Social Clips
${showNotes.clips.map((c) => `[${c.platform}] ${c.text} (${c.duration})`).join('\n')}
`.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showNotes.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, showNotes]);

  const downloadTXT = useCallback(() => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showNotes?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'transcript'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, showNotes]);

  const downloadSRT = useCallback(() => {
    // Parse transcript into SRT format: sequential numbered blocks with timestamp
    // Each block: index, timestamp (00:00:00 --> 00:00:00), text
    // Use the transcript text split by sentences/paragraphs
    if (!transcript) return;
    const lines = transcript.split('\n').filter(l => l.trim());
    let srtContent = '';
    lines.forEach((line, i) => {
      const startSec = i * 30; // 30s per block as placeholder
      const endSec = startSec + 30;
      const toSRTTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
      };
      srtContent += `${i + 1}\n${toSRTTime(startSec)} --> ${toSRTTime(endSec)}\n${line}\n\n`;
    });
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showNotes?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'transcript'}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, showNotes]);

  const downloadJSON = useCallback(() => {
    if (!transcript || !showNotes) return;
    const data = {
      title: showNotes.title,
      duration: showNotes.duration,
      timestamp: showNotes.timestamp,
      transcript,
      keyTakeaways: showNotes.keyTakeaways,
      guestBio: showNotes.guestBio,
      clips: showNotes.clips,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showNotes.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? 'transcript'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, showNotes]);

  const getStepLabel = () => {
    switch (step) {
      case 'uploading': return 'Uploading...';
      case 'transcribing': return 'Whisper is transcribing your audio...';
      case 'generating': return 'AI is generating show notes...';
      case 'extracting': return 'Extracting the best audio clips...';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'uploading': return <Upload className="w-5 h-5 text-indigo-400" />;
      case 'transcribing': return <Mic className="w-5 h-5 text-indigo-400" />;
      case 'generating': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'extracting': return <Scissors className="w-5 h-5 text-indigo-400" />;
      default: return null;
    }
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
            Upload any audio file. Whisper transcribes it.
            Then AI generates timestamps, show notes, and social clips automatically.
          </p>
        </div>

        {/* Upload zone — idle */}
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

        {/* Processing state */}
        {(step === 'uploading' || step === 'transcribing' || step === 'generating') && (
          <div className="border border-slate-700 rounded-2xl p-8 bg-slate-900/70">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                {step === 'transcribing'
                  ? <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  : getStepIcon()}
              </div>
              <div>
                <p className="text-white font-medium">{fileName}</p>
                <p className="text-indigo-400 text-sm flex items-center gap-1.5">
                  {step === 'transcribing' && <Mic className="w-3 h-3" />}
                  {step === 'generating' && <Sparkles className="w-3 h-3" />}
                  {getStepLabel()}
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full animate-pulse"
                style={{
                  width: step === 'uploading' ? '20%' : step === 'transcribing' ? '50%' : step === 'generating' ? '75%' : step === 'extracting' ? '95%' : '100%',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Done — show results */}
        {step === 'done' && showNotes && (
          <div className="space-y-6">
            {/* Success banner */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Transcription complete — ready to use</span>
            </div>

            {/* Transcript */}
            <div className="border border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-slate-400" />
                  <span className="text-white font-medium">Transcript</span>
                  {showNotes.duration && (
                    <span className="text-slate-500 text-sm">{showNotes.duration}</span>
                  )}
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
                  {transcript}
                </pre>
              </div>
            </div>

            {/* Show Notes */}
            <div className="border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-medium">AI-Generated Show Notes</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">Generated in ~8s</span>
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

                {showNotes.guestBio && (
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Guest Bio</p>
                    <p className="text-slate-300 text-sm">{showNotes.guestBio}</p>
                  </div>
                )}

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
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              <button
                onClick={() => {
                  setStep('idle');
                  setShowNotes(null);
                  setTranscript('');
                  setError(null);
                  setExtractedClips([]);
                  setCurrentFile(null);
                }}
                className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm transition"
              >
                Try Another File
              </button>
            </div>

            {/* Export panel */}
            {transcript && (
              <div className="border border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span className="text-white font-medium">Export Results</span>
                  <span className="text-xs text-slate-500 ml-auto">TXT · SRT · JSON</span>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'TXT', desc: 'Plain text transcript', icon: FileText, fn: downloadTXT },
                      { label: 'SRT', desc: 'Subtitles for video', icon: ClosedCaptioning, fn: downloadSRT },
                      { label: 'JSON', desc: 'Structured data', icon: FileJson, fn: downloadJSON },
                    ].map(({ label, desc, icon: Icon, fn }) => (
                      <button
                        key={label}
                        onClick={fn}
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                        </div>
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{label}</p>
                          <p className="text-slate-500 text-xs">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Audio Clips */}
            {extractedClips.length > 0 && (
              <div className="border border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-indigo-400" />
                  <span className="text-white font-medium">Extracted Audio Clips</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">{extractedClips.length} clips</span>
                </div>
                <div className="px-6 py-5 space-y-3 bg-slate-950/50">
                  {extractedClips.map((clip) => (
                    <div key={clip.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm line-clamp-2">{clip.text}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {Math.floor(clip.duration / 60)}:{String(Math.floor(clip.duration % 60)).padStart(2, '0')} · [{Math.floor(clip.startTime / 60)}:{String(Math.floor(clip.startTime % 60)).padStart(2, '0')} - {Math.floor(clip.endTime / 60)}:{String(Math.floor(clip.endTime % 60)).padStart(2, '0')}]
                        </p>
                      </div>
                      {clip.downloadUrl ? (
                        <a
                          href={clip.downloadUrl}
                          download={clip.filename || `clip-${clip.id}.mp3`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs px-3 py-1.5">No file</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {step === 'error' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-300 font-medium">Something went wrong</p>
                <p className="text-red-500/70 text-sm">{error}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => { setStep('idle'); setError(null); }}
                className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 text-sm transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Feature callouts */}
        {step === 'idle' && (
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { icon: Mic, title: 'Whisper AI', desc: 'OpenAI Whisper, 15+ languages' },
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
