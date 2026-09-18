import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '반대편 · Falsify Before You Decide',
  description: '결론이 맞다는 이유보다 틀렸다는 증거부터 찾는 AI 의사결정 검증 도구. 사실·가정·미확인을 분리하고 반증 조건, 실패 신호, 가장 작은 검증 행동을 제시합니다.',
  keywords: ['의사결정', 'AI', '반증', 'pre-mortem', '커리어', 'decision making', 'falsification'],
  robots: { index: true, follow: true },
  openGraph: {
    title: '반대편 · Falsify Before You Decide',
    description: 'AI에게 답을 묻기 전에, 내 결론이 틀릴 조건부터 찾으세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '반대편 · Falsify Before You Decide',
    description: '결론이 맞다는 이유보다 틀렸다는 증거부터 찾는 AI.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
