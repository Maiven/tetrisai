import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '반대편 · Decision Mirror',
  description: '결정하기 전, 내가 보지 못한 것을 보는 AI. 숨은 가정과 반대 논리, 실패 경로를 검증합니다.',
  robots: { index: true, follow: true },
  openGraph: {
    title: '반대편 · Decision Mirror',
    description: '더 좋은 답보다, 더 넓은 판단을.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
