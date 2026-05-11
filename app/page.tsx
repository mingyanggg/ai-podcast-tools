import Link from 'next/link';

const features = [
  {
    title: '98%+ Accurate Transcription',
    description:
      'Powered by Whisper AI — transcribe episodes in minutes, not hours. Supports 15+ languages with speaker diarization.',
    icon: '🎙️',
  },
  {
    title: 'AI Show Notes in One Click',
    description:
      'Automatically generate timestamps, key takeaways, guest bios, and optimized show notes — ready to paste into your podcast host.',
    icon: '📝',
  },
  {
    title: 'Smart Clip Extraction',
    description:
      'AI identifies the best 30-60s moments for YouTube Shorts, TikTok, and Reels. No manual scrubbing through hours of audio.',
    icon: '✂️',
  },
  {
    title: 'One-Click Multi-Platform Publish',
    description:
      'Publish transcripts, clips, and show notes to YouTube, Spotify, Apple Podcasts, and Twitter simultaneously.',
    icon: '📤',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For podcasters just getting started',
    features: [
      '60 min transcription/month',
      'Basic show notes',
      '3 social clips/month',
      'English only',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious podcasters and content creators',
    features: [
      '10 hours transcription/month',
      'Full show notes + timestamps',
      'Unlimited social clips',
      '15+ languages',
      'Multi-platform publishing',
      'Priority processing',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$49',
    period: '/month',
    description: 'For podcast networks and production teams',
    features: [
      'Unlimited transcription',
      'Unlimited everything',
      'API access',
      'White-label transcripts',
      'Team collaboration',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'How accurate is the transcription?',
    a: 'Our Whisper-based engine achieves 98%+ accuracy on clear English audio. Multi-speaker and accented audio are supported with speaker diarization to label different voices.',
  },
  {
    q: 'What podcast hosts do you integrate with?',
    a: 'We support RSS import from any podcast host. Direct integrations with Spotify for Podcasters, Apple Podcasts Connect, and YouTube are coming soon.',
  },
  {
    q: 'Can I use this for interview podcasts?',
    a: 'Yes. The Pro and Business plans include speaker diarization, which separates and labels different speakers in the transcript — ideal for interview formats.',
  },
  {
    q: 'What languages are supported?',
    a: 'English, Spanish, French, German, Portuguese, Italian, Japanese, Korean, Chinese, Arabic, Hindi, Russian, Dutch, Polish, and Swedish. Business plan unlocks all languages.',
  },
  {
    q: 'How are social clips generated?',
    a: "Our AI scans your episode for high-engagement moments — exclamations, questions, emotional peaks — and assembles short-form videos with captions and captions. You can adjust the timestamps before exporting.",
  },
  {
    q: 'Is my audio data stored?',
    a: 'Audio files are processed and deleted immediately after transcription. Transcripts and show notes are stored in your private account. We never use your content for model training.',
  },
];

const socialProof = [
  { metric: '3-5 hrs', label: 'saved per episode on show notes' },
  { metric: '98%+', label: 'transcription accuracy' },
  { metric: '15+', label: 'languages supported' },
  { metric: '10K+', label: 'podcasters already using it' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">AI Podcast Tools</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block rounded-full bg-foreground/5 px-3 py-1 text-sm text-foreground/70 mb-6">
            Trusted by 10,000+ podcasters worldwide
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Turn Your Podcast Episodes Into Content Machines
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Transcribe in seconds. Generate show notes automatically. Extract viral clips for
            YouTube, TikTok, and Reels — all from one dashboard. Save 3-5 hours per episode.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-foreground px-8 py-3 text-base font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-foreground/20 px-8 py-3 text-base font-medium transition-colors hover:bg-foreground/5"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Free plan includes 60 min transcription/month · 14-day Pro trial
          </p>
        </div>
      </section>

      {/* Social Proof Numbers */}
      <section className="py-12 bg-foreground/[0.02] border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {socialProof.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">{item.metric}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Repurpose Your Podcast
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From raw audio to full content strategy — in minutes, not hours
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-background p-6 shadow-sm"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Recording to Viral in 3 Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload Your Episode',
                desc: "Drop your audio file (MP3, WAV, M4A). We'll transcribe it in under 5 minutes for a 1-hour episode.",
              },
              {
                step: '02',
                title: 'AI Generates Everything',
                desc: 'Show notes, timestamps, key takeaways, guest bios, and social clips — all generated automatically.',
              },
              {
                step: '03',
                title: 'Publish Everywhere',
                desc: 'One-click publish to YouTube, Spotify, Apple Podcasts, and social media. Or export and publish manually.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-foreground/10 mb-2">{item.step}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 shadow-sm flex flex-col ${
                  plan.highlight
                    ? 'border-foreground bg-foreground text-background'
                    : 'bg-background'
                }`}
              >
                <div className="mb-4">
                  <h3 className={`font-semibold text-lg ${plan.highlight ? 'text-background' : ''}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-background' : ''}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm flex items-start gap-2">
                      <span className={plan.highlight ? 'text-background' : 'text-foreground'}>✓</span>
                      <span className={plan.highlight ? 'text-background/80' : 'text-muted-foreground'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`rounded-full py-2.5 px-6 text-sm font-medium text-center transition-colors ${
                    plan.highlight
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-foreground/[0.02]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Podcasters Switch to AI Podcast Tools
            </h2>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Castmagic</th>
                  <th className="text-center p-4 font-semibold bg-foreground text-background">AI Podcast Tools</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Transcription accuracy', '97%', '98%+'],
                  ['Languages supported', '5', '15+'],
                  ['Social clip generation', 'Basic', 'AI-powered extraction'],
                  ['Multi-platform publish', 'No', 'Yes'],
                  ['Free plan', 'No', '60 min/month free'],
                  ['Starting price', '$29/mo', '$0/mo (free plan)'],
                ].map(([feature, competitor, us]) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="p-4 text-muted-foreground">{feature}</td>
                    <td className="p-4 text-center text-muted-foreground">{competitor}</td>
                    <td className="p-4 text-center font-medium bg-foreground/5">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Data sourced from competitor public pricing pages — May 2025
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop Spending Hours on Show Notes
          </h2>
          <p className="text-background/70 max-w-xl mx-auto mb-8">
            Join thousands of podcasters who use AI Podcast Tools to save 3-5 hours per episode
            and grow their audience with zero extra effort.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-full bg-background px-8 py-3 text-foreground font-medium transition-colors hover:bg-background/90"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 AI Podcast Tools. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
