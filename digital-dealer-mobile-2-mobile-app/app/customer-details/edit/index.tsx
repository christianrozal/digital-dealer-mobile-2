import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native'
import BackArrowIcon from '@/components/svg/backArrow'
import AlexiumLogo2 from '@/components/svg/alexiumLogo2'
import { router } from 'expo-router'
import ButtonComponent from '@/components/ui/button'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '@/constants'
import * as ImagePicker from 'expo-image-picker'
import CameraIcon from "@/components/svg/cameraIcon";
import SuccessAnimation from "@/components/successAnimation";

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  profile_image_url: string | null
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile_image_url: ''
  })
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
          `${API_URL}/api/customer-scans/details/${customerId}/${scanId}`,
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
          phone: customerScan.customer.phone || '',
          profile_image_url: customerScan.customer.profile_image_url || ''
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
    setLoading(true);
    try {
      const [customerId, scanId, token] = await Promise.all([
        AsyncStorage.getItem('selectedCustomerId'),
        AsyncStorage.getItem('selectedScanId'),
        AsyncStorage.getItem('userToken')
      ]);

      if (!customerId || !token) {
        Alert.alert('Error', 'Missing required data');
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }

      // Update customer details through the API
      await axios.patch(
        `${API_URL}/api/customers/${customerId}`,
        {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          profile_image_url: formData.profile_image_url || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Set flag to show success message in details screen
      await AsyncStorage.setItem('customerWasEdited', 'true');
      
      // Navigate back to details screen
      router.push("/customer-details");
    } catch (error: any) {
      console.error('Error updating customer:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to update customer profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'LD'
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts[1] || ''
    
    if (!firstName) return 'LD'
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        await uploadImage(selectedAsset);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    setUploadingImage(true);
    try {
      const customerId = await AsyncStorage.getItem('selectedCustomerId');
      const token = await AsyncStorage.getItem('userToken');

      if (!customerId || !token) {
        Alert.alert('Error', 'Missing required data');
        return;
      }

      // Get the file extension and content type
      const fileType = imageAsset.uri.split('.').pop()?.toLowerCase();
      const contentType = fileType === 'png' ? 'image/png' : 
                         fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : 
                         'image/jpeg'; // default to jpeg
      
      console.log('Requesting signed URL for upload...');
      
      // Get signed URL from backend
      const { data: { signedUrl, imageUrl } } = await axios.get(
        `${API_URL}/api/customers/${customerId}/upload-url?fileType=${contentType}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Got signed URL:', signedUrl);
      console.log('Image URL will be:', imageUrl);

      // Upload to S3
      const response = await fetch(imageAsset.uri);
      const blob = await response.blob();

      console.log('Uploading to S3...');

      // Simplified upload with only content-type header
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': contentType
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText
        });
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('Upload successful, updating form data...');

      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        profile_image_url: imageUrl
      }));

      // Note: We'll update the profile in the database when the user clicks "Update Customer"

    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', `Failed to upload image: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
      {showSuccess && (
        <SuccessAnimation
          message={successMessage}
          isSuccess={successMessage.includes("successfully")}
          onAnimationComplete={() => setShowSuccess(false)}
        />
      )}
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
          <TouchableOpacity 
            onPress={pickImage}
            disabled={uploadingImage}
            className='mt-10 mx-auto'
          >
            {formData.profile_image_url ? (
              <Image
                source={{ 
                  uri: formData.profile_image_url,
                  headers: {
                    'Cache-Control': 'public',
                    'Pragma': 'public'
                  }
                }}
                className="w-[100px] h-[100px] rounded-full"
                onError={(error) => {
                  console.error('Image loading error:', error);
                  // If image fails to load, fallback to initials
                  setFormData(prev => ({
                    ...prev,
                    profile_image_url: ''
                  }));
                }}
                defaultSource={require('@/assets/images/favicon.png')}
              />
            ) : (
              <View
                className="bg-color1 rounded-full items-center justify-center relative"
                style={{ width: 100, height: 100 }}
              >
                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                  {getInitials(formData.name)}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-1">
              <CameraIcon width={20} height={20} />
            </View>
          </TouchableOpacity>
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
          disabled={loading || uploadingImage}
          loading={loading}
        />
      </View>
    </View>
  )
}

export default EditCustomerScreen