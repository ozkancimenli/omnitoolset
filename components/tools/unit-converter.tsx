'use client';

import { useState } from 'react';
import ToolBase from './ToolBase';

type UnitCategory = 'length' | 'weight' | 'volume' | 'temperature' | 'area' | 'speed' | 'time' | 'energy';

const UNIT_CONVERSIONS: Record<UnitCategory, { units: string[]; conversions: Record<string, Record<string, number | string>> }> = {
  length: {
    units: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch', 'nautical mile'],
    conversions: {
      meter: { meter: 1, kilometer: 0.001, centimeter: 100, millimeter: 1000, mile: 0.000621371, yard: 1.09361, foot: 3.28084, inch: 39.3701, 'nautical mile': 0.000539957 },
      kilometer: { meter: 1000, kilometer: 1, centimeter: 100000, millimeter: 1000000, mile: 0.621371, yard: 1093.61, foot: 3280.84, inch: 39370.1, 'nautical mile': 0.539957 },
      centimeter: { meter: 0.01, kilometer: 0.00001, centimeter: 1, millimeter: 10, mile: 0.00000621371, yard: 0.0109361, foot: 0.0328084, inch: 0.393701, 'nautical mile': 0.00000539957 },
      millimeter: { meter: 0.001, kilometer: 0.000001, centimeter: 0.1, millimeter: 1, mile: 0.000000621371, yard: 0.00109361, foot: 0.00328084, inch: 0.0393701, 'nautical mile': 0.000000539957 },
      mile: { meter: 1609.34, kilometer: 1.60934, centimeter: 160934, millimeter: 1609340, mile: 1, yard: 1760, foot: 5280, inch: 63360, 'nautical mile': 0.868976 },
      yard: { meter: 0.9144, kilometer: 0.0009144, centimeter: 91.44, millimeter: 914.4, mile: 0.000568182, yard: 1, foot: 3, inch: 36, 'nautical mile': 0.000493737 },
      foot: { meter: 0.3048, kilometer: 0.0003048, centimeter: 30.48, millimeter: 304.8, mile: 0.000189394, yard: 0.333333, foot: 1, inch: 12, 'nautical mile': 0.000164579 },
      inch: { meter: 0.0254, kilometer: 0.0000254, centimeter: 2.54, millimeter: 25.4, mile: 0.0000157828, yard: 0.0277778, foot: 0.0833333, inch: 1, 'nautical mile': 0.0000137149 },
      'nautical mile': { meter: 1852, kilometer: 1.852, centimeter: 185200, millimeter: 1852000, mile: 1.15078, yard: 2025.37, foot: 6076.12, inch: 72913.4, 'nautical mile': 1 },
    },
  },
  weight: {
    units: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton', 'metric ton'],
    conversions: {
      kilogram: { kilogram: 1, gram: 1000, milligram: 1000000, pound: 2.20462, ounce: 35.274, ton: 0.00110231, 'metric ton': 0.001 },
      gram: { kilogram: 0.001, gram: 1, milligram: 1000, pound: 0.00220462, ounce: 0.035274, ton: 0.00000110231, 'metric ton': 0.000001 },
      milligram: { kilogram: 0.000001, gram: 0.001, milligram: 1, pound: 0.00000220462, ounce: 0.000035274, ton: 0.00000000110231, 'metric ton': 0.000000001 },
      pound: { kilogram: 0.453592, gram: 453.592, milligram: 453592, pound: 1, ounce: 16, ton: 0.0005, 'metric ton': 0.000453592 },
      ounce: { kilogram: 0.0283495, gram: 28.3495, milligram: 28349.5, pound: 0.0625, ounce: 1, ton: 0.00003125, 'metric ton': 0.0000283495 },
      ton: { kilogram: 907.185, gram: 907185, milligram: 907185000, pound: 2000, ounce: 32000, ton: 1, 'metric ton': 0.907185 },
      'metric ton': { kilogram: 1000, gram: 1000000, milligram: 1000000000, pound: 2204.62, ounce: 35274, ton: 1.10231, 'metric ton': 1 },
    },
  },
  volume: {
    units: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluid ounce', 'cubic meter', 'cubic foot', 'cubic inch'],
    conversions: {
      liter: { liter: 1, milliliter: 1000, gallon: 0.264172, quart: 1.05669, pint: 2.11338, cup: 4.22675, 'fluid ounce': 33.814, 'cubic meter': 0.001, 'cubic foot': 0.0353147, 'cubic inch': 61.0237 },
      milliliter: { liter: 0.001, milliliter: 1, gallon: 0.000264172, quart: 0.00105669, pint: 0.00211338, cup: 0.00422675, 'fluid ounce': 0.033814, 'cubic meter': 0.000001, 'cubic foot': 0.0000353147, 'cubic inch': 0.0610237 },
      gallon: { liter: 3.78541, milliliter: 3785.41, gallon: 1, quart: 4, pint: 8, cup: 16, 'fluid ounce': 128, 'cubic meter': 0.00378541, 'cubic foot': 0.133681, 'cubic inch': 231 },
      quart: { liter: 0.946353, milliliter: 946.353, gallon: 0.25, quart: 1, pint: 2, cup: 4, 'fluid ounce': 32, 'cubic meter': 0.000946353, 'cubic foot': 0.0334201, 'cubic inch': 57.75 },
      pint: { liter: 0.473176, milliliter: 473.176, gallon: 0.125, quart: 0.5, pint: 1, cup: 2, 'fluid ounce': 16, 'cubic meter': 0.000473176, 'cubic foot': 0.0167101, 'cubic inch': 28.875 },
      cup: { liter: 0.236588, milliliter: 236.588, gallon: 0.0625, quart: 0.25, pint: 0.5, cup: 1, 'fluid ounce': 8, 'cubic meter': 0.000236588, 'cubic foot': 0.00835503, 'cubic inch': 14.4375 },
      'fluid ounce': { liter: 0.0295735, milliliter: 29.5735, gallon: 0.0078125, quart: 0.03125, pint: 0.0625, cup: 0.125, 'fluid ounce': 1, 'cubic meter': 0.0000295735, 'cubic foot': 0.00104438, 'cubic inch': 1.80469 },
      'cubic meter': { liter: 1000, milliliter: 1000000, gallon: 264.172, quart: 1056.69, pint: 2113.38, cup: 4226.75, 'fluid ounce': 33814, 'cubic meter': 1, 'cubic foot': 35.3147, 'cubic inch': 61023.7 },
      'cubic foot': { liter: 28.3168, milliliter: 28316.8, gallon: 7.48052, quart: 29.9221, pint: 59.8442, cup: 119.688, 'fluid ounce': 957.506, 'cubic meter': 0.0283168, 'cubic foot': 1, 'cubic inch': 1728 },
      'cubic inch': { liter: 0.0163871, milliliter: 16.3871, gallon: 0.004329, quart: 0.017316, pint: 0.034632, cup: 0.069264, 'fluid ounce': 0.554113, 'cubic meter': 0.0000163871, 'cubic foot': 0.000578704, 'cubic inch': 1 },
    },
  },
  temperature: {
    units: ['celsius', 'fahrenheit', 'kelvin'],
    conversions: {
      celsius: { celsius: 1, fahrenheit: 'formula', kelvin: 'formula' },
      fahrenheit: { celsius: 'formula', fahrenheit: 1, kelvin: 'formula' },
      kelvin: { celsius: 'formula', fahrenheit: 'formula', kelvin: 1 },
    },
  },
  area: {
    units: ['square meter', 'square kilometer', 'square centimeter', 'square mile', 'acre', 'hectare', 'square yard', 'square foot', 'square inch'],
    conversions: {
      'square meter': { 'square meter': 1, 'square kilometer': 0.000001, 'square centimeter': 10000, 'square mile': 0.000000386102, acre: 0.000247105, hectare: 0.0001, 'square yard': 1.19599, 'square foot': 10.7639, 'square inch': 1550 },
      'square kilometer': { 'square meter': 1000000, 'square kilometer': 1, 'square centimeter': 10000000000, 'square mile': 0.386102, acre: 247.105, hectare: 100, 'square yard': 1195990, 'square foot': 10763900, 'square inch': 1550000000 },
      'square centimeter': { 'square meter': 0.0001, 'square kilometer': 0.0000000001, 'square centimeter': 1, 'square mile': 0.0000000000386102, acre: 0.0000000247105, hectare: 0.00000001, 'square yard': 0.000119599, 'square foot': 0.00107639, 'square inch': 0.155 },
      'square mile': { 'square meter': 2589990, 'square kilometer': 2.58999, 'square centimeter': 25899900000, 'square mile': 1, acre: 640, hectare: 258.999, 'square yard': 3097600, 'square foot': 27878400, 'square inch': 4014489600 },
      acre: { 'square meter': 4046.86, 'square kilometer': 0.00404686, 'square centimeter': 40468600, 'square mile': 0.0015625, acre: 1, hectare: 0.404686, 'square yard': 4840, 'square foot': 43560, 'square inch': 6272640 },
      hectare: { 'square meter': 10000, 'square kilometer': 0.01, 'square centimeter': 100000000, 'square mile': 0.00386102, acre: 2.47105, hectare: 1, 'square yard': 11959.9, 'square foot': 107639, 'square inch': 15500000 },
      'square yard': { 'square meter': 0.836127, 'square kilometer': 0.000000836127, 'square centimeter': 8361.27, 'square mile': 0.000000322831, acre: 0.000206612, hectare: 0.0000836127, 'square yard': 1, 'square foot': 9, 'square inch': 1296 },
      'square foot': { 'square meter': 0.092903, 'square kilometer': 0.000000092903, 'square centimeter': 929.03, 'square mile': 0.0000000358701, acre: 0.0000229568, hectare: 0.0000092903, 'square yard': 0.111111, 'square foot': 1, 'square inch': 144 },
      'square inch': { 'square meter': 0.00064516, 'square kilometer': 0.00000000064516, 'square centimeter': 6.4516, 'square mile': 0.000000000248857, acre: 0.000000159423, hectare: 0.000000064516, 'square yard': 0.000771605, 'square foot': 0.00694444, 'square inch': 1 },
    },
  },
  speed: {
    units: ['meter per second', 'kilometer per hour', 'mile per hour', 'foot per second', 'knot'],
    conversions: {
      'meter per second': { 'meter per second': 1, 'kilometer per hour': 3.6, 'mile per hour': 2.23694, 'foot per second': 3.28084, knot: 1.94384 },
      'kilometer per hour': { 'meter per second': 0.277778, 'kilometer per hour': 1, 'mile per hour': 0.621371, 'foot per second': 0.911344, knot: 0.539957 },
      'mile per hour': { 'meter per second': 0.44704, 'kilometer per hour': 1.60934, 'mile per hour': 1, 'foot per second': 1.46667, knot: 0.868976 },
      'foot per second': { 'meter per second': 0.3048, 'kilometer per hour': 1.09728, 'mile per hour': 0.681818, 'foot per second': 1, knot: 0.592484 },
      knot: { 'meter per second': 0.514444, 'kilometer per hour': 1.852, 'mile per hour': 1.15078, 'foot per second': 1.68781, knot: 1 },
    },
  },
  time: {
    units: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    conversions: {
      second: { second: 1, minute: 0.0166667, hour: 0.000277778, day: 0.0000115741, week: 0.00000165344, month: 0.000000380517, year: 0.0000000317098 },
      minute: { second: 60, minute: 1, hour: 0.0166667, day: 0.000694444, week: 0.0000992063, month: 0.000022831, year: 0.00000190259 },
      hour: { second: 3600, minute: 60, hour: 1, day: 0.0416667, week: 0.00595238, month: 0.00136986, year: 0.000114155 },
      day: { second: 86400, minute: 1440, hour: 24, day: 1, week: 0.142857, month: 0.0328549, year: 0.00273973 },
      week: { second: 604800, minute: 10080, hour: 168, day: 7, week: 1, month: 0.229984, year: 0.0191781 },
      month: { second: 2629746, minute: 43829.1, hour: 730.485, day: 30.4369, week: 4.34813, month: 1, year: 0.0833333 },
      year: { second: 31556952, minute: 525949, hour: 8765.82, day: 365.242, week: 52.1775, month: 12, year: 1 },
    },
  },
  energy: {
    units: ['joule', 'kilojoule', 'calorie', 'kilocalorie', 'watt hour', 'kilowatt hour', 'BTU', 'foot-pound'],
    conversions: {
      joule: { joule: 1, kilojoule: 0.001, calorie: 0.239006, kilocalorie: 0.000239006, 'watt hour': 0.000277778, 'kilowatt hour': 0.000000277778, BTU: 0.000947817, 'foot-pound': 0.737562 },
      kilojoule: { joule: 1000, kilojoule: 1, calorie: 239.006, kilocalorie: 0.239006, 'watt hour': 0.277778, 'kilowatt hour': 0.000277778, BTU: 0.947817, 'foot-pound': 737.562 },
      calorie: { joule: 4.184, kilojoule: 0.004184, calorie: 1, kilocalorie: 0.001, 'watt hour': 0.00116222, 'kilowatt hour': 0.00000116222, BTU: 0.00396567, 'foot-pound': 3.08596 },
      kilocalorie: { joule: 4184, kilojoule: 4.184, calorie: 1000, kilocalorie: 1, 'watt hour': 1.16222, 'kilowatt hour': 0.00116222, BTU: 3.96567, 'foot-pound': 3085.96 },
      'watt hour': { joule: 3600, kilojoule: 3.6, calorie: 860.421, kilocalorie: 0.860421, 'watt hour': 1, 'kilowatt hour': 0.001, BTU: 3.41214, 'foot-pound': 2655.22 },
      'kilowatt hour': { joule: 3600000, kilojoule: 3600, calorie: 860421, kilocalorie: 860.421, 'watt hour': 1000, 'kilowatt hour': 1, BTU: 3412.14, 'foot-pound': 2655220 },
      BTU: { joule: 1055.06, kilojoule: 1.05506, calorie: 252.164, kilocalorie: 0.252164, 'watt hour': 0.293071, 'kilowatt hour': 0.000293071, BTU: 1, 'foot-pound': 778.169 },
      'foot-pound': { joule: 1.35582, kilojoule: 0.00135582, calorie: 0.324048, kilocalorie: 0.000324048, 'watt hour': 0.000376616, 'kilowatt hour': 0.000000376616, BTU: 0.00128507, 'foot-pound': 1 },
    },
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');

  const convert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;

    const conversions = UNIT_CONVERSIONS[category].conversions;
    const conversion = conversions[fromUnit]?.[toUnit];

    // Handle temperature conversions (formulas)
    if (category === 'temperature') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return (numAmount * 9/5) + 32;
      } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
        return numAmount + 273.15;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return (numAmount - 32) * 5/9;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
        return ((numAmount - 32) * 5/9) + 273.15;
      } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
        return numAmount - 273.15;
      } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
        return ((numAmount - 273.15) * 9/5) + 32;
      } else if (fromUnit === toUnit) {
        return numAmount;
      }
    }

    if (typeof conversion === 'number') {
      return numAmount * conversion;
    }
    return 0;
  };

  const result = convert();

  return (
    <ToolBase
      title="Unit Converter"
      description="Convert between different units of measurement"
      icon="📏"
      helpText="Convert between different units of measurement across multiple categories: length, weight, volume, temperature, area, speed, time, and energy."
      tips={[
        'Select unit category',
        'Enter amount to convert',
        'Choose source and target units',
        'Real-time conversion',
        'Supports 8 categories'
      ]}
    >
      <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as UnitCategory);
            const units = UNIT_CONVERSIONS[e.target.value as UnitCategory].units;
            setFromUnit(units[0]);
            setToUnit(units[1] || units[0]);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          {Object.keys(UNIT_CONVERSIONS).map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            {UNIT_CONVERSIONS[category].units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            {UNIT_CONVERSIONS[category].units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Result</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
              {amount} {fromUnit} = {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnit}
            </p>
          </div>
        </div>
      </div>
    </ToolBase>
  );
}

