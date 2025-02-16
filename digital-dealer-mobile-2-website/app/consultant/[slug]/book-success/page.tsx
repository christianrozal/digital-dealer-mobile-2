"use client";
import { Button } from "@heroui/react";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import AlexiumLogo2 from "@/app/components/svg/alexiumLogo2";

interface AppointmentDetails {
  date: string;
  time: string;
}

const BookSuccessPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);

  useEffect(() => {
    // Get appointment details from localStorage
    const storedDetails = localStorage.getItem('appointmentDetails');
    if (storedDetails) {
      setAppointmentDetails(JSON.parse(storedDetails));
      // Clear the details after retrieving them
      localStorage.removeItem('appointmentDetails');
    }
  }, []);

  return (
    <div className="border max-w-sm min-h-screen mx-auto py-4 px-10">
      <div className="flex items-center justify-center">
        <AlexiumLogo2 width={79} height={17} />
      </div>

      <div className="mt-16 text-center">
        <div className="w-20 h-20 bg-color3 rounded-full flex items-center justify-center mx-auto">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.6668 8L12.0002 22.6667L5.3335 16"
              stroke="#16A34A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mt-6">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Your appointment has been successfully booked. You will receive a confirmation email shortly.
        </p>

        {appointmentDetails && (
          <div className="mt-6 bg-color3 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-sm mb-2">Appointment Details</h3>
            <p className="text-sm text-gray-600">
              Date: {appointmentDetails.date}
            </p>
            <p className="text-sm text-gray-600">
              Time: {appointmentDetails.time}
            </p>
          </div>
        )}

        <div className="mt-12">
          <Button
            className="bg-color1 font-semibold text-sm rounded-full w-full text-white"
            onPress={() => router.push(`/consultant/${slug}`)}
          >
            Back to Consultant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookSuccessPage; 