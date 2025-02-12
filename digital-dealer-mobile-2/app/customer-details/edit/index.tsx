import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native'
import BackArrowIcon from '@/components/svg/backArrow'
import AlexiumLogo2 from '@/components/svg/alexiumLogo2'
import { router } from 'expo-router'
import ButtonComponent from '@/components/ui/button'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '@/constants'

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface CustomerScan {
  id: number
  customer_id: number
  customer: Customer
  dealership_id: number
  dealership_brand_id: number
  dealership_department_id: number | null
  interest_status: string
  interested_in: string | null
  follow_up_date: string | null
  created_at: string
}

const EditCustomerScreen = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Get the customer and scan IDs from AsyncStorage on mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const [customerId, scanId] = await Promise.all([
          AsyncStorage.getItem('selectedCustomerId'),
          AsyncStorage.getItem('selectedScanId')
        ])

        if (!customerId || !scanId) {
          Alert.alert('Error', 'Customer data not found')
          router.back()
          return
        }

        // Get auth token
        const token = await AsyncStorage.getItem('userToken')
        if (!token) {
          router.replace('/login')
          return
        }

        // Fetch customer scan details
        const response = await axios.get(
          `${API_URL}/api/customer-scans/${customerId}/${scanId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const customerScan: CustomerScan = response.data

        // Set form data from customer details
        setFormData({
          name: customerScan.customer.name || '',
          email: customerScan.customer.email || '',
          phone: customerScan.customer.phone || ''
        })
      } catch (error) {
        console.error('Error loading customer data:', error)
        Alert.alert('Error', 'Failed to load customer data')
        router.back()
      }
    }

    loadCustomerData()
  }, [])

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle customer update
  const handleUpdateCustomer = async () => {
    setLoading(true)
    try {
      const [customerId, token] = await Promise.all([
        AsyncStorage.getItem('selectedCustomerId'),
        AsyncStorage.getItem('userToken')
      ])

      if (!customerId || !token) {
        Alert.alert('Error', 'Missing required data')
        return
      }

      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Name is required')
        return
      }

      // Update customer details through the API
      await axios.patch(
        `${API_URL}/api/customer/${customerId}`,
        {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      router.push("/customer-details")
    } catch (error) {
      console.error('Error updating customer:', error)
      Alert.alert('Error', 'Failed to update customer profile')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'CU'
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts[1] || ''
    
    if (!firstName) return 'CU'
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`
  }

  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      <View>
        {/* Header */}
        <View className="flex-row w-full justify-between items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <BackArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/home')}>
            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
          </TouchableOpacity>
          <View style={{ width: 18 }} />
        </View>

        <View className='px-4'>
          <Text className="text-2xl font-semibold mt-10">Edit Customer Profile</Text>
          <View className='mt-10 mx-auto'>
            <View
              className="bg-color1 rounded-full items-center justify-center"
              style={{ width: 100, height: 100 }}
            >
              <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                {getInitials(formData.name)}
              </Text>
            </View>
          </View>
          <View className='gap-3 mt-10'>
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            <TextInput
              className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>
      <View>
        <ButtonComponent
          label={loading ? "Updating..." : "Update Customer"}
          onPress={handleUpdateCustomer}
          disabled={loading}
          loading={loading}
        />
      </View>
    </View>
  )
}

export default EditCustomerScreen