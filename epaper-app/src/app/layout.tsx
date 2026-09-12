// @ts-nocheck
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // 👇 Yahan naam change kar diya hai 👇
  title: 'Fikr-o-Khayal',
  description: 'Read the latest edition of Fikr-o-Khayal E-Paper',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}