'use client';

import { memo, useMemo } from 'react';
import { getToolComponent } from '@/lib/tool-components';

interface ToolWrapperProps {
  toolId: string;
}

const ToolWrapper = memo(function ToolWrapper({ toolId }: ToolWrapperProps) {
  const ToolComponent = useMemo(() => getToolComponent(toolId), [toolId]);
  return <ToolComponent toolId={toolId} />;
});

ToolWrapper.displayName = 'ToolWrapper';

export default ToolWrapper;
