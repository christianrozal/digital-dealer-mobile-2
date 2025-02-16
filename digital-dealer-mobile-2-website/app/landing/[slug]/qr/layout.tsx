import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code - Digital Dealer",
  description: "Scan this QR code to connect with your dealership representative and enhance your car buying experience.",
  openGraph: {
    title: "QR Code - Digital Dealer",
    description: "Scan this QR code to connect with your dealership representative.",
  },
};

export default function QRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 