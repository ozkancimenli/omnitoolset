'use client';

interface AdsterraProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Adsterra({
  className = '',
  style,
}: AdsterraProps) {
  // Adsterra Native Banner - Original code exactly as provided
  return (
    <>
      <script async data-cfasync="false" src="//pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js"></script>
      <div id="container-612a325632297ecc15cfd2d178f355ec" className={className} style={style}></div>
    </>
  );
}
