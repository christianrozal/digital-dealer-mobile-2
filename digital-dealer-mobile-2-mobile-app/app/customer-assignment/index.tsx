import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from "@/components/ui/button";
import BackArrowIcon from "@/components/svg/backArrow";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ChevronDownIcon from "@/components/svg/chevronDown";
import { API_URL } from "@/constants";

interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string | null;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  profile_image_url?: string | null;
}

interface CustomerScan {
  id: number;
  customer_id: number;
  user_id: number;
  dealership_id: number;
  dealership_brand_id: number;
  dealership_department_id: number | null;
  interest_status: string;
  interested_in: string | null;
  follow_up_date: string | null;
  created_at: string;
  customer: Customer;
  user: User;
}

const CustomerAssignmentScreen = () => {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [priorScans, setPriorScans] = useState<CustomerScan[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get current user token and data
        const [token, selectedCustomerId, scanId, dealershipData] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('selectedCustomerId'),
          AsyncStorage.getItem('selectedScanId'),
          AsyncStorage.getItem('selectedDealership')
        ]);

        if (!token || !selectedCustomerId || !dealershipData) {
          router.replace('/login');
          return;
        }

        setSelectedScanId(scanId);

        const dealership = JSON.parse(dealershipData);
        const brandId = dealership.brand.id;

        // Fetch users for this dealership brand
        const usersResponse = await fetch(`${API_URL}/api/users/brand/${brandId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch customer details
        const customerResponse = await fetch(`${API_URL}/api/customers/id/${selectedCustomerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer');
        }

        const customerData = await customerResponse.json();
        setCustomer(customerData);

        // Fetch prior scans
        const scansResponse = await fetch(`${API_URL}/api/customer-scans/logs/${selectedCustomerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!scansResponse.ok) {
          throw new Error('Failed to fetch scans');
        }

        const scansData = await scansResponse.json();
        setPriorScans(scansData);

        // Get current user data
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setSelectedName(user.name);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    };

    loadInitialData();
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

  const renderNameOptions = () => {
    return users.map((user) => (
      <TouchableOpacity
        key={user.id}
        className={`px-5 py-3 bg-white ${selectedName === user.name ? 'bg-gray-100' : ''}`}
        onPress={() => handleNameSelection(user.name)}
      >
        <View className="flex-row items-center gap-2">
          {user.profile_image_url ? (
            <Image
              source={{ uri: user.profile_image_url }}
              style={{ width: 24, height: 24, borderRadius: 12 }}
            />
          ) : (
            <View
              className="bg-color1 rounded-full flex items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <Text className="text-white text-[10px] font-bold">
                {getInitials(user.name)}
              </Text>
            </View>
          )}
          <Text className={`text-sm ${selectedName === user.name ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
            {user.name}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const handleAssign = async () => {
    try {
      setIsAssigning(true);
      
      const [token, selectedCustomerId, selectedScanId, dealershipData] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedCustomerId'),
        AsyncStorage.getItem('selectedScanId'),
        AsyncStorage.getItem('selectedDealership')
      ]);

      if (!token || !selectedCustomerId || !selectedScanId || !dealershipData || !selectedName) {
        Alert.alert('Error', 'Missing required data');
        return;
      }

      const dealership = JSON.parse(dealershipData);
      const selectedUser = users.find(user => user.name === selectedName);

      if (!selectedUser) {
        Alert.alert('Error', 'Selected user not found');
        return;
      }

      // Update the selected scan with the new user
      const response = await fetch(`${API_URL}/api/customer-scans/scan/${selectedScanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update customer scan');
      }

      const scanData = await response.json();

      // Find the selected scan's index and get the scan that came before it
      const selectedScanIndex = priorScans.findIndex(scan => scan.id.toString() === selectedScanId);
      console.log('Selected scan ID:', selectedScanId);
      console.log('Selected scan index:', selectedScanIndex);
      console.log('Prior scans:', priorScans.map(scan => ({ id: scan.id, user_id: scan.user_id })));
      
      const previousScan = selectedScanIndex >= 0 && selectedScanIndex < priorScans.length - 1 
        ? priorScans[selectedScanIndex + 1] 
        : null;
      console.log('Previous scan:', previousScan ? { id: previousScan.id, user_id: previousScan.user_id } : 'null');
      console.log('Selected user ID:', selectedUser.id);
      
      const isReassignment = previousScan && previousScan.user_id !== selectedUser.id;
      console.log('Is reassignment:', isReassignment);

      if (isReassignment) {
        console.log('Creating notification for user:', previousScan.user_id);
        // Create notification for the previous consultant
        const notificationResponse = await fetch(`${API_URL}/api/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            type: 'CUSTOMER_REASSIGNMENT',
            user_id: previousScan.user_id,
            dealership_brand_id: dealership.brand.id,
            dealership_department_id: dealership.department ? dealership.department.id : null,
            metadata: {
              customerName: customer?.name || 'Unknown Customer',
              newUserName: selectedUser.name,
              customerProfileImage: customer?.profile_image_url
            }
          })
        });

        if (!notificationResponse.ok) {
          const errorData = await notificationResponse.json();
          console.error('Failed to create notification:', errorData);
        } else {
          const notificationData = await notificationResponse.json();
          console.log('Notification created:', notificationData);
        }
      }

      // Store the selected user ID
      await AsyncStorage.setItem('selectedUserId', selectedUser.id.toString());

      // Navigate to the appropriate screen
      router.push("/customer-log");
    } catch (error) {
      console.error('Error assigning customer:', error);
      Alert.alert('Error', 'Failed to assign customer. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const renderPriorUsers = () => {
    if (!priorScans || priorScans.length === 0) {
      return null;
    }
    
    // Get unique prior users from all scans except the selected scan
    const uniquePriorUsers = priorScans
      .filter(scan => scan.id.toString() !== selectedScanId) // Exclude the selected scan
      .map(scan => scan.user)
      .filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id) // Only keep unique users
      );

    if (uniquePriorUsers.length === 0) {
      return null;
    }

    const priorUserNames = uniquePriorUsers.map(user => user.name).join(", ");

    return (
      <View className="mt-4">
        <Text className="text-gray-500 text-[10px] mb-2">Prior Consultants</Text>
        <View>
          <Text className="text-sm text-gray-700">{priorUserNames}</Text>
        </View>
      </View>
    );
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNameSelection = (name: string) => {
    setSelectedName(name);
    setIsDropdownOpen(false);
  };

  return (
    <View className="pt-7 px-7 pb-7 h-screen justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.push("/home/customers")}>
            <BackArrowIcon />
          </TouchableOpacity>
          {/* Logo */}
          <TouchableOpacity onPress={() => { router.push("/home") }}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>

        <View className="mt-12">
          <Text className="text-2xl font-semibold">Customer Assignment</Text>
          <Text className="text-xs text-gray-400 mt-3">
            The below customer will be assigned to you. In case the customer was
            assigned to anyone else, we will send the notification to align
            everyone.
          </Text>
        </View>
        
        {/* Customer Info */}
        <View className="bg-gray-400 rounded-md px-5 py-7 mt-5 flex-row gap-5">
          <View>
            {customer?.profile_image_url ? (
              <Image
                source={{ uri: customer.profile_image_url || undefined }}
                style={{ width: 64, height: 64, borderRadius: 32 }}
              />
            ) : (
              <View
                className="bg-color1 rounded-full flex items-center justify-center"
                style={{ width: 64, height: 64 }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 20 }}>
                  {getInitials(customer?.name || '')}
                </Text>
              </View>
            )}
          </View>
          <View className="gap-1">
            <Text className="text-white text-[10px]">
              Customer Name: <Text className="font-bold">{customer?.name || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Contact Number: <Text className="font-bold">{customer?.phone || "N/A"}</Text>
            </Text>
            <Text className="text-white text-[10px]">
              Email: <Text className="font-bold">{customer?.email || "N/A"}</Text>
            </Text>
          </View>
        </View>

        {/* Prior Consultants */}
        <View className="mt-6">
          {renderPriorUsers()}
        </View>

        {/* Name Select */}
        <View className="mt-5 relative z-10 w-full">
          <Text className="text-[10px] text-gray-500">Your Name</Text>
          <TouchableOpacity
            className="rounded-md bg-color3 px-5 py-3 mt-1 flex-row items-center justify-between"
            onPress={toggleDropdown}
          >
            <View className="flex-row items-center gap-2">
              {selectedName && (
                <>
                  {users.find(u => u.name === selectedName)?.profile_image_url ? (
                    <Image
                      source={{ uri: users.find(u => u.name === selectedName)?.profile_image_url || undefined }}
                      style={{ width: 24, height: 24, borderRadius: 12 }}
                    />
                  ) : (
                    <View
                      className="bg-color1 rounded-full flex items-center justify-center"
                      style={{ width: 24, height: 24 }}
                    >
                      <Text className="text-white text-[10px] font-bold">
                        {getInitials(selectedName)}
                      </Text>
                    </View>
                  )}
                </>
              )}
              <Text
                className={`text-sm ${selectedName ? "text-gray-600" : "text-gray-400"}`}
              >
                {selectedName || "Select a name"}
              </Text>
            </View>
            <View
              className="transition-transform duration-300"
              style={{
                transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }],
              }}
            >
              <ChevronDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
          {isDropdownOpen && (
            <ScrollView
              className="mt-1 bg-white border border-gray-200 rounded-md"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 10,
                maxHeight: 112,
              }}
            >
              {renderNameOptions()}
            </ScrollView>
          )}
        </View>

        <View className='mt-7'>
          <ButtonComponent
            label={isAssigning ? "Assigning..." : "Apply"}
            onPress={handleAssign}
            disabled={isAssigning || !selectedName}
            loading={isAssigning}
          />
        </View>
      </View>
    </View>
  );
};

export default CustomerAssignmentScreen;
