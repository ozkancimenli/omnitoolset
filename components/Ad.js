'use client';
import { useEffect } from 'react';
import { SITE } from '@/lib/site';

// Otomatik boyutlu AdSense birimi. Yayıncı kimliği yoksa hiçbir şey göstermez (onay öncesi boş yer kalmaz).
export default function Ad({ slot }) {
  useEffect(() => {
    if (!SITE.adsenseClient) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);
  if (!SITE.adsenseClient) return null;
  return (
    <div className="ad-slot" aria-label="Advertisement">
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={SITE.adsenseClient}
        data-ad-slot={slot || undefined} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
