import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/whisper';
import { checkQuota, recordUsage } from '@/lib/usage';
import { getCurrentUser, uploadAudio, saveTranscription } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 120; // 120 seconds for large files

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

    // Estimate audio duration from file size (rough: 1MB ≈ 1 min for MP3 at 128kbps)
    const estimatedDurationSeconds = Math.ceil((file.size / (128 * 1024 / 8)) * 60);

    // Check authentication and quota
    const user = await getCurrentUser();
    if (user) {
      const quota = await checkQuota(user.id, estimatedDurationSeconds);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: 'Monthly transcription limit reached',
            reason: quota.reason,
            usedMinutes: quota.usedMinutes,
            limitMinutes: quota.limitMinutes,
            upgradeUrl: '/#pricing',
          },
          { status: 403 }
        );
      }
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload audio to Supabase Storage (before transcription so we have the URL ready)
    let audioUrl = '';
    if (user) {
      const uploadedUrl = await uploadAudio(user.id, buffer, file.name, file.type);
      if (uploadedUrl) {
        audioUrl = uploadedUrl;
      }
    }

    // Transcribe
    const result = await transcribeAudio(buffer, file.name);
    const actualDuration = result.duration ?? estimatedDurationSeconds;

    // Record usage after successful transcription
    if (user) {
      await recordUsage(user.id, actualDuration).catch((err) => {
        console.error('[Usage Record Failed]', err);
      });

      // Persist transcription to database
      if (audioUrl) {
        await saveTranscription({
          userId: user.id,
          audioUrl,
          transcriptText: result.text,
          durationSeconds: actualDuration,
          language: result.language,
        }).catch((err) => {
          console.error('[Save Transcription Failed]', err);
        });
      }
    }

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
