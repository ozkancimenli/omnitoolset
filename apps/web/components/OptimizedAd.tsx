'use client';

import { useEffect, useState } from 'react';
import AdSense from './AdSense';
import Adsterra from './Adsterra';

/**
 * OptimizedAd Component
 * 
 * Smart ad component that chooses between AdSense and Adsterra
 * based on position, GEO, and performance.
 * 
 * Usage:
 *   <OptimizedAd position="tool-top" />
 *   <OptimizedAd position="blog-middle" preferNetwork="adsterra" />
 */
interface OptimizedAdProps {
  position: 'tool-top' | 'tool-bottom' | 'tool-sidebar' | 'blog-top' | 'blog-middle' | 'blog-bottom' | 'blog-sidebar' | 'home-hero' | 'home-bottom' | 'home-sidebar';
  preferNetwork?: 'adsense' | 'adsterra' | 'auto';
  format?: 'banner' | 'vertical' | 'native' | 'auto';
  className?: string;
}

export default function OptimizedAd({
  position,
  preferNetwork = 'auto',
  format = 'auto',
  className = '',
}: OptimizedAdProps) {
  const [network, setNetwork] = useState<'adsense' | 'adsterra'>('adsense');
  const [userGeo, setUserGeo] = useState<string>('');

  useEffect(() => {
    // Detect user GEO (simplified - in production use proper GEO detection)
    // For now, we'll use a simple heuristic
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isTier1 = ['America', 'Europe', 'Asia/Tokyo', 'Australia'].some(tz => timezone.includes(tz));
    
    // Smart network selection based on position and GEO
    if (preferNetwork === 'auto') {
      // Above-fold positions: Prefer AdSense (reliability)
      if (position === 'home-hero' || position === 'tool-top' || position === 'blog-top') {
        setNetwork('adsense');
      }
      // Mid-content: Prefer Adsterra (higher CPM potential)
      else if (position === 'blog-middle' || position === 'home-bottom') {
        setNetwork('adsterra');
      }
      // Sidebar: Prefer AdSense (stable revenue)
      else if (position === 'tool-sidebar' || position === 'blog-sidebar' || position === 'home-sidebar') {
        setNetwork('adsense');
      }
      // Bottom: Prefer Adsterra (exit intent, higher CPM)
      else if (position === 'tool-bottom' || position === 'blog-bottom') {
        setNetwork('adsterra');
      }
      // Default: AdSense
      else {
        setNetwork('adsense');
      }
    } else {
      setNetwork(preferNetwork);
    }

    setUserGeo(isTier1 ? 'tier1' : 'tier2');
  }, [position, preferNetwork]);

  // Determine ad format based on position
  const getAdFormat = () => {
    if (format !== 'auto') return format;
    
    if (position.includes('sidebar')) {
      return 'vertical';
    }
    if (position.includes('middle')) {
      return 'native';
    }
    return 'banner';
  };

  const adFormat = getAdFormat();

  // Render based on selected network
  if (network === 'adsterra') {
    return (
      <div className={className}>
        <Adsterra 
          format={adFormat === 'vertical' ? 'banner' : adFormat === 'native' ? 'native' : 'banner'}
          className={className}
          width={adFormat === 'vertical' ? 300 : 728}
          height={adFormat === 'vertical' ? 600 : 90}
        />
      </div>
    );
  }

  // AdSense
  return (
    <div className={className}>
      <AdSense
        useAdsterra={false} // Force AdSense
        adFormat={
          adFormat === 'vertical' 
            ? 'vertical' 
            : adFormat === 'native'
            ? 'rectangle'
            : 'horizontal'
        }
        fullWidthResponsive={true}
        className={className}
      />
    </div>
  );
}

/**
 * Pre-configured optimized ad components
 */
export const HomeHeroAd = () => (
  <OptimizedAd position="home-hero" preferNetwork="adsense" format="banner" />
);

export const HomeBottomAd = () => (
  <OptimizedAd position="home-bottom" preferNetwork="adsterra" format="banner" />
);

export const HomeSidebarAd = () => (
  <OptimizedAd position="home-sidebar" preferNetwork="adsense" format="vertical" />
);

export const ToolTopAd = () => (
  <OptimizedAd position="tool-top" preferNetwork="adsense" format="banner" />
);

export const ToolBottomAd = () => (
  <OptimizedAd position="tool-bottom" preferNetwork="adsterra" format="banner" />
);

export const ToolSidebarAd = () => (
  <OptimizedAd position="tool-sidebar" preferNetwork="adsense" format="vertical" />
);

export const BlogTopAd = () => (
  <OptimizedAd position="blog-top" preferNetwork="adsense" format="banner" />
);

export const BlogMiddleAd = () => (
  <OptimizedAd position="blog-middle" preferNetwork="adsterra" format="native" />
);

export const BlogBottomAd = () => (
  <OptimizedAd position="blog-bottom" preferNetwork="adsense" format="banner" />
);

export const BlogSidebarAd = () => (
  <OptimizedAd position="blog-sidebar" preferNetwork="adsense" format="vertical" />
);

