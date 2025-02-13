import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
  Image,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import dayjs from 'dayjs'

// Import your icons (adjust paths as needed)
import SearchIcon from '@/components/svg/searchIcon'
import CloseIcon from '@/components/svg/closeIcon'
import FilterIcon from '@/components/svg/filterIcon'
import PhoneIcon from '@/components/svg/phoneIcon'
import EmailIcon from '@/components/svg/emailIcon'
import CalendarIcon from '@/components/svg/calendar'
import { API_URL } from '@/constants'
import ActivitiesFilter, { ActivityFilters } from '@/components/activitiesFilter'

interface CustomerScan {
  id: number
  customer_id: number
  customer: {
    name: string
    email: string | null
    phone: string | null
    profile_image_url: string | null
  }
  dealership_id: number
  dealership_brand_id: number
  dealership_department_id: number | null
  interest_status: string
  interested_in: string | null
  follow_up_date: string | null
  created_at: string
}

interface DealershipSelection {
  brand: {
    id: string
    name: string
  }
  department: {
    id: string
    name: string
  } | null
}

interface UserData {
  id: number
  email: string
  role_id: number
}

// Skeleton loader component mimicking the home screen layout
const HomeScreenSkeleton = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white px-5"
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 80 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-5 min-h-10">
          <Text className="text-2xl font-semibold">Activities</Text>
          <View className="p-2">
            <FilterIcon showCircle={false} />
          </View>
        </View>

        {/* Search Bar */}
        <View className="mt-4 flex-row items-center rounded-md border border-gray-200">
          <View className="px-3">
            <SearchIcon width={24} height={24} stroke="black" />
          </View>
          <TextInput
            editable={false}
            className="flex-1 py-2 text-sm"
            placeholder="Search scans..."
          />
        </View>

        {/* Date Summary */}
        <View className="flex-row justify-between rounded-md bg-color3 p-3 mt-5">
          <View className="h-4 w-16 bg-color3 rounded" />
          <View className="h-4 w-16 bg-color3 rounded" />
        </View>

        {/* Scan List Skeleton */}
        <View className="gap-4 mt-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="bg-white rounded-lg">
              <View className="p-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row gap-2 items-center">
                    <View className="w-10 h-10 bg-color3 rounded-full" />
                    <View className="h-4 w-24 bg-color3 rounded" />
                  </View>
                  <View className="flex-row gap-1">
                    <View className="h-4 w-12 bg-color3 rounded" />
                    <View className="h-4 w-16 bg-color3 rounded" />
                  </View>
                </View>
                <View className="mt-3">
                  <View className="flex-row items-center gap-2">
                    <View className="h-3 w-10 bg-color3 rounded" />
                    <View className="h-3 w-28 bg-color3 rounded" />
                  </View>
                  <View className="flex-row items-center mt-2 gap-2">
                    <View className="h-3 w-10 bg-color3 rounded" />
                    <View className="h-3 w-28 bg-color3 rounded" />
                  </View>
                </View>
              </View>
              <View className="py-2 flex-row gap-3 justify-between px-4 bg-color3">
                <View className="flex-row gap-2 items-center">
                  <View className="h-3 w-20 bg-color3 rounded" />
                </View>
                <View className="flex-row items-center">
                  <View className="h-3 w-32 bg-color3 rounded" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const DEFAULT_FILTERS: ActivityFilters = {
  fromDate: dayjs().startOf('day').toISOString(),
  toDate: dayjs().endOf('day').toISOString(),
  sortBy: "last_scanned_newest_to_oldest",
  interestedIn: [],
  interestStatus: []
};

