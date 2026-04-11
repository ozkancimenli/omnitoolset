import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://omnitoolset.com'),
  title: 'OmniToolset',
  description:
    'OmniToolset is a modular automation platform for tools, integrations, and production-minded workflows.'
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
