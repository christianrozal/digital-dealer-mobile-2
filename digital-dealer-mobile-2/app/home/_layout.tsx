import {
    View,
    TouchableOpacity,
    Text,
    Image,
    Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { router, usePathname, Slot } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import AnalyticsIcon from "@/components/svg/analyticsIcon";
import NotificationsIcon from "@/components/svg/notificationsIcon";
import ActivityIcon from "@/components/svg/activityIcon";
import CustomersIcon from "@/components/svg/customersIcon";
import ScannerIcon from "@/components/svg/scannerIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/constants";
import Sidepane from "@/components/sidepane";

interface UserData {
    name: string;
    profile_image_url: string | null;
}

const HomeLayout = () => {
    const pathname = usePathname();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isSidepaneOpen, setIsSidepaneOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-1000)).current;

    const toggleSidepane = () => {
        const toValue = isSidepaneOpen ? -1000 : 0;
        setIsSidepaneOpen(!isSidepaneOpen);
        
        Animated.spring(slideAnim, {
            toValue,
            useNativeDriver: true,
            tension: 20,
            friction: 7,
        }).start();
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const response = await axios.get(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const validPaths = [
        "/home",
        "/home/customers",
        "/home/analytics",
        "/home/notifications",
    ];

    const shouldRenderLayout = validPaths.includes(pathname);

    return (
        <View className="flex-1 bg-white">
            {shouldRenderLayout ? (
            <>
                {/* Header */}
                <View className="absolute top-0 left-0 right-0 h-[60px] flex-row justify-between items-center px-5 z-20 bg-white">
                    {/* User Icon */}
                    <TouchableOpacity 
                        className="justify-center items-center h-[60px] px-4 -translate-x-4"
                        onPress={toggleSidepane}
                    >
                        {userData?.profile_image_url ? (
                            <Image 
                                source={{ uri: userData.profile_image_url }}
                                className="w-9 h-9 rounded-full"
                            />
                        ) : (
                            <View className="bg-[#3D12FA] rounded-full items-center justify-center w-9 h-9">
                                <Text className="text-white font-bold text-xs">
                                    {userData?.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Logo */}
                    <View className="transform translate-x-4">
                        <AlexiumLogo2 width={64 * 1.2} height={14 * 1.2} />
                    </View>

                    {/* Header Icons */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: 4 }] }}>
                        <TouchableOpacity 
                            className="justify-center items-center h-[60px] pl-5 pr-1" 
                            onPress={() => router.replace("/home/analytics")}
                        >
                            <AnalyticsIcon
                                width={24}
                                height={24}
                                stroke={pathname === "/home/analytics" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="justify-center items-center h-[60px] px-1" 
                            onPress={() => router.replace("/home/notifications")}
                        >
                            <NotificationsIcon
                                width={27}
                                height={27}
                                stroke={pathname === "/home/notifications" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sidepane */}
                <Animated.View 
                    className="absolute top-0 left-0 bottom-0 w-[80%] bg-white z-30"
                    style={{
                        transform: [{ translateX: slideAnim }],
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                >
                    <Sidepane onClose={toggleSidepane} userData={userData} />
                </Animated.View>

                {/* Overlay */}
                {isSidepaneOpen && (
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/30 z-20"
                        activeOpacity={1}
                        onPress={toggleSidepane}
                    />
                )}

                {/* Bottom Navigation */}
                <View className="absolute bottom-0 left-0 right-0 h-[70px] flex-row justify-center items-center bg-white border-t border-gray-100 z-10">
                    <TouchableOpacity 
                        className="justify-center items-center h-[70px] px-5"
                        style={{ alignItems: 'center' }}
                        onPress={() => router.replace("/home")}
                    >
                        <ActivityIcon
                            stroke={pathname === "/home" ? "#3D12FA" : "#BECAD6"}
                        />
                        <Text style={{ 
                            fontSize: 10,
                            color: '#6b7280',
                            fontWeight: '600',
                            marginTop: 4
                        }}>
                            Activity
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="justify-center items-center h-[70px] px-5" 
                        onPress={() => router.replace("/qr-scanner")}
                    >
                        <ScannerIcon
                            fgColor={pathname === "/home/qr-scanner" ? "#3D12FA" : "#BECAD6"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="justify-center items-center h-[70px] px-5"
                        style={{ alignItems: 'center' }}
                        onPress={() => router.replace("/home/customers")}
                    >
                        <CustomersIcon
                            stroke={pathname === "/home/customers" ? "#3D12FA" : "#BECAD6"}
                        />
                        <Text style={{ 
                            fontSize: 10,
                            color: '#6b7280',
                            fontWeight: '600',
                            marginTop: 4
                        }}>
                            Customers
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content Area */}
                <Slot />
            </>
            ) : (
                <Slot />
            )}
        </View>
    );
};

export default HomeLayout;