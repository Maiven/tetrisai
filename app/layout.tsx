import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '반대편 · 스타트업 종사자를 위한 AI 의사결정 실사',
  description: '입사·잔류·이직·역할·보상·스톡옵션 결정을 회사·역할·리더·보상·학습의 5-Lens로 검증하는 Employee-side Startup Due Diligence AI.',
  keywords: ['스타트업 이직', '스타트업 커리어', '스톡옵션', '스타트업 오퍼', '의사결정', 'AI', 'employee due diligence', 'startup career'],
  robots: { index: true, follow: true },
  openGraph: {
    title: '반대편 · Startup Employee Due Diligence',
    description: '회사보다 먼저, 내 커리어가 투자할 곳을 실사하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '반대편 · Startup Employee Due Diligence',
    description: '입사·잔류·이직 전에 회사·역할·리더·보상·학습을 직원 편에서 실사합니다.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
