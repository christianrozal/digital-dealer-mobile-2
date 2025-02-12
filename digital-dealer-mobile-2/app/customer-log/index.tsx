import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import BackArrowIcon from "@/components/svg/backArrow";
import Calendar2Icon from "@/components/svg/calendar2";
import AlexiumLogo2 from "@/components/svg/alexiumLogo2";
import ButtonComponent from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Radio from "@/components/ui/radio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@/constants";
import { format } from 'date-fns';
import EditIcon from "@/components/svg/editIcon";
import DeleteIcon from "@/components/svg/deleteIcon";

interface CustomerScan {
    id: number;
    customer_id: number;
    customer: {
        name: string;
        email: string | null;
        phone: string | null;
    };
    interest_status: string;
    interested_in: string | null;
    follow_up_date: string | null;
    created_at: string;
}

interface Comment {
    id: number;
    comment_text: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        profile_image_url: string | null;
    };
}

interface AssignmentHistory {
    type: 'INITIAL_ASSIGNMENT' | 'REASSIGNMENT';
    user: {
        name: string;
        email: string;
        profile_image_url: string | null;
    };
    timestamp: string;
    customer_name: string;
}

const CustomerLogSkeleton = () => {
    return (
        <ScrollView className='pt-7 px-7 pb-32'>
            {/* Header */}
            <View className='flex-row w-full justify-between items-center'>
                <TouchableOpacity onPress={() => router.back()}>
                    <BackArrowIcon />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/home")}>
                    <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                </TouchableOpacity>
                <View style={{ width: 18 }} />
            </View>
            <View className="mt-10"></View>
            <Text className="text-2xl font-semibold">Customer Log</Text>
            <View>
                {/* Customer Info */}
                <View className="bg-gray-400 rounded-md px-5 py-7 mt-10 flex-row gap-5">
                    <View className="bg-color1 rounded-full items-center justify-center" style={{ width: 56, height: 56 }}>
                        <Text className="text-white font-bold text-sm">LD</Text>
                    </View>
                    <View className="gap-1">
                        <Text className="text-white text-[10px]">
                            Customer Name: <Text className="font-bold">Loading Data...</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Contact Number: <Text className="font-bold">Loading Data...</Text>
                        </Text>
                        <Text className="text-white text-[10px]">
                            Email: <Text className="font-bold">Loading Data...</Text>
                        </Text>
                    </View>
                </View>

                {/* Interest in checkbox group*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Interested In</Text>
                    <View className="flex-row">
                        {/* Buying*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Checkbox
                                checked={true}
                                onPress={() => {}}
                                size={14}
                            />
                            <Text className="text-[10px]">Buying</Text>
                        </TouchableOpacity>
                        {/* Selling*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Checkbox
                                checked={false}
                                onPress={() => {}}
                                size={14}
                            />
                            <Text className="text-[10px]">Selling</Text>
                        </TouchableOpacity>
                        {/* Financing*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Checkbox
                                checked={false}
                                onPress={() => {}}
                                size={14}
                            />
                            <Text className="text-[10px]">Financing</Text>
                        </TouchableOpacity>
                        {/* Purchased*/}
                        <TouchableOpacity
                            className="flex-row items-center gap-2"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Checkbox
                                checked={false}
                                onPress={() => {}}
                                size={14}
                            />
                            <Text className="text-[10px]">Purchased</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Interest status radio group*/}
                <View className="mt-3">
                    <Text className="text-[10px] text-gray-500">Interest Status</Text>
                    <View className="flex-row">
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Radio
                                checked={true}
                                onPress={() => {}}
                                size={12}
                            />
                            <Text className="text-[10px] text-black">Hot</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Radio
                                checked={false}
                                onPress={() => {}}
                                size={12}
                            />
                            <Text className="text-[10px] text-gray-500">Warm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Radio
                                checked={false}
                                onPress={() => {}}
                                size={12}
                            />
                            <Text className="text-[10px] text-gray-500">Cold</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Radio
                                checked={false}
                                onPress={() => {}}
                                size={12}
                            />
                            <Text className="text-[10px] text-gray-500">Not Interested</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-1"
                            style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                        >
                            <Radio
                                checked={false}
                                onPress={() => {}}
                                size={12}
                            />
                            <Text className="text-[10px] text-gray-500">Bought</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Follow up select date*/}
                <View className="mt-5">
                    <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
                    <TouchableOpacity className="mt-3 rounded-md bg-color3 py-3 px-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs">Select date and time</Text>
                            <Calendar2Icon width={16} height={16} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Comments Section */}
                <View className="mt-10">
                    {/* Tab Buttons */}
                    <View className="flex-row gap-2 justify-between">
                        <TouchableOpacity 
                            className="py-2 px-4 rounded-full bg-color3"
                        >
                            <Text className="text-[10px] text-center text-black font-semibold">Comments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="py-2 px-4 rounded-full"
                        >
                            <Text className="text-[10px] text-center text-gray-400 font-normal">Thread</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="py-2 px-4 rounded-full"
                        >
                            <Text className="text-[10px] text-center text-gray-400 font-normal">Assignment History</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Comments TextInput */}
                    <View className="mt-5">
                        <TextInput
                            placeholder="Add your comment"
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            style={{ height: 100 }}
                            className="placeholder:text-gray-400 placeholder:text-[10px] text-xs border border-gray-300 rounded-md py-3 px-4 w-full focus:outline-color1"
                            editable={false}
                        />
                    </View>
                </View>

                {/* Update button */}
                <ButtonComponent 
                    label="Update" 
                    onPress={() => {}}
                    className="mt-10"
                    disabled={true}
                />

                {/* Back to activities button*/}
                <ButtonComponent 
                    label="Back to Activities" 
                    onPress={() => router.push("/home")} 
                    className="mt-5 mb-20"
                    var2
                />
            </View>
        </ScrollView>
    );
};

