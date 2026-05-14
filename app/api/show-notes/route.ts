import { NextRequest, NextResponse } from 'next/server';
import { generateShowNotes } from '@/lib/ai/show-notes';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    if (transcript.length < 50) {
      return NextResponse.json({ error: 'Transcript too short' }, { status: 400 });
    }

    const showNotes = await generateShowNotes(transcript);

    return NextResponse.json({ success: true, ...showNotes });
  } catch (error) {
    console.error('[ShowNotes API Error]', error);
    const message = error instanceof Error ? error.message : 'Failed to generate show notes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
