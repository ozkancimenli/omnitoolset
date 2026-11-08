'use client';
import { useState } from 'react';

const num = (v) => (v === '' || v === null ? NaN : Number(v));
const fmt = (n) => (Number.isFinite(n) ? String(+n.toFixed(6)) : '—');

export function PercentageCalculator() {
  const [a1, setA1] = useState('15'); const [b1, setB1] = useState('80');
  const [a2, setA2] = useState('12'); const [b2, setB2] = useState('60');
  const [a3, setA3] = useState('50'); const [b3, setB3] = useState('65');
  const r1 = num(a1) / 100 * num(b1);
  const r2 = num(b2) === 0 ? NaN : num(a2) / num(b2) * 100;
  const r3 = num(a3) === 0 ? NaN : (num(b3) - num(a3)) / Math.abs(num(a3)) * 100;
  const I = (v, s) => <input type="number" value={v} onChange={(e) => s(e.target.value)} style={{ width: 110 }} />;
  const Row = ({ children, result }) => <div className="row" style={{ margin: '12px 0' }}>{children}<b style={{ fontSize: 20 }}>= {result}</b></div>;
  return (
    <div className="tool">
      <h3>What is X% of Y?</h3>
      <Row result={fmt(r1)}>What is {I(a1, setA1)} % of {I(b1, setB1)}</Row>
      <h3>X is what percent of Y?</h3>
      <Row result={`${fmt(r2)} %`}>{I(a2, setA2)} is what % of {I(b2, setB2)}</Row>
      <h3>Percentage change from X to Y</h3>
      <Row result={`${Number.isFinite(r3) && r3 > 0 ? '+' : ''}${fmt(r3)} %`}>From {I(a3, setA3)} to {I(b3, setB3)}</Row>
      <p className="muted">{Number.isFinite(r3) ? (r3 >= 0 ? `An increase of ${fmt(r3)}%.` : `A decrease of ${fmt(-r3)}%.`) : ''}</p>
    </div>
  );
}

export function ageBetween(birth, on) {
  if (!(birth <= on)) return null;
  let y = on.getFullYear() - birth.getFullYear(), m = on.getMonth() - birth.getMonth(), d = on.getDate() - birth.getDate();
  if (d < 0) { m -= 1; d += new Date(on.getFullYear(), on.getMonth(), 0).getDate(); }
  if (m < 0) { y -= 1; m += 12; }
  const days = Math.round((Date.UTC(on.getFullYear(), on.getMonth(), on.getDate()) - Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate())) / 864e5);
  let next = new Date(on.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < new Date(on.getFullYear(), on.getMonth(), on.getDate())) next = new Date(on.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const untilNext = Math.round((Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) - Date.UTC(on.getFullYear(), on.getMonth(), on.getDate())) / 864e5);
  return { y, m, d, days, weeks: Math.floor(days / 7), untilNext, nextAge: next.getFullYear() - birth.getFullYear(), weekday: birth.toLocaleDateString('en-US', { weekday: 'long' }) };
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return y ? new Date(y, m - 1, d) : null; };

export function AgeCalculator() {
  const [birth, setBirth] = useState('1990-06-15');
  const [on, setOn] = useState(() => iso(new Date()));
  const b = parse(birth), o = parse(on); const r = b && o ? ageBetween(b, o) : null;
  return (
    <div className="tool">
      <div className="row">
        <label>Date of birth <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></label>
        <label>Age on <input type="date" value={on} onChange={(e) => setOn(e.target.value)} /></label>
      </div>
      {r ? <>
        <p style={{ fontSize: 24, margin: '18px 0 6px' }}><b>{r.y} years, {r.m} months, {r.d} days</b></p>
        <div className="stats">
          {[['Total days', r.days.toLocaleString()], ['Total weeks', r.weeks.toLocaleString()], ['Next birthday in', r.untilNext === 0 ? 'Today 🎉' : `${r.untilNext} days`], ['Turning', r.nextAge], ['Born on a', r.weekday]].map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}
        </div>
      </> : <p className="err">The birth date must be on or before the second date.</p>}
    </div>
  );
}
