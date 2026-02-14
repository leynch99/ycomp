import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/providers/Providers";
import { QuickContactWidget } from "@/components/QuickContactWidget";

export const runtime = "nodejs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ycomp.ua — Інтернет-магазин компʼютерних комплектуючих",
  description:
    "Комплектуючі, готові ПК та сервіс. Доставка по Україні, гарантія та професійна консультація.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ycomp.ua — Комплектуючі та сервіс",
    description:
      "Сучасні комплектуючі, конфігуратор ПК, сервіс та trade-in. Доставка Новою Поштою.",
    url: "/",
    siteName: "ycomp.ua",
    locale: "uk_UA",
    type: "website",
  },
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "ycomp.ua",
                url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+38-044-200-12-34",
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
