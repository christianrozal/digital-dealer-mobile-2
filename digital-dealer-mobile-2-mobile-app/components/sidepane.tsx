import { View, Text, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Select from '@/components/ui/select';
import axios from 'axios';
import { API_URL } from '@/constants';
import LogoutIcon from './svg/logoutIcon';
import ProfileIcon from './svg/profileIcon';
import BackArrowIcon from './svg/backArrow';
import ButtonComponent from '@/components/ui/button';
import QRCode from 'react-native-qrcode-svg';

interface SidepaneProps {
    onClose: () => void;
    userData: {
        name: string;
        profile_image_url: string | null;
        email?: string;
    } | null;
}

interface Option {
    id: string;
    label: string;
    departments?: any[];
}

const SidepaneComponent = ({ onClose, userData }: SidepaneProps) => {
    const [isDealershipDropdownOpen, setIsDealershipDropdownOpen] = useState(false);
    const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
    const [selectedDealership, setSelectedDealership] = useState<Option | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Option | null>(null);
    const [dealerships, setDealerships] = useState<Option[]>([]);
    const [departments, setDepartments] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentDealership, setCurrentDealership] = useState<Option | null>(null);
    const [currentDepartment, setCurrentDepartment] = useState<Option | null>(null);
    const [isSwitching, setIsSwitching] = useState(false);
    const [qrValue, setQrValue] = useState<string>('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch current dealership and department on mount
    useEffect(() => {
        const fetchCurrentDealership = async () => {
            try {
                const dealershipData = await AsyncStorage.getItem('selectedDealership');
                if (dealershipData) {
                    const { brand, department } = JSON.parse(dealershipData);
                    setCurrentDealership({
                        id: brand.id,
                        label: brand.name
                    });
                    if (department) {
                        setCurrentDepartment({
                            id: department.id,
                            label: department.name
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching current dealership:', error);
            }
        };

        fetchCurrentDealership();
    }, []);

    // Fetch dealerships
    useEffect(() => {
        const fetchDealerships = async () => {
            try {
                setIsLoading(true);
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    router.replace('/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/auth/dealerships`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dealershipOptions = response.data.map((dealership: any) => ({
                    id: dealership.id.toString(),
                    label: dealership.name,
                    departments: dealership.departments
                }));

                setDealerships(dealershipOptions);
            } catch (error) {
                console.error('Error fetching dealerships:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDealerships();
    }, []);

    // Update departments when dealership is selected
    useEffect(() => {
        if (!selectedDealership) {
            setDepartments([]);
            return;
        }

        const dealership = dealerships.find(d => d.id === selectedDealership.id);
        if (dealership?.departments) {
            const departmentOptions = dealership.departments.map(dept => ({
                id: dept.id.toString(),
                label: dept.name
            }));
            setDepartments(departmentOptions);
        } else {
            setDepartments([]);
        }
    }, [selectedDealership, dealerships]);

    // Add effect to generate QR value when dealership changes
    useEffect(() => {
        const generateQrValue = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token || !currentDealership) return;

                const qrData = {
                    type: 'digital-dealer',
                    dealershipId: currentDealership.id,
                    dealershipName: currentDealership.label,
                    departmentId: currentDepartment?.id,
                    departmentName: currentDepartment?.label,
                    userId: userData?.email,
                    timestamp: new Date().toISOString()
                };

                setQrValue(JSON.stringify(qrData));
            } catch (error) {
                console.error('Error generating QR value:', error);
            }
        };

        generateQrValue();
    }, [currentDealership, currentDepartment, userData]);

    const handleDealershipSelection = (option: Option) => {
        setSelectedDealership(option);
        setSelectedDepartment(null);
        setIsDealershipDropdownOpen(false);
    };

    const handleDepartmentSelection = (option: Option) => {
        setSelectedDepartment(option);
        setIsDepartmentDropdownOpen(false);
    };

    const handleSwitchDealership = async () => {
        if (!selectedDealership) return;
        
        setIsSwitching(true);
        try {
            // Store selected brand and department
            const selection = {
                brand: {
                    id: selectedDealership.id,
                    name: selectedDealership.label
                },
                department: selectedDepartment ? {
                    id: selectedDepartment.id,
                    name: selectedDepartment.label
                } : null
            };
            await AsyncStorage.setItem('selectedDealership', JSON.stringify(selection));
            
            // Update current states
            setCurrentDealership({
                id: selectedDealership.id,
                label: selectedDealership.label
            });
            if (selectedDepartment) {
                setCurrentDepartment({
                    id: selectedDepartment.id,
                    label: selectedDepartment.label
                });
            } else {
                setCurrentDepartment(null);
            }
            
            // Clear selection states
            setSelectedDealership(null);
            setSelectedDepartment(null);
            onClose();
            router.replace("/home");
        } catch (error) {
            console.error('Error switching dealership:', error);
        } finally {
            setIsSwitching(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('selectedDealership');
            router.replace('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Add this function to check if we should show the switch button
    const shouldShowSwitchButton = () => {
        if (!selectedDealership || !currentDealership) return false;
        
        // Different dealership
        if (selectedDealership.id !== currentDealership.id) return true;
        
        // Same dealership but different department
        if (selectedDealership.id === currentDealership.id && departments.length > 0) {
            return selectedDepartment && (!currentDepartment || currentDepartment.id !== selectedDepartment.id);
        }
        
        return false;
    };

    return (
        <>
            <View className="flex-1 bg-white" style={{ paddingVertical: 20 }}>
                {/* Header with close button */}
                <View className="flex-row items-center px-5 pb-8">
                    <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                        <BackArrowIcon />
                    </TouchableOpacity>
                </View>
                <View className="flex-1 justify-between mt-3">
                    <View className="px-7 flex-1">
                        {/* User Profile Section */}
                        <View className="flex-row items-center gap-4">
                            {userData?.profile_image_url ? (
                                <Image 
                                    source={{ uri: userData.profile_image_url }}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <View className="bg-[#3D12FA] rounded-full items-center justify-center w-10 h-10">
                                    <Text className="text-white font-bold text-base">
                                        {userData?.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                    </Text>
                                </View>
                            )}
                            <View>
                                <Text className="text-lg font-semibold">{userData?.name || 'User'}</Text>
                                <Text className="text-xs text-gray-400">Sales Consultant</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">{userData?.email || ''}</Text>
                            </View>
                        </View>

                        {/* QR Code Section */}
                        {currentDealership && qrValue && (
                        <View style={{ marginTop: 20 }}>
                            <View className="bg-color3 rounded-md items-center justify-center w-full" style={{ padding: 20 }}>
                                <QRCode
                                    value={"test"}
                                    size={150}
                                    backgroundColor="#F4F8FC"
                                    color="#3D12FA"
                                />
                            </View>
                        </View>
                        )}

                        {/* Current Dealership */}
                        {currentDealership && (
                            <View className="mt-5 mx-auto">
                                <Text className="text-xs text-gray-400 text-center">Current Dealership</Text>
                                <Text className="text-base font-medium text-center text-color1">
                                    {currentDepartment ? currentDepartment.label : currentDealership.label}
                                </Text>
                            </View>
                        )}

                        {/* Dealership Selection */}
                        <View className="mt-3 z-20">
                            <Select
                                placeholder="Select Brand"
                                value={selectedDealership}
                                options={dealerships}
                                isOpen={isDealershipDropdownOpen}
                                onPress={() => {
                                    setIsDealershipDropdownOpen(!isDealershipDropdownOpen);
                                    setIsDepartmentDropdownOpen(false);
                                }}
                                onSelect={handleDealershipSelection}
                            />
                        </View>

                        {selectedDealership && departments.length > 0 && (
                            <View className="mt-3 z-10">
                                <Select
                                    placeholder="Select Department"
                                    value={selectedDepartment}
                                    options={departments}
                                    isOpen={isDepartmentDropdownOpen}
                                    onPress={() => {
                                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen);
                                        setIsDealershipDropdownOpen(false);
                                    }}
                                    onSelect={handleDepartmentSelection}
                                />
                            </View>
                        )}

                        {/* Switch Dealership Button */}
                        {shouldShowSwitchButton() && (
                            <View className="mt-3">
                                <ButtonComponent
                                    label={isSwitching ? "Switching..." : "Switch"}
                                    onPress={handleSwitchDealership}
                                    disabled={!selectedDealership || (departments.length > 0 && !selectedDepartment) || isSwitching}
                                    loading={isSwitching}
                                    className="py-2"
                                />
                            </View>
                        )}
                    </View>

                    {/* Bottom Actions */}
                    <View className="mt-auto flex-row justify-center gap-8">
                        <TouchableOpacity 
                            className="items-center py-3 px-5 flex-row gap-2"
                            onPress={() => {
                                onClose();
                                router.replace("/profile");
                            }}
                        >
                            <ProfileIcon stroke="#4b5563" />
                            <Text className="text-base text-gray-600">Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            className="items-center py-3 px-5 flex-row gap-2"
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogoutIcon fill="#ef4444" />
                            <Text className="text-base text-red-500">
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

export default SidepaneComponent;