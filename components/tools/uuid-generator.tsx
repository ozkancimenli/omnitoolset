'use client';

import { useState } from 'react';

export default function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generate = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUID());
    }
    setUuids(newUuids);
  };

  const copyToClipboard = (uuid?: string) => {
    const text = uuid || uuids.join('\n');
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Count: {count}
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <button onClick={generate} className="btn w-full">
        Generate UUIDs
      </button>

      {uuids.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Generated UUIDs:
            </label>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div key={index} className="flex gap-2 items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    value={uuid}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded 
                             text-slate-100 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="btn text-sm px-4"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => copyToClipboard()} className="btn w-full">
            Copy All
          </button>
        </div>
      )}
    </div>
  );
}
