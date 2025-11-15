'use client';

interface AdsterraProps {
  containerId?: string;
  layout?: '1x1' | '1x2' | '2x1' | '4x1' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export default function Adsterra({
  containerId = 'container-612a325632297ecc15cfd2d178f355ec',
  layout = 'auto',
  className = '',
  style,
}: AdsterraProps) {
  // Use original container ID - Adsterra script looks for this specific ID
  // For multiple instances, we'll use the same ID (Adsterra handles multiple containers)

  // Layout styles
  const layoutStyles: Record<string, React.CSSProperties> = {
    '1x1': { aspectRatio: '1/1', maxWidth: '300px', minHeight: '250px' },
    '1x2': { aspectRatio: '1/2', maxWidth: '300px', minHeight: '500px' },
    '2x1': { aspectRatio: '2/1', maxWidth: '600px', minHeight: '300px' },
    '4x1': { aspectRatio: '4/1', maxWidth: '1200px', minHeight: '250px' },
    auto: { width: '100%', minHeight: '250px' },
  };

  return (
    <div
      id={containerId}
      className={`adsterra-container ${className}`}
      style={{
        ...layoutStyles[layout],
        ...style,
        margin: '0 auto',
      }}
    />
  );
}
