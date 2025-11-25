'use client';

import { useEffect } from 'react';
import { addRecentTool } from '@/lib/recent-tools';
import { Tool } from '@/data/tools';

interface ToolTrackerProps {
  tool: Tool;
}

export default function ToolTracker({ tool }: ToolTrackerProps) {
  useEffect(() => {
    addRecentTool({
      id: tool.id,
      title: tool.title,
      slug: tool.slug,
    });
  }, [tool.id, tool.title, tool.slug]);

  return null;
}

