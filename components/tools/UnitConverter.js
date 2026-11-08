'use client';
import { useState } from 'react';

// Her birim temel birime çarpanla tanımlı (uzunluk: metre, ağırlık: kilogram, hacim: litre, alan: m²).
const UNITS = {
  Length: { base: 'm', u: { Millimeter: 0.001, Centimeter: 0.01, Meter: 1, Kilometer: 1000, Inch: 0.0254, Foot: 0.3048, Yard: 0.9144, Mile: 1609.344 } },
  Weight: { base: 'kg', u: { Milligram: 1e-6, Gram: 0.001, Kilogram: 1, 'Metric ton': 1000, Ounce: 0.028349523125, Pound: 0.45359237, Stone: 6.35029318 } },
  Volume: { base: 'L', u: { Milliliter: 0.001, Liter: 1, 'Cubic meter': 1000, Teaspoon: 0.00492892159375, Tablespoon: 0.01478676478125, 'Fluid ounce (US)': 0.0295735295625, 'Cup (US)': 0.2365882365, 'Pint (US)': 0.473176473, 'Quart (US)': 0.946352946, 'Gallon (US)': 3.785411784 } },
  Area: { base: 'm²', u: { 'Square meter': 1, 'Square kilometer': 1e6, Hectare: 10000, 'Square foot': 0.09290304, 'Square yard': 0.83612736, Acre: 4046.8564224, 'Square mile': 2589988.110336 } },
  Temperature: { temp: true, u: { Celsius: 0, Fahrenheit: 0, Kelvin: 0 } },
};
const toC = { Celsius: (v) => v, Fahrenheit: (v) => (v - 32) * 5 / 9, Kelvin: (v) => v - 273.15 };
const fromC = { Celsius: (v) => v, Fahrenheit: (v) => v * 9 / 5 + 32, Kelvin: (v) => v + 273.15 };

export function convert(kind, value, from, to) {
  const k = UNITS[kind];
  if (k.temp) return fromC[to](toC[from](value));
  return value * k.u[from] / k.u[to];
}
const fmt = (n) => (Number.isFinite(n) ? (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0) ? n.toExponential(6) : String(+n.toPrecision(10))) : '—');

export default function UnitConverter() {
  const [kind, setKind] = useState('Length');
  const names = Object.keys(UNITS[kind].u);
  const [from, setFrom] = useState('Meter');
  const [to, setTo] = useState('Foot');
  const [value, setValue] = useState('1');
  const pick = (k) => { setKind(k); const n = Object.keys(UNITS[k].u); setFrom(n[0]); setTo(n[1]); };
  const v = parseFloat(value);
  const f = names.includes(from) ? from : names[0], t = names.includes(to) ? to : names[1];
  return (
    <div className="tool">
      <div className="row" style={{ marginBottom: 14 }}>{Object.keys(UNITS).map((k) => <button key={k} className={'btn small' + (k === kind ? '' : ' ghost')} onClick={() => pick(k)}>{k}</button>)}</div>
      <div className="row">
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: 160 }} />
        <select value={f} onChange={(e) => setFrom(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select>
        <button className="btn small ghost" onClick={() => { setFrom(t); setTo(f); }} aria-label="Swap units">⇄</button>
        <select value={t} onChange={(e) => setTo(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select>
      </div>
      <p style={{ fontSize: 24, margin: '18px 0 6px' }}><b>{Number.isFinite(v) ? `${value} ${f} = ${fmt(convert(kind, v, f, t))} ${t}` : 'Enter a number'}</b></p>
      {Number.isFinite(v) && <div className="stats">{names.filter((n) => n !== f).map((n) => <div className="stat" key={n}><b style={{ fontSize: 18 }}>{fmt(convert(kind, v, f, n))}</b><span>{n}</span></div>)}</div>}
    </div>
  );
}
