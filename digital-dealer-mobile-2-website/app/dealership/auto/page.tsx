"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import { API_URL } from '@/constants';
import AlexiumLogoIcon from "@/app/components/svg/alexiumLogo";

interface DealershipDepartment {
  slug: string;
  name: string;
  dealershipBrand?: {
    dealership?: {
      name: string;
    };
  };
}

interface DealershipBrand {
  slug: string;
  name: string;
  dealership?: {
    name: string;
  };
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  slug: string;
  profile_image_url?: string;
}

const AutoRecognitionPage = () => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entityName, setEntityName] = useState<string>('');
  const [entitySlug, setEntitySlug] = useState<string>('');
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [isNotYouLoading, setIsNotYouLoading] = useState(false);

  useEffect(() => {
    // Get entity slug from localStorage
    const storedEntitySlug = localStorage.getItem('entitySlug');
    if (storedEntitySlug) {
      setEntitySlug(storedEntitySlug);
    }
  }, []);

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        if (!entitySlug) return;
        
        // Try department first
        const response = await fetch(`${API_URL}/api/dealership-departments`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const departmentsResponse = await response.json();
        const departments = Array.isArray(departmentsResponse) ? departmentsResponse : departmentsResponse.data || [];
        const department = departments.find((d: DealershipDepartment) => d.slug === entitySlug);

        if (department) {
          setEntityName(department.name);
          return;
        }

        // Try brand if department not found
        const response2 = await fetch(`${API_URL}/api/dealership-brands`);
        if (!response2.ok) {
          throw new Error('Failed to fetch brands');
        }
        const brandsResponse = await response2.json();
        const brands = Array.isArray(brandsResponse) ? brandsResponse : brandsResponse.data || [];
        const brand = brands.find((b: DealershipBrand) => b.slug === entitySlug);

        if (brand) {
          setEntityName(brand.name);
          return;
        }
      } catch (err) {
        console.error('Error fetching entity details:', err);
      }
    };

    fetchEntityDetails();
  }, [entitySlug]);

  useEffect(() => {
    const checkStoredCustomer = async () => {
      try {
        // Try to get stored customer data from localStorage
        const storedCustomer = localStorage.getItem('customerData');
        if (!storedCustomer) {
          console.log('No stored customer found');
          if (entitySlug) {
            router.push(`/dealership/${entitySlug}/signup`);
          } else {
            setError('No entity information found');
          }
          return;
        }

        const customer = JSON.parse(storedCustomer);
        console.log('Found stored customer:', customer);

        // Verify the customer still exists in our database
        const response = await fetch(`${API_URL}/api/customers/${customer.slug}`);
        if (!response.ok) {
          console.log('Customer no longer exists in database');
          localStorage.removeItem('customerData');
          if (entitySlug) {
            router.push(`/dealership/${entitySlug}/signup`);
          } else {
            setError('No entity information found');
          }
          return;
        }

        const verifiedCustomer = await response.json();
        setCustomerData(verifiedCustomer);
        
        // Set first name
        const nameParts = verifiedCustomer.name.split(" ");
        setFirstName(nameParts[0]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking stored customer:', err);
        setError("Failed to verify customer details");
        setLoading(false);
      }
    };

    checkStoredCustomer();
  }, [entitySlug, router]);

  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleContinue = async () => {
    try {
      setIsContinueLoading(true);
      console.log('Creating dealership scan for customer:', customerData);
      const scanResponse = await fetch(`${API_URL}/api/dealership-scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerData?.name,
          email: customerData?.email,
          phone: customerData?.phone,
          entitySlug: entitySlug,
          customerId: customerData?.id
        }),
      });

      if (!scanResponse.ok) {
        console.error('Scan creation failed:', await scanResponse.text());
        throw new Error('Failed to create scan');
      }

      const scanData = await scanResponse.json();
      console.log('Scan created successfully:', JSON.stringify(scanData, null, 2));

      // Get the QR code details to find the latest user who scanned this customer
      const latestScanResponse = await fetch(`${API_URL}/api/customer-scans/logs/${customerData?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (latestScanResponse.ok) {
        const scans = await latestScanResponse.json();
        console.log('Latest scans:', scans);
        
        if (scans && scans.length > 0) {
          const latestScan = scans[0]; // Get the most recent scan
          console.log('Latest scan found:', latestScan);
          
          // Create notification for the consultant
          const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'CUSTOMER_CHECK_IN',
              user_id: latestScan.user_id,
              dealership_brand_id: latestScan.dealership_brand_id,
              dealership_department_id: latestScan.dealership_department_id || null,
              metadata: {
                customerName: customerData?.name,
                customerProfileImage: customerData?.profile_image_url,
                entityName: entityName
              }
            })
          });

          if (!notificationResponse.ok) {
            const errorData = await notificationResponse.json();
            console.error('Failed to create notification:', errorData);
          } else {
            const notificationResult = await notificationResponse.json();
            console.log('Notification created successfully:', notificationResult);
          }
        } else {
          console.log('No scans found for customer');
        }
      } else {
        console.error('Failed to fetch latest scans:', await latestScanResponse.text());
      }

      router.push(`/landing/${customerData?.slug}`);
    } catch (err) {
      console.error('Error creating scan:', err);
      setError('Failed to proceed. Please try again.');
      setIsContinueLoading(false);
    }
  };

  const handleNotYou = () => {
    setIsNotYouLoading(true);
    localStorage.removeItem('customerData');
    localStorage.removeItem('entitySlug');
    if (entitySlug) {
      router.push(`/dealership/${entitySlug}/signup`);
    } else {
      setError('No entity information found');
      setIsNotYouLoading(false);
    }
  };

  if (error) {
    return (
      <div className="border max-w-sm min-h-screen mx-auto p-7">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (loading || !customerData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="border-color1 max-w-sm h-screen mx-auto py-12 px-8">
      <div className="flex flex-col gap-5 justify-between h-full">
        <div>
          {/* header */}
          <div className="flex flex-col items-center justify-center">
            <AlexiumLogoIcon size={63} />
            <div className="text-center">
              <h1 className="text-xs font-semibold mt-3 text-black">
                {entityName}
              </h1>
              <p className="text-color2 text-[8px]">POWERED BY ALEXIUM</p>
            </div>
          </div>
          <div className="mt-40">
            <h2 className="font-medium text-2xl">Welcome back, {firstName}!</h2>
            <p className="mt-3">Thank you for visiting us today.</p>
            <p className="mt-3 text-xs text-color2">
              We&apos;re excited to help you find your perfect vehicle and provide
              you with personalised service.
            </p>
          </div>
          <div className="flex gap-3 items-center border rounded-lg p-3 mt-10">
            <div>
              <div className="w-10 h-10 rounded-full bg-color1 text-white font-medium flex items-center justify-center">
                {customerData ? getInitials(customerData.name) : ''}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">{customerData.name}</p>
              <p className="text-xs text-color2">{customerData.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <Button
            onPress={handleContinue}
            className="text-color1 bg-color3 rounded-full w-full"
            isLoading={isContinueLoading}
            isDisabled={isContinueLoading || isNotYouLoading}
          >
            Continue
          </Button>
          <Button
            onPress={handleNotYou}
            className="bg-color1 text-white rounded-full w-full"
            isLoading={isNotYouLoading}
            isDisabled={isContinueLoading || isNotYouLoading}
          >
            Not You?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoRecognitionPage; 