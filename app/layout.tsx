import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://aitoolsfactory.com'),
  title: {
    default: 'AI Podcast Tools — Transcribe, Generate Show Notes & Create Clips in Seconds',
    template: '%s | AI Podcast Tools',
  },
  description:
    'Transform your podcast workflow with AI. Automatic transcription, AI-generated show notes, and smart clip extraction.',
  keywords: [
    'AI podcast transcription',
    'podcast show notes generator',
    'AI clip generator for podcasts',
    'convert podcast to short videos',
    'podcast editing software AI',
    'automatic podcast shownotes',
    'podcast social media clips',
    'AI transcription for podcasters',
  ],
  authors: [{ name: 'AI Tools Factory' }],
  creator: 'AI Tools Factory',
  publisher: 'AI Tools Factory',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aitoolsfactory.com/podcast-tools',
    siteName: 'AI Podcast Tools',
    title: 'AI Podcast Tools — Transcribe, Generate Show Notes & Create Clips in Seconds',
    description:
      'Transform your podcast workflow with AI. Automatic transcription, AI-generated show notes, smart clip extraction, and one-click publishing.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Podcast Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Podcast Tools',
    description: 'AI-powered podcast production suite. Transcribe, summarize, and clip in seconds.',
    images: ['/og-image.png'],
    creator: '@aitoolsfactory',
  },
  alternates: {
    canonical: 'https://aitoolsfactory.com/podcast-tools',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Podcast schema markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'AI Podcast Tools',
              description:
                'AI-powered podcast production suite with automatic transcription, show notes generation, and clip creation.',
              url: 'https://aitoolsfactory.com/podcast-tools',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Free plan with 60 minutes transcription per month',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
