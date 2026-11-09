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

const money = (n) => (Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—');

export function discountTotals(price, pct, tax) {
  const saved = price * pct / 100; const after = price - saved; const taxAmt = after * tax / 100;
  return { saved, after, taxAmt, total: after + taxAmt };
}

export function DiscountCalculator() {
  const [price, setPrice] = useState('120'); const [pct, setPct] = useState('25'); const [tax, setTax] = useState('0');
  const r = discountTotals(num(price), num(pct), num(tax) || 0);
  return (
    <div className="tool">
      <div className="row">
        <label>Original price <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: 120 }} /></label>
        <label>Discount % <input type="number" min="0" max="100" value={pct} onChange={(e) => setPct(e.target.value)} style={{ width: 90 }} /></label>
        <label>Sales tax % (optional) <input type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} style={{ width: 90 }} /></label>
      </div>
      <div className="row" style={{ margin: '10px 0' }}>{[10, 15, 20, 25, 30, 40, 50, 70].map((p) => <button key={p} className={'btn small' + (num(pct) === p ? '' : ' ghost')} onClick={() => setPct(String(p))}>{p}%</button>)}</div>
      <div className="stats">
        {[['Final price', money(r.total)], ['You save', money(r.saved)], ['Price after discount', money(r.after)], ['Tax', money(r.taxAmt)]].map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}
      </div>
    </div>
  );
}

export function tipSplit(bill, pct, people, roundUp) {
  const tip = bill * pct / 100; const total = bill + tip; let each = total / Math.max(1, people);
  if (roundUp) each = Math.ceil(each);
  return { tip, total, each, eachTip: tip / Math.max(1, people) };
}

export function TipCalculator() {
  const [bill, setBill] = useState('84.50'); const [pct, setPct] = useState('18'); const [people, setPeople] = useState('2'); const [round, setRound] = useState(false);
  const r = tipSplit(num(bill), num(pct), Math.max(1, Math.floor(num(people) || 1)), round);
  return (
    <div className="tool">
      <div className="row">
        <label>Bill amount <input type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(e.target.value)} style={{ width: 120 }} /></label>
        <label>Tip % <input type="number" min="0" value={pct} onChange={(e) => setPct(e.target.value)} style={{ width: 80 }} /></label>
        <label>People <input type="number" min="1" value={people} onChange={(e) => setPeople(e.target.value)} style={{ width: 80 }} /></label>
        <label><input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} /> Round up per person</label>
      </div>
      <div className="row" style={{ margin: '10px 0' }}>{[10, 15, 18, 20, 22, 25].map((p) => <button key={p} className={'btn small' + (num(pct) === p ? '' : ' ghost')} onClick={() => setPct(String(p))}>{p}%</button>)}</div>
      <div className="stats">
        {[['Per person', money(r.each)], ['Tip', money(r.tip)], ['Total', money(r.total)], ['Tip per person', money(r.eachTip)]].map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}
      </div>
    </div>
  );
}

export function bmi(kg, m) { return kg / (m * m); }
export function bmiCategory(b) {
  if (!Number.isFinite(b)) return '';
  return b < 18.5 ? 'Underweight' : b < 25 ? 'Healthy weight' : b < 30 ? 'Overweight' : 'Obesity';
}

