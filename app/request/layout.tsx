import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Candidate Diligence Request · Bandaepyeon',
  description: 'A privacy-first request page for candidates and companies to exchange specific offer and role evidence.',
  robots: { index: false, follow: false },
};

export default function RequestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
