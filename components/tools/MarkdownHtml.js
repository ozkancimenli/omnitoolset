'use client';
import { useState } from 'react';
import { CopyButton, download } from '@/components/FileDrop';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(`<code>${esc(c)}</code>`); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img src="${u}" alt="${a}">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => (/^(https?:|mailto:|\/|#)/.test(u) ? `<a href="${u}">${t}</a>` : t))
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, a, b) => `<strong>${a || b}</strong>`)
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>').replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[i]);
}

// Yaygın Markdown alt kümesi: başlıklar, paragraflar, listeler, alıntılar, kod blokları, yatay çizgi, satır içi biçimler.
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n'); const out = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^```/.test(l)) { const lang = l.slice(3).trim(); const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(buf.join('\n'))}</code></pre>`); continue; }
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { out.push(`<h${m[1].length}>${inline(m[2].replace(/\s+#+$/, ''))}</h${m[1].length}>`); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(l)) { const buf = []; while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${markdownToHtml(buf.join('\n'))}</blockquote>`); continue; }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
      const ordered = /^\s*\d/.test(l); const tag = ordered ? 'ol' : 'ul'; const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) {
        let t = lines[i++].replace(/^\s*([-*+]|\d+[.)])\s+/, '');
        const task = t.match(/^\[([ xX])\]\s+(.*)$/);
        items.push(task ? `<li><input type="checkbox" disabled${task[1] !== ' ' ? ' checked' : ''}> ${inline(task[2])}</li>` : `<li>${inline(t)}</li>`);
      }
      out.push(`<${tag}>\n${items.join('\n')}\n</${tag}>`); continue;
    }
    if (!l.trim()) { i++; continue; }
    const buf = []; while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*([-*+]|\d+[.)])\s)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${buf.map(inline).join('<br>\n').replace(/<br>\n(?!$)/g, (x, o, s) => x)}</p>`.replace(/<br>\n/g, ' ').replace(/ {2,}/g, ' '));
  }
  return out.join('\n');
}

const SAMPLE = '# Release notes\n\nVersion **2.1** adds _dark mode_ and fixes a few bugs.\n\n## Changes\n\n- Faster image export\n- New [docs site](https://example.com)\n- [x] Tested on mobile\n\n> Upgrade with `npm i app@latest`\n\n```js\nconsole.log("hello");\n```';

export default function MarkdownToHtml() {
  const [md, setMd] = useState(SAMPLE);
  const [view, setView] = useState('preview');
  const html = markdownToHtml(md);
  return (
    <div className="tool">
      <div className="row" style={{ alignItems: 'stretch' }}>
        <div style={{ flex: 1, minWidth: 280 }}><label>Markdown</label><textarea value={md} onChange={(e) => setMd(e.target.value)} spellCheck={false} style={{ minHeight: 320 }} /></div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="row" style={{ marginBottom: 6 }}>
            <button className={'btn small' + (view === 'preview' ? '' : ' ghost')} onClick={() => setView('preview')}>Preview</button>
            <button className={'btn small' + (view === 'html' ? '' : ' ghost')} onClick={() => setView('html')}>HTML</button>
            <CopyButton text={html} />
            <button className="btn small ghost" onClick={() => download(new Blob([html], { type: 'text/html' }), 'document.html')}>Download</button>
          </div>
          {view === 'html' ? <textarea readOnly value={html} style={{ minHeight: 320 }} />
            : <div className="prose" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '4px 16px', minHeight: 320, background: '#fff' }} dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      </div>
    </div>
  );
}
