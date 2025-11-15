'use client';

interface SocialShareProps {
  title: string;
  description: string;
  url: string;
}

export default function SocialShare({ title, description, url }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = async (platform: keyof typeof shareLinks) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
      }
    }
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-700">
      <span className="text-slate-400 text-sm">Share:</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Share on Twitter"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
          </svg>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Share on Facebook"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.15.15-.297.297-.576.437-.663.149-.149-.297-.595-.736-1.004-1.184-.297-.297-.595-.347-.893-.099-.297.248-1.184 1.133-1.533 1.383-.297.198-.595.248-.893.05-.297-.198-1.184-.496-2.03-1.533-.736-.736-1.234-1.633-1.383-1.933-.149-.297-.015-.446.112-.595.124-.149.297-.347.446-.496.149-.149.198-.297.297-.496.099-.198.05-.347-.05-.496-.099-.149-.893-2.18-1.184-2.976-.297-.795-.595-.595-.893-.595-.297 0-.595-.05-.893-.05-.297 0-.595.149-.893.347-.297.198-1.184 1.184-1.184 2.876 0 1.691 1.234 3.338 1.383 3.536.149.198 2.428 3.733 5.888 5.24.595.297 1.004.446 1.383.446.595 0 1.184-.198 1.633-.595.893-.893 1.533-1.98 1.533-2.577 0-.297-.149-.446-.297-.595z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.577 4.125 1.585 5.84L0 24l6.16-1.585C7.875 23.423 9.874 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.75 0-3.4-.5-4.8-1.36L2.4 22l1.36-4.8C2.5 15.4 2 13.75 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

