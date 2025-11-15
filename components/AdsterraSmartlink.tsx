'use client';

interface AdsterraSmartlinkProps {
  smartlinkUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function AdsterraSmartlink({
  smartlinkUrl = 'https://www.effectivegatecpm.com/mm191s15?key=6e97a3f80c904696c8f019e4b77d7bbd',
  className = '',
  style,
  children,
}: AdsterraSmartlinkProps) {
  return (
    <a
      href={smartlinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`adsterra-smartlink ${className}`}
      style={{
        display: 'inline-block',
        ...style,
      }}
    >
      {children || 'Click here'}
    </a>
  );
}

