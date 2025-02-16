'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input, Checkbox, Button, Spinner } from "@heroui/react";
import { API_URL } from '@/constants';
import AlexiumLogoIcon from '@/app/components/svg/alexiumLogo';

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

const SignupPage = () => {
  const params = useParams();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    terms: false
  });

  // Add check for existing customer data
  useEffect(() => {
    const storedCustomer = localStorage.getItem('customerData');
    if (storedCustomer) {
      console.log('Found existing customer data, redirecting to auto page...');
      router.push(`/dealership/auto`);
      return;
    }
  }, [router]);

  const { slug } = params;
  const [processedSlug, setProcessedSlug] = useState<string>('');

  const convertToTitleCase = (str: string): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
  };

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      const formattedSlug = convertToTitleCase(slug.replace(/-/g, " "));
      setProcessedSlug(formattedSlug);
    }

    const fetchEntityDetails = async () => {
      try {
        if (!slug) {
          console.error('Slug is undefined or empty');
          throw new Error('Invalid slug');
        }
        console.log('Starting fetch with slug:', slug);

        // Try department first
        console.log('Fetching departments...');
        const response = await fetch(`${API_URL}/api/dealership-departments`);
        if (!response.ok) {
          console.error('Departments fetch failed with status:', response.status);
          throw new Error(`Failed to fetch departments: ${response.status}`);
        }

        let departmentsResponse;
        try {
          departmentsResponse = await response.json();
          console.log('Raw departments response:', JSON.stringify(departmentsResponse));
        } catch (parseError) {
          console.error('Failed to parse departments response:', parseError);
          throw new Error('Invalid departments response');
        }

        // Safely extract departments array with type checking
        let departments = [];
        if (Array.isArray(departmentsResponse)) {
          departments = departmentsResponse;
        } else if (departmentsResponse && typeof departmentsResponse === 'object') {
          departments = Array.isArray(departmentsResponse.data) ? departmentsResponse.data : [];
        }
        console.log('Processed departments array:', JSON.stringify(departments));

        // Safely check each department
        if (departments.length > 0) {
          const department = departments.find((d: DealershipDepartment) => {
            if (!d || typeof d !== 'object') {
              console.log('Invalid department object:', d);
              return false;
            }
            console.log('Checking department:', JSON.stringify(d));
            console.log('Department slug:', d.slug);
            console.log('Comparing with:', slug);
            return d.slug === slug;
          });

          if (department) {
            console.log('Department found:', JSON.stringify(department));
            setPageLoading(false);
            return;
          }
        } else {
          console.log('No departments found in response');
        }

        // Try brand if department not found
        console.log('Department not found, trying brands...');
        const response2 = await fetch(`${API_URL}/api/dealership-brands`);
        if (!response2.ok) {
          console.error('Brands fetch failed with status:', response2.status);
          throw new Error(`Failed to fetch brands: ${response2.status}`);
        }

        let brandsResponse;
        try {
          brandsResponse = await response2.json();
          console.log('Raw brands response:', JSON.stringify(brandsResponse));
        } catch (parseError) {
          console.error('Failed to parse brands response:', parseError);
          throw new Error('Invalid brands response');
        }

        // Safely extract brands array with type checking
        let brands = [];
        if (Array.isArray(brandsResponse)) {
          brands = brandsResponse;
        } else if (brandsResponse && typeof brandsResponse === 'object') {
          brands = Array.isArray(brandsResponse.data) ? brandsResponse.data : [];
        }
        console.log('Processed brands array:', JSON.stringify(brands));

        // Safely check each brand
        if (brands.length > 0) {
          const brand = brands.find((b: DealershipBrand) => {
            if (!b || typeof b !== 'object') {
              console.log('Invalid brand object:', b);
              return false;
            }
            console.log('Checking brand:', JSON.stringify(b));
            console.log('Brand slug:', b.slug);
            console.log('Comparing with:', slug);
            return b.slug === slug;
          });

          if (brand) {
            console.log('Brand found:', JSON.stringify(brand));
            setPageLoading(false);
            return;
          }
        } else {
          console.log('No brands found in response');
        }

        console.log('No matching department or brand found for slug:', slug);
        throw new Error('Entity not found');
      } catch (error) {
        console.error('Error in fetchEntityDetails:', error);
        setError('Invalid QR code or entity not found');
        setPageLoading(false);
      }
    };

    if (slug) {
      fetchEntityDetails();
    }
  }, [slug]);

  const handleSubmit = async () => {
    const now = Date.now();
    const requestId = now;
    
    if (!formData.terms) {
      alert("Please accept the terms and conditions");
      return;
    }
    
    if (isSubmitting.current || submitting) {
      console.log(`[${requestId}] Submission blocked - already in progress`);
      return;
    }

    isSubmitting.current = true;
    setSubmitting(true);

    try {
      console.log(`[${requestId}] Creating customer...`);
      const customerResponse = await fetch(`${API_URL}/api/customers`, {
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

      if (!customerResponse.ok) {
        throw new Error('Failed to create customer');
      }

      const customer = await customerResponse.json();
      console.log(`[${requestId}] Customer created/updated:`, customer);

      // Store customer data and entity slug in localStorage
      localStorage.setItem('customerData', JSON.stringify(customer));
      localStorage.setItem('entitySlug', slug as string);

      console.log(`[${requestId}] Creating dealership scan...`);
      const scanResponse = await fetch(`${API_URL}/api/dealership-scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          entitySlug: slug,
          customerId: customer.id
        }),
      });

      if (!scanResponse.ok) {
        throw new Error('Failed to submit form');
      }

      const scanData = await scanResponse.json();
      console.log(`[${requestId}] Scan created, redirecting...`);

      // Get the QR code details to find the latest user who scanned this customer
      const latestScanResponse = await fetch(`${API_URL}/api/customer-scans/logs/${customer.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (latestScanResponse.ok) {
        const scans = await latestScanResponse.json();
        if (scans && scans.length > 0) {
          const latestScan = scans[0]; // Get the most recent scan
          
          // Create notification for the consultant
          const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'CUSTOMER_CHECK_IN',
              userId: latestScan.user_id,
              dealershipId: latestScan.dealership_id,
              dealershipBrandId: latestScan.dealership_brand_id,
              dealershipDepartmentId: latestScan.dealership_department_id,
              metadata: {
                customerName: customer.name,
                customerProfileImage: customer.profile_image_url,
                entityName: scanData.scan.qrCode.dealershipDepartment?.name || scanData.scan.qrCode.dealershipBrand.name
              }
            })
          });

          if (!notificationResponse.ok) {
            console.error(`[${requestId}] Failed to create notification:`, await notificationResponse.json());
          }
        }
      }

      router.push(`/landing/${customer.slug}`);
    } catch (err) {
      console.error(`[${requestId}] Form submission error:`, err);
      setError('Failed to submit form. Please try again.');
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (pageLoading) {
    return (
      <div className="border max-w-sm min-h-screen mx-auto py-12 px-8">
        <div className="flex flex-col items-center justify-center h-full">
          <AlexiumLogoIcon size={63} />
          <div className="text-center">
            <h1 className="text-xs font-semibold mt-3 text-black">
              {processedSlug}
            </h1>
            <p className="text-color2 text-[8px]">POWERED BY ALEXIUM</p>
          </div>
          <div className="mt-10">
            <Spinner size="lg" color="primary"/>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border max-w-sm min-h-screen mx-auto py-12 px-8">
        <div className="flex flex-col items-center justify-center">
          <AlexiumLogoIcon size={63} />
          <div className="text-center">
            <h1 className="text-xs font-semibold mt-3 text-black">
              {processedSlug}
            </h1>
            <p className="text-color2 text-[8px]">POWERED BY ALEXIUM</p>
          </div>
          <div className="mt-10 bg-red-50 p-4 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border max-w-sm min-h-screen mx-auto py-12 px-8">
      {/* header */}
      <div className="flex flex-col items-center justify-center">
        <AlexiumLogoIcon size={63} />
        <div className="text-center">
          <h1 className="text-xs font-semibold mt-3 text-black">
            {processedSlug}
          </h1>
          <p className="text-color2 text-[8px]">POWERED BY ALEXIUM</p>
        </div>
      </div>

      {/* body */}
      <div className="mt-16">
        <div>
          <h2 className="text-[25px] font-medium">
            Welcome
          </h2>
          <h3 className="text-base mt-3">Thank you for visiting us today.</h3>
          <p className="text-xs text-color2 mt-3">
            We&apos;re excited to help you find your perfect vehicle and provide
            you with personalised service.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Input
            label="Name"
            type="text"
            size="sm"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            isDisabled={submitting}
            classNames={{
              inputWrapper: "bg-color3 rounded-md",
            }}
          />
          <Input
            label="Email"
            type="email"
            size="sm"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            isDisabled={submitting}
            classNames={{
              inputWrapper: "bg-color3 rounded-md",
            }}
          />
          <Input
            label="Contact Number"
            type="tel"
            size="sm"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            isDisabled={submitting}
            classNames={{
              inputWrapper: "bg-color3 rounded-md",
            }}
          />

          <div className="flex flex-col gap-2">
            <Checkbox
              size="sm"
              name="terms"
              isSelected={formData.terms}
              onChange={handleInputChange}
              isDisabled={submitting}
              classNames={{
                label: "text-[10px] text-color2",
              }}
            >
              I agree to Alexium&apos;s Privacy Policy and Terms of Use.
            </Checkbox>
          </div>
          
          <Button
            onPress={handleSubmit}
            className="bg-color1 w-full mt-10 text-white rounded-full"
            isDisabled={submitting}
            isLoading={submitting}
            size="lg"
          >
            {submitting ? "Checking in..." : "Check-In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 