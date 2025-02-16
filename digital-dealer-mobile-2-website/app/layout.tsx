import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Dealer",
  description: "Streamline your dealership experience with Digital Dealer. Connect with customers, manage leads, and enhance your automotive sales process.",
  keywords: "dealership, automotive, sales, customer management, digital dealer, car sales",
  authors: [{ name: "Alexium" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#3d12fa",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://digital-dealer-mobile.com",
    title: "Digital Dealer",
    description: "Streamline your dealership experience with Digital Dealer",
    siteName: "Digital Dealer",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Digital Dealer"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Dealer",
    description: "Streamline your dealership experience with Digital Dealer",
    images: ["/twitter-image.png"],
  },
  applicationName: "Digital Dealer",
  appleWebApp: {
    capable: true,
    title: "Digital Dealer",
    statusBarStyle: "black-translucent",
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
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}
