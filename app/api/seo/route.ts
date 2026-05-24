import { NextRequest, NextResponse } from 'next/server';
import { generateSeoOptimizedContent } from '@/lib/ai/seo';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentTitle, currentDescription, podcastNiche } = body;

    if (!currentTitle || typeof currentTitle !== 'string') {
      return NextResponse.json({ error: 'Current title is required' }, { status: 400 });
    }

    if (!currentDescription || typeof currentDescription !== 'string') {
      return NextResponse.json({ error: 'Current description is required' }, { status: 400 });
    }

    const seoResult = await generateSeoOptimizedContent(
      currentTitle,
      currentDescription,
      podcastNiche
    );

    return NextResponse.json({ success: true, ...seoResult });
  } catch (error) {
    console.error('[SEO API Error]', error);
    const message = error instanceof Error ? error.message : 'Failed to generate SEO content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
