import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Base URL for the site
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.quickroom8.com";

// Comprehensive metadata for SEO
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  
  // Primary metadata
  title: {
    default: "QuickRoom8 - Find Rooms & Flatmates in Malta",
    template: "%s | QuickRoom8",
  },
  description: "Find your perfect room and flatmate in Malta. Browse verified listings, connect with potential flatmates, and use our AI-powered compatibility matching to find your ideal living situation.",
  keywords: [
    "rooms Malta",
    "flatmates Malta",
    "room rental Malta",
    "shared accommodation Malta",
    "find flatmate Malta",
    "rent room Malta",
    "coliving Malta",
    "student accommodation Malta",
    "expat housing Malta",
    "room sharing Malta",
  ],
  authors: [{ name: "QuickRoom8" }],
  creator: "QuickRoom8",
  publisher: "QuickRoom8",
  
  // Robots
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
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  
  // Manifest
  manifest: "/manifest.json",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: siteUrl,
    siteName: "QuickRoom8",
    title: "QuickRoom8 - Find Rooms & Flatmates in Malta",
    description: "Find your perfect room and flatmate in Malta. Browse verified listings, connect with potential flatmates, and use our AI-powered compatibility matching.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuickRoom8 - Room & Flatmate Matching Platform",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "QuickRoom8 - Find Rooms & Flatmates in Malta",
    description: "Find your perfect room and flatmate in Malta with AI-powered compatibility matching.",
    images: ["/og-image.png"],
    creator: "@quickroom8",
  },
  
  // Verification (add your verification codes)
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Alternate languages (if applicable)
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-MT": siteUrl,
    },
  },
  
  // Category
  category: "Real Estate",
  
  // Classification
  classification: "Room Rental Platform",
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preconnect to Supabase */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        
        {/* Geo meta tags for local SEO */}
        <meta name="geo.region" content="MT" />
        <meta name="geo.placename" content="Malta" />
        
        {/* Additional SEO meta tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "QuickRoom8",
              url: siteUrl,
              logo: `${siteUrl}/favicon.png`,
              description: "Room and flatmate matching platform in Malta",
              address: {
                "@type": "PostalAddress",
                addressCountry: "MT",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+356 9930 1803",
                contactType: "customer service",
                availableLanguage: ["English", "Maltese", "Italian"],
              },
              sameAs: [
                "https://www.facebook.com/quickroom8",
                "https://www.instagram.com/quickroom8",
              ],
            }),
          }}
        />
        
        {/* Website structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "QuickRoom8",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/browse?search={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
