import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomGlassFade } from "@/components/BottomGlassFade";
import { LandingBodySync } from "@/components/LandingBodySync";
import { JsonLd } from "@/components/JsonLd";
import { bebasNeue, inter, openSans } from "@/lib/fonts";
import {
  faqJsonLd,
  organizationJsonLd,
  rootMetadata,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/site";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050505] text-[#F6F5F2] font-[family-name:var(--font-inter)]">
        <JsonLd
          data={[
            websiteJsonLd(),
            organizationJsonLd(),
            softwareApplicationJsonLd(),
            faqJsonLd(),
          ]}
        />
        <Providers>
          <LandingBodySync />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomGlassFade />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
