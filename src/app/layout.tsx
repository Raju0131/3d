import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CreditLink from '@/components/CreditLink';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = 'https://3d-bay-ten.vercel.app';

// Share-card copy, deliberately different from the on-page title/description:
// this is for someone deciding whether to click, not someone already here.
const SHARE_TITLE = 'Sneaker Lab — Real-Time 3D Product Configurator';
const SHARE_DESCRIPTION =
  'Six colourways, three materials, live pricing — entirely in the browser. The 16.7 MB source model ships at 2.4 MB and holds 60fps on a mid-range Android.';
const SHARE_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Sneaker Lab configurator: a 3D sneaker with colourway and material controls',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Sneaker Lab — Pick Your Colourway',
  description:
    'A premium 3D sneaker configurator. Choose a colourway and material to build the perfect pair — right in your browser.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: 'Sneaker Lab',
    type: 'website',
    locale: 'en_US',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <CreditLink />
      </body>
    </html>
  );
}
