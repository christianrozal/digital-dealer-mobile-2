import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome Back - Digital Dealer",
  description: "Welcome back to your dealership. Quick and secure auto-recognition for returning customers.",
  openGraph: {
    title: "Welcome Back - Digital Dealer",
    description: "Welcome back to your dealership. Quick and secure auto-recognition for returning customers.",
  },
};

export default function AutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 