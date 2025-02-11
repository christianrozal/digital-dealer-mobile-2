import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import { router } from "expo-router";
import Select from "@/components/ui/select";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from "@/components/ui/button";
const API_URL = 'http://172.16.21.184:3000/api';
const AUTH_API = `${API_URL}/auth`;

interface Option {
  id: string;
  label: string;
}

// Updated interfaces to match Prisma schema
interface Dealership {
  id: number;
  name: string;
  slug: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  primary_contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  brands: DealershipBrand[];
}

interface DealershipBrand {
  id: number;
  name: string;
  slug: string;
  dealership_id: number;
  primary_contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dealership: Dealership;
  departments: DealershipDepartment[];
}

interface DealershipDepartment {
  id: number;
  name: string;
  slug: string;
  dealership_brand_id: number;
  primary_contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dealershipBrand: DealershipBrand;
}

interface UserData {
  id: number;
  role_id: number;
}

const DealershipsScreen = () => {
  const [isBrandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dealershipName, setDealershipName] = useState<string>('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  // Fetch dealership name on mount
  useEffect(() => {
    const fetchDealershipInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(`${API_URL}/dealership-info`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dealership info');
        }

        const data = await response.json();
        if (data?.name) {
          setDealershipName(data.name);
        }
      } catch (error) {
        console.error('Error fetching dealership:', error);
      }
    };

    fetchDealershipInfo();
  }, []);

  // Updated fetch dealership brands with new schema relations
  useEffect(() => {
    const fetchDealershipBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(`${AUTH_API}/dealerships`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            router.replace('/login');
            return;
          }
          throw new Error('Failed to fetch dealership brands');
        }

        const data: DealershipBrand[] = await response.json();
        
        if (data.length === 0) {
          setError('No dealerships available');
          return;
        }

        // Store the full brand data for later use
        const brandOptions = data.map(brand => ({
          id: brand.id.toString(),
          label: brand.name,
        }));

        setBrands(brandOptions);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load dealership brands');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDealershipBrands();
  }, []);

  // Updated fetch departments with new schema relations
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedBrand) return;

      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          router.replace('/login');
          return;
        }

        const response = await fetch(`${AUTH_API}/dealerships/${selectedBrand.id}/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to fetch departments');
        }

        const data: DealershipDepartment[] = await response.json();
        
        // If there are no departments or we get a 404, just set an empty array
        // This is a valid case for brands without departments
        if (!data || response.status === 404) {
          setDepartments([]);
          return;
        }

        const departmentOptions = data.map(dept => ({
          id: dept.id.toString(),
          label: dept.name,
        }));

        setDepartments(departmentOptions);
      } catch (error) {
        console.error('Error:', error);
        // Don't show error for missing departments, just set empty array
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [selectedBrand]);

  const toggleBrandDropdown = () => {
    setBrandDropdownOpen(!isBrandDropdownOpen);
    if (isDepartmentDropdownOpen) setDepartmentDropdownOpen(false);
  };

  const toggleDepartmentDropdown = () => {
    setDepartmentDropdownOpen(!isDepartmentDropdownOpen);
    if (isBrandDropdownOpen) setBrandDropdownOpen(false);
  };

  const handleBrandSelection = (option: Option) => {
    setSelectedBrand(option);
    setSelectedDepartment(null);
    setBrandDropdownOpen(false);
  };

  const handleDepartmentSelection = (option: Option) => {
    setSelectedDepartment(option);
    setDepartmentDropdownOpen(false);
  };

  const handleContinue = async () => {
    if (selectedBrand && (departments.length === 0 || selectedDepartment)) {
      try {
        // Store selected brand and department
        const selection = {
          brand: {
            id: selectedBrand.id,
            name: selectedBrand.label
          },
          department: selectedDepartment ? {
            id: selectedDepartment.id,
            name: selectedDepartment.label
          } : null
        };
        await AsyncStorage.setItem('selectedDealership', JSON.stringify(selection));
        router.push("/home");
      } catch (error) {
        console.error('Error saving selection:', error);
        setError('Failed to save selection');
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-color1 rounded-full px-6 py-2"
            onPress={() => router.replace('/login')}
          >
            <Text className="text-white">Return to Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center justify-center h-screen w-full max-w-60 mx-auto">
          <AlexiumLogoIcon />
          <Text className="mt-10 font-light text-sm">Welcome to</Text>
          <Text className="text-xl font-semibold mt-3">{dealershipName || 'Loading...'}</Text>

          <View className="w-full min-h-44 z-20" style={{ marginTop: 40 }}>
            <Select
              placeholder="Select Brand"
              value={selectedBrand}
              options={brands}
              isOpen={isBrandDropdownOpen}
              onPress={toggleBrandDropdown}
              onSelect={handleBrandSelection}
            />

            {selectedBrand && departments.length > 0 && (
              <View className="mt-4 z-10">
                <Select
                  placeholder="Select Department"
                  value={selectedDepartment}
                  options={departments}
                  isOpen={isDepartmentDropdownOpen}
                  onPress={toggleDepartmentDropdown}
                  onSelect={handleDepartmentSelection}
                />
              </View>
            )}

            {/* Continue Button */}
            <View className="mt-8">
              <ButtonComponent
                label="Continue"
                onPress={handleContinue}
                disabled={!selectedBrand || (departments.length > 0 && !selectedDepartment)}
                className={`${
                  selectedBrand && (departments.length === 0 || selectedDepartment)
                  ? 'bg-color1' 
                  : 'bg-indigo-100'
                }`}
              />
            </View>
          </View>
        </View>
      )}

      {isLoading && (
        <View
          className="z-50 absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-white/50"
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

export default DealershipsScreen;
