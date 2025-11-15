'use client';

import { getToolComponent } from '@/lib/tool-components';

interface ToolWrapperProps {
  toolId: string;
}

export default function ToolWrapper({ toolId }: ToolWrapperProps) {
  const ToolComponent = getToolComponent(toolId);
  return <ToolComponent toolId={toolId} />;
}
