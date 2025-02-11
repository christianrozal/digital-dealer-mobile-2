import { View, Text, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const FirstPage = () => {
  const handleLogout = async () => {
    try {
      console.log('🔄 Logging out...');
      // Clear all stored data
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      console.log('✅ Successfully cleared user data');
      
      // Redirect to login page
      router.replace('/login');
    } catch (error) {
      console.error('💥 Error during logout:', error);
      // Still redirect to login even if there's an error clearing data
      router.replace('/login');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-10">
      <Text className="text-xl font-bold text-black">FirstPage</Text>
      {/* Continue to Home */}
      <TouchableOpacity
        onPress={() => router.push('/home')}
        className="bg-color1 rounded-full px-4 py-2.5 w-full mt-20"
      >
        <Text className="text-white text-center font-medium text-base">Continue to Home</Text>
      </TouchableOpacity>
      {/* Login */}
      <TouchableOpacity
        onPress={() => router.push('/login')}
        className="bg-color1 rounded-full px-4 py-2.5 w-full mt-5"
      >
        <Text className="text-white text-center font-medium text-base">Login</Text>
      </TouchableOpacity>
      {/* Dealership */}
      <TouchableOpacity
        onPress={() => router.push('/dealerships')}
        className="bg-color1 rounded-full px-4 py-2.5 w-full mt-5"
      >
        <Text className="text-white text-center font-medium text-base">Dealerships</Text>
      </TouchableOpacity>
      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-color1 rounded-full px-4 py-2.5 w-full mt-5"
      >
        <Text className="text-white text-center font-medium text-base">Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default FirstPage