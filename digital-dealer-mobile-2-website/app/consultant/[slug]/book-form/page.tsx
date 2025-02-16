"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import BackArrowIcon from "@/app/components/svg/backArrow";
import AlexiumLogo2 from "@/app/components/svg/alexiumLogo2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ConsultantData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  slug: string;
  dealership_brand_id: number;
  dealership_department_id: number | null;
}

interface BookingDateTime {
  date: string;
  time: string;
  consultantId: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
}

const BookFormPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [consultantData, setConsultantData] = useState<ConsultantData | null>(null);
  const [bookingDateTime, setBookingDateTime] = useState<BookingDateTime | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    // Get consultant and booking data from localStorage
    const storedConsultantData = localStorage.getItem('selectedConsultant');
    const storedBookingData = localStorage.getItem('bookingDateTime');
    
    if (!storedConsultantData || !storedBookingData) {
      router.push(`/consultant/${slug}`);
      return;
    }

    setConsultantData(JSON.parse(storedConsultantData));
    setBookingDateTime(JSON.parse(storedBookingData));
  }, [router, slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const createNotification = async (userId: number, customer: Customer, appointmentDate: string) => {
    try {
      await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'APPOINTMENT_CREATED',
          user_id: userId,
          dealership_brand_id: consultantData?.dealership_brand_id,
          dealership_department_id: consultantData?.dealership_department_id,
          metadata: {
            customer_id: customer.id,
            appointment_date: appointmentDate,
            customerName: customer.name,
            entityName: consultantData?.name || 'Consultant',
            customerProfileImage: customer.profile_image_url
          },
        }),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw error here, as this is not critical for the booking process
    }
  };

  const getOrCreateCustomer = async (): Promise<Customer> => {
    // First try to get existing customer
    const checkCustomerResponse = await fetch(
      `${API_URL}/api/customers/check?email=${encodeURIComponent(formData.email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (checkCustomerResponse.ok) {
      const existingCustomer = await checkCustomerResponse.json();
      if (existingCustomer) {
        // Update customer information if it has changed
        const updateResponse = await fetch(`${API_URL}/api/customers/${existingCustomer.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
          }),
        });
        
        if (updateResponse.ok) {
          return updateResponse.json();
        }
      }
    }

    // If customer doesn't exist or couldn't be updated, create new one
    const createCustomerResponse = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }),
    });

    if (!createCustomerResponse.ok) {
      throw new Error('Failed to create customer');
    }

    return createCustomerResponse.json();
  };

  const convertTo24Hour = (time12h: string) => {
    return dayjs(time12h, "h:mm A").format("HH:mm");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultantData || !bookingDateTime) return;

    setLoading(true);
    try {
      // Get or create customer
      const customer = await getOrCreateCustomer();

      // Convert time to 24-hour format and create ISO date string
      const time24 = convertTo24Hour(bookingDateTime.time);
      const [hours, minutes] = time24.split(':');
      
      // Create a new date object with the correct time
      const appointmentDate = new Date(bookingDateTime.date);
      appointmentDate.setHours(parseInt(hours));
      appointmentDate.setMinutes(parseInt(minutes));
      appointmentDate.setSeconds(0);
      appointmentDate.setMilliseconds(0);

      // Create appointment
      const appointmentResponse = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          notes: formData.notes,
          user_id: consultantData.id,
          customer_id: customer.id,
          dealership_brand_id: consultantData.dealership_brand_id,
          dealership_department_id: consultantData.dealership_department_id,
        }),
      });

      if (!appointmentResponse.ok) {
        throw new Error('Failed to create appointment');
      }

      // Create notification for the consultant
      await createNotification(
        consultantData.id,
        customer,
        appointmentDate.toISOString()
      );

      // Store appointment details for success page
      localStorage.setItem('appointmentDetails', JSON.stringify({
        date: new Date(bookingDateTime.date).toLocaleDateString(),
        time: bookingDateTime.time,
      }));

      // Clear booking data
      localStorage.removeItem('selectedConsultant');
      localStorage.removeItem('bookingDateTime');

      // Redirect to success page
      router.push(`/consultant/${slug}/book-success`);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border max-w-sm min-h-screen mx-auto py-4 px-10">
      <div className="flex items-center justify-center">
        <AlexiumLogo2 width={79} height={17} />
      </div>

      {/* Consultant Info */}
      {consultantData && (
        <div className="mt-6 flex items-center gap-3 bg-color3 rounded-lg p-5">
          {consultantData.profile_image_url ? (
            <Image
              src={consultantData.profile_image_url}
              width={40}
              height={40}
              alt={consultantData.name}
              className="rounded-full w-[40px] h-[40px] object-cover"
            />
          ) : (
            <div className="bg-color1 text-white font-bold w-[40px] h-[40px] text-lg rounded-full flex items-center justify-center">
              {consultantData.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm">{consultantData.name}</h3>
            <p className="text-xs text-gray-500">Consultant</p>
          </div>
        </div>
      )}

      <div className="flex gap-5 items-center mt-6">
        <div
          onClick={() => router.push(`/consultant/${slug}/book-date`)}
          className="cursor-pointer hover:opacity-70"
        >
          <BackArrowIcon width={16} height={16} />
        </div>
        <h2 className="text-xl font-semibold">Enter Your Details</h2>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-color1"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-color1"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-color1"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-color1"
          />
        </div>

        {bookingDateTime && (
          <div className="bg-color3 p-4 rounded-md">
            <h3 className="font-semibold text-sm mb-2">Appointment Details</h3>
            <p className="text-sm text-gray-600">
              Date: {new Date(bookingDateTime.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Time: {bookingDateTime.time}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="bg-color1 font-semibold text-sm rounded-full w-full text-white mt-4"
          isDisabled={loading}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </Button>
      </form>
    </div>
  );
};

export default BookFormPage;
