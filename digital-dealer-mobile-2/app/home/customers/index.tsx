import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { API_URL } from '@/constants';
import dayjs from 'dayjs';

// Import icons (adjust paths as needed)
import SearchIcon from '@/components/svg/searchIcon';
import FilterIcon from '@/components/svg/filterIcon';
import PhoneIcon from '@/components/svg/phoneIcon';
import CloseIcon from '@/components/svg/closeIcon';
import AddIcon from '@/components/svg/addIcon';

//
// Type definitions
//

interface DealershipSelection {
  brand: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
}

interface CustomerScan {
  id: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    profileImage?: string;
  };
  created_at: string;
  // Optional fields (if your API provides these)
  interest_status?: string;
  interested_in?: string;
}

interface Customer {
  id: number | string;
  name: string;
  email: string | null;
  phone: string | null;
  profileImage?: string;
  lastScanned: string;
  lastScanId?: string;
  scanCount: number;
  interestStatus?: string;
  interestedIn?: string;
}

//
// CustomersScreenSkeleton Component (updated to match the home screen style)
//

const CustomersScreenSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 80 }}
        className="px-5"
      >
        {/* Static Header */}
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold">
            My Customers <Text className="text-xl font-normal text-gray-500">(0)</Text>
          </Text>
          <TouchableOpacity className="relative p-2">
            <FilterIcon showCircle={false} />
          </TouchableOpacity>
        </View>

        {/* Static Search Bar */}
        <View className="mt-4 flex-row items-center rounded-md border border-gray-200">
          <View className="px-3">
            <SearchIcon width={24} height={24} stroke="black" />
          </View>
          <TextInput
            editable={false}
            className="flex-1 py-2 text-sm"
            placeholder="Search customers..."
          />
        </View>

        {/* Customers List Skeleton */}
        <View className="mt-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="p-3 rounded-md flex-row justify-between items-center bg-white shadow-sm">
              <View className="items-center flex-row gap-3">
                <View className="w-10 h-10 bg-color3 rounded-full" />
                <View>
                  <View className="h-4 w-24 bg-color3 rounded mb-2" />
                  <View className="flex-row gap-1 items-center">
                    <View className="h-3 w-32 bg-color3 rounded" />
                  </View>
                  <View className="h-2 w-28 bg-color3 rounded mt-2" />
                </View>
              </View>
              <View className="gap-2">
                <View className="h-3 w-16 bg-color3 rounded" />
                <View className="h-4 w-12 bg-color3 rounded" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

//
// CustomersScreen Component
//

