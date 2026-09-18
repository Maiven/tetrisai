import { ImageResponse } from 'next/og';

export const alt = 'BANDAEPYEON - Startup Employee Due Diligence';
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

        <div style={{ width: '60%', padding: '64px 0 56px 72px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 18, letterSpacing: 4, fontWeight: 800, color: '#62738a' }}>STARTUP EMPLOYEE DUE DILIGENCE</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 68, lineHeight: 1.04, letterSpacing: -3, fontWeight: 800, marginTop: 36 }}>
            <span>DON'T JUST</span><span>JOIN A STARTUP.</span><span>DILIGENCE IT.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 22, lineHeight: 1.45, color: '#526175', marginTop: 24, maxWidth: 590 }}>
            <span>Company · Role · Manager · Equity · Learning</span>
            <span>Find what has not been proven before you decide.</span>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 800 }}>
            <div style={{ display: 'flex', position: 'relative', width: 50, height: 28 }}>
              <span style={{ position: 'absolute', display: 'flex', left: 0, width: 28, height: 28, borderRadius: 999, background: '#b7dfff', border: '1px solid #8fb6d6' }} />
              <span style={{ position: 'absolute', display: 'flex', right: 0, width: 28, height: 28, borderRadius: 999, background: '#111923' }} />
            </div>
            <span>BANDAEPYEON</span>
          </div>
        </div>

        <div style={{ width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', display: 'flex', left: 42, width: 220, height: 350, borderRadius: '125px 125px 26px 26px', background: 'linear-gradient(#fff5d9,#efa14d)', border: '2px solid rgba(255,255,255,.7)' }} />
          <div style={{ position: 'absolute', display: 'flex', right: 45, width: 220, height: 350, borderRadius: '125px 125px 26px 26px', background: 'linear-gradient(#dce7fb,#42577f)', border: '2px solid rgba(255,255,255,.7)' }} />
          <div style={{ zIndex: 2, width: 86, height: 300, borderRadius: 48, background: 'rgba(255,255,255,.74)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, color: '#385887' }}>?</div>
        </div>
      </div>
    ),
    size,
  );
}
