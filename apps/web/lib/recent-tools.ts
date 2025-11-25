'use client';

const RECENT_TOOLS_KEY = 'omnitoolset_recent_tools';
const MAX_RECENT_TOOLS = 10;

export interface RecentTool {
  id: string;
  title: string;
  slug: string;
  timestamp: number;
}

export function getRecentTools(): RecentTool[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!stored) return [];
    
    const tools: RecentTool[] = JSON.parse(stored);
    return tools.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_RECENT_TOOLS);
  } catch {
    return [];
  }
}

export function addRecentTool(tool: { id: string; title: string; slug: string }) {
  if (typeof window === 'undefined') return;
  
  try {
    const recent = getRecentTools();
    const updated = recent.filter(t => t.id !== tool.id);
    updated.unshift({
      ...tool,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated.slice(0, MAX_RECENT_TOOLS)));
  } catch {
    // Ignore errors
  }
}

export function clearRecentTools() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_TOOLS_KEY);
}

