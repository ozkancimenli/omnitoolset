'use client';

import { useEffect, useRef } from 'react';

interface AdsterraProps {
  format?: 'banner' | 'native' | 'popunder';
  className?: string;
  width?: number;
  height?: number;
}

export default function Adsterra({ 
  format = 'banner', 
  className = '',
  width = 728,
  height = 90 
}: AdsterraProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!adRef.current || scriptLoaded.current) return;

    // Adsterra Smartlink
    const smartlinkUrl = 'https://www.effectivegatecpm.com/mm191s15?key=6e97a3f80c904696c8f019e4b77d7bbd';

    if (format === 'popunder') {
      // Popunder ad - loads on page interaction (only once per session)
      const handleInteraction = () => {
        if (!scriptLoaded.current && !sessionStorage.getItem('adsterra_popunder_shown')) {
          scriptLoaded.current = true;
          sessionStorage.setItem('adsterra_popunder_shown', 'true');
          window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
        }
      };

      // Add event listeners for user interaction
      const timer = setTimeout(() => {
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
      }, 2000); // Wait 2 seconds before enabling

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    } else if (format === 'banner') {
      // Banner ad using iframe
      const iframe = document.createElement('iframe');
      iframe.src = smartlinkUrl;
      iframe.width = width.toString();
      iframe.height = height.toString();
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.style.margin = '0 auto';
      iframe.style.maxWidth = '100%';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
      
      adRef.current.appendChild(iframe);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && iframe.parentNode) {
          adRef.current.removeChild(iframe);
        }
      };
    } else if (format === 'native') {
      // Native ad - clickable banner
      const link = document.createElement('a');
      link.href = smartlinkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'block';
      link.style.width = '100%';
      link.style.minHeight = '250px';
      link.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      link.style.borderRadius = '8px';
      link.style.textDecoration = 'none';
      link.style.color = 'white';
      link.style.padding = '20px';
      link.style.textAlign = 'center';
      link.style.fontSize = '18px';
      link.style.fontWeight = 'bold';
      link.style.cursor = 'pointer';
      link.textContent = 'Advertisement';
      link.onclick = (e) => {
        e.preventDefault();
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      };

      adRef.current.appendChild(link);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && link.parentNode) {
          adRef.current.removeChild(link);
        }
      };
    }
  }, [format, width, height]);

  if (format === 'popunder') {
    // Popunder doesn't need a visible element
    return null;
  }

  return (
    <div 
      ref={adRef} 
      className={`adsterra-container ${className}`}
      style={{ 
        minHeight: format === 'native' ? '250px' : `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    />
  );
}
