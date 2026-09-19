import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bandaepyeon · Startup Career Decision Due Diligence',
  description: 'Evidence-first due diligence for startup offers, stay-or-leave decisions, role changes, equity, and career risk.',
  keywords: [
    'startup offer evaluation',
    'startup equity',
    'career due diligence',
    'startup job offer',
    'startup runway',
    'decision intelligence',
    'AI career decision',
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://decision-mirror-eight.vercel.app/en',
    languages: {
      'en': 'https://decision-mirror-eight.vercel.app/en',
      'ko-KR': 'https://decision-mirror-eight.vercel.app/',
    },
  },
  openGraph: {
    title: 'Bandaepyeon · Decision Due Diligence for Startup Careers',
    description: 'Do not ask AI to choose for you. Find what still needs to be proven before you invest years of your career.',
    type: 'website',
    locale: 'en_US',
    url: 'https://decision-mirror-eight.vercel.app/en',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bandaepyeon · Startup Career Due Diligence',
    description: 'Evidence-first diligence for startup offers, equity, role changes, and stay-or-leave decisions.',
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
