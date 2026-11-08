'use client';
import { useMemo, useState } from 'react';
import { CopyButton } from '@/components/FileDrop';

const STOP = new Set('the a an and or but of to in on at for with is are was were be been it this that as by from i you he she we they not your my our their its'.split(' '));

export function WordCounter() {
  const [text, setText] = useState('');
  const s = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const freq = {};
    for (const w of words) { const k = w.toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, ''); if (k && !STOP.has(k)) freq[k] = (freq[k] || 0) + 1; }
    return {
      words: words.length, chars: text.length, noSpace: text.replace(/\s/g, '').length,
      sentences: (text.match(/[^.!?]+[.!?]+(\s|$)/g) || (text.trim() ? [1] : [])).length,
      paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
      read: Math.max(words.length ? 1 : 0, Math.round(words.length / 238)),
      top: Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [text]);
  return (
    <div className="tool">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here…" style={{ fontFamily: 'inherit', fontSize: 16 }} />
      <div className="stats">
        {[['Words', s.words], ['Characters', s.chars], ['No spaces', s.noSpace], ['Sentences', s.sentences], ['Paragraphs', s.paragraphs], ['Reading time', s.read + ' min']].map(([k, v]) => (
          <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>
        ))}
      </div>
      {s.top.length > 0 && <p className="muted" style={{ marginTop: 14 }}>Top words: {s.top.map(([w, n]) => `${w} (${n})`).join(', ')}</p>}
    </div>
  );
}

const SMALL = new Set('a an and as at but by for in nor of on or per the to vs via'.split(' '));
const wordsOf = (t) => t.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const CASES = {
  'UPPERCASE': (t) => t.toUpperCase(),
  'lowercase': (t) => t.toLowerCase(),
  'Title Case': (t) => t.toLowerCase().replace(/[\p{L}\p{N}']+/gu, (w, i) => (i > 0 && SMALL.has(w) ? w : w[0].toUpperCase() + w.slice(1))),
  'Sentence case': (t) => t.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()),
  'camelCase': (t) => wordsOf(t).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join(''),
  'PascalCase': (t) => wordsOf(t).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''),
  'snake_case': (t) => wordsOf(t).map((w) => w.toLowerCase()).join('_'),
  'kebab-case': (t) => wordsOf(t).map((w) => w.toLowerCase()).join('-'),
  'aLtErNaTiNg': (t) => [...t].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(''),
};

export function CaseConverter() {
  const [text, setText] = useState('');
  return (
    <div className="tool">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your text…" style={{ fontFamily: 'inherit', fontSize: 16, minHeight: 160 }} />
      <div className="row" style={{ marginTop: 12 }}>
        {Object.entries(CASES).map(([k, f]) => <button key={k} className="btn small ghost" onClick={() => setText(f(text))}>{k}</button>)}
        <CopyButton text={text} />
      </div>
    </div>
  );
}

