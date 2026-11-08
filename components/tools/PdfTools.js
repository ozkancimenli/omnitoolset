'use client';
import { useState } from 'react';
import FileDrop, { fmtBytes, download, baseName } from '@/components/FileDrop';

const pdfLib = () => import('pdf-lib');
const bytes = (file) => file.arrayBuffer();

function move(list, i, d) { const a = [...list]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; }

function OrderList({ files, setFiles }) {
  return (
    <ul className="files">
      {files.map((f, i) => (
        <li key={f.name + i}>
          <span className="grow">{i + 1}. {f.name} <span className="muted">({fmtBytes(f.size)})</span></span>
          <button className="btn small ghost" onClick={() => setFiles(move(files, i, -1))} aria-label="Move up">↑</button>
          <button className="btn small ghost" onClick={() => setFiles(move(files, i, 1))} aria-label="Move down">↓</button>
          <button className="btn small ghost" onClick={() => setFiles(files.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
        </li>
      ))}
    </ul>
  );
}

export function MergePdf() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const run = async () => {
    setBusy(true); setMsg('');
    try {
      const { PDFDocument } = await pdfLib();
      const out = await PDFDocument.create();
      for (const f of files) {
        let src;
        try { src = await PDFDocument.load(await bytes(f)); } catch { throw new Error(`Could not open ${f.name} (it may be encrypted or damaged).`); }
        const pages = await out.copyPages(src, src.getPageIndices()); pages.forEach((p) => out.addPage(p));
      }
      const blob = new Blob([await out.save()], { type: 'application/pdf' });
      download(blob, 'merged.pdf'); setMsg(`Merged ${files.length} files into ${out.getPageCount()} pages (${fmtBytes(blob.size)}).`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="application/pdf" onFiles={(f) => setFiles((c) => [...c, ...f.filter((x) => x.type === 'application/pdf' || x.name.endsWith('.pdf'))])} label="Drop PDF files here" />
      <OrderList files={files} setFiles={setFiles} />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" disabled={files.length < 2 || busy} onClick={run}>{busy ? 'Merging…' : 'Merge PDFs'}</button>
        {files.length === 1 && <span className="muted">Add at least one more PDF.</span>}
        {msg && <span>{msg}</span>}
      </div>
    </div>
  );
}

export function parseRanges(text, max) {
  const out = [];
  for (const part of text.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`“${part}” is not a valid page or range.`);
    let a = +m[1], b = m[2] ? +m[2] : a; if (a > b) [a, b] = [b, a];
    if (a < 1 || b > max) throw new Error(`Pages must be between 1 and ${max}.`);
    for (let i = a; i <= b; i++) out.push(i - 1);
  }
  if (!out.length) throw new Error('Enter at least one page.');
  return out;
}

export function SplitPdf() {
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(0);
  const [ranges, setRanges] = useState('1');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const open = async (f) => {
    setMsg('');
    try { const { PDFDocument } = await pdfLib(); const d = await PDFDocument.load(await bytes(f)); setFile(f); setCount(d.getPageCount()); setRanges(`1-${Math.min(3, d.getPageCount())}`); }
    catch { setMsg('Could not open this PDF (it may be encrypted or damaged).'); }
  };
  const extract = async (perPage) => {
    setBusy(true); setMsg('');
    try {
      const { PDFDocument } = await pdfLib(); const src = await PDFDocument.load(await bytes(file));
      if (perPage) {
        for (let i = 0; i < count; i++) { const d = await PDFDocument.create(); const [p] = await d.copyPages(src, [i]); d.addPage(p); download(new Blob([await d.save()], { type: 'application/pdf' }), `${baseName(file.name)}-page-${i + 1}.pdf`); await new Promise((r) => setTimeout(r, 250)); }
        setMsg(`Downloaded ${count} single-page PDFs.`);
      } else {
        const idx = parseRanges(ranges, count); const d = await PDFDocument.create();
        (await d.copyPages(src, idx)).forEach((p) => d.addPage(p));
        download(new Blob([await d.save()], { type: 'application/pdf' }), `${baseName(file.name)}-pages.pdf`); setMsg(`Extracted ${idx.length} pages.`);
      }
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="application/pdf" multiple={false} onFiles={(f) => open(f[0])} label={file ? `${file.name} — ${count} pages (click to change)` : 'Drop a PDF here'} />
      {file && <div className="row" style={{ marginTop: 16 }}>
        <label>Pages to keep <input type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 6, 9-10" /></label>
        <button className="btn" disabled={busy} onClick={() => extract(false)}>Extract pages</button>
        <button className="btn ghost" disabled={busy} onClick={() => extract(true)}>Split every page</button>
      </div>}
      {msg && <p>{msg}</p>}
    </div>
  );
}

const SIZES = { fit: null, a4: [595.28, 841.89], letter: [612, 792] };

export function ImagesToPdf() {
  const [files, setFiles] = useState([]);
  const [size, setSize] = useState('fit');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const run = async () => {
    setBusy(true); setMsg('');
    try {
      const { PDFDocument } = await pdfLib(); const doc = await PDFDocument.create();
      for (const f of files) {
        let data = await bytes(f), img;
        if (f.type === 'image/png') img = await doc.embedPng(data);
        else if (f.type === 'image/jpeg') img = await doc.embedJpg(data);
        else { // WebP vb. → JPG'ye çevir
          const bmp = await createImageBitmap(f); const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
          const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(bmp, 0, 0);
          data = await (await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92))).arrayBuffer(); img = await doc.embedJpg(data);
        }
        const target = SIZES[size];
        if (!target) { const p = doc.addPage([img.width, img.height]); p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }); }
        else {
          const [pw, ph] = img.width > img.height ? [target[1], target[0]] : target; const m = 28;
          const s = Math.min((pw - 2 * m) / img.width, (ph - 2 * m) / img.height); const w = img.width * s, h = img.height * s;
          doc.addPage([pw, ph]).drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
        }
      }
      const blob = new Blob([await doc.save()], { type: 'application/pdf' }); download(blob, 'images.pdf');
      setMsg(`Created a ${files.length}-page PDF (${fmtBytes(blob.size)}).`);
    } catch (e) { setMsg('Could not create the PDF: ' + e.message); }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="image/jpeg,image/png,image/webp" onFiles={(f) => setFiles((c) => [...c, ...f.filter((x) => x.type.startsWith('image/'))])} label="Drop JPG or PNG images" />
      <OrderList files={files} setFiles={setFiles} />
      <div className="row" style={{ marginTop: 16 }}>
        <label>Page size <select value={size} onChange={(e) => setSize(e.target.value)}><option value="fit">Fit to image</option><option value="letter">US Letter</option><option value="a4">A4</option></select></label>
        <button className="btn" disabled={!files.length || busy} onClick={run}>{busy ? 'Creating…' : 'Create PDF'}</button>
        {msg && <span>{msg}</span>}
      </div>
    </div>
  );
}

