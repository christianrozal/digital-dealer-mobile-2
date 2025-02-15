import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { CameraView, Camera, BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloseIcon from "@/components/svg/closeIcon";
import UploadIcon from "@/components/svg/uploadIcon";
import { API_URL } from "@/constants";

const QrScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

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

      // Create customer scan
      const response = await fetch(`${API_URL}/api/customer-scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          user_id: user.id,
          dealership_brand_id: parseInt(dealership.brand.id),
          dealership_department_id: dealership.department ? parseInt(dealership.department.id) : null,
          interest_status: 'Hot',
          interested_in: 'Buying',
          follow_up_date: followUpDate.toISOString()
        })
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
      console.error('Error handling QR scan:', error);
      setError('Failed to process QR code');
      setIsScanning(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="mb-4">Camera access is required</Text>
        <Button
          title="Grant Permission"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        />
      </View>
    );
  }

  return (
    <View className="bg-color1 h-screen relative">
      <CameraView
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        onBarcodeScanned={handleBarCodeScanned}
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