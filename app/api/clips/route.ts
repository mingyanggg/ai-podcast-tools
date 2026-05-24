import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/whisper';
import { identifyBestClips, extractAudioClips, ExtractedClip } from '@/lib/ai/clips';
import { writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const transcriptText = formData.get('transcript') as string | null;
    const maxClips = Math.min(parseInt(formData.get('maxClips') as string) || 5, 10);

    if (!file && !transcriptText) {
      return NextResponse.json({ error: 'No file or transcript provided' }, { status: 400 });
    }

    // Validate file if provided
    if (file) {
      const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
      const hasValidExtension = allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      if (!hasValidExtension) {
        return NextResponse.json({ error: 'Unsupported audio format' }, { status: 400 });
      }
      if (file.size > 500 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 });
      }
    }

    let segments: { start: number; end: number; text: string }[] = [];
    let filePath = '';

    if (file && !transcriptText) {
      // Step 1: Transcribe the audio
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      filePath = path.join(process.cwd(), 'data', 'uploads', `${Date.now()}-${file.name}`);
      
      // Ensure directory exists
      const { mkdir } = await import('fs/promises');
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, buffer);

      const result = await transcribeAudio(buffer, file.name);

      // Parse segments from transcript text (format: [MM:SS] or [HH:MM:SS] text)
      const segmentRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.+)/g;
      let match;
      let lastEnd = 0;

      while ((match = segmentRegex.exec(result.text)) !== null) {
        const hours = match[3] ? parseInt(match[1]) : 0;
        const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
        const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
        const start = hours * 3600 + minutes * 60 + seconds;
        const text = match[4].trim();

        if (segments.length > 0) {
          segments[segments.length - 1].end = start;
        }

        segments.push({ start, end: start + 60, text });
        lastEnd = start + 60;
      }

      // If no timestamped format, create a single segment from the whole text
      if (segments.length === 0) {
        segments.push({
          start: 0,
          end: result.duration || 300,
          text: result.text,
        });
      } else {
        // Close the last segment
        segments[segments.length - 1].end = lastEnd;
      }
    } else if (transcriptText) {
      // Parse transcript text format: [MM:SS] text or plain text segments
      const segmentRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.+)/g;
      let match;
      let lastEnd = 0;

      while ((match = segmentRegex.exec(transcriptText)) !== null) {
        const hours = match[3] ? parseInt(match[1]) : 0;
        const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1]);
        const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2]);
        const start = hours * 3600 + minutes * 60 + seconds;
        const text = match[4].trim();

        if (segments.length > 0) {
          segments[segments.length - 1].end = start;
        }

        segments.push({ start, end: start + 60, text });
        lastEnd = start + 60;
      }

      if (segments.length === 0) {
        return NextResponse.json(
          { error: 'Transcript must contain timestamp markers like [00:30]' },
          { status: 400 }
        );
      }

      // Close the last segment
      segments[segments.length - 1].end = lastEnd;

      // If we have a file, save it for clip extraction
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        filePath = path.join(process.cwd(), 'data', 'uploads', `${Date.now()}-${file.name}`);
        const { mkdir } = await import('fs/promises');
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, buffer);
      }
    }

    if (segments.length === 0) {
      return NextResponse.json({ error: 'No segments found in transcript' }, { status: 400 });
    }

    // Step 2: Identify best clips
    const bestClips = identifyBestClips(segments, maxClips);

    if (bestClips.length === 0) {
      return NextResponse.json({
        clips: [],
        message: 'No suitable clips found. Try a longer transcript.',
      });
    }

    // Step 3: Extract audio clips if we have the file
    let extractedClips: ExtractedClip[] = [];
    if (filePath) {
      try {
        extractedClips = await extractAudioClips(filePath, bestClips);
      } catch (err) {
        console.error('Clip extraction failed:', err);
        // Return clip metadata even if extraction failed
      }
    }

    return NextResponse.json({
      success: true,
      clips: extractedClips.length > 0
        ? extractedClips.map((c) => ({
            id: c.id,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.duration,
            text: c.text,
            filename: c.filename,
            downloadUrl: `/api/clips/download?file=${c.filename}`,
          }))
        : bestClips.map((c, i) => ({
            id: `clip-${i}`,
            startTime: c.startTime,
            endTime: c.endTime,
            duration: c.endTime - c.startTime,
            text: c.text,
            filename: null,
            downloadUrl: null,
          })),
      totalSegments: segments.length,
    });
  } catch (error) {
    console.error('[Clips API Error]', error);
    const message = error instanceof Error ? error.message : 'Failed to extract clips';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
