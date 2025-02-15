import { useState, useEffect } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { router } from "expo-router";
import CloseIcon from "@/components/svg/closeIcon";
import UploadIcon from "@/components/svg/uploadIcon";

const QrScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);
  

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
        style={{ height: '100%' }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-5 right-5 z-10 opacity-50">
          <CloseIcon stroke="white" width={30} height={30}/>
        </TouchableOpacity>

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