const CustomersScreen = () => {
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [flatCustomers, setFlatCustomers] = useState<Customer[]>([]);
  const [groupedCustomers, setGroupedCustomers] = useState<{ [key: string]: Customer[] }>({});
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ─── FETCH CUSTOMERS FROM API ──────────────────────────────────────────────
  const fetchCustomers = async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        // Clear existing data when starting a new fetch
        setCustomers([]);
        setFlatCustomers([]);
        setGroupedCustomers({});
      }
      setError(null);

      // Get user data from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        router.replace('/login');
        return;
      }
      const userData = JSON.parse(userDataStr);

      // Get selected dealership
      const selection = await AsyncStorage.getItem('selectedDealership');
      const dealershipSelection: DealershipSelection = selection ? JSON.parse(selection) : null;
      if (!dealershipSelection) {
        setError('No dealership selected');
        return;
      }

      // Get auth token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Fetch unique customers for the selected brand/department
      const response = await axios.get(`${API_URL}/api/customer-scans/user/${userData.id}/unique-customers`, {
        params: {
          brandId: dealershipSelection.brand.id,
          departmentId: dealershipSelection.department?.id,
          page,
          limit: 10,
          search: searchQuery || undefined
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { customers: newCustomers, pagination } = response.data;
      setTotalCustomers(pagination.total);
      setHasMorePages(page < pagination.totalPages);

      if (isLoadMore) {
        setCustomers(prev => [...prev, ...newCustomers]);
      } else {
        setCustomers(newCustomers);
      }

      // Apply sorting if needed
      let sortedCustomers = isLoadMore ? [...customers, ...newCustomers] : newCustomers;
      if (sortBy) {
        const safeDate = (date: string | undefined) => date ? new Date(date).getTime() : 0;
        switch (sortBy) {
          case "a_to_z":
            sortedCustomers.sort((a: Customer, b: Customer) => a.name.localeCompare(b.name));
            break;
          case "z_to_a":
            sortedCustomers.sort((a: Customer, b: Customer) => b.name.localeCompare(a.name));
            break;
          case "scans_low_to_high":
            sortedCustomers.sort((a: Customer, b: Customer) => (a.scanCount || 0) - (b.scanCount || 0));
            break;
          case "scans_high_to_low":
            sortedCustomers.sort((a: Customer, b: Customer) => (b.scanCount || 0) - (a.scanCount || 0));
            break;
          case "last_scanned_newest_to_oldest":
            sortedCustomers.sort((a: Customer, b: Customer) => safeDate(b.lastScanned) - safeDate(a.lastScanned));
            break;
          case "last_scanned_oldest_to_newest":
            sortedCustomers.sort((a: Customer, b: Customer) => safeDate(a.lastScanned) - safeDate(b.lastScanned));
            break;
        }
        setFlatCustomers(sortedCustomers);
        setGroupedCustomers({});
      } else {
        // Group customers by first letter
        const grouped: { [key: string]: Customer[] } = {};
        sortedCustomers.forEach((customer: Customer) => {
          const letter = customer.name ? customer.name[0].toUpperCase() : '#';
          if (!grouped[letter]) grouped[letter] = [];
          grouped[letter].push(customer);
        });
        // Sort group keys (letters)
        const sortedGroups: { [key: string]: Customer[] } = {};
        Object.keys(grouped).sort().forEach(letter => {
          sortedGroups[letter] = grouped[letter];
        });
        setGroupedCustomers(sortedGroups);
        setFlatCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!hasMorePages || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchCustomers(nextPage, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCustomers(1);
  };

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Clear data and set loading state before searching
      setCustomers([]);
      setFlatCustomers([]);
      setGroupedCustomers({});
      setIsLoading(true);
      setCurrentPage(1);
      fetchCustomers(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchCustomers(1);
  }, []);

  // ─── FOCUS THE SEARCH INPUT WHEN NEEDED ───────────────────────────────
  useEffect(() => {
    if (isSearching) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  }, [isSearching]);

  // ─── HELPER FUNCTIONS ────────────────────────────────────────────────
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No date";
    return dayjs(dateString).format("D MMM YYYY, h:mm A");
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return "CU";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  };

  // ─── RENDER LOADING/ERROR STATES ─────────────────────────────────────
  if (isLoading) {
    // Instead of showing an ActivityIndicator, we render the custom skeleton loader
    return <CustomersScreenSkeleton />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  // ─── MAIN RENDER ─────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Add Button */}
      <TouchableOpacity 
        className="absolute bottom-20 right-5 z-10" 
        onPress={() => router.push("/add-customer")}
      >
        <AddIcon />
      </TouchableOpacity>

      <ScrollView 
        className="flex-1 bg-white px-5"
        ref={scrollViewRef}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3D12FA']}
            tintColor="#3D12FA"
            progressViewOffset={40}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold">
            My Customers <Text className="text-xl font-normal text-gray-500">({totalCustomers})</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setIsFilterVisible(true)}
            className="relative p-2"
          >
            <FilterIcon showCircle={false} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className={`mt-4 flex-row items-center rounded-md border ${isSearching ? 'border-color1' : 'border-gray-200'}`}>
          <View className="px-3">
            <SearchIcon width={24} height={24} stroke={isSearching ? "#3D12FA" : "black"} />
          </View>
          <TextInput
            ref={inputRef}
            className="flex-1 py-2 text-sm"
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
          />
          {searchQuery ? (
            <TouchableOpacity className="px-3" onPress={() => setSearchQuery('')}>
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Customers List */}
        {flatCustomers.length === 0 && Object.keys(groupedCustomers).length === 0 ? (
          <View className="items-center justify-center mt-5">
            <Text className="text-gray-500 text-base">No customers found</Text>
          </View>
        ) : (
          <>
            {sortBy ? (
              flatCustomers.map(customer => (
                <CustomerCard 
                  key={customer.id}
                  customer={customer}
                  getInitials={getInitials}
                  formatDate={formatDate}
                  setFlatCustomers={setFlatCustomers}
                  setGroupedCustomers={setGroupedCustomers}
                />
              ))
            ) : (
              Object.keys(groupedCustomers).map(letter => (
                <View key={letter}>
                  <View className="px-3 mt-3">
                    <Text className="font-bold text-lg">{letter}</Text>
                  </View>
                  {groupedCustomers[letter].map(customer => (
                    <CustomerCard 
                      key={customer.id}
                      customer={customer}
                      getInitials={getInitials}
                      formatDate={formatDate}
                      setFlatCustomers={setFlatCustomers}
                      setGroupedCustomers={setGroupedCustomers}
                    />
                  ))}
                </View>
              ))
            )}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3D12FA" />
              </View>
            )}
          </>
        )}

        {/* Filter Modal (placeholder) */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isFilterVisible}
          onRequestClose={() => setIsFilterVisible(false)}
        >
          <View className="flex-1 justify-end bg-transparent">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setIsFilterVisible(false)}
            >
              <View className="flex-1" />
            </TouchableOpacity>
            <View className="bg-white rounded-t-3xl p-6" style={{ height: "40%" }}>
              <Text className="text-center text-lg font-bold">Filter Modal</Text>
              {/* Add your filter options here */}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

