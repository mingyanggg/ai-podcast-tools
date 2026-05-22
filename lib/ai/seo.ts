import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

export interface SeoResult {
  optimizedTitle: string;
  optimizedDescription: string;
  shortDescription: string; // 150-300 chars for podcast directories
  tags: string[];
  episodeTitles: string[]; // 5 title variations
  showNotes: string; // Full show notes paragraph
  keywords: string[]; // Top 10 keywords
  timestamp: string;
}

export async function generateSeoOptimizedContent(
  currentTitle: string,
  currentDescription: string,
  podcastNiche?: string
): Promise<SeoResult> {
  const nicheContext = podcastNiche ? `Podcast niche: ${podcastNiche}` : '';

  const prompt = `You are an expert Podcast SEO strategist. Optimize the following podcast metadata for maximum discoverability on Apple Podcasts, Spotify, Google Podcasts, and YouTube.

Current Title: "${currentTitle}"
Current Description: "${currentDescription}"
${nicheContext}

Generate a JSON object with exactly this structure:
{
  "optimizedTitle": "SEO-optimized podcast title (50-60 chars, include key search terms naturally)",
  "optimizedDescription": "Full episode/podcast description (300-500 words, compelling and keyword-rich)",
  "shortDescription": "Short description for podcast directories (150-300 chars, hook + value prop)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13", "tag14", "tag15"],
  "episodeTitles": ["Title variant 1", "Title variant 2", "Title variant 3", "Title variant 4", "Title variant 5"],
  "showNotes": "A compelling 2-3 paragraph show notes summary that drives listeners to engage",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "timestamp": "today's date in Month DD, YYYY format"
}

Rules:
- Include natural language keywords (what listeners actually search for)
- Tags: mix of broad (3-5) and specific (7-10) tags
- Episode titles should be curiosity-driven, click-worthy, and varied in style
- Short description must create urgency and clearly state the value
- optimizedTitle should be compelling AND keyword-optimized
- Return ONLY the JSON, no markdown code blocks or explanation`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.75,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate SEO content');
  }

  const result = JSON.parse(content) as SeoResult;

  if (!result.timestamp) {
    result.timestamp = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return result;
}
