'use client';
import { useState } from 'react';
import { CopyButton, download } from '@/components/FileDrop';

// RFC 4180 uyumlu CSV ayrıştırıcı: tırnaklı alanlar, kaçışlı tırnak (""), alan içinde satır sonu.
export function parseCsv(text, delim) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
    if (c === '"' && f === '') q = true;
    else if (c === delim) { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (q) throw new Error('A quoted field is never closed.');
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}
const guessDelim = (t) => { const line = t.split(/\r?\n/)[0] || ''; return [',', ';', '\t', '|'].sort((a, b) => line.split(b).length - line.split(a).length)[0]; };
const typed = (v) => (/^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v === '' ? null : v);

export default function CsvToJson() {
  const [csv, setCsv] = useState('name,age,city\nAda,36,London\n"Smith, John",41,"New York"');
  const [delim, setDelim] = useState('auto');
  const [header, setHeader] = useState(true);
  const [types, setTypes] = useState(true);
  let json = '', err = '', count = 0;
  try {
    const d = delim === 'auto' ? guessDelim(csv) : delim === 'tab' ? '\t' : delim;
    const rows = parseCsv(csv, d); const conv = (v) => (types ? typed(v) : v);
    let data;
    if (header && rows.length) { const keys = rows[0].map((k, i) => k.trim() || `column${i + 1}`); data = rows.slice(1).map((r) => Object.fromEntries(keys.map((k, i) => [k, conv(r[i] ?? '')]))); }
    else data = rows.map((r) => r.map(conv));
    count = data.length; json = JSON.stringify(data, null, 2);
  } catch (e) { err = e.message; }
  return (
    <div className="tool">
      <div className="row" style={{ marginBottom: 10 }}>
        <label>Delimiter <select value={delim} onChange={(e) => setDelim(e.target.value)}><option value="auto">Auto-detect</option><option value=",">Comma</option><option value=";">Semicolon</option><option value="tab">Tab</option><option value="|">Pipe</option></select></label>
        <label><input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} /> First row is header</label>
        <label><input type="checkbox" checked={types} onChange={(e) => setTypes(e.target.checked)} /> Convert numbers & booleans</label>
        <label>or open a file <input type="file" accept=".csv,.tsv,text/csv" onChange={async (e) => e.target.files[0] && setCsv(await e.target.files[0].text())} /></label>
      </div>
      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} spellCheck={false} placeholder="Paste CSV here" />
      <div className="row" style={{ margin: '10px 0' }}>
        <b>JSON</b>{err ? <span className="err">{err}</span> : <span className="muted">{count} records</span>}
        <CopyButton text={json} />
        <button className="btn small ghost" disabled={!json} onClick={() => download(new Blob([json], { type: 'application/json' }), 'data.json')}>Download .json</button>
      </div>
      <textarea readOnly value={json} />
    </div>
  );
}

const cell = (v, d) => {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /["\r\n]/.test(s) || s.includes(d) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function jsonToCsv(data, d = ',') {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.every((r) => Array.isArray(r))) return rows.map((r) => r.map((v) => cell(v, d)).join(d)).join('\n');
  const keys = [...new Set(rows.flatMap((r) => (r && typeof r === 'object' ? Object.keys(r) : [])))];
  return [keys.map((k) => cell(k, d)).join(d), ...rows.map((r) => keys.map((k) => cell(r?.[k], d)).join(d))].join('\n');
}

export function JsonToCsv() {
  const [json, setJson] = useState('[\n  {"name": "Ada", "age": 36, "city": "London"},\n  {"name": "Smith, John", "age": 41, "city": "New York"}\n]');
  const [delim, setDelim] = useState(',');
  let csv = '', err = '';
  try { csv = jsonToCsv(JSON.parse(json), delim === 'tab' ? '\t' : delim); } catch (e) { err = 'Invalid JSON: ' + e.message; }
  return (
    <div className="tool">
      <div className="row" style={{ marginBottom: 10 }}>
        <label>Delimiter <select value={delim} onChange={(e) => setDelim(e.target.value)}><option value=",">Comma</option><option value=";">Semicolon</option><option value="tab">Tab</option></select></label>
        <label>or open a file <input type="file" accept=".json,application/json" onChange={async (e) => e.target.files[0] && setJson(await e.target.files[0].text())} /></label>
      </div>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} placeholder="Paste a JSON array of objects" />
      <div className="row" style={{ margin: '10px 0' }}>
        <b>CSV</b>{err && <span className="err">{err}</span>}
        <CopyButton text={csv} />
        <button className="btn small ghost" disabled={!csv} onClick={() => download(new Blob(['﻿' + csv], { type: 'text/csv' }), 'data.csv')}>Download .csv</button>
      </div>
      <textarea readOnly value={csv} />
    </div>
  );
}
