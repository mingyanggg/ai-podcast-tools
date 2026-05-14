import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/whisper';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large files

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/aac'];
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: MP3, WAV, M4A, OGG, FLAC' },
        { status: 400 }
      );
    }

    // Max 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 500MB' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe
    const result = await transcribeAudio(buffer, file.name);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[Transcribe API Error]', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
