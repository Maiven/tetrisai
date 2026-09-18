import { ImageResponse } from 'next/og';

export const alt = 'BANDAEPYEON - Falsify Before You Decide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(115deg,#fff1df 0%,#f7f8fb 50%,#dce8ff 100%)',
          color: '#101722',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', display: 'flex', left: -80, top: -120, width: 520, height: 520, borderRadius: 999, background: 'rgba(238,156,78,.20)' }} />
        <div style={{ position: 'absolute', display: 'flex', right: -70, top: -100, width: 520, height: 520, borderRadius: 999, background: 'rgba(85,126,218,.18)' }} />

        <div style={{ width: '58%', padding: '72px 0 64px 78px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 20, letterSpacing: 5, fontWeight: 800, color: '#62738a' }}>AI DECISION FALSIFIER</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 74, lineHeight: 1.02, letterSpacing: -4, fontWeight: 800, marginTop: 42 }}>
            <span>FALSIFY</span><span>BEFORE</span><span>YOU DECIDE.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 24, lineHeight: 1.45, color: '#526175', marginTop: 28, maxWidth: 560 }}>
            <span>Don't ask AI to choose for you.</span>
            <span>Find the evidence that could prove your conclusion wrong.</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 800 }}>
            <div style={{ display: 'flex', position: 'relative', width: 50, height: 28 }}>
              <span style={{ position: 'absolute', display: 'flex', left: 0, width: 28, height: 28, borderRadius: 999, background: '#b7dfff', border: '1px solid #8fb6d6' }} />
              <span style={{ position: 'absolute', display: 'flex', right: 0, width: 28, height: 28, borderRadius: 999, background: '#111923' }} />
            </div>
            <span>BANDAEPYEON</span>
          </div>
        </div>

        <div style={{ width: '42%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', display: 'flex', left: 62, width: 250, height: 360, borderRadius: '140px 140px 28px 28px', background: 'linear-gradient(#fff5d9,#efa14d)', border: '2px solid rgba(255,255,255,.7)' }} />
          <div style={{ position: 'absolute', display: 'flex', right: 58, width: 250, height: 360, borderRadius: '140px 140px 28px 28px', background: 'linear-gradient(#dce7fb,#42577f)', border: '2px solid rgba(255,255,255,.7)' }} />
          <div style={{ zIndex: 2, width: 92, height: 315, borderRadius: 55, background: 'rgba(255,255,255,.70)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 78, color: '#385887' }}>?</div>
        </div>
      </div>
    ),
    size,
  );
}
