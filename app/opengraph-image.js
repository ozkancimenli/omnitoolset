import { ImageResponse } from 'next/og';

export const alt = 'OmniToolset — free online tools that run in your browser';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: '#60a5fa' }}>OmniToolset</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 20 }}>Free online tools that never upload your files</div>
        <div style={{ fontSize: 32, color: '#cbd5e1', marginTop: 28 }}>Images · PDFs · QR codes · Text · Developer tools</div>
      </div>
    ),
    size,
  );
}
