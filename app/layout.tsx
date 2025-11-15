import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

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

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="google-adsense-account" content="ca-pub-8640955536193345" />
      </head>
      <body className={inter.className}>
        {/* AdSense Script - beforeInteractive loads in head */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640955536193345"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {/* Adsterra Popunder Script - beforeInteractive loads in head */}
        <Script
          type="text/javascript"
          src="//pl28055668.effectivegatecpm.com/5c/e4/ee/5ce4ee5ab685f82c323752c9b8d45ace.js"
          strategy="beforeInteractive"
        />
        {/* Google Analytics (gtag.js) - beforeInteractive loads in head */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1WF6SNHNXN"
          strategy="beforeInteractive"
        />
        <Script
          id="google-analytics"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1WF6SNHNXN');
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
