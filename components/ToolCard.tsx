import Link from 'next/link';
import { Tool } from '@/data/tools';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`}>
      <div className="tool-card">
        <div className="text-5xl mb-4">{tool.icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-slate-100">{tool.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{tool.description}</p>
        <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium">
          {tool.category}
        </span>
      </div>
    </Link>
  );
}
