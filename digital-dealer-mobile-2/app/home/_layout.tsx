import {
    View,
    TouchableOpacity,
    Text,
} from "react-native";
import React from "react";
import { router, usePathname, Slot } from "expo-router";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import AnalyticsIcon from "@/components/svg/analyticsIcon";
import NotificationsIcon from "@/components/svg/notificationsIcon";
import ActivityIcon from "@/components/svg/activityIcon";
import CustomersIcon from "@/components/svg/customersIcon";
import ScannerIcon from "@/components/svg/scannerIcon";

const HomeLayout = () => {
    const pathname = usePathname();
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
                <View className="absolute  top-0 left-0 right-0 h-[60px] flex-row justify-between items-center px-5 z-20 bg-white">
                    {/* User Icon */}
                    <TouchableOpacity className="justify-center items-center h-[60px] px-4 -translate-x-4">
                        <View className="bg-[#3D12FA] rounded-full items-center justify-center w-8 h-8">
                            <Text className="text-white font-bold text-sm">
                                JD
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <View className="transform translate-x-4">
                        <AlexiumLogo2 width={64 * 1.2} height={14 * 1.2} />
                    </View>

                    {/* Header Icons */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: 4 }] }}>
                        <TouchableOpacity className="justify-center items-center h-[60px] pl-5 pr-1" onPress={() => router.push("/home/analytics")}>
                            <AnalyticsIcon
                                width={24}
                                height={24}
                                stroke={pathname === "/home/analytics" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className="justify-center items-center h-[60px] px-1" onPress={() => router.push("/home/notifications")}>
                            <NotificationsIcon
                                width={27}
                                height={27}
                                stroke={pathname === "/home/notifications" ? "#3D12FA" : "#9EA5AD"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                   {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 h-[70px] flex-row justify-center items-center bg-white border-t border-gray-100 z-10">
                    <TouchableOpacity className="justify-center items-center h-[70px] px-5"
                style={{ alignItems: 'center' }}
                        onPress={() => router.push("/home")}
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

                    <TouchableOpacity className="justify-center items-center h-[70px] px-5" onPress={() => router.push("/qr-scanner")}>
                        <ScannerIcon
                            fgColor={pathname === "/home/qr-scanner" ? "#3D12FA" : "#BECAD6"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="justify-center items-center h-[70px] px-5"
                style={{ alignItems: 'center' }}
                        onPress={() => router.push("/home/customers")}
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
                <Slot />
        </>
            ) : (
                <Slot />
            )}
        </View>
    );
};

export default HomeLayout;