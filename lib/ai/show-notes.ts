import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

export interface ShowNotesResult {
  title: string;
  duration: string;
  timestamp: string;
  keyTakeaways: string[];
  guestBio?: string;
  clips: { platform: string; text: string; duration: string }[];
}

function estimateDuration(text: string): string {
  // Rough estimate: average speaking pace ~150 words/min
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 150);
  return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
}

export async function generateShowNotes(transcript: string): Promise<ShowNotesResult> {
  const prompt = `You are a professional podcast show notes generator. Given the transcript below, create comprehensive show notes.

Transcript:
${transcript}

Generate a JSON object with exactly this structure:
{
  "title": "Episode title (engaging, SEO-friendly)",
  "duration": "estimated duration in MM:SS format",
  "timestamp": "today's date in Month DD, YYYY format",
  "keyTakeaways": ["3-5 key insights from the episode"],
  "guestBio": "Guest biography if mentioned, otherwise omit",
  "clips": [
    {"platform": "Twitter/X", "text": "a punchy 1-sentence quote suitable for Twitter (max 280 chars)", "duration": "30s"},
    {"platform": "LinkedIn", "text": "a professional insight suitable for LinkedIn (max 300 chars)", "duration": "45s"}
  ]
}

Rules:
- keyTakeaways should be 3-5 bullets, each 10-30 words
- clips should be genuinely interesting/quotable moments
- title should be engaging and include relevant keywords
- Return ONLY the JSON, no markdown code blocks or explanation`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate show notes');
  }

  const result = JSON.parse(content) as ShowNotesResult;

  // Ensure duration is set
  if (!result.duration) {
    result.duration = estimateDuration(transcript);
  }
  if (!result.timestamp) {
    result.timestamp = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return result;
}
