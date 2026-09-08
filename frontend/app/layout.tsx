import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatbotWidget } from "@/components/ChatbotWidget"
import { CookieBanner } from "@/components/CookieBanner"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = "https://kenyawatch-chi.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KenyaWatch AI - Procurement Accountability Platform",
    template: "%s | KenyaWatch AI",
  },
  description: "Making Kenyan government procurement transparent and accountable through AI-powered risk detection and citizen reporting. Track contracts across all 47 counties.",
  keywords: ["Kenya", "procurement", "transparency", "accountability", "corruption", "government contracts", "PPIP", "OCDS", "public procurement", "open data"],
  authors: [{ name: "KenyaWatch" }],
  creator: "KenyaWatch",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "KenyaWatch AI",
    title: "KenyaWatch AI - Procurement Accountability Platform",
    description: "Making Kenyan government procurement transparent and accountable through AI-powered risk detection and citizen reporting.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "KenyaWatch AI - Procurement Transparency Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KenyaWatch AI - Procurement Accountability Platform",
    description: "Making Kenyan government procurement transparent and accountable through AI-powered risk detection.",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "KenyaWatch AI",
    url: SITE_URL,
    description: "AI-powered platform making Kenyan government procurement transparent and accountable.",
    applicationCategory: "GovernmentApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES",
    },
    creator: {
      "@type": "Organization",
      name: "KenyaWatch",
      url: SITE_URL,
    },
  }

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0d9488" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <ChatbotWidget />
        </div>
      </body>
    </html>
  )
}