//
// CustomerCard Component
//

interface CustomerCardProps {
  customer: Customer;
  getInitials: (name: string | undefined) => string;
  formatDate: (date: string | undefined) => string;
  setFlatCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setGroupedCustomers: React.Dispatch<React.SetStateAction<{ [key: string]: Customer[] }>>;
}

const CustomerCard = ({ customer, getInitials, formatDate, setFlatCustomers, setGroupedCustomers }: CustomerCardProps) => {
  return (
    <TouchableOpacity
      className="p-3 mt-2 rounded-md flex-row justify-between items-center bg-white shadow-sm"
      onPress={async () => {
        try {
          await AsyncStorage.setItem('selectedCustomerId', customer.id.toString());
          await AsyncStorage.setItem('selectedScanId', customer.lastScanId?.toString() || '');
          router.push("/customer-details");
        } catch (error) {
          console.error('Error storing customer data:', error);
          Alert.alert('Error', 'Failed to load customer details');
        }
      }}
    >
      <View className="items-center flex-row gap-3">
        {customer.profileImage ? (
          <Image
            source={{ 
              uri: customer.profileImage,
              headers: {
                'Cache-Control': 'public',
                'Pragma': 'public'
              }
            }}
            className="w-10 h-10 rounded-full"
            onError={(error) => {
              console.error('Image loading error:', error);
              // If image fails to load, fallback to initials
              setFlatCustomers(prev => 
                prev.map(c => 
                  c.id === customer.id 
                    ? { ...c, profileImage: undefined }
                    : c
                )
              );
              setGroupedCustomers(prev => {
                const newGroups = { ...prev };
                Object.keys(newGroups).forEach(letter => {
                  newGroups[letter] = newGroups[letter].map(c =>
                    c.id === customer.id
                      ? { ...c, profileImage: undefined }
                      : c
                  );
                });
                return newGroups;
              });
            }}
            defaultSource={require('@/assets/images/favicon.png')}
          />
        ) : (
          <View className="w-10 h-10 bg-color1 rounded-full items-center justify-center">
            <Text className="text-white font-bold text-xs">
              {getInitials(customer.name)}
            </Text>
          </View>
        )}
        <View>
          <Text className="font-bold text-sm">{customer.name}</Text>
          <View className="flex-row gap-1 items-center mt-1">
            <PhoneIcon width={14} height={14} />
            <Text className="text-gray-500 text-xs">
              {customer.phone || "No phone number"}
            </Text>
          </View>
          <Text className="text-[10px] font-semibold text-gray-400">
            Last scanned:{" "}
            <Text className="font-normal">
              {formatDate(customer.lastScanned)}
            </Text>
          </Text>
        </View>
      </View>
      <View className="gap-2">
        <Text className="text-[10px] text-gray-500">#scans: {customer.scanCount}</Text>
        {customer.interestStatus && (
          <View className="flex-row gap-2">
            <Text
              className={`rounded-full text-[10px] border font-semibold px-2 py-0.5 ${
                customer.interestStatus === "Hot"
                  ? "border-red-400 bg-red-100 text-red-600"
                  : customer.interestStatus === "Warm"
                  ? "border-orange-400 bg-orange-100 text-orange-600"
                  : "border-blue-400 bg-blue-100 text-blue-600"
              }`}
            >
              {customer.interestStatus}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomersScreen;