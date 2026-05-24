import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(_cookies: { name: string; value: string }[]) {
          // Not needed for API routes — cookies are handled by middleware
        },
      },
    }
  );
}

/**
 * Get the current user from the Supabase session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Upload an audio file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadAudio(
  userId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'mp3';
    const safeExt = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext) ? ext : 'mp3';
    const path = `${userId}/${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error('[uploadAudio] Storage upload failed:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('audio').getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error('[uploadAudio] Unexpected error:', err);
    return null;
  }
}

/**
 * Persist a completed transcription and optional show notes to the database.
 * Should be called after a successful transcription.
 */
export async function saveTranscription(params: {
  userId: string;
  audioUrl: string;
  transcriptText: string;
  durationSeconds: number;
  language?: string;
  showNotes?: {
    summary?: string;
    timestamps?: unknown;
    keyTakeaways?: string[];
    tags?: string[];
  };
}): Promise<{ transcriptionId: string } | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: transcription, error: transError } = await supabase
      .from('transcriptions')
      .insert({
        user_id: params.userId,
        audio_url: params.audioUrl,
        transcript_text: params.transcriptText,
        duration_seconds: params.durationSeconds,
        language: params.language ?? null,
        status: 'completed',
      })
      .select('id')
      .single();

    if (transError || !transcription) {
      console.error('[saveTranscription] Insert failed:', transError);
      return null;
    }

    if (params.showNotes) {
      const { error: notesError } = await supabase.from('show_notes').insert({
        transcription_id: transcription.id,
        summary: params.showNotes.summary ?? null,
        timestamps: params.showNotes.timestamps ?? null,
        key_takeaways: params.showNotes.keyTakeaways ?? null,
        tags: params.showNotes.tags ?? null,
      });
      if (notesError) {
        console.error('[saveTranscription] show_notes insert failed:', notesError);
      }
    }

    return { transcriptionId: transcription.id };
  } catch (err) {
    console.error('[saveTranscription] Unexpected error:', err);
    return null;
  }
}
