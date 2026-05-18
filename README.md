# AI Podcast Tools

AI-powered podcast production suite: automatic transcription, AI-generated show notes, smart clip extraction, and one-click multi-platform publishing.

**[Live Demo](https://aitoolsfactory.com/podcast-tools)** | **[Product Hunt](https://producthunt.com)**

## Features

### Core Features

- **🎙️ Audio Transcription** — Whisper-powered transcription, supports 15+ languages
- **📝 AI Show Notes Generator** — Automatically generate timestamps, summaries, and key takeaways
- **✂️ Smart Clip Extraction** — AI identifies the best moments for social clips (shorts/reels/tiktok)
- **📤 One-Click Publishing** — Publish to YouTube, Spotify, Apple Podcasts, and social media simultaneously
- **🎨 Audio Enhancement** — One-click noise reduction, audio leveling, and EQ

### Coming Soon

- [ ] Guest interview transcription with speaker diarization
- [ ] Multi-language translation and dubbing
- [ ] Podcast SEO optimizer (title, description, tags)
- [ ] Audience analytics dashboard

## Use Cases

- **Podcasters** who want to automate shownotes and clip creation
- **Content creators** repurposing long-form podcast content into short-form social media posts
- **Podcast networks** managing multiple shows at scale

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/mo | 60 min transcription/month |
| Pro | $15/mo | 10 hours transcription + unlimited clips |
| Business | $45/mo | Unlimited everything + API access |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **AI**: OpenAI Whisper API, GPT-4o
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: LemonSqueezy (MoR, no US company required)
- **Hosting**: Vercel
- **Analytics**: Plausible Analytics (privacy-first)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/mingyanggg/ai-podcast-tools.git
cd ai-podcast-tools

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
ai-podcast-tools/
├── app/                    # Next.js 14 App Router
│   ├── (marketing)/       # Landing page, pricing, docs
│   ├── (app)/            # Dashboard, transcription, clips
│   ├── api/              # API routes (webhooks, AI, etc.)
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── marketing/        # Landing page components
│   └── app/              # App components (upload, transcription, etc.)
├── lib/
│   ├── supabase/         # Supabase client + helpers
│   ├── stripe/           # Stripe integration
│   ├── lemonsqueezy/     # LemonSqueezy integration
│   └── ai/               # AI helpers (Whisper, GPT)
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── scripts/              # Utility scripts
```

## SEO

### Target Keywords

**Primary Keywords (High Volume)**
- "AI podcast transcription"
- "podcast show notes generator"
- "AI clip generator for podcasts"
- "convert podcast to short videos"

**Secondary Keywords (Medium Volume)**
- "podcast editing software AI"
- "automatic podcast shownotes"
- "podcast social media clips"
- "AI transcription for podcasters"

**Long-tail Keywords (Lower Volume, High Intent)**
- "best AI tool for podcasters 2025"
- "how to transcribe podcast automatically"
- "turn podcast into YouTube shorts automatically"
- "free podcast transcription API"

### SEO Strategy

1. **Programmatic SEO** — Generate 100+ landing pages for podcast genres/niches
2. **Content Marketing** — Blog posts targeting long-tail keywords
3. **Backlinks** — Guest posts on podcasting communities, Product Hunt launches
4. **Technical SEO** — Fast loading, structured data (Podcast schema), sitemap.xml

## Contributing

Contributions welcome! Please read our contributing guide and submit a PR.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for podcasters worldwide
