import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/providers/Providers";
import { QuickContactWidget } from "@/components/QuickContactWidget";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";

export const runtime = "nodejs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground bg-background transition-colors duration-300`}>
        <Providers>
          <GoogleAnalytics />
          <WebVitalsReporter />
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
          <main className="min-h-screen">{children}</main>
          <Footer />
          <QuickContactWidget />
        </Providers>
      </body>
    </html>
  );
}