const CustomerLogScreen = () => {
    const [comment, setComment] = useState('');
    const [value, setValue] = useState<string | null>(null);
    const [interestedIn, setInterestedIn] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'comments' | 'thread' | 'history'>('comments');
    const [loading, setLoading] = useState(false);
    const [customerScan, setCustomerScan] = useState<CustomerScan | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showOptions, setShowOptions] = useState<number | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const [userData, setUserData] = useState<{ email: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [isSavingComment, setIsSavingComment] = useState(false);
    const [isCommentFocused, setIsCommentFocused] = useState(false);
    const [isEditCommentFocused, setIsEditCommentFocused] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const loadCustomerData = async () => {
            try {
                const [customerId, scanId, token] = await Promise.all([
                    AsyncStorage.getItem('selectedCustomerId'),
                    AsyncStorage.getItem('selectedScanId'),
                    AsyncStorage.getItem('userToken')
                ]);

                if (!customerId || !scanId || !token) {
                    Alert.alert('Error', 'Required data not found');
                    router.back();
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/api/customer-scans/${customerId}/${scanId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setCustomerScan(response.data);
                
                // Set initial values based on customer data
                setValue(response.data.interest_status || null);
                if (response.data.interested_in) {
                    setInterestedIn([response.data.interested_in]);
                }
            } catch (error) {
                console.error('Error loading customer data:', error);
                Alert.alert('Error', 'Failed to load customer data');
                router.back();
            }
        };

        loadCustomerData();
    }, []);

    useEffect(() => {
        const loadComments = async () => {
            if (activeTab === 'thread' && customerScan) {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) {
                        Alert.alert('Error', 'Authentication token not found');
                        return;
                    }

                    const response = await axios.get(
                        `${API_URL}/api/comments/customer/${customerScan.customer_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    setComments(response.data);
                } catch (error) {
                    console.error('Error loading comments:', error);
                    Alert.alert('Error', 'Failed to load comments');
                } finally {
                    setLoadingComments(false);
                }
            }
        };

        loadComments();
    }, [activeTab, customerScan]);

    useEffect(() => {
        const loadAssignmentHistory = async () => {
            if (activeTab === 'history' && customerScan) {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    if (!token) {
                        Alert.alert('Error', 'Authentication token not found');
                        return;
                    }

                    const response = await axios.get(
                        `${API_URL}/api/customer-logs/${customerScan.customer_id}/history`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    setAssignmentHistory(response.data);
                } catch (error) {
                    console.error('Error loading assignment history:', error);
                    Alert.alert('Error', 'Failed to load assignment history');
                } finally {
                    setLoadingHistory(false);
                }
            }
        };

        loadAssignmentHistory();
    }, [activeTab, customerScan]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) {
                    Alert.alert('Error', 'Authentication token not found');
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/api/users/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUserData(response.data);
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const handleCheckboxChange = (interestType: "Buying" | "Selling" | "Financing" | "Purchased") => {
        const newInterestedIn = [...interestedIn];
        if (newInterestedIn.includes(interestType)) {
            const index = newInterestedIn.indexOf(interestType);
            newInterestedIn.splice(index, 1);
        } else {
            newInterestedIn.push(interestType);
        }
        setInterestedIn(newInterestedIn);
    };

    const handleInterestStatusChange = (interestStatus: string) => {
        setValue(interestStatus);
    };

    const handleTabChange = (tab: 'comments' | 'thread' | 'history') => {
        // Clear data and set loading state before switching tabs
        if (tab === 'thread') {
            setComments([]);
            setLoadingComments(true);
        } else if (tab === 'history') {
            setAssignmentHistory([]);
            setLoadingHistory(true);
        }
        setActiveTab(tab);
    };

    const handlePostComment = async () => {
        if (!comment.trim() || !customerScan) return;

        setIsPostingComment(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            const response = await axios.post(
                `${API_URL}/api/comments`,
                {
                    customerId: customerScan.customer_id,
                    comment: comment.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Add new comment to the list
            setComments(prevComments => [response.data, ...prevComments]);
            setComment(''); // Clear the input
        } catch (error) {
            console.error('Error posting comment:', error);
            Alert.alert('Error', 'Failed to post comment');
        } finally {
            setIsPostingComment(false);
        }
    };

    const formatCommentDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    };

    const generateInitials = (name: string | undefined) => {
        if (!name) return "CU";
        const nameParts = name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts[1] || "";
        
        if (!firstName) return "CU";
        
        if (lastName) {
            return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
        }
        
        return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'U'}`;
    };

    const handleUpdate = async () => {
        if (!customerScan) return;
        
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            // If there's a comment, post it first
            if (comment.trim()) {
                await axios.post(
                    `${API_URL}/api/comments`,
                    {
                        customerId: customerScan.customer_id,
                        comment: comment.trim()
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setComment(''); // Clear the comment input
            }

            // Switch to thread tab instead of navigating
            setActiveTab('thread');
            setLoadingComments(true);
            setComments([]); // Clear existing comments before loading new ones
            
        } catch (error) {
            console.error('Error updating:', error);
            Alert.alert('Error', 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        setIsDeletingComment(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            await axios.delete(
                `${API_URL}/api/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setComments(prevComments => 
                prevComments.filter(c => c.id !== commentId)
            );
            setShowOptions(null);
            setShowDeleteConfirm(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert('Error', 'Failed to delete comment');
        } finally {
            setIsDeletingComment(false);
        }
    };

    if (!customerScan) {
        return <CustomerLogSkeleton />;
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView 
                ref={scrollViewRef}
                className='pt-7 px-7 pb-32'
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
            >
                {/* Header */}
                <View className='flex-row w-full justify-between items-center'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <BackArrowIcon />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/home")}>
                        <AlexiumLogo2 width={64 * 1.3} height={14 * 1.3} />
                    </TouchableOpacity>
                    <View style={{ width: 18 }} />
                </View>
                <View className="mt-10"></View>
                <Text className="text-2xl font-semibold">Customer Log</Text>
                <View>
                    {/* Customer Info */}
                    <View className="bg-gray-400 rounded-md px-5 py-7 mt-10 flex-row gap-5">
                        <View className="bg-color1 rounded-full items-center justify-center" style={{ width: 56, height: 56 }}>
                            <Text className="text-white font-bold text-sm">
                                {generateInitials(customerScan.customer.name)}
                            </Text>
                        </View>
                        <View className="gap-1">
                            <Text className="text-white text-[10px]">
                                Customer Name: <Text className="font-bold">{customerScan.customer.name || 'No name'}</Text>
                            </Text>
                            <Text className="text-white text-[10px]">
                                Contact Number: <Text className="font-bold">{customerScan.customer.phone || 'No phone'}</Text>
                            </Text>
                            <Text className="text-white text-[10px]">
                                Email: <Text className="font-bold">{customerScan.customer.email || 'No email'}</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Interest in checkbox group*/}
                    <View className="mt-5">
                        <Text className="text-[10px] text-gray-500">Interested In</Text>
                        <View className="flex-row">
                            {/* Buying*/}
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleCheckboxChange("Buying")}
                            >
                                <Checkbox
                                    checked={interestedIn.includes("Buying")}
                                    onPress={() => handleCheckboxChange("Buying")}
                                    size={14}
                                />
                                <Text className="text-[10px]">Buying</Text>
                            </TouchableOpacity>
                            {/* Selling*/}
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleCheckboxChange("Selling")}
                            >
                                <Checkbox
                                    checked={interestedIn.includes("Selling")}
                                    onPress={() => handleCheckboxChange("Selling")}
                                    size={14}
                                />
                                <Text className="text-[10px]">Selling</Text>
                            </TouchableOpacity>
                            {/* Financing*/}
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleCheckboxChange("Financing")}
                            >
                                <Checkbox
                                    checked={interestedIn.includes("Financing")}
                                    onPress={() => handleCheckboxChange("Financing")}
                                    size={14}
                                />
                                <Text className="text-[10px]">Financing</Text>
                            </TouchableOpacity>
                            {/* Purchased*/}
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleCheckboxChange("Purchased")}
                            >
                                <Checkbox
                                    checked={interestedIn.includes("Purchased")}
                                    onPress={() => handleCheckboxChange("Purchased")}
                                    size={14}
                                />
                                <Text className="text-[10px]">Purchased</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Interest status radio group*/}
                    <View className="mt-3">
                        <Text className="text-[10px] text-gray-500">Interest Status</Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleInterestStatusChange("Hot")}
                            >
                                <Radio
                                    checked={value === "Hot"}
                                    onPress={() => handleInterestStatusChange("Hot")}
                                    size={12}
                                />
                                <Text className={`text-[10px] ${value === "Hot" ? "text-black" : "text-gray-500"}`}>
                                    Hot
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleInterestStatusChange("Warm")}
                            >
                                <Radio
                                    checked={value === "Warm"}
                                    onPress={() => handleInterestStatusChange("Warm")}
                                    size={12}
                                />
                                <Text className={`text-[10px] ${value === "Warm" ? "text-black" : "text-gray-500"}`}>
                                    Warm
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleInterestStatusChange("Cold")}
                            >
                                <Radio
                                    checked={value === "Cold"}
                                    onPress={() => handleInterestStatusChange("Cold")}
                                    size={12}
                                />
                                <Text className={`text-[10px] ${value === "Cold" ? "text-black" : "text-gray-500"}`}>
                                    Cold
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleInterestStatusChange("Not Interested")}
                            >
                                <Radio
                                    checked={value === "Not Interested"}
                                    onPress={() => handleInterestStatusChange("Not Interested")}
                                    size={12}
                                />
                                <Text className={`text-[10px] ${value === "Not Interested" ? "text-black" : "text-gray-500"}`}>
                                    Not Interested
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center gap-1"
                                style={{ paddingVertical: 10, paddingHorizontal: 5 }}
                                onPress={() => handleInterestStatusChange("Bought")}
                            >
                                <Radio
                                    checked={value === "Bought"}
                                    onPress={() => handleInterestStatusChange("Bought")}
                                    size={12}
                                />
                                <Text className={`text-[10px] ${value === "Bought" ? "text-black" : "text-gray-500"}`}>
                                    Bought
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Follow up select date*/}
                    <View className="mt-5">
                        <Text className="text-[10px] text-gray-500">Follow Up Date</Text>
                        <TouchableOpacity className="mt-3 rounded-md bg-color3 py-3 px-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-xs">Select date and time</Text>
                                <Calendar2Icon width={16} height={16} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Comments and Thread Section */}
                    <View className="mt-10">
                        {/* Tab Buttons */}
                        <View className="flex-row gap-2 justify-between">
                            <TouchableOpacity 
                                className={`py-2 px-4 rounded-full ${activeTab === 'comments' ? 'bg-color3' : ''}`}
                                onPress={() => handleTabChange('comments')}
                            >
                                <Text className={`text-[10px] text-center ${activeTab === 'comments' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                    Comments
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className={`py-2 px-4 rounded-full ${activeTab === 'thread' ? 'bg-color3' : ''}`}
                                onPress={() => handleTabChange('thread')}
                            >
                                <Text className={`text-[10px] text-center ${activeTab === 'thread' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                    Thread
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className={`py-2 px-4 rounded-full ${activeTab === 'history' ? 'bg-color3' : ''}`}
                                onPress={() => handleTabChange('history')}
                            >
                                <Text className={`text-[10px] text-center ${activeTab === 'history' ? 'text-black font-semibold' : 'text-gray-400 font-normal'}`}>
                                    Assignment History
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tab Content */}
                        {activeTab === 'comments' && (
                            <View className="mt-5">
                                <TextInput
                                    placeholder="Add your comment"
                                    multiline={true}
                                    numberOfLines={4}
                                    value={comment}
                                    onChangeText={setComment}
                                    textAlignVertical="top"
                                    style={{ height: 100 }}
                                    onFocus={() => setIsCommentFocused(true)}
                                    onBlur={() => setIsCommentFocused(false)}
                                    className={`placeholder:text-gray-400 placeholder:text-[10px] text-xs border ${isCommentFocused ? 'border-color1' : 'border-gray-300'} rounded-md py-3 px-4 w-full`}
                                />
                            </View>
                        )}

                        {activeTab === 'thread' && (
                            <View className="mt-5">
                                {loadingComments || isPostingComment ? (
                                    <View className="gap-3">
                                        {[1, 2, 3].map((_, index) => (
                                            <View key={index} className="bg-white rounded-md p-4">
                                                <View className="flex-row justify-between items-center mb-2">
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="bg-color3 rounded-full w-8 h-8" />
                                                        <View>
                                                            <View className="h-3 w-24 bg-color3 rounded mb-1" />
                                                            <View className="h-2 w-32 bg-color3 rounded" />
                                                        </View>
                                                    </View>
                                                </View>
                                                <View className="h-4 w-3/4 bg-color3 rounded mt-2" />
                                            </View>
                                        ))}
                                    </View>
                                ) : comments.length === 0 ? (
                                    <View className="bg-color3 rounded-md p-4">
                                        <Text className="text-gray-500 text-xs">No comments yet</Text>
                                    </View>
                                ) : (
                                    <View className="gap-3">
                                        {comments.map((comment) => (
                                            <View key={comment.id} className={`${showOptions === comment.id ? 'bg-color3' : 'bg-white'} rounded-md p-4 relative`}>
                                                <View className="flex-row justify-between items-center mb-2">
                                                    <View className="flex-row items-center gap-2">
                                                        <View className="bg-color1 rounded-full w-8 h-8 items-center justify-center">
                                                            <Text className="text-white text-xs font-bold">
                                                                {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <View>
                                                            <Text className="text-xs font-bold">{comment.user.name}</Text>
                                                            <Text className="text-[10px] text-gray-500">
                                                                {formatCommentDate(comment.created_at)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {comment.user.email === userData?.email && (
                                                        <TouchableOpacity 
                                                            onPress={() => setShowOptions(showOptions === comment.id ? null : comment.id)}
                                                            className="py-4 px-4 -mt-2 -mr-2"
                                                        >
                                                            <Text className="font-bold">⋮</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {showOptions === comment.id && (
                                                    <>
                                                        <TouchableOpacity 
                                                            activeOpacity={0}
                                                            onPress={() => setShowOptions(null)}
                                                            className="absolute inset-0 w-full h-full"
                                                        />
                                                        <View 
                                                            className="absolute right-4 top-[50px] bg-white rounded-md shado p-0"
                                                            style={{
                                                                elevation: 100,
                                                                zIndex: 100
                                                            }}
                                                        >
                                                            <TouchableOpacity 
                                                                onPress={() => {
                                                                    setEditingCommentId(comment.id);
                                                                    setEditedComment(comment.comment_text);
                                                                    setShowOptions(null);
                                                                }}
                                                                className="py-2 px-4 flex-row items-center gap-2"
                                                            >
                                                                <EditIcon width={14} height={14} stroke="#9ca3af" />
                                                                <Text className="text-xs">Edit</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity 
                                                                onPress={() => {
                                                                    setCommentToDelete(comment.id);
                                                                    setShowDeleteConfirm(true);
                                                                    setShowOptions(null);
                                                                }}
                                                                className="-ml-1 py-2 px-4 flex-row items-center gap-2"
                                                            >
                                                                <DeleteIcon width={20} height={20} stroke="#ef4444" />
                                                                <Text className="text-xs text-red-500">Delete</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                )}
                                                {editingCommentId === comment.id ? (
                                                    <View>
                                                        <TextInput
                                                            value={editedComment}
                                                            onChangeText={setEditedComment}
                                                            multiline
                                                            numberOfLines={4}
                                                            textAlignVertical="top"
                                                            style={{ height: 100 }}
                                                            onFocus={() => {
                                                                setIsEditCommentFocused(true);
                                                            }}
                                                            onBlur={() => setIsEditCommentFocused(false)}
                                                            className={`placeholder:text-gray-400 placeholder:text-[10px] text-xs border ${isEditCommentFocused ? 'border-color1' : 'border-gray-300'} rounded-md py-3 px-4 w-full`}
                                                        />
                                                        <View className="flex-row justify-end mt-2 gap-2">
                                                            <TouchableOpacity 
                                                                onPress={() => {
                                                                    setEditingCommentId(null);
                                                                    setEditedComment('');
                                                                }}
                                                                className="px-3 py-1 rounded-full bg-color3"
                                                                disabled={isSavingComment}
                                                            >
                                                                <Text className="text-xs text-gray-500">Cancel</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity 
                                                                onPress={async () => {
                                                                    setIsSavingComment(true);
                                                                    try {
                                                                        const token = await AsyncStorage.getItem('userToken');
                                                                        if (!token) {
                                                                            Alert.alert('Error', 'Authentication token not found');
                                                                            return;
                                                                        }

                                                                        await axios.patch(
                                                                            `${API_URL}/api/comments/${comment.id}`,
                                                                            { comment_text: editedComment },
                                                                            {
                                                                                headers: {
                                                                                    Authorization: `Bearer ${token}`
                                                                                }
                                                                            }
                                                                        );

                                                                        setComments(prevComments => 
                                                                            prevComments.map(c => 
                                                                                c.id === comment.id 
                                                                                    ? { ...c, comment_text: editedComment }
                                                                                    : c
                                                                            )
                                                                        );
                                                                        setEditingCommentId(null);
                                                                        setEditedComment('');
                                                                    } catch (error) {
                                                                        console.error('Error updating comment:', error);
                                                                        Alert.alert('Error', 'Failed to update comment');
                                                                    } finally {
                                                                        setIsSavingComment(false);
                                                                    }
                                                                }}
                                                                className={`w-16 py-1 rounded-full bg-color1 flex-row items-center justify-center gap-2 ${isSavingComment ? 'opacity-50' : ''}`}
                                                                disabled={isSavingComment}
                                                            >
                                                                {isSavingComment ? (
                                                                    <>
                                                                        <Text className="text-xs text-white">Saving...</Text>
                                                                    </>
                                                                ) : (
                                                                    <Text className="text-xs text-white">Save</Text>
                                                                )}
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <Text className="text-xs">{comment.comment_text}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'history' && (
                            <View className="mt-5">
                                {loadingHistory ? (
                                    <View>
                                        {/* Table Header Skeleton */}
                                        <View className="flex-row border-y border-gray-200 py-2">
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Date</Text>
                                            </View>
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Time</Text>
                                            </View>
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Assigned to</Text>
                                            </View>
                                        </View>

                                        {/* Table Content Skeleton */}
                                        <View className="gap-2 mt-2">
                                            {[1, 2, 3].map((_, index) => (
                                                <View key={index} className="flex-row py-3 border-b border-gray-100">
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                        <View className="h-3 w-20 bg-color3 rounded" />
                                                    </View>
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                        <View className="h-3 w-16 bg-color3 rounded" />
                                                    </View>
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center gap-2">
                                                        <View className="bg-color3 rounded-full w-7 h-7" />
                                                        <View className="h-3 w-20 bg-color3 rounded" />
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ) : assignmentHistory.length === 0 ? (
                                    <View className="bg-color3 rounded-md p-4">
                                        <Text className="text-gray-500 text-xs">No assignment history</Text>
                                    </View>
                                ) : (
                                    <View>
                                        {/* Table Header */}
                                        <View className="flex-row border-y border-gray-200 py-2">
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Date</Text>
                                            </View>
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Time</Text>
                                            </View>
                                            <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                <Text className="text-[10px] text-gray-500 font-medium text-center">Assigned to</Text>
                                            </View>
                                        </View>

                                        {/* Table Content */}
                                        <View className="gap-2 mt-2">
                                            {assignmentHistory.map((entry, index) => (
                                                <View key={index} className="flex-row py-3 border-b border-gray-100">
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                        <Text className="text-xs">
                                                            {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center">
                                                        <Text className="text-xs">
                                                            {format(new Date(entry.timestamp), 'h:mm a')}
                                                        </Text>
                                                    </View>
                                                    <View style={{ flex: 1 }} className="flex-row items-center justify-center gap-2">
                                                        <View className="bg-indigo-500 rounded-full w-7 h-7 items-center justify-center">
                                                            <Text className="text-white text-xs font-bold">
                                                                {entry.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-xs">
                                                            {(() => {
                                                                const nameParts = entry.user.name.split(' ');
                                                                const firstName = nameParts[0];
                                                                const lastName = nameParts[1] || '';
                                                                return `${firstName} ${lastName ? lastName[0] + '.' : ''}`;
                                                            })()}
                                                        </Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Update button */}
                    <ButtonComponent 
                        label={loading ? "Updating..." : "Update"}
                        onPress={handleUpdate}
                        className="mt-10"
                        loading={loading}
                        disabled={loading}
                    />

                    {/* Back to activities button*/}
                    <ButtonComponent 
                        label="Back to Activities" 
                        onPress={() => router.push("/home")} 
                        className="mt-5 mb-20"
                        var2
                    />
                </View>

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={showDeleteConfirm}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => {
                        setShowDeleteConfirm(false);
                        setCommentToDelete(null);
                    }}
                >
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <View className="bg-white rounded-lg p-4 mx-4 w-full max-w-sm">
                            <Text className="text-lg font-semibold text-center mb-4">Delete Comment</Text>
                            <Text className="text-sm text-gray-500 text-center mb-6">
                                Are you sure you want to delete this comment?
                            </Text>
                            <View className="flex-row justify-end gap-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowDeleteConfirm(false);
                                        setCommentToDelete(null);
                                    }}
                                    className="py-2 px-4 rounded-full bg-color3"
                                    disabled={isDeletingComment}
                                >
                                    <Text className="text-xs text-gray-500">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (commentToDelete) {
                                            handleDeleteComment(commentToDelete);
                                        }
                                    }}
                                    className={`py-2 w-20 rounded-full bg-red-500 flex-row items-center justify-center gap-2 ${isDeletingComment ? 'opacity-50' : ''}`}
                                    disabled={isDeletingComment}
                                >
                                    {isDeletingComment ? (
                                        <>
                                            <Text className="text-xs text-white">Deleting...</Text>
                                        </>
                                    ) : (
                                        <Text className="text-xs text-white">Delete</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CustomerLogScreen;