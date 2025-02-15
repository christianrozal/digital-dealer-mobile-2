import AlexiumLogoIcon from "@/components/svg/alexiumLogo";
import ButtonComponent from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { API_URL } from "@/constants";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🌐 Using API URL:', API_URL);

const LoginScreen = () => {
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          console.log('🔑 Found existing token, redirecting to dealerships');
          router.replace('/dealerships');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
        return;
      }

      // Clear any existing data first
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      
      // Store the new token and user data
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      await router.replace('/dealerships');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-white items-center justify-center px-8 flex-1">
      {/* Logo Section */}
      <View className="items-center mb-8">
        <AlexiumLogoIcon width={63} height={63} />
        <Text className="text-lg font-semibold mt-2">Digital Dealer</Text>
        <Text className="text-[8px] text-gray-500 mt-1">POWERED BY ALEXIUM</Text>
      </View>

      {/* Email Input */}
      <View className="mt-4 w-full">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
          className={`border ${isEmailFocused ? 'border-color1' : 'border-gray-300'} rounded-md px-4 py-3 placeholder:text-gray-400`}
        />
      </View>

      {/* Password Input */}
      <View className="mt-4 w-full">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          className={`border ${isPasswordFocused ? 'border-color1' : 'border-gray-300'} rounded-md px-4 py-3 placeholder:text-gray-400`}
        />
      </View>

      {/* Checkbox Section */}
      <View className="flex-row items-center mt-5 w-full">
        <Checkbox
          checked={agreedToTerms}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          size={14}
        />
        <Text className="text-[10px] font-medium text-gray-500 ml-2">
          I agree to Alexium's{" "}
          <Text 
            onPress={() => router.push("https://www.alexium.com.au/privacy-policy")} 
            className="underline font-medium text-gray-500 text-[10px] active:opacity-50"
          >
            Privacy Policy
          </Text>
          {" "}and{" "}
          <Text 
            onPress={() => router.push("https://www.alexium.com.au/terms-of-use")} 
            className="underline text-[10px] font-medium text-gray-500 active:opacity-50"
          >
            Terms of Use
          </Text>
        </Text>
      </View>

      {/* Login Button */}
      <View className="w-full mt-8">
        <ButtonComponent
          label="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        className="mt-4"
        onPress={() => {
          console.log('📧 Forgot password clicked');
          // Implement forgot password functionality
        }}
      >
        <Text className="font-medium text-gray-400 underline text-xs">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Separator */}
      <Text className="my-6 text-gray-500">or</Text>

      {/* Request Access Button */}
      <View className="w-full">
        <ButtonComponent
          label="Request Access"
          var2
          onPress={() => {
            console.log('📝 Request access clicked');
            // Implement request access functionality
          }}
        >
        </ButtonComponent>
      </View>
    </View>
  );
};

export default LoginScreen;