export function RotatePdf() {
  const [file, setFile] = useState(null);
  const [count, setCount] = useState(0);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('all');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const open = async (f) => {
    setMsg('');
    try { const { PDFDocument } = await pdfLib(); const d = await PDFDocument.load(await bytes(f)); setFile(f); setCount(d.getPageCount()); }
    catch { setMsg('Could not open this PDF (it may be encrypted or damaged).'); }
  };
  const run = async () => {
    setBusy(true); setMsg('');
    try {
      const { PDFDocument, degrees } = await pdfLib(); const doc = await PDFDocument.load(await bytes(file));
      const idx = pages.trim().toLowerCase() === 'all' ? doc.getPageIndices() : parseRanges(pages, count);
      for (const i of idx) { const p = doc.getPage(i); p.setRotation(degrees((p.getRotation().angle + angle) % 360)); }
      download(new Blob([await doc.save()], { type: 'application/pdf' }), `${baseName(file.name)}-rotated.pdf`);
      setMsg(`Rotated ${idx.length} page${idx.length === 1 ? '' : 's'} by ${angle}°.`);
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };
  return (
    <div className="tool">
      <FileDrop accept="application/pdf" multiple={false} onFiles={(f) => open(f[0])} label={file ? `${file.name} — ${count} pages (click to change)` : 'Drop a PDF here'} />
      {file && <div className="row" style={{ marginTop: 16 }}>
        <label>Rotate <select value={angle} onChange={(e) => setAngle(+e.target.value)}><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>90° counter-clockwise</option></select></label>
        <label>Pages <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="all or 1-3, 5" style={{ width: 140 }} /></label>
        <button className="btn" disabled={busy} onClick={run}>{busy ? 'Rotating…' : 'Rotate & download'}</button>
      </div>}
      {msg && <p>{msg}</p>}
    </div>
  );
}
