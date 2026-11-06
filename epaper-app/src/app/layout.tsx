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
      <head>
        {/* Agar aap metadata object me nahi daalna chahte, to head ke andar direct aise bhi daal sakte hain: */}
        <meta name="google-site-verification" content="no8kPhj_Hbkxh_UZZKV6lgNJj1J64LL8a1OlVNUprn4" />
      </head>
      <body>{children}</body>
    </html>
  );
}