export function JsonFormatter() {
  const [text, setText] = useState('');
  const [indent, setIndent] = useState('2');
  const [msg, setMsg] = useState(null);
  const apply = (minify) => {
    try {
      const v = JSON.parse(text);
      setText(minify ? JSON.stringify(v) : JSON.stringify(v, null, indent === 'tab' ? '\t' : +indent));
      setMsg({ ok: true, t: minify ? 'Valid JSON — minified.' : 'Valid JSON — formatted.' });
    } catch (e) {
      const m = String(e.message).match(/position (\d+)/); let where = '';
      if (m) { const pos = +m[1]; const before = text.slice(0, pos); where = ` (line ${before.split('\n').length}, column ${pos - before.lastIndexOf('\n')})`; }
      setMsg({ ok: false, t: 'Invalid JSON: ' + e.message + where });
    }
  };
  return (
    <div className="tool">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder='{"paste": "your JSON here"}' spellCheck={false} />
      <div className="row" style={{ marginTop: 12 }}>
        <label>Indent <select value={indent} onChange={(e) => setIndent(e.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></label>
        <button className="btn" onClick={() => apply(false)}>Format</button>
        <button className="btn ghost" onClick={() => apply(true)}>Minify</button>
        <CopyButton text={text} />
        {msg && <span className={msg.ok ? 'ok' : 'err'}>{msg.t}</span>}
      </div>
    </div>
  );
}

const b64enc = (s) => { const b = new TextEncoder().encode(s); let bin = ''; b.forEach((x) => (bin += String.fromCharCode(x))); return btoa(bin); };
const b64dec = (s) => { const bin = atob(s.replace(/^data:[^,]*,/, '').replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/')); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); };

export function Base64Tool() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [fileOut, setFileOut] = useState('');
  let output = '', error = '';
  try { output = fileOut || (input ? (mode === 'encode' ? b64enc(input) : b64dec(input)) : ''); } catch { error = 'This is not valid Base64.'; }
  const pickFile = (f) => { const r = new FileReader(); r.onload = () => setFileOut(String(r.result)); r.readAsDataURL(f); };
  return (
    <div className="tool">
      <div className="row" style={{ marginBottom: 12 }}>
        <label><input type="radio" checked={mode === 'encode'} onChange={() => { setMode('encode'); setFileOut(''); }} /> Encode</label>
        <label><input type="radio" checked={mode === 'decode'} onChange={() => { setMode('decode'); setFileOut(''); }} /> Decode</label>
        {mode === 'encode' && <label>or file → data URL <input type="file" onChange={(e) => e.target.files[0] && pickFile(e.target.files[0])} /></label>}
      </div>
      <textarea value={input} onChange={(e) => { setInput(e.target.value); setFileOut(''); }} placeholder={mode === 'encode' ? 'Text to encode…' : 'Base64 to decode…'} style={{ minHeight: 140 }} />
      <div className="row" style={{ margin: '10px 0' }}><b>Result</b><CopyButton text={output} />{error && <span className="err">{error}</span>}</div>
      <textarea readOnly value={output} style={{ minHeight: 140 }} />
    </div>
  );
}

const SETS = { lower: 'abcdefghijkmnopqrstuvwxyz', upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', digits: '23456789', symbols: '!@#$%^&*()-_=+[]{};:,.?' };
function randomPassword(len, opts) {
  const pools = Object.keys(SETS).filter((k) => opts[k]).map((k) => SETS[k]);
  if (!pools.length) return '';
  const all = pools.join(''); const rnd = new Uint32Array(len + pools.length); crypto.getRandomValues(rnd);
  const chars = pools.map((p, i) => p[rnd[i] % p.length]);
  for (let i = chars.length; i < len; i++) chars.push(all[rnd[i] % all.length]);
  const sh = new Uint32Array(chars.length); crypto.getRandomValues(sh);
  for (let i = chars.length - 1; i > 0; i--) { const j = sh[i] % (i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}

export function PasswordGenerator() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [pw, setPw] = useState('');
  const entropy = Math.round(len * Math.log2(Object.keys(SETS).filter((k) => opts[k]).reduce((n, k) => n + SETS[k].length, 0) || 1));
  return (
    <div className="tool">
      <div className="row">
        <label>Length <b>{len}</b> <input type="range" min="8" max="64" value={len} onChange={(e) => setLen(+e.target.value)} /></label>
        {Object.keys(SETS).map((k) => <label key={k}><input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} /> {k}</label>)}
        <button className="btn" onClick={() => setPw(randomPassword(len, opts))}>Generate</button>
      </div>
      {pw && <div className="row" style={{ marginTop: 16 }}>
        <code style={{ fontSize: 20, background: '#f1f5f9', padding: '10px 14px', borderRadius: 8, wordBreak: 'break-all' }}>{pw}</code>
        <CopyButton text={pw} />
      </div>}
      <p className="muted">Strength: about {entropy} bits of entropy — {entropy >= 100 ? 'excellent' : entropy >= 70 ? 'strong' : entropy >= 50 ? 'fair' : 'weak'}. Similar-looking characters (l, 1, O, 0) are excluded.</p>
    </div>
  );
}
