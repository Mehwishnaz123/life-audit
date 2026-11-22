import type { Metadata, Viewport } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Plan, track and understand your whole life`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION, url: SITE_URL },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description: SITE_DESCRIPTION },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#2A1533', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
