'use client';

import { useEffect } from 'react';

/**
 * Adsterra Social Bar Component
 * 
 * Social Bar is an easy-to-install display ad format that:
 * - Looks like friendly notifications, icons, or widgets
 * - Doesn't block web content (uses dynamic iFrame technology)
 * - Works in all browsers and OS without browser subscriptions
 * - Shows different ads in turns for each user
 * - Has high CTRs (up to 30x higher than Web Push)
 * - Returns high CPM rates
 * 
 * Key Features:
 * - No browser subscription needed (unlike web push)
 * - Ad-blocker friendly (lightweight code, not glued to specific place)
 * - Native & non-disruptive design
 * - AI-powered optimization algorithm
 * - Single line of lightweight code
 * 
 * Installation:
 * - Script should be placed before </body> tag
 * - Works automatically once script is loaded
 * - Shows ads like notifications, dynamic icons, chats, or IG stories
 */
export default function AdsterraSocialbar() {
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="pl28059282.effectivegatecpm.com"]'
    );
    
    if (existingScript) {
      return; // Script already loaded
    }

    // Load Adsterra Social Bar script
    // This script creates the Social Bar widget automatically
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    
    // Append to body (before </body> tag as recommended by Adsterra)
    // In Next.js, this component is already in the body, so this is correct
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount (though Social Bar typically persists)
      const scriptToRemove = document.querySelector(
        'script[src*="pl28059282.effectivegatecpm.com"]'
      );
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Social Bar doesn't need a visible container - script automatically creates
  // the widget (notifications, icons, chats, etc.) on the page
  return null;
}

