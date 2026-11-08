'use client';
import { useRef, useState } from 'react';

export default function FileDrop({ accept, multiple = true, onFiles, label }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const take = (list) => { const files = Array.from(list || []); if (files.length) onFiles(files); };
  return (
    <div
      className={'drop' + (over ? ' over' : '')}
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') input.current?.click(); }}
    >
      <strong>{label || 'Drop files here or click to choose'}</strong>
      <div style={{ fontSize: 13, marginTop: 6 }}>Processed on your device — nothing is uploaded.</div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden
        onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

export const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB');

export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const baseName = (name) => name.replace(/\.[^.]+$/, '');

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => resolve({ img, url }); img.onerror = () => reject(new Error('Could not read this image'));
    img.src = url;
  });
}

export function canvasBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn small ghost" type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {}
    }}>{done ? 'Copied ✓' : 'Copy'}</button>
  );
}
