import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import BackArrowIcon from "@/components/svg/backArrow";
import { router } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import { API_URL } from "@/constants";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import ButtonComponent from "@/components/ui/button";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraIcon from "@/components/svg/cameraIcon";

interface UserData {
    name: string;
    email: string;
    phone: string;
    profile_image_url: string | null;
    role_id?: number;
    role?: {
        id: number;
        name: string;
    };
}

const EditProfileScreen = () => {
    const [userData, setUserData] = useState<UserData>({
        name: "",
        email: "",
        phone: "",
        profile_image_url: null,
        role_id: undefined,
        role: undefined
    });
    const [saving, setSaving] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        loadToken();
    }, []);

    const loadToken = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('userToken');
            setToken(storedToken);
            if (storedToken) {
                fetchUserProfile(storedToken);
            }
        } catch (error) {
            console.error('Error loading token:', error);
        }
    };

    const fetchUserProfile = async (authToken: string) => {
        try {
            const response = await axios.get(`${API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const handleImagePick = async () => {
        if (!token) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const selectedAsset = result.assets[0];
                const fileType = selectedAsset.uri.split('.').pop()?.toLowerCase();
                const contentType = fileType === 'png' ? 'image/png' : 
                                  fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : 
                                  'image/jpeg'; // default to jpeg

                // Get signed URL for upload - using the user-specific endpoint
                const { data: { signedUrl, imageUrl } } = await axios.get(
                    `${API_URL}/api/users/profile/upload-url`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { fileType: contentType }
                    }
                );

                // Upload image to S3
                const response = await fetch(selectedAsset.uri);
                const blob = await response.blob();
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

                // Update local state with new image URL
                setUserData(prev => ({
                    ...prev,
                    profile_image_url: imageUrl
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleSave = async () => {
        if (!token) return;

        try {
            setSaving(true);
            await axios.put(
                `${API_URL}/api/users/profile`,
                {
                    name: userData.name,
                    phone: userData.phone,
                    profile_image_url: userData.profile_image_url
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            router.back();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string): string => {
        if (!name) return "LD";
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts[nameParts.length - 1] || "";
        const firstInitial = firstName[0]?.toUpperCase() || "";
        const lastInitial = lastName[0]?.toUpperCase() || "";
        return firstInitial + lastInitial || "LD";
    };

    return (
        <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
            <View>
                {/* Header */}
                <View className="flex-row w-full justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <BackArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/home")}>
                        <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                    </TouchableOpacity>
                    <View style={{ width: 18 }}>
                        <Text> </Text>
                    </View>
                </View>

                <View className="px-4">
                    <Text className="text-2xl font-semibold mt-10">Edit Profile</Text>

                    {/* Profile Image */}
                    <TouchableOpacity
                        onPress={handleImagePick}
                        className="mt-10 mx-auto"
                    >
                        <View
                            className="relative bg-color1 rounded-full flex items-center justify-center"
                            style={{ width: 100, height: 100 }}
                        >
                            {userData.profile_image_url ? (
                                <Image
                                    source={{ uri: userData.profile_image_url }}
                                    style={{ width: 100, height: 100, borderRadius: 50 }}
                                />
                            ) : (
                                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                    {getInitials(userData.name)}
                                </Text>
                            )}
                            <View className="absolute bottom-0 right-1">
                                <CameraIcon width={20} height={20} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Form Fields */}
                    <View className="gap-3 mt-10">
                        <TextInput
                            className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
                            placeholder="Full Name"
                            value={userData.name}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                        />
                        <TextInput
                            className="py-3 px-3 flex-row bg-color3 items-center gap-3 rounded-md text-gray-500 text-sm focus:outline-color1"
                            placeholder="Phone Number"
                            value={userData.phone}
                            onChangeText={(text) => setUserData(prev => ({ ...prev, phone: text }))}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
            </View>

            {/* Save Button */}
            <View>
                <ButtonComponent
                    label={saving ? "Saving..." : "Save Changes"}
                    onPress={handleSave}
                    disabled={saving}
                />
            </View>
        </View>
    );
};

export default EditProfileScreen; 