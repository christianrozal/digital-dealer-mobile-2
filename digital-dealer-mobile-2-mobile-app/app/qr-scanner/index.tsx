import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { CameraView, Camera, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import CloseIcon from "@/components/svg/closeIcon";
import UploadIcon from "@/components/svg/uploadIcon";
import { API_URL } from "@/constants";

const QrScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };
    getCameraPermissions();
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    try {
      if (!isScanning) return;
      setIsScanning(false);

      const customerId = result.data;
      if (!customerId) {
        setError('Invalid QR code');
        return;
      }

      // Get current user token and data
      const [token, dealershipData] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('selectedDealership')
      ]);

      if (!token || !dealershipData) {
        router.replace('/login');
        return;
      }

      const dealership = JSON.parse(dealershipData);
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        router.replace('/login');
        return;
      }

      // Set follow-up date to one day from now
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 1);

      const scanPayload = {
        customer_id: parseInt(customerId),
        user_id: user.id,
        dealership_brand_id: parseInt(dealership.brand.id),
        dealership_department_id: dealership.department ? parseInt(dealership.department.id) : null,
        interest_status: 'Hot',
        interested_in: 'Buying',
        follow_up_date: followUpDate.toISOString()
      };

      // Create customer scan
      const response = await fetch(`${API_URL}/api/customer-scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(scanPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to create customer scan');
      }

      const scanData = await response.json();

      // Store customer ID and scan ID in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('selectedCustomerId', customerId),
        AsyncStorage.setItem('selectedScanId', scanData.id.toString())
      ]);

      // Navigate to the appropriate screen
      router.push('/customer-assignment');

    } catch (error) {
      setError('Failed to process QR code');
      setIsScanning(true);
    }
  };

  const handleUploadQR = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Scan the image for QR codes using Camera's scanFromURLAsync
        const scannedCodes = await Camera.scanFromURLAsync(imageUri);
        
        if (scannedCodes && scannedCodes.length > 0) {
          await handleBarCodeScanned(scannedCodes[0]);
        } else {
          setError('No QR code found in the image');
        }
      }
    } catch (error) {
      setError('Failed to process QR code from image');
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="mb-4">Camera access is required</Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
        />
      </View>
    );
  }

  return (
    <View className="bg-color1 h-screen relative">
      <CameraView
        facing="back"
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        style={{ height: '100%' }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-5 right-5 z-10 opacity-50">
          <CloseIcon stroke="white" width={30} height={30}/>
        </TouchableOpacity>

        {error && (
          <View className="absolute top-20 left-0 right-0 items-center">
            <Text className="text-red-500 bg-white px-4 py-2 rounded">{error}</Text>
          </View>
        )}

        <View className="absolute top-0 left-0 right-0 bottom-0 ">
          <View className="h-[25vh] bg-black opacity-50" />
          <View className="flex-row h-64">
            <View className="flex-1 bg-black opacity-50" />
            <View className="w-64" />
            <View className="flex-1 bg-black opacity-50" />
          </View>
          <View className="flex-1 bg-black opacity-50" />
        </View>

        <View className="mt-[25vh]">
          <View className="h-64 w-64 relative mx-auto">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-color1" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-color1" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-color1" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-color1" />
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleUploadQR}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10"
        >
          <View className="items-center justify-center">
            <UploadIcon width={51} height={51} />
            <Text className="text-white mx-auto mt-2 text-[10px]">UPLOAD QR</Text>
          </View>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
};

export default QrScannerScreen;