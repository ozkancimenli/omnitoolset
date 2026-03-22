import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://omnitoolset.com'),
  title: 'OmniToolset',
  description: 'AI tools that help your business grow automatically.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
