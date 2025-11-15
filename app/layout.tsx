import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ToastContainer } from '@/components/Toast'
import AdsterraSocialbar from '@/components/AdsterraSocialbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://omnitoolset.com'),
  title: {
    default: 'FREE PDF Converter Online - No Registration | Merge, Split, Convert PDFs Instantly',
    template: '%s | OmniToolset - PDF Converter',
  },
  description: '100% FREE PDF converter tools online. Merge PDF, split PDF, compress PDF, convert PDF to Word, Excel, PowerPoint, JPG, PNG instantly. All PDF tools completely free, no registration, no watermarks, 100% secure. Use unlimited times for free.',
  keywords: 'pdf converter, pdf converter online, free pdf converter, pdf converter free, pdf converter no registration, pdf merge free, pdf split free, pdf compress free, pdf to word free, pdf to excel free, pdf to jpg free, pdf to png free, word to pdf free, excel to pdf free, powerpoint to pdf free, online pdf tools, free pdf tools, pdf tools online, instant pdf converter, pdf converter tool, free online pdf converter, pdf converter instant, pdf converter secure, no registration pdf converter, pdf converter unlimited, best pdf converter, how to convert pdf, pdf converter 2024, top pdf converter, pdf converter best, pdf converter review, image converter free, text tools free, developer tools free, online tools free, free online tools, no registration tools, best online tools, free tools online, instant tools, quick tools, secure tools, unlimited tools, no watermark tools, best free tools 2024',
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
    siteName: 'OmniToolset - PDF Converter',
    title: 'FREE PDF Converter Online - No Registration | Merge, Split, Convert PDFs Instantly',
    description: '100% FREE PDF converter tools online. Merge PDF, split PDF, compress PDF, convert PDF to Word, Excel, PowerPoint, JPG, PNG instantly. All PDF tools completely free, no registration, no watermarks, 100% secure. Use unlimited times for free.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FREE PDF Converter Online - No Registration | OmniToolset',
    description: '100% FREE PDF converter tools online. Merge PDF, split PDF, compress PDF, convert PDF to Word, Excel, PowerPoint, JPG, PNG instantly. All PDF tools completely free, no registration, no watermarks, 100% secure.',
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
        <ToastContainer />
        <AdsterraSocialbar />
        <SpeedInsights />
      </body>
    </html>
  )
}
