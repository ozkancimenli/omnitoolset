'use client';

import { useEffect } from 'react';

export default function AdsterraSocialbar() {
  useEffect(() => {
    // Load Adsterra Socialbar script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    
    // Append to body
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector(
        'script[src="//pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Socialbar doesn't need a visible container - script handles it
  return null;
}

