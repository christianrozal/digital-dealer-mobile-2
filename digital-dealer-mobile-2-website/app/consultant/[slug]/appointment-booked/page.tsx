"use client";

import Image from "next/image";
import React from "react";

const AppointmentBookedPage = () => {
  return (
    <div className="border max-w-sm min-h-screen mx-auto py-4 px-10">
      <Image
        src="/alexium-logo-2.svg"
        width={79}
        height={17}
        alt=""
        className="mx-auto"
      />
      <div className="mt-10">
        <h2 className="text-2xl font-nunito font-semibold">
          Appointment Booked!
        </h2>
      </div>
    </div>
  );
};

export default AppointmentBookedPage;
