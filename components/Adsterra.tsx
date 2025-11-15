'use client';

import { useEffect } from 'react';

interface AdsterraProps {
  containerId?: string;
  layout?: '1x1' | '1x2' | '2x1' | '4x1' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export default function Adsterra({
  containerId = 'container-612a325632297ecc15cfd2d178f355ec',
  layout = 'auto',
  className = '',
  style,
}: AdsterraProps) {
  useEffect(() => {
    // Load Adsterra script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      const existingScript = document.querySelector(
        'script[src="//pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Layout styles
  const layoutStyles: Record<string, React.CSSProperties> = {
    '1x1': { aspectRatio: '1/1', maxWidth: '300px' },
    '1x2': { aspectRatio: '1/2', maxWidth: '300px' },
    '2x1': { aspectRatio: '2/1', maxWidth: '600px' },
    '4x1': { aspectRatio: '4/1', maxWidth: '1200px' },
    auto: { width: '100%', minHeight: '250px' },
  };

  return (
    <div
      id={containerId}
      className={`adsterra-container ${className}`}
      style={{
        ...layoutStyles[layout],
        ...style,
        margin: '0 auto',
      }}
    />
  );
}