export function BmiCalculator() {
  const [unit, setUnit] = useState('metric');
  const [cm, setCm] = useState('175'); const [kg, setKg] = useState('70');
  const [ft, setFt] = useState('5'); const [inch, setInch] = useState('9'); const [lb, setLb] = useState('154');
  const m = unit === 'metric' ? num(cm) / 100 : (num(ft) * 12 + (num(inch) || 0)) * 0.0254;
  const w = unit === 'metric' ? num(kg) : num(lb) * 0.45359237;
  const b = m > 0 && w > 0 ? bmi(w, m) : NaN;
  const lo = 18.5 * m * m, hi = 24.9 * m * m;
  const range = unit === 'metric' ? `${lo.toFixed(1)}–${hi.toFixed(1)} kg` : `${(lo / 0.45359237).toFixed(0)}–${(hi / 0.45359237).toFixed(0)} lb`;
  return (
    <div className="tool">
      <div className="row" style={{ marginBottom: 12 }}>
        <button className={'btn small' + (unit === 'metric' ? '' : ' ghost')} onClick={() => setUnit('metric')}>Metric (cm, kg)</button>
        <button className={'btn small' + (unit === 'us' ? '' : ' ghost')} onClick={() => setUnit('us')}>US (ft, in, lb)</button>
      </div>
      {unit === 'metric' ? <div className="row">
        <label>Height (cm) <input type="number" value={cm} onChange={(e) => setCm(e.target.value)} style={{ width: 100 }} /></label>
        <label>Weight (kg) <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} style={{ width: 100 }} /></label>
      </div> : <div className="row">
        <label>Height <input type="number" value={ft} onChange={(e) => setFt(e.target.value)} style={{ width: 70 }} /> ft <input type="number" value={inch} onChange={(e) => setInch(e.target.value)} style={{ width: 70 }} /> in</label>
        <label>Weight (lb) <input type="number" value={lb} onChange={(e) => setLb(e.target.value)} style={{ width: 100 }} /></label>
      </div>}
      {Number.isFinite(b) && <>
        <p style={{ fontSize: 26, margin: '18px 0 4px' }}><b>BMI {b.toFixed(1)}</b> — {bmiCategory(b)}</p>
        <p className="muted">A BMI of 18.5–24.9 for this height corresponds to about {range}.</p>
      </>}
      <p className="muted" style={{ fontSize: 13 }}>BMI is a screening measure for adults and does not account for muscle, age, sex or body composition. It is not medical advice — talk to a healthcare professional about your health.</p>
    </div>
  );
}

export function loanPayment(principal, annualRate, years) {
  const n = Math.round(years * 12), r = annualRate / 100 / 12;
  if (!(principal > 0) || !(n > 0)) return null;
  const pay = r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
  const rows = []; let bal = principal;
  for (let y = 1; y <= Math.ceil(n / 12); y++) {
    let int = 0, pr = 0;
    for (let k = 0; k < 12 && (y - 1) * 12 + k < n; k++) { const i = bal * r; int += i; pr += pay - i; bal -= pay - i; }
    rows.push({ y, int, pr, bal: Math.max(0, bal) });
  }
  return { pay, n, total: pay * n, interest: pay * n - principal, rows };
}

export function LoanCalculator() {
  const [p, setP] = useState('300000'); const [rate, setRate] = useState('6.5'); const [yrs, setYrs] = useState('30');
  const r = loanPayment(num(p), num(rate) || 0, num(yrs));
  return (
    <div className="tool">
      <div className="row">
        <label>Loan amount <input type="number" value={p} onChange={(e) => setP(e.target.value)} style={{ width: 130 }} /></label>
        <label>Interest rate (APR %) <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} style={{ width: 90 }} /></label>
        <label>Term (years) <input type="number" value={yrs} onChange={(e) => setYrs(e.target.value)} style={{ width: 80 }} /></label>
      </div>
      <div className="row" style={{ margin: '10px 0' }}>{[10, 15, 20, 30].map((y) => <button key={y} className={'btn small' + (num(yrs) === y ? '' : ' ghost')} onClick={() => setYrs(String(y))}>{y} years</button>)}</div>
      {r ? <>
        <div className="stats">
          {[['Monthly payment', money(r.pay)], ['Total interest', money(r.interest)], ['Total paid', money(r.total)], ['Payments', r.n]].map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}
        </div>
        <details style={{ marginTop: 16 }}><summary>Yearly amortization schedule</summary>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
            <thead><tr>{['Year', 'Principal paid', 'Interest paid', 'Balance'].map((h) => <th key={h} style={{ textAlign: 'right', borderBottom: '1px solid var(--line)', padding: 6 }}>{h}</th>)}</tr></thead>
            <tbody>{r.rows.map((x) => <tr key={x.y}>{[x.y, money(x.pr), money(x.int), money(x.bal)].map((v, i) => <td key={i} style={{ textAlign: 'right', padding: 6, borderBottom: '1px solid var(--line)' }}>{v}</td>)}</tr>)}</tbody>
          </table>
        </details>
        <p className="muted" style={{ fontSize: 13 }}>Principal and interest only. Mortgage payments usually also include property tax, homeowners insurance and sometimes PMI or HOA fees.</p>
      </> : <p className="err">Enter a loan amount and term.</p>}
    </div>
  );
}

// Yanlılıksız [0, n) — reddetme örneklemesi
const secureRand = (n) => { const lim = Math.floor(4294967296 / n) * n; const a = new Uint32Array(1); do crypto.getRandomValues(a); while (a[0] >= lim); return a[0] % n; };

