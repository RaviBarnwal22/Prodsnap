import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prodsnap.in"),
  title: "Prodsnap | Master PM Interviews with AI-Powered Feedback",
  description: "Stop practicing blindly. Get real-time AI feedback on your PM case solutions and master the frameworks used by the world's leading tech companies.",
  keywords: [
    "Product Management Interview Prep",
    "Global PM Case Study Practice",
    "AI PM Mock Interview",
    "CIRCLES framework practice",
    "Associate Product Manager (APM) Prep",
    "PM Interview Questions and Answers",
    "Google PM Interview Prep",
    "Meta Product Management Case",
    "Amazon PM Writing Exercise",
    "Product Sense Coaching",
    "Master PM Interviews"
  ],
  authors: [{ name: "Prodsnap Team" }],
  creator: "Prodsnap",
  publisher: "Prodsnap",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prodsnap.in",
    title: "Prodsnap | Elevate Your PM Skills with AI. Are You Ready?",
    description: "The 'secret weapon' for ambitious PMs. Get instant AI feedback on your case solutions and crack top tech interviews faster.",
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
    title: "Prodsnap | Crack Your Dream PM Role with AI",
    description: "Real-time AI reality checks for your PM case practice. Stop guessing, start mastering.",
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
        {/* ClientProviders holds all ssr:false dynamic imports — keeps this Server Component clean */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
