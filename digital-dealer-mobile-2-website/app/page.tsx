"use client";

import { QRCodeSVG } from "qrcode.react";
import AlexiumLogo2 from "./components/svg/alexiumLogo2";
import Link from "next/link";

export default function Home() {
  const targetUrl = "https://digital-dealer-mobile-2-website.vercel.app/dealership/lennock-volkswagen/signup";

  return (
    <div>
      <div className="flex flex-col items-center justify-center bg-color1 py-10 px-7">
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-white">SCAN QR CODE</h2>
        </div>

        <div>
          <Link href={targetUrl}>
            <QRCodeSVG
              value={targetUrl}
              className="size-56"
              bgColor="transparent"
              fgColor="#FFFFFF"
              level="L"
            />
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-10 mt-5">
        <div className="flex items-center justify-center mb-8">
          <AlexiumLogo2 width={76} height={19} />
        </div>

        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold">Let us help you!</h1>
          <p className="text-base mt-2">
            NEED HELP DURING YOUR VISIT?
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Simply scan this QR code, and we&apos;ll connect you with a Sale Consultant in no time. Let us take care of everything while you focus on finding your dream car.
          </p>
        </div>
      </div>
    </div>
  );
}