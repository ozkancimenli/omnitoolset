'use client';

import React from 'react';

interface SocialSharePanelProps {
  showSocialShare: boolean;
  setShowSocialShare: (show: boolean) => void;
  shareUrl: string;
  setShareUrl: (url: string) => void;
  file: File | null;
  pdfEngineRef: React.RefObject<any>;
  toast: any;
}

export const SocialSharePanel: React.FC<SocialSharePanelProps> = ({
  showSocialShare,
  setShowSocialShare,
  shareUrl,
  setShareUrl,
  file,
  pdfEngineRef,
  toast,
}) => {
  if (!showSocialShare) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowSocialShare(false)}>
      <div className="bg-gradient-to-br from-pink-900 via-rose-900 to-red-900 rounded-lg shadow-2xl border-2 border-pink-500 p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <span>Share PDF</span>
          </h3>
          <button
            onClick={() => setShowSocialShare(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <label className="text-white text-sm mb-2 block">Share URL (optional)</label>
            <input
              type="text"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const text = `Check out this amazing PDF editor! ${shareUrl || window.location.href}`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
                toast.success('Shared on Twitter!');
              }}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <span>🐦</span>
              Twitter
            </button>
            <button
              onClick={() => {
                const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || window.location.href)}`;
                window.open(url, '_blank');
                toast.success('Shared on LinkedIn!');
              }}
              className="px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <span>💼</span>
              LinkedIn
            </button>
            <button
              onClick={() => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || window.location.href)}`;
                window.open(url, '_blank');
                toast.success('Shared on Facebook!');
              }}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <span>📘</span>
              Facebook
            </button>
            <button
              onClick={async () => {
                if (file && pdfEngineRef.current) {
                  const pdfBytes = await pdfEngineRef.current.savePdf();
                  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
                  const shareData = {
                    title: file.name,
                    text: 'Check out this PDF!',
                    files: [new File([blob], file.name, { type: 'application/pdf' })]
                  };
                  if (navigator.share && navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    toast.success('Shared successfully!');
                  } else {
                    await navigator.clipboard.writeText(shareUrl || window.location.href);
                    toast.success('Link copied to clipboard!');
                  }
                }
              }}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <span>📱</span>
              Native Share
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <label className="text-white text-sm mb-2 block">Copy Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl || (typeof window !== 'undefined' ? window.location.href : '')}
                readOnly
                className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl || (typeof window !== 'undefined' ? window.location.href : ''));
                  toast.success('Link copied!');
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




