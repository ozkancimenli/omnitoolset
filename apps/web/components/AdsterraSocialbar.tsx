'use client';

import { useEffect, useState } from 'react';

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
 * 
 * Location: This component is rendered in app/layout.tsx (line 104)
 * It loads a script that automatically creates widgets on the page
 */
export default function AdsterraSocialbar() {
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'loaded' | 'error' | 'ready'>('ready');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Wait for DOM to be fully ready
    if (typeof window === 'undefined' || !document.body) {
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="pl28059282.effectivegatecpm.com"]'
    );
    
    if (existingScript) {
      console.log('[SocialBar] Script already loaded');
      setScriptStatus('loaded');
      return; // Script already loaded
    }

    // Load Adsterra Social Bar script
    // According to Adsterra: "Insert it right above the closing </body> tag"
    // This component is already placed right before </body> in layout.tsx
    const loadScript = () => {
      try {
        setScriptStatus('loading');
        
        // Create script element exactly as Adsterra provides
        // <script type='text/javascript' src='//pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js'></script>
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js';
        // Note: Adsterra's original script doesn't have async/defer, but we keep them for performance
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        
        // Add error handling
        script.onerror = () => {
          // Silently handle error - Adsterra script may fail due to ad blockers or network issues
          // This is expected behavior and doesn't affect site functionality
          setScriptStatus('error');
        };
        
        script.onload = () => {
          // Suppress console logs in production to reduce noise
          if (process.env.NODE_ENV === 'development') {
            console.log('[SocialBar] Script loaded successfully');
          }
          setScriptStatus('loaded');
          
          // Suppress errors from external scripts loaded by Adsterra
          // These are expected and don't affect functionality
          const originalError = window.console.error;
          window.console.error = (...args) => {
            // Filter out known harmless errors from Adsterra's sub-scripts
            const errorString = args.join(' ');
            if (errorString.includes('preferencenail.com') || 
                errorString.includes('sfp.js') ||
                errorString.includes('ERR_CONNECTION_REFUSED')) {
              // Silently ignore these expected errors
              return;
            }
            // Log other errors normally
            originalError.apply(window.console, args);
          };
          
          // Check if widget was created after a delay
          setTimeout(() => {
            const widgetElements = document.querySelectorAll('[id*="social"], [class*="social"], [id*="adsterra"], [class*="adsterra"]');
            if (process.env.NODE_ENV === 'development') {
              if (widgetElements.length > 0) {
                console.log('[SocialBar] Widget elements found:', widgetElements.length);
              } else {
                console.log('[SocialBar] Widget elements not yet visible (may appear later)');
              }
            }
          }, 3000);
        };
        
        // Append to body - right before closing </body> tag (as recommended by Adsterra)
        document.body.appendChild(script);
      } catch (error) {
        console.error('[SocialBar] Error loading script:', error);
        setScriptStatus('error');
      }
    };

    // Load script after a short delay to ensure page is ready
    const timer = setTimeout(loadScript, 1000);

    // Debug mode: Show status in development
    if (process.env.NODE_ENV === 'development') {
      setShowDebug(true);
    }

    return () => {
      clearTimeout(timer);
      // Cleanup on unmount (though Social Bar typically persists)
      const scriptToRemove = document.querySelector(
        'script[src*="pl28059282.effectivegatecpm.com"]'
      );
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Social Bar doesn't need a visible container - script automatically creates
  // the widget (notifications, icons, chats, etc.) on the page
  // But we show a debug indicator in development mode
  return (
    <>
      {showDebug && process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: scriptStatus === 'loaded' ? '#10b981' : scriptStatus === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
          onClick={() => setShowDebug(false)}
          title="Click to hide. SocialBar script status indicator."
        >
          SocialBar: {scriptStatus === 'loading' ? 'Loading...' : scriptStatus === 'loaded' ? '✓ Loaded' : scriptStatus === 'error' ? '✗ Error' : 'Ready'}
        </div>
      )}
    </>
  );
}

