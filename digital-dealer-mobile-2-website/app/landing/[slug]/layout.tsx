import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Welcome to Your Dealership - Digital Dealer",
  description: "Explore your dealership options, from browsing cars to booking test drives. Everything you need in one place.",
  openGraph: {
    title: "Welcome to Your Dealership - Digital Dealer",
    description: "Explore your dealership options, from browsing cars to booking test drives.",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 