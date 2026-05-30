import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'DPWH Infrastructure Dashboard',
  description: 'Department of Public Works and Highways Infrastructure Transparency Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sora.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
