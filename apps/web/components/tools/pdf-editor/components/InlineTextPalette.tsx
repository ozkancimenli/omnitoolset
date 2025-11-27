'use client';

interface InlineTextPaletteProps {
  isActive: boolean;
  color: string;
  fontSize: number;
  fontFamily: string;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onColorChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function InlineTextPalette({
  isActive,
  color,
  fontSize,
  fontFamily,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onCopy,
  onDelete,
}: InlineTextPaletteProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1 rounded-2xl border px-3 py-2 shadow-xl text-[12px] font-medium transition ${
        isActive
          ? 'bg-indigo-600/95 text-white border-indigo-500/60 shadow-indigo-500/30'
          : 'bg-white/95 text-slate-700 border-slate-200'
      }`}
    >
      <button onClick={onBold} className="px-2 py-1 rounded-md hover:bg-white/20 font-semibold">
        B
      </button>
      <button onClick={onItalic} className="px-2 py-1 rounded-md hover:bg-white/20 italic">
        I
      </button>
      <button onClick={onUnderline} className="px-2 py-1 rounded-md hover:bg-white/20 underline">
        U
      </button>
      <div className="w-px h-4 bg-white/40 dark:bg-slate-700/60 mx-1" />
      <button onClick={onAlignLeft} className="px-2 py-1 rounded-md hover:bg-white/20">
        ⬅
      </button>
      <button onClick={onAlignCenter} className="px-2 py-1 rounded-md hover:bg-white/20">
        ⇆
      </button>
      <button onClick={onAlignRight} className="px-2 py-1 rounded-md hover:bg-white/20">
        ➡
      </button>
      <div className="w-px h-4 bg-white/40 dark:bg-slate-700/60 mx-1" />
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-8 h-8 rounded-md border border-white/40 cursor-pointer"
      />
      <input
        type="number"
        value={Math.round(fontSize)}
        min={6}
        max={128}
        onChange={(e) => onFontSizeChange(Number(e.target.value))}
        className="w-16 px-2 py-1 rounded-md border border-white/30 bg-white/10 text-xs"
      />
      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        className="px-2 py-1 rounded-md border border-white/30 bg-white/10 text-xs"
      >
        <option value="Helvetica">Sans</option>
        <option value="Times New Roman">Serif</option>
        <option value="Courier New">Mono</option>
      </select>
      <div className="w-px h-4 bg-white/40 dark:bg-slate-700/60 mx-1" />
      <button onClick={onCopy} className="px-2 py-1 rounded-md hover:bg-white/20">
        Copy
      </button>
      <button onClick={onDelete} className="px-2 py-1 rounded-md hover:bg-rose-500/40 text-rose-50">
        Delete
      </button>
    </div>
  );
}
