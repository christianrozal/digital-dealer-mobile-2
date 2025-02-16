"use client";

import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import AlexiumLogo2 from "@/app/components/svg/alexiumLogo2";
import BackArrowIcon from "@/app/components/svg/backArrow";
import { API_URL } from "@/constants";

const QRPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        if (typeof slug === "string") {
          const response = await fetch(`${API_URL}/api/customers/${slug}`);
          if (!response.ok) {
            throw new Error("Failed to fetch customer");
          }
          const customer = await response.json();
          setCustomerId(customer.id);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };

    fetchCustomer();
  }, [slug]);

  return (
    <div className="border max-w-sm min-h-screen mx-auto p-7">
      <div className="flex justify-between items-center">
        <div
          onClick={() => router.push(`/landing/${slug}`)}
          className="cursor-pointer hover:opacity-70"
        >
          <BackArrowIcon width={16} height={16} />
        </div>
        <AlexiumLogo2 width={79} height={17} />
        <div className="size-4" />
      </div>
      <h2 className="mt-16">
        The below QR is to be used by the{" "}
        <span className="font-bold">Sales Consultant.</span>
      </h2>
      <p className="mt-5">
        This connects you with the sales consultant so that we can take care of
        all your needs faster.
      </p>
      {/* Clickable QR Code */}
      <div className="bg-color3 p-12 rounded-md mt-10">
        <p className="text-center text-sm font-bold">SCAN QR CODE</p>
        <div className="flex justify-center mt-5">
          {customerId ? (
            <QRCodeSVG
              value={customerId.toString()}
              className="size-56"
              bgColor="#F4F8FC"
              fgColor="#3D12FA"
              aria-label="Sales Consultant Landing Page QR Code"
            />
          ) : (
            // A simple skeleton loader using Tailwind's animate-pulse class
            <div className="size-56 bg-gray-100 rounded-xl animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPage;
