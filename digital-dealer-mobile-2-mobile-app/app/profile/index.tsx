import { View, Text, TouchableOpacity, Image, Modal, Dimensions, Clipboard } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import EmailIcon from "@/components/svg/emailIcon";
import PhoneIcon from "@/components/svg/phoneIcon";
import WebsiteIcon from "@/components/svg/websiteIcon";
import BackArrowIcon from "@/components/svg/backArrow";
import { router, useFocusEffect } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import EditIcon from "@/components/svg/editIcon";
import { API_URL } from "@/constants";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ButtonComponent from "@/components/ui/button";
import { Linking, Share } from "react-native";
import ShareX from "@/components/svg/share-x";
import ShareFacebook from "@/components/svg/share-facebook";
import ShareInstagram from "@/components/svg/share-instagram";
import ShareWhatsapp from "@/components/svg/share-whatsapp";
import ShareCopy from "@/components/svg/share-copy";
import SuccessAnimation from "@/components/successAnimation";

const ProfileScreen = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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

    useFocusEffect(
        useCallback(() => {
            const checkProfileEdit = async () => {
                try {
                    const wasEdited = await AsyncStorage.getItem('profileWasEdited');
                    if (wasEdited === 'true') {
                        setTimeout(() => {
                            setSuccessMessage("Profile updated successfully");
                            setShowSuccess(true);
                        }, 100);
                        await AsyncStorage.removeItem('profileWasEdited');
                    }
                } catch (error) {
                    console.error('Error checking profile edit status:', error);
                }
            };
            
            loadToken();
            checkProfileEdit();
        }, [])
    );

    const getInitials = (name: string | undefined): string => {
        if (!name) return "CU";
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[nameParts.length - 1] || "";
        const firstInitial = firstName[0]?.toUpperCase() || "";
        const lastInitial = lastName[0]?.toUpperCase() || "";
        return firstInitial + lastInitial || "CU";
    };

    const shareUrl = `https://digital-dealer-mobile-2-website.vercel.app/consultant/${userData?.slug}`;

    const handleCopy = async () => {
        await Clipboard.setString(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
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
                                {userData?.role_id === 1 ? "Manager" : userData?.role_id === 2 ? "Sales Consultant" : "No Role"}
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
                    <ButtonComponent 
                        label="Share Profile" 
                        var2 
                        onPress={() => setShowShareModal(true)} 
                    />
                </View>
            </View>
        );
    }

    return (
        <>
            <View className="pt-7 px-7 pb-7 h-full justify-between gap-5">
                {showSuccess && (
                    <View className="absolute inset-x-0 top-0 z-[999] items-center pt-5">
                        <View className="w-11/12">
                            <SuccessAnimation
                                message={successMessage}
                                isSuccess={successMessage.includes("successfully")}
                                onAnimationComplete={() => setShowSuccess(false)}
                            />
                        </View>
                    </View>
                )}
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
                                {userData?.role_id === 1 ? "Manager" : userData?.role_id === 2 ? "Sales Consultant" : "No Role"}
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
                    <ButtonComponent 
                        label="Share Profile" 
                        var2 
                        onPress={() => setShowShareModal(true)} 
                    />
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showShareModal}
                onRequestClose={() => setShowShareModal(false)}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/50"
                    activeOpacity={1}
                    onPress={() => setShowShareModal(false)}
                >
                    <View 
                        className="absolute bottom-0 w-full bg-white rounded-t-2xl"
                        style={{ height: Dimensions.get('window').height * 0.35 }}
                    >
                        <View className="p-6">
                            <Text className="text-lg font-semibold mb-6">Share this profile</Text>
                            <View className="flex-row justify-between mb-6">
                                <TouchableOpacity 
                                    className="items-center" 
                                    onPress={() => {
                                        const url = `https://twitter.com/intent/tweet?text=Check out my profile&url=${encodeURIComponent(shareUrl)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <ShareX />
                                    <Text className="text-xs mt-1 text-gray-500">Twitter</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="items-center"
                                    onPress={() => {
                                        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <ShareFacebook />
                                    <Text className="text-xs mt-1 text-gray-500">Facebook</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="items-center"
                                    onPress={() => {
                                        const url = `https://www.instagram.com/share?url=${encodeURIComponent(shareUrl)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <ShareInstagram />
                                    <Text className="text-xs mt-1 text-gray-500">Instagram</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="items-center"
                                    onPress={() => {
                                        const url = `whatsapp://send?text=Check out this consultant's profile: ${encodeURIComponent(shareUrl)}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <ShareWhatsapp />
                                    <Text className="text-xs mt-1 text-gray-500">WhatsApp</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row items-center border border-gray-200 rounded-lg p-3">
                                <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>
                                    {shareUrl}
                                </Text>
                                <TouchableOpacity 
                                    className="ml-2 flex-row items-center gap-2 px-3 py-1.5 rounded-md"
                                    onPress={handleCopy}
                                >
                                    <ShareCopy />
                                    {copied && (
                                        <View className="absolute -top-6 right-0 bg-gray-500 px-4 py-1 rounded-full">
                                            <Text className="text-white text-xs">Copied!</Text>
                                        </View> 
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default ProfileScreen;