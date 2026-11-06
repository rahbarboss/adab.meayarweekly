import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Paper Portal",
  description: "Read Daily Digital Newspaper Editions",
  verification: {
    google: "no8kPhj_Hbkxh_UZZKV6lgNJj1J64LL8a1OlVNUprn4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}