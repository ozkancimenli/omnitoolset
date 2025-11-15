import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://omnitoolset.com'),
  title: {
    default: 'OmniToolset - Free PDF, Image & File Converter Tools',
    template: '%s | OmniToolset',
  },
  description: 'Merge, split, compress PDFs. Resize, compress, convert images. Word, Excel, PowerPoint to PDF. All file converter tools free and online!',
  keywords: 'pdf merge, pdf split, pdf compress, pdf converter, image resize, image compress, jpg png converter, word to pdf, excel to pdf, powerpoint to pdf, free tools, online converter',
  authors: [{ name: 'OmniToolset' }],
  creator: 'OmniToolset',
  publisher: 'OmniToolset',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omnitoolset.com',
    siteName: 'OmniToolset',
    title: 'OmniToolset - Free PDF, Image & File Converter Tools',
    description: 'Merge, split, compress PDFs. Resize, compress, convert images. All file converter tools free and online!',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniToolset - Free PDF, Image & File Converter Tools',
    description: 'Merge, split, compress PDFs. Resize, compress, convert images. All file converter tools free and online!',
  },
  alternates: {
    canonical: 'https://omnitoolset.com',
  },
  verification: {
    // Add your verification codes here when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Add your Google Analytics and AdSense IDs here when ready
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const googleAdsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="google-adsense-account" content="ca-pub-8640955536193345" />
        <script type='text/javascript' src='//pl28055668.effectivegatecpm.com/5c/e4/ee/5ce4ee5ab685f82c323752c9b8d45ace.js'></script>
      </head>
      <body className={inter.className}>
        {children}
        <Analytics 
          googleAnalyticsId={googleAnalyticsId}
          googleAdsenseId={googleAdsenseId}
        />
      </body>
    </html>
  )
}
