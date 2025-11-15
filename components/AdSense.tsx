'use client';

import { useEffect, useRef } from 'react';
import Adsterra from './Adsterra';

interface AdSenseProps {
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
  useAdsterra?: boolean; // Toggle between AdSense and Adsterra
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  fullWidthResponsive = true,
  useAdsterra = true, // Default to Adsterra smartlink
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  // Use Adsterra Smartlink if enabled
  if (useAdsterra) {
    return (
      <div className={className} style={style}>
        <Adsterra format="banner" className={className} width={728} height={90} />
      </div>
    );
  }

  // Original AdSense code (fallback)
  useEffect(() => {
    // Only push once per container
    if (pushedRef.current) return;
    
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle && adRef.current) {
        // Check if this container already has ads
        const insElement = adRef.current.querySelector('.adsbygoogle');
        if (insElement && !insElement.hasAttribute('data-adsbygoogle-status')) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div ref={adRef} className={`adsense-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...(fullWidthResponsive && { width: '100%' }),
        }}
        data-ad-client="ca-pub-8640955536193345"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
