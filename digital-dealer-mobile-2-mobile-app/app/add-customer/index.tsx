import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import BackArrowIcon from '@/components/svg/backArrow';
import AlexiumLogo2 from '@/components/svg/alexiumLogo2';
import { router } from 'expo-router';
import ButtonComponent from '@/components/ui/button';
import CameraIcon from '@/components/svg/cameraIcon';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants';

const AddCustomerScreen = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create new customer document and related scan document in the database
  const handleCreateCustomer = async () => {
    if (!formData.name) {
      console.log('Name is required');
      return;
    }

    setLoading(true);
    try {
      // Get user data and selected dealership from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      const selectedDealershipStr = await AsyncStorage.getItem('selectedDealership');
      const token = await AsyncStorage.getItem('userToken');

      if (!userDataStr || !selectedDealershipStr || !token) {
        console.log('Required data not found in AsyncStorage');
        router.replace('/login');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const selectedDealership = JSON.parse(selectedDealershipStr);

      let imageUrl = null;

      // Upload new image if available
      if (profileImage) {
        try {
          // Get signed URL for upload
          const uploadUrlResponse = await fetch(`${API_URL}/api/customers/upload-url?fileType=image/jpeg`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          if (!uploadUrlResponse.ok) {
            throw new Error('Failed to get upload URL');
          }

          const { signedUrl, imageUrl: finalImageUrl } = await uploadUrlResponse.json();

          // Upload image using signed URL
          const response = await fetch(profileImage);
          const blob = await response.blob();

          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': 'image/jpeg'
            }
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }

          imageUrl = finalImageUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue without image if upload fails
        }
      }

      // Create customer and customer scan
      const response = await fetch(`${API_URL}/api/customers/with-scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            profile_image_url: imageUrl,
          },
          customerScan: {
            user_id: userData.id,
            dealership_id: parseInt(selectedDealership.dealership?.id),
            dealership_brand_id: parseInt(selectedDealership.brand.id),
            dealership_department_id: selectedDealership.department ? parseInt(selectedDealership.department.id) : null,
            interest_status: 'Hot',
            interested_in: 'Buying',
            follow_up_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // One day from now
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const data = await response.json();
      console.log('Customer created successfully:', data);

      // Store the customer ID and scan ID in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('selectedCustomerId', data.customer.id.toString()),
        AsyncStorage.setItem('selectedScanId', data.customerScan.id.toString()),
        AsyncStorage.setItem('customerAddSuccess', 'true')
      ]);

      // Navigate back to show customer details
      router.push('/customer-details');

    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return 'FN';
    
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';

    if (!firstName) return 'FN';
    
    if (lastName) {
      return `${firstName[0]?.toUpperCase() || ''}${lastName[0]?.toUpperCase() || ''}`;
    }
    
    return `${firstName[0]?.toUpperCase() || ''}${firstName[1]?.toUpperCase() || 's'}`;
  };

  const handleImageUpload = async () => {
    try {
      // Request media library permissions using Expo ImagePicker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library is required!');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;
      
      if (result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Failed to pick an image', error);
    }
  };

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

        <View className="px-4">
          <Text className="text-2xl font-semibold mt-10">Add New Customer</Text>
          <TouchableOpacity className="mt-10 mx-auto" onPress={handleImageUpload}>
            <View className="bg-color1 rounded-full flex items-center justify-center" style={{ width: 100, height: 100 }}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
              ) : (
                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                  {getInitials(formData.name)}
                </Text>
              )}
            </View>
            <View className="ml-auto -mt-5">
              <CameraIcon />
            </View>
          </TouchableOpacity>
          <View className="gap-3 mt-10">
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
      <View className="px-4">
        <ButtonComponent
          label={loading ? 'Creating...' : 'Create New Customer'}
          onPress={handleCreateCustomer}
          disabled={loading}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default AddCustomerScreen;