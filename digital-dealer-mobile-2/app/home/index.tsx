import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { API_URL } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'

interface CustomerScan {
  id: number
  customer_id: number
  customer: {
    name: string
    email: string | null
    phone: string | null
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
  id: number;
  email: string;
  role_id: number;
}

const HomeScreen = () => {
  const [scans, setScans] = useState<CustomerScan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDealership, setSelectedDealership] = useState<DealershipSelection | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

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

      // Fetch scans for the selected brand/department
      const response = await axios.get(`${API_URL}/customer-scans/user/${user.id}`, {
        params: {
          brandId: dealershipSelection.brand.id,
          departmentId: dealershipSelection.department?.id
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setScans(response.data)
    } catch (error) {
      console.error('Error fetching scans:', error)
      setScans([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchScans()
  }

  useEffect(() => {
    fetchScans()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <ScrollView 
      className="flex-1 bg-white px-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text className="text-2xl font-bold mt-4 mb-2">Your Recent Scans</Text>
      <Text className="text-gray-600 mb-4">
        {selectedDealership?.department 
          ? `${selectedDealership.department.name}`
          : selectedDealership?.brand.name}
      </Text>
      {scans.length === 0 ? (
        <Text className="text-gray-500 text-center mt-4">No scans found</Text>
      ) : (
        scans.map(scan => (
          <Card key={scan.id} className="mb-4 p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-lg font-semibold">{scan.customer.name}</Text>
                {scan.customer.email && (
                  <Text className="text-gray-600">{scan.customer.email}</Text>
                )}
                {scan.customer.phone && (
                  <Text className="text-gray-600">{scan.customer.phone}</Text>
                )}
              </View>
              <View className="items-end">
                <Text 
                  className={`px-2 py-1 rounded-full text-sm ${
                    scan.interest_status === 'Hot' 
                      ? 'bg-red-100 text-red-800' 
                      : scan.interest_status === 'Warm' 
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {scan.interest_status}
                </Text>
              </View>
            </View>
            
            {scan.interested_in && (
              <Text className="text-gray-700 mt-2">
                Interested in: {scan.interested_in}
              </Text>
            )}
            
            {scan.follow_up_date && (
              <Text className="text-gray-700">
                Follow up: {format(new Date(scan.follow_up_date), 'MMM d, yyyy')}
              </Text>
            )}
            
            <Text className="text-gray-500 text-sm mt-2">
              Scanned on {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  )
}

export default HomeScreen