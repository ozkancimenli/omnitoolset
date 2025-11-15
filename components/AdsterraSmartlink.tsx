'use client';

import { useEffect } from 'react';

interface AdsterraSmartlinkProps {
  smartlinkUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdsterraSmartlink({
  smartlinkUrl = 'https://www.effectivegatecpm.com/mm191s15?key=6e97a3f80c904696c8f019e4b77d7bbd',
  className = '',
  style,
}: AdsterraSmartlinkProps) {
  useEffect(() => {
    // Smartlink is typically used for redirects or click tracking
    // This component can be used as a clickable link or auto-redirect
    // For now, we'll create a clickable link component
  }, []);

  return (
    <a
      href={smartlinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`adsterra-smartlink ${className}`}
      style={{
        display: 'inline-block',
        ...style,
      }}
    >
      {/* Smartlink content - can be customized */}
    </a>
  );
}

