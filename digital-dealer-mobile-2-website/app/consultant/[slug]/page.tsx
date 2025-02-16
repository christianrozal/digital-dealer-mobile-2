"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import EmailIcon from "@/app/components/svg/emailIcon";
import PhoneIcon from "@/app/components/svg/phoneIcon";
import WebsiteIcon from "@/app/components/svg/websiteIcon";
import CheckIcon from "@/app/components/svg/checkIcon";
import AlexiumLogo2 from "@/app/components/svg/alexiumLogo2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ConsultantSlugPage = () => {
  const router = useRouter();
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!slug) return;

      try {
        const response = await fetch(`${API_URL}/api/users/consultant/${slug}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [slug]);

  const generateVCard = () => {
    if (!userData) return "";

    const nameParts = userData.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return `BEGIN:VCARD
VERSION:3.0
FN:${userData.name}
N:${lastName};${firstName};;;
ORG:Alexium
TITLE:${userData.position || "Consultant"}
EMAIL:${userData.email}${userData.phone ? `\nTEL:${userData.phone}` : ''}
URL:www.alexium.com.au
END:VCARD`;
  };

  const setConfirmation = () => {
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  const handleSaveContact = () => {
    if (!userData) return;

    const vCardData = generateVCard();
    const blob = new Blob([vCardData], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${userData.name.replace(" ", "_")}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setConfirmation();
  };

  const handleBookAppointment = () => {
    try {
      // Store consultant data in localStorage
      localStorage.setItem('selectedConsultant', JSON.stringify({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profile_image_url: userData.profile_image_url,
        slug: userData.slug,
        dealership_brand_id: userData.dealership_brand_id,
        dealership_department_id: userData.dealership_department_id
      }));

      // Navigate to booking page
      router.push(`/consultant/${slug}/book-date`);
    } catch (error) {
      console.error('Error storing consultant data:', error);
      // Navigate anyway even if storage fails
      router.push(`/consultant/${slug}/book-date`);
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-color1"></div>
    </div>
  );
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!userData) return <div className="text-center p-4">User not found</div>;

  const firstName = userData.name.split(" ")[0];
  const avatarText = firstName.length >= 2 
    ? firstName.charAt(0).toUpperCase() + firstName.charAt(1).toLowerCase()
    : firstName.charAt(0).toUpperCase();

  return (
    <>
      {showConfirmation && (
        <div 
          className="fixed top-5 max-w-xs w-[90%] flex gap-2 border rounded-md border-color5 py-3 px-3 justify-center items-center bg-white opacity-100 z-50 left-1/2"
          style={{ 
            boxShadow: "0px 4px 10px 0px rgba(7, 170, 48, 0.25)",
            transform: "translateX(-50%)"
          }}
        >
          <CheckIcon width={17} height={17} />
          <p className="text-xs">Contact Saved</p>
        </div>
      )}

      <div className="border max-w-sm h-screen mx-auto py-5 px-10 flex flex-col justify-between gap-5">
        <div>
          <div className="flex items-center justify-center">
            <AlexiumLogo2 width={79} height={17} />
          </div>

          <div className="flex flex-col items-center justify-center shadow-md p-10 mt-10 rounded-md">
            {userData.profile_image_url ? (
              <Image
                src={userData.profile_image_url}
                width={100}
                height={100}
                alt={userData.name}
                className="rounded-full w-[100px] h-[100px] object-cover"
              />
            ) : (
              <div className="bg-color1 text-white font-bold w-[100px] h-[100px] text-4xl rounded-full flex items-center justify-center">
                {avatarText}
              </div>
            )}
            <h2 className="font-nunito font-semibold mt-4">{userData.name}</h2>
            <p className="text-xs text-color2 mt-2">{userData.position || "Consultant"}</p>
          </div>

          <div className="flex flex-col gap-3 text-xs mt-7">
            <div className="flex gap-4 items-center py-2 rounded-md bg-color3 px-5">
              <EmailIcon width={17} height={17} stroke="#3d12fa" />
              <p>{userData.email}</p>
            </div>
            <div className="flex gap-4 items-center py-2 rounded-md bg-color3 px-5">
              <PhoneIcon width={17} height={17} stroke="#3d12fa" />
              <p>{userData.phone || "No Phone"}</p>
            </div>
            <div className="flex gap-4 items-center py-2 rounded-md bg-color3 px-5">
              <WebsiteIcon width={17} height={17} fill="#3d12fa" />
              <p>www.alexium.com.au</p>
            </div>
          </div>
        </div>

        <div>
          <Button
            className="bg-color1 font-semibold text-sm rounded-full w-full text-white"
            onPress={handleSaveContact}
          >
            Save Contact
          </Button>
          <Button
            className="bg-color3 font-semibold text-sm rounded-full w-full text-color1 mt-5"
            onPress={handleBookAppointment}
          >
            Book An Appointment
          </Button>
        </div>
      </div>
    </>
  );
};

export default ConsultantSlugPage;
