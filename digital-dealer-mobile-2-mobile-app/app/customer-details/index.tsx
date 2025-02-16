import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import EmailIcon from '@/components/svg/emailIcon';
import PhoneIcon from '@/components/svg/phoneIcon';
import BackArrowIcon from '@/components/svg/backArrow';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import EditIcon from '@/components/svg/editIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants';
import ButtonComponent from '@/components/ui/button';
import SuccessAnimation from "@/components/successAnimation";

interface CustomerScan {
  id: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    profile_image_url: string | null;
  };
  interest_status: string;
  created_at: string;
  scanCount: number;
}

// Add CustomerDetailsScreenSkeleton component
const CustomerDetailsScreenSkeleton = () => {
  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home")}>
            <BackArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View className="w-[18px]" />
        </View>
        <View className="px-4">
          <TouchableOpacity 
            className="flex-row items-center gap-1 ml-auto p-2 z-10 mt-8"
            onPress={() => router.push({
              pathname: "/customer-details/edit"
            })}
          >
            <EditIcon /><Text className="text-xs text-gray-300">Edit...</Text>
          </TouchableOpacity>
          <View
            className="bg-white rounded-md justify-center items-center"
            style={{
              padding: 20,
              shadowColor: "#9a9a9a",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.25,
              shadowRadius: 9.4,
              elevation: 4,
            }}>
            <View className="bg-color1 rounded-full items-center justify-center w-[100px] h-[100px]">
              <Text className="text-white font-bold text-[30px]">LD</Text>
            </View>
            <Text className="text-2xl font-semibold mt-3">Loading Data...</Text>
            <View className="flex-row items-center mt-2 gap-[10px]">
              <Text className="text-xs text-gray-500">Scans: ...</Text>
              <View className="flex-row gap-2">
                <Text className="rounded-full text-[10px] border font-semibold px-2 py-0.5 border-gray-400 bg-color3 text-gray-600">
                  Loading...
                </Text>
              </View>
            </View>
          </View>
          <View className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md px-6">
            <EmailIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">Loading Data...</Text>
          </View>
          <View className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md px-6">
            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">Loading Data...</Text>
          </View>
          <View className='flex-row justify-center mt-5'>
            <Text className='text-xs text-gray-500'>
              <Text className='font-bold'>Last scanned:</Text> Loading Data...
            </Text>
          </View>
        </View>
      </View>
      <View className='px-4'>
        <ButtonComponent
          label="Show Customer Log"
          var2
          onPress={() => router.push({
            pathname: "/customer-log"
          })}
        />
      </View>
    </View>
  );
};

const SelectedCustomerScreen = () => {
  const [loading, setLoading] = useState(true);
  const [customerScan, setCustomerScan] = useState<CustomerScan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const customerId = await AsyncStorage.getItem('selectedCustomerId');
        const scanId = await AsyncStorage.getItem('selectedScanId');
        const token = await AsyncStorage.getItem('userToken');
        const wasEdited = await AsyncStorage.getItem('customerWasEdited');

        if (!customerId || !scanId || !token) {
          throw new Error('Required data not found');
        }

        const response = await axios.get(
          `${API_URL}/api/customer-scans/details/${customerId}/${scanId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCustomerScan(response.data);

        // Show success message if customer was edited
        if (wasEdited === 'true') {
          setSuccessMessage("Customer profile updated successfully");
          setShowSuccess(true);
          // Clear the flag
          await AsyncStorage.removeItem('customerWasEdited');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "CU";
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";
    
    if (!firstName) return "CU";
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("D MMM YYYY h:mm A");
  };

  if (loading) {
    return <CustomerDetailsScreenSkeleton />;
  }

  if (error || !customerScan) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{error || 'No customer data available'}</Text>
      </View>
    );
  }

  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      {showSuccess && (
        <View className="absolute inset-x-0 top-0 z-[999] px-5 pt-5">
          <View className="bg-white rounded-lg shadow-lg">
            <SuccessAnimation
              message={successMessage}
              isSuccess={successMessage.includes("successfully")}
              onAnimationComplete={() => setShowSuccess(false)}
            />
          </View>
        </View>
      )}
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home/customers")}>
            <BackArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/home")}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View className="w-[18px]" />
        </View>
        <View className="px-4">
          <TouchableOpacity 
            className="flex-row items-center gap-1 ml-auto p-2 z-10 mt-8"
            onPress={() => router.push({
              pathname: "/customer-details/edit"
            })}
          >
            <EditIcon /><Text className="text-xs text-gray-300">Edit...</Text>
          </TouchableOpacity>
          <View
            className="bg-white rounded-md justify-center items-center"
            style={{
              padding: 20,
              shadowColor: "#9a9a9a",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.25,
              shadowRadius: 9.4,
              elevation: 4,
            }}>
            {customerScan.customer.profile_image_url ? (
              <Image
                source={{ 
                  uri: customerScan.customer.profile_image_url,
                  headers: {
                    'Cache-Control': 'public',
                    'Pragma': 'public'
                  }
                }}
                className="w-[100px] h-[100px] rounded-full"
                onError={(error) => {
                  console.error('Image loading error:', error);
                  // If image fails to load, fallback to initials
                  setCustomerScan(prev => ({
                    ...prev!,
                    customer: {
                      ...prev!.customer,
                      profile_image_url: null
                    }
                  }));
                }}
                defaultSource={require('@/assets/images/favicon.png')}
              />
            ) : (
              <View className="bg-color1 rounded-full items-center justify-center w-[100px] h-[100px]">
                <Text className="text-white font-bold text-[30px]">
                  {getInitials(customerScan.customer.name)}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-semibold mt-3">{customerScan.customer.name}</Text>
            <View className="flex-row items-center mt-2 gap-[10px]">
              <Text className="text-xs text-gray-500">Scans: {customerScan.scanCount}</Text>
              <View className="flex-row gap-2">
                <Text
                  className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
                    customerScan.interest_status === "Hot"
                      ? "border-red-400 bg-red-100 text-red-600"
                      : customerScan.interest_status === "Warm"
                        ? "border-orange-400 bg-orange-100 text-orange-600"
                        : "border-blue-400 bg-blue-100 text-blue-600"
                  }`}
                >
                  {customerScan.interest_status}
                </Text>
              </View>
            </View>
          </View>
          <View className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md px-6">
            <EmailIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">{customerScan.customer.email || 'No email'}</Text>
          </View>
          <View className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md px-6">
            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
            <Text className="text-xs">{customerScan.customer.phone || 'No phone number'}</Text>
          </View>
          <View className='flex-row justify-center mt-5'>
            <Text className='text-xs text-gray-500'>
              <Text className='font-bold'>Last scanned:</Text> {formatDate(customerScan.created_at)}
            </Text>
          </View>
        </View>
      </View>
      <View className='px-4'>
        <ButtonComponent
          label="Show Customer Log"
          var2
          onPress={() => router.push({
            pathname: "/customer-log"
          })}
        />
      </View>
    </View>
  );
};

export default SelectedCustomerScreen;