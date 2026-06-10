import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomGlassFade } from "@/components/BottomGlassFade";
import { LandingBodySync } from "@/components/LandingBodySync";
import { bebasNeue, inter, openSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "MochiTrade | Trade Future Yield Without Selling Your Assets",
  description:
    "Split principal and future yield into independently tradable assets powered by Uniswap v4 Hooks.",
};

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
        <Providers>
          <LandingBodySync />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomGlassFade />
        </Providers>
      </body>
    </html>
  );
}
