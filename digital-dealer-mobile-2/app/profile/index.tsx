import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import EmailIcon from "@/components/svg/emailIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import WebsiteIcon from "@/components/svg/websiteIcon";
import BackArrowIcon from "@/components/svg/backArrow";
import { router } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import EditIcon from "@/components/svg/editIcon";
import { API_URL } from "@/constants";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from "@/components/ui/button";

const ProfileScreen = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

    const getInitials = (name: string | undefined): string => {
        if (!name) return "CU";
        const firstName = name.trim().split(" ")[0] || "";
        if (!firstName) return "CU"
        const firstLetter = firstName[0]?.toUpperCase() || "";
        const secondLetter = firstName[1]?.toLowerCase() || "";
        return `${firstLetter}${secondLetter}`
    };

    if (loading) {
        return (
            <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
                <View>
                    {/* Header */}
                    <View className="flex-row w-full justify-between items-center">
                        <TouchableOpacity onPress={() => router.push("/home")}>
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
                        <TouchableOpacity 
                            className="flex-row items-center gap-1 ml-auto p-2 z-10 mt-5" 
                            onPress={() => router.push("/profile/edit")}
                        >
                            <EditIcon /><Text className="text-xs text-gray-300">Edit...</Text>
                        </TouchableOpacity>
                        <View
                            className="bg-white rounded-md justify-center items-center"
                            style={{
                                padding: 20,
                                shadowColor: "#9a9a9a",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 9.4,
                                elevation: 4,
                            }}
                        >
                            <View
                                className="bg-color1 rounded-full flex items-center justify-center"
                                style={{ width: 100, height: 100 }}
                            >
                                <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                    LD
                                </Text>
                            </View>
                            <Text className="text-2xl font-semibold mt-3">Loading Data...</Text>
                            <Text className="text-xs text-gray-500">
                                {userData?.role_id === 1 ? "Sales Consultant" : userData?.role?.name || "Loading..."}
                            </Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <EmailIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">Loading Data...</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">Loading Data...</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <WebsiteIcon fill="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">www.alexium.com.au</Text>
                        </View>
                    </View>
                </View>
                <View className="px-4">
                    <ButtonComponent label="Share Profile" var2 />
                </View>
            </View>
        );
    }

    return (
        <>
            <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
                <View>
                    {/* Header */}
                    <View className="flex-row w-full justify-between items-center">
                        <TouchableOpacity onPress={() => router.push("/home")}>
                            <BackArrowIcon />
                        </TouchableOpacity>
                        {/* Logo */}
                        <TouchableOpacity onPress={() => router.push("/home")}>
                            <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                        </TouchableOpacity>
                        <View style={{ width: 18 }}>
                            <Text> </Text>
                        </View>
                    </View>

                    <View className="px-4">
                        <TouchableOpacity 
                            className="flex-row items-center gap-1 ml-auto p-2 z-10 mt-5" 
                            onPress={() => router.push("/profile/edit/index")}
                        >
                            <EditIcon /><Text className="text-xs text-gray-300">Edit...</Text>
                        </TouchableOpacity>
                        <View
                            className="bg-white rounded-md justify-center items-center"
                            style={{
                                padding: 20,
                                shadowColor: "#9a9a9a",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 9.4,
                                elevation: 4,
                            }}
                        >
                            <View
                                className="bg-color1 rounded-full flex items-center justify-center"
                                style={{ width: 100, height: 100 }}
                            >
                                {userData?.profile_image_url ? (
                                    <Image
                                        source={{ uri: userData.profile_image_url }}
                                        style={{ width: 100, height: 100, borderRadius: 50 }}
                                    />
                                ) : (
                                    <Text className="text-white font-bold" style={{ fontSize: 30 }}>
                                        {getInitials(userData?.name)}
                                    </Text>
                                )}
                            </View>
                            <Text className="text-2xl font-semibold mt-3">
                                {userData?.name || "No Name"}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {userData?.role_id === 1 ? "Sales Consultant" : userData?.role?.name || "No Role"}
                            </Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-8 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <EmailIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">{userData?.email || "No email"}</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <PhoneIcon stroke="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">{userData?.phone || "No phone"}</Text>
                        </View>
                        <View
                            className="py-3 flex-row bg-color3 items-center gap-3 mt-3 rounded-md"
                            style={{ paddingHorizontal: 24 }}
                        >
                            <WebsiteIcon fill="#3D12FA" width={20} height={20} />
                            <Text className="text-xs">www.alexium.com.au</Text>
                        </View>
                    </View>
                </View>
                <View className="px-4">
                    <ButtonComponent label="Share Profile" var2 />
                </View>
            </View>
        </>
    );
};

export default ProfileScreen;