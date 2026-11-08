'use client';
import { useMemo, useState } from 'react';

// Satır bazlı LCS farkı: eşit / silinen / eklenen satırlar.
export function diffLines(a, b) {
  const A = a.split('\n'), B = b.split('\n'), n = A.length, m = B.length;
  if (n * m > 4e6) throw new Error('Texts are too long to compare in the browser (limit ≈ 2,000 × 2,000 lines).');
  const L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push(['=', A[i], i + 1, j + 1]); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { out.push(['-', A[i], i + 1, null]); i++; }
    else { out.push(['+', B[j], null, j + 1]); j++; }
  }
  while (i < n) { out.push(['-', A[i], i + 1, null]); i++; }
  while (j < m) { out.push(['+', B[j], null, j + 1]); j++; }
  return out;
}

const COLORS = { '-': '#fee2e2', '+': '#dcfce7', '=': 'transparent' };

export default function DiffChecker() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [run, setRun] = useState(0);
  const result = useMemo(() => {
    if (!run) return null;
    const norm = (t) => (ignoreWs ? t.split('\n').map((l) => l.trim().replace(/\s+/g, ' ')).join('\n') : t);
    try { return { rows: diffLines(norm(a), norm(b)) }; } catch (e) { return { error: e.message }; }
  }, [run]); // eslint-disable-line react-hooks/exhaustive-deps
  const added = result?.rows?.filter((r) => r[0] === '+').length || 0, removed = result?.rows?.filter((r) => r[0] === '-').length || 0;
  return (
    <div className="tool">
      <div className="row" style={{ alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: 260 }}><label>Original</label><textarea value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} /></div>
        <div style={{ flex: 1, minWidth: 260 }}><label>Changed</label><textarea value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} /></div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => setRun((x) => x + 1)}>Compare</button>
        <label><input type="checkbox" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} /> Ignore extra whitespace</label>
        {result?.rows && <span><span className="ok">+{added} added</span> · <span className="err">−{removed} removed</span>{!added && !removed && ' — the texts are identical'}</span>}
        {result?.error && <span className="err">{result.error}</span>}
      </div>
      {result?.rows && (added || removed) > 0 && (
        <pre style={{ marginTop: 14, border: '1px solid var(--line)', borderRadius: 8, overflow: 'auto', maxHeight: 520, fontSize: 13, lineHeight: 1.5 }}>
          {result.rows.map((r, k) => (
            <div key={k} style={{ background: COLORS[r[0]], padding: '0 10px', whiteSpace: 'pre-wrap' }}>
              <span className="muted" style={{ display: 'inline-block', width: 80 }}>{r[2] ?? ''} {r[3] ?? ''}</span>{r[0] === '=' ? ' ' : r[0]} {r[1]}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
