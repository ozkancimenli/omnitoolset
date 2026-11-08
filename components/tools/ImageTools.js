'use client';
import { useState } from 'react';
import FileDrop, { fmtBytes, download, baseName, loadImage, canvasBlob } from '@/components/FileDrop';

const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

async function render(file, { format, quality, width, height }) {
  const { img, url } = await loadImage(file);
  const w = width || img.naturalWidth, h = height || img.naturalHeight;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (format === 'jpg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  const blob = await canvasBlob(c, MIME[format], format === 'png' ? undefined : quality);
  return { blob, w, h, src: URL.createObjectURL(blob) };
}

const guessFormat = (file) => (file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg');

function useItems() {
  const [items, setItems] = useState([]);
  const add = (files) => setItems((cur) => [...cur, ...files.filter((f) => f.type.startsWith('image/')).map((f) => ({ id: Math.random().toString(36).slice(2), file: f }))]);
  const update = (id, patch) => setItems((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  return { items, add, update, clear: () => setItems([]) };
}

function Results({ items, ext }) {
  return (
    <ul className="files">
      {items.map((x) => (
        <li key={x.id}>
          {x.out?.src && <img src={x.out.src} alt="" />}
          <span className="grow">{x.file.name}<br /><span className="muted">{fmtBytes(x.file.size)}
            {x.out && <> → <b>{fmtBytes(x.out.blob.size)}</b> {x.out.w}×{x.out.h}
              {' '}<span className={x.out.blob.size < x.file.size ? 'ok' : 'err'}>({Math.round((1 - x.out.blob.size / x.file.size) * 100)}% {x.out.blob.size < x.file.size ? 'smaller' : 'larger'})</span></>}
          </span>{x.error && <span className="err"> {x.error}</span>}</span>
          {x.out && <button className="btn small" onClick={() => download(x.out.blob, `${baseName(x.file.name)}.${ext(x)}`)}>Download</button>}
        </li>
      ))}
    </ul>
  );
}

export function Compressor() {
  const { items, add, update, clear } = useItems();
  const [quality, setQuality] = useState(0.75);
  const [format, setFormat] = useState('webp');
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    for (const x of items) { try { update(x.id, { out: await render(x.file, { format, quality }), error: null }); } catch (e) { update(x.id, { error: e.message }); } }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={add} label="Drop images here (JPG, PNG, WebP)" />
      <div className="row" style={{ marginTop: 16 }}>
        <label>Quality <b>{Math.round(quality * 100)}%</b> <input type="range" min="0.3" max="0.95" step="0.05" value={quality} onChange={(e) => setQuality(+e.target.value)} /></label>
        <label>Output <select value={format} onChange={(e) => setFormat(e.target.value)}><option value="webp">WebP (smallest)</option><option value="jpg">JPG</option><option value="png">PNG (lossless)</option></select></label>
        <button className="btn" disabled={!items.length || busy} onClick={run}>{busy ? 'Compressing…' : 'Compress'}</button>
        {items.length > 0 && <button className="btn ghost" onClick={clear}>Clear</button>}
      </div>
      <Results items={items} ext={() => format} />
    </div>
  );
}

export function Converter() {
  const { items, add, update, clear } = useItems();
  const [format, setFormat] = useState('jpg');
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    for (const x of items) { try { update(x.id, { out: await render(x.file, { format, quality: 0.92 }), error: null }); } catch (e) { update(x.id, { error: e.message }); } }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="image/*" onFiles={add} label="Drop images to convert" />
      <div className="row" style={{ marginTop: 16 }}>
        <label>Convert to <select value={format} onChange={(e) => setFormat(e.target.value)}><option value="jpg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label>
        <button className="btn" disabled={!items.length || busy} onClick={run}>{busy ? 'Converting…' : 'Convert'}</button>
        {items.length > 0 && <button className="btn ghost" onClick={clear}>Clear</button>}
      </div>
      <Results items={items} ext={() => format} />
    </div>
  );
}

export function Resizer() {
  const { items, add, update, clear } = useItems();
  const [mode, setMode] = useState('px');
  const [w, setW] = useState(1080);
  const [h, setH] = useState('');
  const [pct, setPct] = useState(50);
  const [lock, setLock] = useState(true);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    for (const x of items) {
      try {
        const { img, url } = await loadImage(x.file); const nw = img.naturalWidth, nh = img.naturalHeight; URL.revokeObjectURL(url);
        let tw, th;
        if (mode === 'pct') { tw = Math.round(nw * pct / 100); th = Math.round(nh * pct / 100); }
        else {
          tw = +w || 0; th = +h || 0;
          if (lock || !th || !tw) { if (tw && !th) th = Math.round(nh * tw / nw); else if (th && !tw) tw = Math.round(nw * th / nh); else if (lock) th = Math.round(nh * tw / nw); }
        }
        if (!tw || !th) throw new Error('Enter a width or height');
        update(x.id, { out: await render(x.file, { format: guessFormat(x.file), quality: 0.92, width: tw, height: th }), error: null });
      } catch (e) { update(x.id, { error: e.message }); }
    }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="image/*" onFiles={add} label="Drop images to resize" />
      <div className="row" style={{ marginTop: 16 }}>
        <label><input type="radio" checked={mode === 'px'} onChange={() => setMode('px')} /> Pixels</label>
        <label><input type="radio" checked={mode === 'pct'} onChange={() => setMode('pct')} /> Percentage</label>
        {mode === 'px' ? <>
          <label>Width <input type="number" min="1" style={{ width: 100 }} value={w} onChange={(e) => setW(e.target.value)} /></label>
          <label>Height <input type="number" min="1" style={{ width: 100 }} value={h} placeholder="auto" onChange={(e) => setH(e.target.value)} /></label>
          <label><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Lock aspect ratio</label>
        </> : <label>Scale <input type="number" min="1" max="400" style={{ width: 90 }} value={pct} onChange={(e) => setPct(e.target.value)} /> %</label>}
        <button className="btn" disabled={!items.length || busy} onClick={run}>{busy ? 'Resizing…' : 'Resize'}</button>
        {items.length > 0 && <button className="btn ghost" onClick={clear}>Clear</button>}
      </div>
      <Results items={items} ext={(x) => guessFormat(x.file)} />
    </div>
  );
}
