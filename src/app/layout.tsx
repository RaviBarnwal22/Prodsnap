import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionTimeout from "@/components/SessionTimeout";
import PageTracker from "@/components/PageTracker";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "@/components/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prodsnap | Master PM Interviews Globally with AI Feedback",
  description: "The premier global platform for Product Managers to practice case studies with real-time AI guided feedback. Master CIRCLES, HEART, and BUS frameworks for Google, Meta, Amazon, Microsoft, and Uber PM interviews.",
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
    title: "Prodsnap | Elevate Your Global PM Career",
    description: "Get real-time AI feedback on your PM case solutions. Master frameworks used by the world's leading tech companies with our expert-curated practice engine.",
    siteName: "Prodsnap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prodsnap - Global PM Interview Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prodsnap | Master PM Interviews with AI",
    description: "Real-time AI guided feedback for aspiring Product Managers worldwide. Accelerate your product career.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader
          color="#7c3aed"
          height={4}
          showSpinner={false}
          zIndex={99999}
          initialPosition={0.08}
          crawlSpeed={200}
          speed={200}
        />
        <SessionTimeout />
        <PageTracker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