const HomeScreen = () => {
  // Data and loading state
  const [scans, setScans] = useState<CustomerScan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDealership, setSelectedDealership] = useState<DealershipSelection | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  // UI states for search and filter
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS)
  const inputRef = useRef<TextInput>(null)

  // Load saved filters
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem('activityFilters')
        if (savedFilters) {
          setFilters(JSON.parse(savedFilters))
        }
      } catch (error) {
        console.error('Error loading filters:', error)
      }
    }
    loadSavedFilters()
  }, [])

  // Save filters when they change and fetch scans
  useEffect(() => {
    const saveFilters = async () => {
      try {
        await AsyncStorage.setItem('activityFilters', JSON.stringify(filters))
        fetchScans() // Fetch scans whenever filters change
      } catch (error) {
        console.error('Error saving filters:', error)
      }
    }
    saveFilters()
  }, [filters])

  // Fetch scans using your API logic
  const fetchScans = async () => {
    try {
      setLoading(true)
      // Get user data from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData')
      if (!userDataStr) {
        router.replace('/login')
        return
      }
      const user: UserData = JSON.parse(userDataStr)
      setUserData(user)

      // Get selected dealership
      const selection = await AsyncStorage.getItem('selectedDealership')
      const dealershipSelection: DealershipSelection = selection ? JSON.parse(selection) : null
      setSelectedDealership(dealershipSelection)

      if (!dealershipSelection) {
        throw new Error('No dealership selected')
      }

      // Get auth token
      const token = await AsyncStorage.getItem('userToken')
      if (!token) {
        router.replace('/login')
        return
      }

      // Fetch scans for the selected brand/department with filters
      const response = await axios.get(`${API_URL}/api/customer-scans/user/${user.id}`, {
        params: {
          brandId: dealershipSelection.brand.id,
          departmentId: dealershipSelection.department?.id,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          sortBy: filters.sortBy,
          interestedIn: filters.interestedIn.length > 0 ? filters.interestedIn : undefined,
          interestStatus: filters.interestStatus.length > 0 ? filters.interestStatus : undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Sort the scans based on the selected sort option
      let sortedScans = [...response.data];
      switch (filters.sortBy) {
        case 'a_to_z':
          sortedScans.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
          break;
        case 'z_to_a':
          sortedScans.sort((a, b) => b.customer.name.localeCompare(a.customer.name));
          break;
        case 'last_scanned_newest_to_oldest':
          sortedScans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'last_scanned_oldest_to_newest':
          sortedScans.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        // Note: scans_low_to_high and scans_high_to_low would require additional data from the backend
        default:
          break;
      }

      setScans(sortedScans);
    } catch (error) {
      console.error('Error fetching scans:', error)
      setScans([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchScans()
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchScans()
  }, []) // Only fetch on mount

  if (loading || refreshing) {
    return <HomeScreenSkeleton />
  }

  // Simple local search filter based on customer name, email, or phone
  const filteredScans = scans.filter((scan) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      scan.customer.name.toLowerCase().includes(query) ||
      (scan.customer.email && scan.customer.email.toLowerCase().includes(query)) ||
      (scan.customer.phone && scan.customer.phone.toLowerCase().includes(query))
    )
  })

  // Date summary label and formatting
  const getDateLabel = () => {
    const isToday = 
      dayjs(filters.fromDate).isSame(dayjs().startOf('day'), 'day') &&
      dayjs(filters.toDate).isSame(dayjs().endOf('day'), 'day');

    if (isToday) {
      return {
        label: 'Today',
        date: dayjs().format('dddd, D MMMM')
      };
    }

    return {
      label: 'Date Range',
      date: `${dayjs(filters.fromDate).format('D MMM')} - ${dayjs(filters.toDate).format('D MMM YYYY')}`
    };
  };

  const totalActivities = filteredScans.length

  // Helper to get initials from a name
  const getInitials = (name: string): string => {
    if (!name) return 'CU'
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts[1] || ''
    return lastName
      ? `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
      : `${firstName[0].toUpperCase()}`
  }

  // Helper to format dates
  const formatDate = (dateString: string | null, isLastScanned: boolean = false): string => {
    if (!dateString) return 'No date'
    return isLastScanned
      ? dayjs(dateString).format('D MMM YYYY, h:mm A')
      : dayjs(dateString).format('MMM D, YYYY')
  }

  // Check if any filter is active
  const hasActiveFilters = () => {
    const isToday = 
      dayjs(filters.fromDate).isSame(dayjs().startOf('day'), 'day') &&
      dayjs(filters.toDate).isSame(dayjs().endOf('day'), 'day');

    return (
      !isToday || // Date range is not today
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.interestedIn.length > 0 ||
      filters.interestStatus.length > 0
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white px-5"
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3D12FA']}
            tintColor="#3D12FA"
            progressViewOffset={40}
          />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-5 min-h-10">
          <Text className="text-2xl font-semibold">Activities</Text>
          <TouchableOpacity className="p-2" onPress={() => setIsFilterVisible(true)}>
            <FilterIcon showCircle={hasActiveFilters()} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          className={`mt-4 flex-row items-center rounded-md border ${
            isFocused ? 'border-color1' : 'border-gray-200'
          }`}
        >
          <View className="px-3">
            <SearchIcon width={24} height={24} stroke={isFocused ? '#3D12FA' : 'black'} />
          </View>
          <TextInput
            ref={inputRef}
            className="flex-1 py-2 text-sm"
            placeholder="Search scans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity className="px-3" onPress={() => setSearchQuery('')}>
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Date Summary */}
        <View className="flex-row justify-between rounded-md bg-color3 p-3 mt-5">
          <Text className="text-xs font-bold">
            {getDateLabel().label} <Text className="font-normal">{getDateLabel().date}</Text>
          </Text>
          <Text className="text-xs font-bold">
            <Text className="font-normal">Total:</Text> {totalActivities}
          </Text>
        </View>

        {/* Scans List */}
        {filteredScans.length === 0 ? (
          <View className="mt-5 items-center">
            <Text className="text-gray-500">No scans found</Text>
          </View>
        ) : (
          <View className="gap-4 mt-5">
            {filteredScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                className="bg-white rounded-lg border border-gray-200"
                onPress={async () => {
                  try {
                    // Get all scans for this customer and find the latest one by date
                    const customerScans = scans.filter(s => s.customer_id === scan.customer_id);
                    const latestScan = customerScans.reduce((latest, current) => {
                      if (!latest) return current;
                      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
                    }, customerScans[0]);

                    if (!latestScan) {
                      Alert.alert('Error', 'Could not find latest scan for customer');
                      return;
                    }

                    await AsyncStorage.setItem('selectedCustomerId', scan.customer_id.toString())
                    await AsyncStorage.setItem('selectedScanId', latestScan.id.toString())
                    router.replace('/customer-details')
                  } catch (error) {
                    console.error('Error storing customer data:', error)
                    Alert.alert('Error', 'Failed to load customer details')
                  }
                }}
              >
                <View className="p-4">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row gap-2 items-center">
                      {scan.customer.profile_image_url ? (
                        <Image
                          source={{ 
                            uri: scan.customer.profile_image_url,
                            headers: {
                              'Cache-Control': 'public',
                              'Pragma': 'public'
                            }
                          }}
                          className="w-10 h-10 rounded-full"
                          onError={(error) => {
                            console.error('Image loading error:', error?.nativeEvent?.error || 'Unknown error');
                            // Update the scan object to remove the failed image URL
                            setScans(prevScans => 
                              prevScans.map(s => 
                                s.id === scan.id 
                                  ? { 
                                      ...s, 
                                      customer: { 
                                        ...s.customer, 
                                        profile_image_url: null 
                                      } 
                                    }
                                  : s
                              )
                            );
                          }}
                          defaultSource={require('@/assets/images/favicon.png')}
                        />
                      ) : (
                        <View className="w-10 h-10 bg-color1 rounded-full items-center justify-center">
                          <Text className="text-white font-bold text-sm">
                            {getInitials(scan.customer.name)}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text className="font-bold text-sm">
                          {scan.customer.name || 'Unknown Customer'}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-1">
                      <Text
                        className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                          scan.interest_status === 'Hot'
                            ? 'border-red-400 bg-red-100 text-red-600'
                            : scan.interest_status === 'Warm'
                            ? 'border-orange-400 bg-orange-100 text-orange-600'
                            : 'border-blue-400 bg-blue-100 text-blue-600'
                        }`}
                      >
                        {scan.interest_status}
                      </Text>
                      <Text
                        className={`rounded-full text-[10px] border font-medium px-2 py-0.5 ${
                          scan.interested_in === 'Buying'
                            ? 'border-green-400 bg-green-100 text-green-600'
                            : scan.interested_in === 'Selling'
                            ? 'border-blue-400 bg-blue-100 text-blue-600'
                            : scan.interested_in === 'Financing'
                            ? 'border-purple-400 bg-purple-100 text-purple-600'
                            : scan.interested_in === 'Bought'
                            ? 'border-violet-400 bg-violet-100 text-violet-600'
                            : 'border-gray-400 bg-color3 text-gray-600'
                        }`}
                      >
                        {scan.interested_in || ''}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3">
                    <View className="flex-row items-center gap-2">
                      <PhoneIcon width={15} height={15} />
                      <Text className="text-[10px] text-gray-500">
                        {scan.customer.phone || 'No phone number'}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-2 gap-2">
                      <EmailIcon width={15} height={15} />
                      <Text className="text-[10px] text-gray-500">
                        {scan.customer.email || 'No email'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="py-2 flex-row gap-3 justify-between border-t border-gray-200 px-4 bg-color3">
                  <View className="flex-row gap-2 items-center">
                    <Text className="font-bold text-gray-500 text-[10px]">Follow Up:</Text>
                    <View className="flex-row gap-1 items-center bg-gray-400 rounded py-0.5 px-1.5">
                      <CalendarIcon width={15} height={15} stroke="white" />
                      <Text className="text-[10px] text-white">
                        {formatDate(scan.follow_up_date)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-[10px] font-bold">
                      Last Scanned:{' '}
                      <Text className="font-normal">
                        {formatDate(scan.created_at, true)}
                      </Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isFilterVisible}
          onRequestClose={() => setIsFilterVisible(false)}
        >
          <View className="flex-1 bg-black/20 justify-end">
            <TouchableOpacity 
              className="absolute inset-0" 
              activeOpacity={1}
              onPress={() => setIsFilterVisible(false)}
            />
            <View className="bg-white h-[70%] rounded-t-2xl p-5">
              <ActivitiesFilter
                filters={filters}
                onUpdateFilters={(newFilters) => {
                  setFilters((prev) => ({
                    ...prev,
                    ...newFilters,
                  }))
                }}
                onResetFilters={() => {
                  setFilters(DEFAULT_FILTERS)
                  fetchScans() // Fetch when resetting filters
                }}
                onClose={() => {
                  fetchScans() // Fetch when applying filters
                  setIsFilterVisible(false)
                }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  )
}

export default HomeScreen
