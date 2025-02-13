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
    const [loading, setLoading] = useState(true);
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
        } finally {
            setLoading(false);
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
                // Get the file extension
                const uri = result.assets[0].uri;
                const fileExtension = uri.split('.').pop();
                const fileType = `image/${fileExtension}`;

                // Get signed URL for upload
                const urlResponse = await axios.get(`${API_URL}/users/profile/upload-url`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { fileType }
                });

                const { signedUrl, imageUrl } = urlResponse.data;

                // Upload image to S3
                const response = await fetch(uri);
                const blob = await response.blob();
                await fetch(signedUrl, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': fileType
                    }
                });

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
                `${API_URL}/users/profile`,
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
        if (!name) return "CU";
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        
        if (!firstName) return "CU";
        
        if (lastName) {
            return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
        }
        
        return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading...</Text>
            </View>
        );
    }

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
                            placeholder="Email Address"
                            value={userData.email}
                            editable={false}
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