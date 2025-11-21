'use client';

import { useEffect, useRef } from 'react';

interface AdsterraProps {
  format?: 'banner' | 'native' | 'popunder' | 'text' | 'button' | 'image';
  className?: string;
  width?: number;
  height?: number;
  text?: string; // Custom text for text/button formats
  imageUrl?: string; // Image URL for image format
}

/**
 * Adsterra Smart Direct Link Component
 * 
 * Smart Direct Link is just a URL - no visual format.
 * It automatically selects the best ad offer based on:
 * - User's location (GEO)
 * - Device type (mobile/desktop)
 * - Traffic quality
 * - Highest CPM/CPA rates
 * 
 * Usage:
 * - Text link: <Adsterra format="text" text="Click here" />
 * - Button: <Adsterra format="button" text="Download Now" />
 * - Image: <Adsterra format="image" imageUrl="/banner.jpg" />
 * - Banner area: <Adsterra format="banner" />
 */
export default function Adsterra({ 
  format = 'banner', 
  className = '',
  width = 728,
  height = 90,
  text = 'Advertisement',
  imageUrl
}: AdsterraProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  // Adsterra Smart Direct Link URL
  const smartlinkUrl = 'https://www.effectivegatecpm.com/mm191s15?key=6e97a3f80c904696c8f019e4b77d7bbd';

  useEffect(() => {
    if (!adRef.current || scriptLoaded.current) return;

    if (format === 'popunder') {
      // Popunder - opens on user interaction (once per session)
      const handleInteraction = () => {
        if (!scriptLoaded.current && !sessionStorage.getItem('adsterra_popunder_shown')) {
          scriptLoaded.current = true;
          sessionStorage.setItem('adsterra_popunder_shown', 'true');
          window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
        }
      };

      const timer = setTimeout(() => {
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
      }, 2000);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    } else if (format === 'text') {
      // Text link - simple <a> tag with smartlink
      const link = document.createElement('a');
      link.href = smartlinkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = text;
      link.className = `text-indigo-400 hover:text-indigo-300 underline ${className}`;
      
      adRef.current.appendChild(link);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && link.parentNode) {
          adRef.current.removeChild(link);
        }
      };
    } else if (format === 'button') {
      // Button with smartlink
      const button = document.createElement('button');
      button.onclick = (e) => {
        e.preventDefault();
        window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
      };
      button.textContent = text;
      button.className = `px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors ${className}`;
      
      adRef.current.appendChild(button);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && button.parentNode) {
          adRef.current.removeChild(button);
        }
      };
    } else if (format === 'image') {
      // Image with smartlink
      const link = document.createElement('a');
      link.href = smartlinkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'block';
      link.style.width = '100%';
      
      const img = document.createElement('img');
      img.src = imageUrl || '/placeholder-banner.jpg';
      img.alt = 'Advertisement';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.cursor = 'pointer';
      
      link.appendChild(img);
      adRef.current.appendChild(link);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && link.parentNode) {
          adRef.current.removeChild(link);
        }
      };
    } else if (format === 'banner') {
      // Adsterra Banner Ad - Using proper script loading method
      // Structure is correct (like the example you showed), but we need Adsterra's actual domain
      // For now, using Smart Direct Link as fallback since Adsterra banner script format may vary
      // If you have the actual Adsterra banner script URL from your Adsterra panel, we can use it here
      
      // Option 1: Use Smart Direct Link (current working method)
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
      banner.className = className;
      
      const bannerText = text === 'Advertisement' ? '🎁 Exclusive Offers - Click to View' : text;
      banner.textContent = bannerText;
      
      adRef.current.appendChild(banner);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && banner.parentNode) {
          adRef.current.removeChild(banner);
        }
      };
      
      // Option 2: If you have Adsterra banner script from panel, use this structure:
      // const atOptions = {
      //   key: 'YOUR_ADSTERRA_BANNER_KEY',
      //   format: 'iframe',
      //   height: height,
      //   width: width,
      //   params: {},
      // };
      // const conf = document.createElement('script');
      // conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;
      // const script = document.createElement('script');
      // script.src = '//YOUR_ADSTERRA_DOMAIN/invoke.js'; // Get this from Adsterra panel
      // adRef.current.appendChild(conf);
      // adRef.current.appendChild(script);
    } else if (format === 'native') {
      // Native ad - inline clickable area
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
      link.textContent = text;
      link.className = className;

      adRef.current.appendChild(link);
      scriptLoaded.current = true;

      return () => {
        if (adRef.current && link.parentNode) {
          adRef.current.removeChild(link);
        }
      };
    }
  }, [format, width, height, text, imageUrl, className]);

  if (format === 'popunder') {
    // Popunder doesn't need a visible element
    return null;
  }

  return (
    <div 
      ref={adRef} 
      className={`adsterra-smartlink-container ${className}`}
      style={{ 
        minHeight: format === 'native' ? '250px' : format === 'banner' ? `${height}px` : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    />
  );
}
