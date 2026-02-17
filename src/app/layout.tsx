import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/providers/Providers";
import { QuickContactWidget } from "@/components/QuickContactWidget";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export const runtime = "nodejs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ycomp.ua";

export const metadata: Metadata = {
  title: {
    default: "YComp — Інтернет-магазин компʼютерних комплектуючих",
    template: "%s | YComp",
  },
  description:
    "Компʼютерні комплектуючі, конфігуратор ПК, сервіс та trade-in. Доставка Новою Поштою по Україні, гарантія та професійна консультація.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "YComp — Комплектуючі та сервіс",
    description:
      "Сучасні комплектуючі, конфігуратор ПК, сервіс та trade-in. Доставка Новою Поштою.",
    url: "/",
    siteName: "YComp",
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YComp — Комплектуючі та сервіс",
    description: "Сучасні комплектуючі, конфігуратор ПК, сервіс та trade-in.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <GoogleAnalytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "YComp",
                url: siteUrl,
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/catalog?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "YComp",
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                },
              }),
            }}
          />
          <Header />
          <main className="min-h-screen bg-white">{children}</main>
          <Footer />
          <QuickContactWidget />
        </Providers>
      </body>
    </html>
  );
}
