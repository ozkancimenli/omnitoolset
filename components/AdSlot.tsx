'use client';

import { AdSlotConfig } from '@/lib/types';
import AdSense from './AdSense';

/**
 * AdSlot Component
 * 
 * Reusable ad placement component for consistent ad integration.
 * 
 * Usage:
 *   <AdSlot position="tool-top" />
 *   <AdSlot position="blog-middle" format="in-article" />
 * 
 * To integrate real AdSense:
 *   1. Replace AdSense component with actual ad code
 *   2. Or modify AdSense component to accept position-specific configs
 *   3. Add ad refresh logic if needed
 */
interface AdSlotProps extends AdSlotConfig {
  // Optional: Override default behavior
  showPlaceholder?: boolean;
}

export default function AdSlot({
  position,
  format = 'auto',
  className = '',
  showPlaceholder = false,
}: AdSlotProps) {
  // Position-specific styling
  const positionClasses: Record<string, string> = {
    'tool-top': 'mb-6',
    'tool-bottom': 'mt-6',
    'tool-sidebar': 'sticky top-4',
    'blog-top': 'mb-8',
    'blog-bottom': 'mt-8',
    'blog-middle': 'my-8',
    'home-hero': 'mb-12',
    'home-bottom': 'mt-12',
  };

  // Format-specific styling
  const formatClasses: Record<string, string> = {
    auto: 'min-h-[100px]',
    banner: 'min-h-[250px]',
    sidebar: 'min-h-[600px]',
    'in-article': 'min-h-[250px]',
  };

  const baseClasses = `
    ${positionClasses[position] || ''}
    ${formatClasses[format] || formatClasses.auto}
    ${className}
    bg-gray-100 dark:bg-slate-800
    rounded-xl
    flex items-center justify-center
    border border-gray-200 dark:border-slate-700
  `.trim();

  // In development or if placeholder is requested, show placeholder
  if (showPlaceholder || process.env.NODE_ENV === 'development') {
    return (
      <div className={baseClasses}>
        <div className="text-center p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Ad Slot: {position}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Format: {format}
          </div>
        </div>
      </div>
    );
  }

  // Production: Use actual AdSense component
  return (
    <div className={baseClasses}>
      <AdSense
        adFormat={format === 'auto' ? 'auto' : format}
        fullWidthResponsive={true}
        className="w-full"
      />
    </div>
  );
}

/**
 * Pre-configured AdSlot components for common positions
 */
export const ToolTopAd = () => <AdSlot position="tool-top" />;
export const ToolBottomAd = () => <AdSlot position="tool-bottom" />;
export const ToolSidebarAd = () => <AdSlot position="tool-sidebar" format="sidebar" />;
export const BlogTopAd = () => <AdSlot position="blog-top" />;
export const BlogBottomAd = () => <AdSlot position="blog-bottom" />;
export const BlogMiddleAd = () => <AdSlot position="blog-middle" format="in-article" />;
export const HomeHeroAd = () => <AdSlot position="home-hero" />;
export const HomeBottomAd = () => <AdSlot position="home-bottom" />;

