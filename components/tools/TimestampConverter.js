'use client';
import { useEffect, useState } from 'react';
import { CopyButton } from '@/components/FileDrop';

export function parseTimestamp(raw) {
  const t = raw.trim(); if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  // 11+ hane ≈ milisaniye (1973 sonrası), aksi halde saniye
  const ms = Math.abs(n) >= 1e11 ? n : n * 1000;
  const d = new Date(ms); return isNaN(d) ? null : d;
}

export default function TimestampConverter() {
  const [now, setNow] = useState(null);
  const [ts, setTs] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => { const tick = () => setNow(Math.floor(Date.now() / 1000)); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  const d = parseTimestamp(ts);
  const local = date ? new Date(date) : null;
  return (
    <div className="tool">
      <p className="muted">Current Unix time: <b style={{ color: 'var(--ink)', fontFamily: 'ui-monospace, monospace' }}>{now ?? '…'}</b> {now && <CopyButton text={String(now)} />}</p>
      <h3 style={{ marginTop: 18 }}>Timestamp → date</h3>
      <div className="row"><input type="text" value={ts} onChange={(e) => setTs(e.target.value)} placeholder="e.g. 1762632000 or 1762632000000" style={{ width: 280 }} />
        <button className="btn small ghost" onClick={() => setTs(String(now))}>Use now</button></div>
      {ts && (d ? <div className="stats">
        {[['Your time zone', d.toLocaleString()], ['UTC', d.toUTCString()], ['ISO 8601', d.toISOString()], ['Milliseconds', String(d.getTime())]].map(([k, v]) => <div className="stat" key={k}><b style={{ fontSize: 15, wordBreak: 'break-all' }}>{v}</b><span>{k}</span></div>)}
      </div> : <p className="err">Enter a number of seconds or milliseconds.</p>)}
      <h3 style={{ marginTop: 24 }}>Date → timestamp</h3>
      <div className="row"><input type="datetime-local" step="1" value={date} onChange={(e) => setDate(e.target.value)} /> <span className="muted">(your local time zone)</span></div>
      {local && !isNaN(local) && <div className="row" style={{ marginTop: 10 }}>
        <span>Seconds: <code>{Math.floor(local.getTime() / 1000)}</code></span><CopyButton text={String(Math.floor(local.getTime() / 1000))} />
        <span>Milliseconds: <code>{local.getTime()}</code></span>
      </div>}
    </div>
  );
}
