import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Digital Dealer Mobile",
  description: "Register with your dealership to enhance your car buying experience. Quick and easy signup process.",
  openGraph: {
    title: "Sign Up - Digital Dealer Mobile",
    description: "Register with your dealership to enhance your car buying experience",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 