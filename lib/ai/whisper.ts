import OpenAI from 'openai';

export interface TranscriptResult {
  text: string;
  language?: string;
  duration?: number;
}

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Transcribe an audio file using OpenAI Whisper API
 * Accepts a Buffer (audio file)
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string
): Promise<TranscriptResult> {
  // Create a file-like object from buffer
  const uint8Array = new Uint8Array(audioBuffer);
  const file = new File([uint8Array.buffer], filename, {
    type: getMimeType(filename),
  });

  const transcript = await getOpenAI().audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  // Build timestamped transcript
  let text = '';
  const segments = 'segments' in transcript ? transcript.segments : null;

  if (segments && segments.length > 0) {
    text = segments
      .map((seg) => {
        const start = formatTimestamp(seg.start);
        return `[${start}] ${seg.text.trim()}`;
      })
      .join('\n');
  } else {
    text = transcript.text;
  }

  return {
    text,
    language: 'language' in transcript ? (transcript.language ?? undefined) : undefined,
    duration: 'duration' in transcript ? (transcript.duration ?? undefined) : undefined,
  };
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    wma: 'audio/x-ms-wma',
  };
  return mimeTypes[ext ?? ''] ?? 'audio/mpeg';
}
