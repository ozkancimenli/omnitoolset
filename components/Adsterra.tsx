'use client';

import { useEffect } from 'react';

interface AdsterraProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Adsterra({
  className = '',
  style,
}: AdsterraProps) {
  useEffect(() => {
    // Load Adsterra script dynamically - original code exactly as provided
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js';
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector(
        'script[src="//pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Adsterra Native Banner - Original code exactly as provided
  return (
    <div id="container-612a325632297ecc15cfd2d178f355ec" className={className} style={style}></div>
  );
}
