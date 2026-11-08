export const SITE = {
  name: 'OmniToolset',
  url: 'https://www.omnitoolset.com',
  tagline: 'Free online tools that run in your browser',
  description:
    'Free, fast online tools for images, PDFs, text and developers. Everything runs in your browser — your files are never uploaded.',
  // AdSense yayıncı kimliği onaylanınca Vercel ortam değişkenine girilir: ca-pub-XXXXXXXXXXXXXXXX
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
  contactUrl: 'https://github.com/ozkancimenli/omnitoolset/issues',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
};