export function randomInts(min, max, count, unique, rand = secureRand) {
  const lo = Math.ceil(Math.min(min, max)), hi = Math.floor(Math.max(min, max)), span = hi - lo + 1;
  if (!(span > 0) || !(count > 0)) return [];
  if (unique && count > span) throw new Error(`Only ${span} unique numbers exist between ${lo} and ${hi}.`);
  if (unique) { const pool = Array.from({ length: span }, (_, i) => lo + i); for (let i = 0; i < count; i++) { const j = i + rand(span - i); [pool[i], pool[j]] = [pool[j], pool[i]]; } return pool.slice(0, count); }
  return Array.from({ length: count }, () => lo + rand(span));
}

export function RandomNumberGenerator() {
  const [min, setMin] = useState('1'); const [max, setMax] = useState('100'); const [count, setCount] = useState('1');
  const [unique, setUnique] = useState(true); const [sort, setSort] = useState(false);
  const [out, setOut] = useState([]); const [err, setErr] = useState('');
  const go = () => { try { let r = randomInts(num(min), num(max), Math.min(10000, Math.floor(num(count) || 1)), unique); if (sort) r = [...r].sort((a, b) => a - b); setOut(r); setErr(''); } catch (e) { setErr(e.message); } };
  return (
    <div className="tool">
      <div className="row">
        <label>Min <input type="number" value={min} onChange={(e) => setMin(e.target.value)} style={{ width: 100 }} /></label>
        <label>Max <input type="number" value={max} onChange={(e) => setMax(e.target.value)} style={{ width: 100 }} /></label>
        <label>How many <input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} style={{ width: 80 }} /></label>
        <label><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> No repeats</label>
        <label><input type="checkbox" checked={sort} onChange={(e) => setSort(e.target.checked)} /> Sort</label>
        <button className="btn" onClick={go}>Generate</button>
      </div>
      {err && <p className="err">{err}</p>}
      {out.length > 0 && <p style={{ fontSize: out.length === 1 ? 56 : 20, fontWeight: 800, margin: '18px 0', wordBreak: 'break-word' }}>{out.join(', ')}</p>}
      {out.length > 0 && <CopyButtonLocal text={out.join(', ')} />}
    </div>
  );
}

function CopyButtonLocal({ text }) {
  const [done, setDone] = useState(false);
  return <button className="btn small ghost" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>{done ? 'Copied ✓' : 'Copy'}</button>;
}

export function daysBetween(a, b, includeEnd = false) {
  const d = Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
  return d + (includeEnd ? Math.sign(d || 1) : 0);
}
export function businessDays(a, b) {
  let s = a <= b ? a : b, e = a <= b ? b : a, n = 0; const c = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  while (c < e) { const w = c.getDay(); if (w !== 0 && w !== 6) n++; c.setDate(c.getDate() + 1); }
  return n;
}

export function DaysBetween() {
  const today = iso(new Date());
  const [a, setA] = useState(today); const [b, setB] = useState(`${new Date().getFullYear()}-12-25`); const [incl, setIncl] = useState(false);
  const A = parse(a), B = parse(b); const d = A && B ? daysBetween(A, B, incl) : NaN;
  const abs = Math.abs(d);
  return (
    <div className="tool">
      <div className="row">
        <label>Start date <input type="date" value={a} onChange={(e) => setA(e.target.value)} /></label>
        <label>End date <input type="date" value={b} onChange={(e) => setB(e.target.value)} /></label>
        <label><input type="checkbox" checked={incl} onChange={(e) => setIncl(e.target.checked)} /> Include end date</label>
      </div>
      {Number.isFinite(d) && <>
        <p style={{ fontSize: 26, margin: '18px 0 6px' }}><b>{abs.toLocaleString()} day{abs === 1 ? '' : 's'}</b> {d < 0 ? '(end date is before start date)' : ''}</p>
        <div className="stats">
          {[['Weeks + days', `${Math.floor(abs / 7)} w ${abs % 7} d`], ['Business days (Mon–Fri)', businessDays(A, B).toLocaleString()], ['Hours', (abs * 24).toLocaleString()], ['Approx. months', (abs / 30.4375).toFixed(1)]].map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}
        </div>
        <p className="muted" style={{ fontSize: 13 }}>Business days exclude weekends but not public holidays. The start date is counted; the end date only if you tick the box.</p>
      </>}
    </div>
  );
}
