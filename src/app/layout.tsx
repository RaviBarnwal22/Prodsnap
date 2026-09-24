import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { SiteStructuredData } from "@/components/SiteStructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prodsnap.in"),
  title: "AI PM Interview Practice | Get Scored on Real Cases | Prodsnap",
  description: "Answer real PM cases and get scored by an AI interviewer on six dimensions in seconds, with a model answer every time. Over 200 cases, including AI product management.",
  keywords: [
    "AI PM interview practice",
    "AI product manager interview questions",
    "Product Management Interview Prep",
    "PM case study practice",
    "AI mock interview for PMs",
    "CIRCLES framework practice",
    "Associate Product Manager (APM) Prep",
    "PM Interview Questions and Answers",
    "product sense practice",
    "AI product management"
  ],
  alternates: {
    canonical: "/",
  },
  applicationName: "Prodsnap",
  category: "education",
  authors: [{ name: "Ravi Barnwal", url: "https://www.linkedin.com/in/barnwalravi/" }],
  creator: "Prodsnap",
  publisher: "Prodsnap",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prodsnap.in",
    title: "Prodsnap | The AI Interviewer for Product Managers",
    description: "Answer a real PM case and get a six-dimension scorecard in seconds. Over 200 cases from global tech, including AI product management.",
    siteName: "Prodsnap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prodsnap - AI PM Interview Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prodsnap | The AI Interviewer for Product Managers",
    description: "Answer a real PM case, get scored on six dimensions in seconds. Over 200 cases, including AI product management.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        {/* Preconnect to Unsplash CDN so LCP hero image connection is established early */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <SiteStructuredData />
        {/* ClientProviders holds all ssr:false dynamic imports — keeps this Server Component clean */}
        <ClientProviders>
          {children}
        </ClientProviders>
        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
