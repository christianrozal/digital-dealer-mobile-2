"use client";

import AlexiumLogo2 from "@/app/components/svg/alexiumLogo2";
import QRIcon from "@/app/components/svg/qrIcon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Spinner } from "@heroui/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to Your Dealership - Digital Dealer Mobile",
  description: "Explore your dealership options, from browsing cars to booking test drives. Everything you need in one place.",
  openGraph: {
    title: "Welcome to Your Dealership - Digital Dealer Mobile",
    description: "Explore your dealership options, from browsing cars to booking test drives.",
  },
};

const LandingPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleQRClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(`/landing/${slug}/qr`);
  };

  return (
    <div className="border max-w-sm h-screen mx-auto p-7 relative">
      <div className="flex justify-center items-center w-full">
        <AlexiumLogo2 width={79} height={17} />
        <div className="size-4"/>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mt-16">Thank you!</h2>
        <p className="text-xs text-color2 mt-3">
          We appreciate you sharing your details.
        </p>
        <p className="text-xs text-color2 mt-3">
          While we get one of our team members across your way, feel free to
          access any of the options below.
        </p>
      </div>
      {/* Cards */}
      <ul className="grid grid-cols-2 gap-5 mt-10 text-xs">
        <Link href="/">
          <li className="bg-color3 rounded-md py-10 text-center px-4 hover:bg-opacity-50">
            Browse Cars
          </li>
        </Link>
        <Link href="/">
          <li className="bg-color3 rounded-md py-10 text-center px-4 hover:bg-opacity-50">
            Book a Test Drive
          </li>
        </Link>
        <Link href="/">
          <li className="bg-color3 rounded-md py-10 text-center px-4 hover:bg-opacity-50">
            Explore Trade-In Options
          </li>
        </Link>
        <Link href="/">
          <li className="bg-color3 rounded-md py-10 text-center px-4 hover:bg-opacity-50">
            Download Brochure
          </li>
        </Link>
        <Link href="/">
          <li className="bg-color3 rounded-md py-10 text-center px-4 hover:bg-opacity-50">
            Enquire Finance
          </li>
        </Link>
      </ul>
      {/* QR Link */}
      <Link 
        href={`/landing/${slug}/qr`} 
        onClick={handleQRClick}
        className="absolute bottom-10 right-10 flex items-center justify-center"
      >
        {isLoading ? (
          <Spinner color="primary" size="lg" />
        ) : (
          <QRIcon width={40} height={40} fill="#3d12fa" stroke="#3d12fa" />
        )}
      </Link>
    </div>
  );
};

export default LandingPage;
