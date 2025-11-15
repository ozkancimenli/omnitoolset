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
      // Banner ad - Use Adsterra smartlink with redirect
      // Create clickable banner that redirects to smartlink
      const banner = document.createElement('a');
      banner.href = smartlinkUrl;
      banner.target = '_blank';
      banner.rel = 'noopener noreferrer';
      banner.style.display = 'block';
      banner.style.width = '100%';
      banner.style.minHeight = `${height}px`;
      banner.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      banner.style.borderRadius = '8px';
      banner.style.textDecoration = 'none';
      banner.style.color = 'white';
      banner.style.padding = '20px';
      banner.style.textAlign = 'center';
      banner.style.fontSize = '16px';
      banner.style.fontWeight = 'bold';
      banner.style.cursor = 'pointer';
      banner.style.position = 'relative';
      banner.style.overflow = 'hidden';
      
      // Add animated text
      const text = document.createElement('div');
      text.textContent = 'Advertisement';
      text.style.position = 'absolute';
      text.style.top = '50%';
      text.style.left = '50%';
      text.style.transform = 'translate(-50%, -50%)';
      text.style.zIndex = '1';
      banner.appendChild(text);
      
      // Add click handler
      banner.onclick = (e) => {
        e.preventDefault();
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      };
      
      adRef.current.appendChild(banner);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && banner.parentNode) {
          adRef.current.removeChild(banner);
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
