'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input, Checkbox, Button } from "@heroui/react";
import { API_URL } from '@/constants';
import AlexiumLogoIcon from '@/app/components/svg/alexiumLogo';

interface EntityDetails {
  name: string;
  type: 'brand' | 'department';
  dealershipName: string;
}

const SignupPage = () => {
  const params = useParams();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [entityDetails, setEntityDetails] = useState<EntityDetails | null>(null);
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
  const formRef = useRef<HTMLFormElement>(null);
  const submitCount = useRef(0);
  const lastSubmissionTime = useRef(0);
  const MIN_SUBMISSION_DELAY = 2000; // 2 seconds

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
        // Try department first
        let response = await fetch(`${API_URL}/api/dealership-departments`);
        let departments = await response.json();
        let department = departments.find((d: any) => d.slug === slug);

        if (department) {
          setEntityDetails({
            name: department.name,
            type: 'department',
            dealershipName: department.dealershipBrand?.dealership?.name || 'Dealership'
          });
          setPageLoading(false);
          return;
        }

        // Try brand if department not found
        response = await fetch(`${API_URL}/api/dealership-brands`);
        let brands = await response.json();
        let brand = brands.find((b: any) => b.slug === slug);

        if (brand) {
          setEntityDetails({
            name: brand.name,
            type: 'brand',
            dealershipName: brand.dealership?.name || 'Dealership'
          });
          setPageLoading(false);
          return;
        }

        throw new Error('Entity not found');
      } catch (err) {
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

      console.log(`[${requestId}] Scan created, redirecting...`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
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
            We're excited to help you find your perfect vehicle and provide
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
              classNames={{
                label: "text-[10px] text-color2",
              }}
            >
              I agree to Alexium's Privacy Policy and Terms of Use.
            </Checkbox>
          </div>
          
          <Button
            onClick={handleSubmit}
            className="bg-color1 w-full mt-10 text-white"
            isDisabled={submitting}
            isLoading={submitting}
          >
            {submitting ? "Checking in..." : "Check-In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 