import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { siteUrl } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Sales Tax Pricing Index · Sourced pricing comparison',
    template: '%s · Sales Tax Pricing Index',
  },
  description:
    'A sourced comparison of sales tax compliance pricing across TaxCloud, Avalara, TaxJar, Numeral, Kintsugi, Anrok, Sphere, and Zamp. Operated by TaxCloud, Inc.; ownership disclosed.',
  openGraph: {
    siteName: 'Sales Tax Pricing Index',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const base = siteUrl().replace(/\/$/, '');
const SITE_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      url: siteUrl(),
      name: 'Sales Tax Pricing Index',
      description:
        'A sourced comparison of pricing for every major US sales tax compliance platform.',
      publisher: { '@id': `${base}/#publisher` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': `${base}/#publisher`,
      name: 'TaxCloud, Inc.',
      url: 'https://taxcloud.com',
      description:
        'TaxCloud operates the Sales Tax Pricing Index as a sourced public reference. TaxCloud is one of the eight providers compared on the site; ownership is disclosed on every page.',
      sameAs: ['https://taxcloud.com', 'https://www.linkedin.com/company/taxcloud'],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
