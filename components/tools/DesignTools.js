'use client';
import { useEffect, useRef, useState } from 'react';
import { download, canvasBlob, CopyButton } from '@/components/FileDrop';

export function QrGenerator() {
  const [kind, setKind] = useState('url');
  const [v, setV] = useState({ url: 'https://', text: '', email: '', subject: '', ssid: '', pass: '', enc: 'WPA' });
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(1024);
  const [src, setSrc] = useState('');
  const esc = (s) => s.replace(/([\\;,:"])/g, '\\$1');
  const data = kind === 'url' ? v.url : kind === 'text' ? v.text
    : kind === 'email' ? `mailto:${v.email}${v.subject ? '?subject=' + encodeURIComponent(v.subject) : ''}`
    : `WIFI:T:${v.enc};S:${esc(v.ssid)};P:${esc(v.pass)};;`;
  useEffect(() => {
    let live = true;
    import('qrcode').then((QR) => QR.toDataURL(data || ' ', { width: 320, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: 'M' }).then((u) => live && setSrc(u)));
    return () => { live = false; };
  }, [data, fg, bg]);
  const save = async (fmt) => {
    const QR = await import('qrcode'); const opt = { width: size, margin: 2, color: { dark: fg, light: bg }, errorCorrectionLevel: 'M' };
    if (fmt === 'svg') download(new Blob([await QR.toString(data, { ...opt, type: 'svg' })], { type: 'image/svg+xml' }), 'qr-code.svg');
    else { const u = await QR.toDataURL(data, opt); download(await (await fetch(u)).blob(), 'qr-code.png'); }
  };
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="tool">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="row" style={{ marginBottom: 12 }}>{['url', 'text', 'email', 'wifi'].map((k) => <label key={k}><input type="radio" checked={kind === k} onChange={() => setKind(k)} /> {k === 'url' ? 'Website' : k === 'wifi' ? 'Wi-Fi' : k[0].toUpperCase() + k.slice(1)}</label>)}</div>
          {kind === 'url' && <input type="text" value={v.url} onChange={set('url')} style={{ width: '100%' }} />}
          {kind === 'text' && <textarea value={v.text} onChange={set('text')} style={{ minHeight: 100, fontFamily: 'inherit' }} />}
          {kind === 'email' && <><input type="text" placeholder="name@example.com" value={v.email} onChange={set('email')} style={{ width: '100%', marginBottom: 8 }} /><input type="text" placeholder="Subject (optional)" value={v.subject} onChange={set('subject')} style={{ width: '100%' }} /></>}
          {kind === 'wifi' && <><input type="text" placeholder="Network name (SSID)" value={v.ssid} onChange={set('ssid')} style={{ width: '100%', marginBottom: 8 }} /><input type="text" placeholder="Password" value={v.pass} onChange={set('pass')} style={{ width: '100%', marginBottom: 8 }} /><select value={v.enc} onChange={set('enc')}><option value="WPA">WPA/WPA2/WPA3</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></>}
          <div className="row" style={{ marginTop: 14 }}>
            <label>Color <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /></label>
            <label>Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></label>
            <label>PNG size <select value={size} onChange={(e) => setSize(+e.target.value)}><option value={512}>512 px</option><option value={1024}>1024 px</option><option value={2048}>2048 px</option></select></label>
          </div>
          <div className="row" style={{ marginTop: 14 }}><button className="btn" onClick={() => save('png')}>Download PNG</button><button className="btn ghost" onClick={() => save('svg')}>Download SVG</button></div>
        </div>
        {src && <img src={src} alt="QR code preview" width={240} height={240} style={{ borderRadius: 8, border: '1px solid var(--line)' }} />}
      </div>
    </div>
  );
}

const LAYOUTS = ['split', 'center', 'band'];
function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

export function OgImageGenerator() {
  const ref = useRef(null);
  const [f, setF] = useState({ title: 'Handmade Botanical Soap', sub: 'Small-batch, plastic-free', price: '$12', brand: 'Your Brand', layout: 'split', bg: '#0f172a', accent: '#f59e0b' });
  const [img, setImg] = useState(null);
  const [logo, setLogo] = useState(null);
  const pick = (setter) => (e) => { const file = e.target.files[0]; if (!file) return; const i = new Image(); i.onload = () => setter(i); i.src = URL.createObjectURL(file); };
  useEffect(() => {
    const c = ref.current; const ctx = c.getContext('2d'); const W = 1200, H = 630;
    const ink = lum(f.bg) > 0.55 ? '#0f172a' : '#ffffff'; const sub = lum(f.bg) > 0.55 ? '#475569' : '#cbd5e1';
    ctx.fillStyle = f.bg; ctx.fillRect(0, 0, W, H);
    const cover = (im, x, y, w, h) => { const s = Math.max(w / im.width, h / im.height); const iw = im.width * s, ih = im.height * s; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); ctx.restore(); };
    let tx = 80, tw = 1040, align = 'left';
    if (f.layout === 'split') { tw = img ? 560 : 1040; if (img) cover(img, 680, 0, 520, H); }
    if (f.layout === 'center') { align = 'center'; tx = 600; tw = 960; if (img) { ctx.globalAlpha = .25; cover(img, 0, 0, W, H); ctx.globalAlpha = 1; } }
    if (f.layout === 'band') { if (img) cover(img, 0, 0, W, H); ctx.fillStyle = f.bg; ctx.globalAlpha = .9; ctx.fillRect(0, H - 260, W, 260); ctx.globalAlpha = 1; }
    ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    const font = (w, s) => `${w} ${s}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    let size = 72; ctx.font = font(800, size); let lines = wrap(ctx, f.title, tw);
    while (lines.length > 3 && size > 40) { size -= 6; ctx.font = font(800, size); lines = wrap(ctx, f.title, tw); }
    const block = lines.length * size * 1.12 + (f.sub ? 50 : 0) + (f.price ? 90 : 0);
    let y = f.layout === 'band' ? H - 260 + (260 - block) / 2 + size : (H - block) / 2 + size;
    ctx.fillStyle = ink; lines.forEach((l) => { ctx.fillText(l, tx, y); y += size * 1.12; });
    if (f.sub) { ctx.font = font(500, 30); ctx.fillStyle = sub; ctx.fillText(f.sub, tx, y + 6); y += 50; }
    if (f.price) {
      ctx.font = font(800, 36); const pw = ctx.measureText(f.price).width + 48; const px = align === 'center' ? tx - pw / 2 : tx;
      ctx.fillStyle = f.accent; ctx.beginPath(); ctx.roundRect(px, y + 4, pw, 62, 31); ctx.fill();
      ctx.fillStyle = lum(f.accent) > 0.6 ? '#0f172a' : '#fff'; ctx.textAlign = 'center'; ctx.fillText(f.price, px + pw / 2, y + 48); ctx.textAlign = align;
    }
    ctx.textAlign = 'left'; ctx.font = font(700, 26); ctx.fillStyle = f.layout === 'band' && img ? '#fff' : sub;
    if (logo) { const h = 54, w = logo.width * h / logo.height; ctx.drawImage(logo, 80, 46, Math.min(w, 260), h); }
    else if (f.brand) ctx.fillText(f.brand, 80, 76);
    ctx.fillStyle = f.accent; ctx.fillRect(0, 0, W, 10);
  }, [f, img, logo]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="tool">
      <canvas ref={ref} width={1200} height={630} className="preview" />
      <div className="row" style={{ marginTop: 16 }}>
        <label>Title <input type="text" value={f.title} onChange={set('title')} style={{ width: 300 }} /></label>
        <label>Subtitle <input type="text" value={f.sub} onChange={set('sub')} /></label>
        <label>Price / badge <input type="text" value={f.price} onChange={set('price')} style={{ width: 110 }} /></label>
        <label>Brand <input type="text" value={f.brand} onChange={set('brand')} /></label>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <label>Layout <select value={f.layout} onChange={set('layout')}>{LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}</select></label>
        <label>Background <input type="color" value={f.bg} onChange={set('bg')} /></label>
        <label>Accent <input type="color" value={f.accent} onChange={set('accent')} /></label>
        <label>Product image <input type="file" accept="image/*" onChange={pick(setImg)} /></label>
        <label>Logo <input type="file" accept="image/*" onChange={pick(setLogo)} /></label>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" onClick={async () => download(await canvasBlob(ref.current, 'image/png'), 'og-image-1200x630.png')}>Download PNG (1200×630)</button>
      </div>
    </div>
  );
}

const hexToRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); if (!/^[0-9a-f]{6}$/i.test(h)) return null; const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const rgbToHex = (r, g, b) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; }
function hslToRgb(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return [f(0), f(8), f(4)].map((x) => Math.round(x * 255)); }
function parseColor(t) {
  t = t.trim(); let m;
  if ((m = t.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i))) return hexToRgb(m[1]);
  if ((m = t.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i))) return [+m[1], +m[2], +m[3]].map((x) => Math.min(255, x));
  if ((m = t.match(/^hsla?\(\s*(\d+)[\s,]+(\d+)%?[\s,]+(\d+)%?/i))) return hslToRgb(+m[1], +m[2], +m[3]);
  return null;
}
const relLum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [relLum(a), relLum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

export function ColorConverter() {
  const [input, setInput] = useState('#2563eb');
  const rgb = parseColor(input);
  const out = rgb && { hex: rgbToHex(...rgb), rgb: `rgb(${rgb.join(', ')})`, hsl: (() => { const [h, s, l] = rgbToHsl(...rgb); return `hsl(${h}, ${s}%, ${l}%)`; })() };
  return (
    <div className="tool">
      <div className="row">
        <input type="color" value={out ? out.hex : '#000000'} onChange={(e) => setInput(e.target.value)} style={{ width: 64, height: 44 }} />
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="#2563eb, rgb(37,99,235) or hsl(221,83%,53%)" style={{ flex: 1, minWidth: 240 }} />
      </div>
      {!out ? <p className="err">Enter a HEX, RGB or HSL color.</p> : <>
        <div style={{ background: out.hex, height: 90, borderRadius: 10, margin: '16px 0', border: '1px solid var(--line)' }} />
        {Object.entries(out).map(([k, v]) => <div className="row" key={k} style={{ margin: '6px 0' }}><b style={{ width: 50 }}>{k.toUpperCase()}</b><code>{v}</code><CopyButton text={v} /></div>)}
        <div className="row" style={{ marginTop: 14 }}>
          {[['White text', [255, 255, 255], '#fff'], ['Black text', [0, 0, 0], '#000']].map(([label, c, css]) => { const r = contrast(rgb, c); return (
            <div key={label} style={{ background: out.hex, color: css, padding: '10px 14px', borderRadius: 8 }}>{label}: {r.toFixed(2)}:1 {r >= 4.5 ? '✓ AA' : r >= 3 ? '— large text only' : '✗'}</div>); })}
        </div>
      </>}
    </div>
  );
}
