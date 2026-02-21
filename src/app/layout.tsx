import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PageTransition } from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PillSnap - Identify medications safely',
  description: 'Identify medications safely and instantly using imprint, color, and shape.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
