import { View, Text, TouchableOpacity, Image, ScrollView, Animated, RefreshControl } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants';
import NotificationReassignment from "@/components/svg/notification-reassignment";
import NotificationScan from "@/components/svg/notification-scan";
import NotificationCheckin from "@/components/svg/notification-checkin";
import NotificationAppointment from "@/components/svg/notification-appointment";
import NotificationDefault from "@/components/svg/notification-default";

dayjs.extend(relativeTime);

interface Notification {
  id: number;
  type: string;
  read: boolean;
  user_id: number;
  dealership_id?: number;
  dealership_brand_id?: number;
  dealership_department_id?: number;
  created_at: Date;
  updated_at: Date;
  metadata?: {
    customerName: string;
    newUserName: string;
    customerProfileImage?: string;
    entityName: string;
  };
  dealership?: {
    id: number;
    name: string;
  };
  dealershipBrand?: {
    id: number;
    name: string;
  };
  dealershipDepartment?: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
    profile_image_url?: string;
  };
}

const NotificationSkeleton = () => {
  const renderSkeletonItem = () => (
    <View className="p-3 bg-white mt-3 rounded-md flex-row gap-3 items-center animate-pulse">
      <View className="w-9 h-9 bg-color3 rounded-full" />
      <View className="flex-1 gap-2">
        <View className="h-4 bg-color3 rounded w-full" />
        <View className="h-3 bg-color3 rounded w-3/4" />
      </View>
    </View>
  );

  return (
    <View>
      <View>
        <View className="h-6 bg-color3 rounded w-16 mb-2 animate-pulse" />
        {[1, 2, 3].map((_, index) => (
          <React.Fragment key={index}>
            {renderSkeletonItem()}
          </React.Fragment>
        ))}
      </View>
      
      <View className="mt-6">
        <View className="h-6 bg-color3 rounded w-16 mb-2 animate-pulse" />
        {[1, 2].map((_, index) => (
          <React.Fragment key={index}>
            {renderSkeletonItem()}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadUserAndNotifications();

    return () => {
      // Cleanup: Mark all notifications as read when leaving the screen
      if (userId) {
        const markNotificationsAsRead = async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            
            await axios.patch(`${API_URL}/api/notifications/mark-all-read`, 
              { user_id: userId },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                }
              }
            );
          } catch (error) {
            console.error('Error marking notifications as read:', error);
          }
        };
        markNotificationsAsRead();
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  const onRefresh = React.useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const setupWebSocket = (currentUserId: number) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${API_URL.replace('http://', 'ws://').replace('https://', 'wss://')}/websocket`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send initialization message with user ID
      ws.send(JSON.stringify({
        type: 'init',
        userId: currentUserId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        // Fetch new notifications when a real-time update is received
        fetchNotifications(currentUserId);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed with code:', event.code);
      // Only attempt to reconnect if the close wasn't intentional
      if (event.code !== 1000) {
        setTimeout(() => setupWebSocket(currentUserId), 3000);
      }
    };

    wsRef.current = ws;
  };

  const loadUserAndNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        await fetchNotifications(user.id);
        setupWebSocket(user.id);
      } else {
        console.log('No user data found in AsyncStorage');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const fetchNotifications = async (currentUserId: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/login');
        return;
      }

      console.log('Fetching notifications for userId:', currentUserId);
      console.log('API URL:', `${API_URL}/api/notifications?user_id=${currentUserId}`);
      const response = await axios.get(`${API_URL}/api/notifications?user_id=${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        router.replace('/login');
        return;
      }

      await axios.patch(`${API_URL}/api/notifications/mark-all-read`, 
        { user_id: userId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );
      await fetchNotifications(userId);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const groupNotifications = (notifications: Notification[]) => {
    const today = dayjs().startOf('day');
    
    return notifications.reduce((groups, notification) => {
      const notificationDate = dayjs(notification.created_at);
      const isToday = notificationDate.isAfter(today);
      
      if (isToday) {
        groups.today.push(notification);
      } else {
        groups.older.push(notification);
      }
      
      return groups;
    }, { today: [] as Notification[], older: [] as Notification[] });
  };

  const getNotificationMessage = (notification: Notification) => {
    const entityName = notification.dealership?.name || notification.dealershipBrand?.name || notification.dealershipDepartment?.name || '';
    
    switch (notification.type) {
      case 'CUSTOMER_REASSIGNMENT':
        return notification.metadata ? 
          ['Customer ', notification.metadata.customerName, ' has been reassigned to ', notification.metadata.newUserName] :
          ['A customer has been reassigned to another consultant'];
      case 'CUSTOMER_CHECK_IN':
        return notification.metadata ? 
          ['Customer ', notification.metadata.customerName, ' checked in at ', notification.metadata.entityName] :
          ['A customer has checked in'];
      case 'APPOINTMENT_CREATED':
        return notification.metadata ? 
          ['New appointment scheduled with ', notification.metadata.customerName] :
          ['New appointment scheduled'];
      case 'CUSTOMER_SCAN':
        return ['New customer scan in ', entityName];
      default:
        return ['Update from ', entityName];
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "EN";
    const nameParts = name.split(" ");
    if (nameParts.length < 2) return name.slice(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return 'No date';
    }
    const now = dayjs();
    const commentDate = dayjs(date);
    const diffInHours = now.diff(commentDate, 'hour');
    const diffInDays = now.diff(commentDate, 'day');

    if (diffInHours < 24) {
      return commentDate.fromNow();
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return commentDate.format("D MMM YYYY");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CUSTOMER_REASSIGNMENT':
        return <NotificationReassignment size={14} />;
      case 'CUSTOMER_CHECK_IN':
        return <NotificationCheckin size={14} />;
      case 'CUSTOMER_SCAN':
        return <NotificationScan size={14} />;
      case 'APPOINTMENT_CREATED':
        return <NotificationAppointment size={14} />;
      default:
        return <NotificationDefault size={14} />;
    }
  };

  const renderNotification = (notification: Notification) => {
    // Get customer name from metadata for initials
    const customerName = notification.metadata?.customerName;
    
    return (
      <View 
        key={notification.id}
        className={`p-3 ${notification.read ? 'bg-white' : 'bg-color3'} mt-3 rounded-md flex-row gap-3 items-center`}
      >
        {notification.metadata?.customerProfileImage ? (
          <Image
            source={{ uri: notification.metadata.customerProfileImage }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        ) : (
          <View className="w-9 h-9 bg-color1 rounded-full flex items-center justify-center">
            <Text className="text-white font-bold text-xs">
              {getInitials(customerName || (notification.dealership?.name || notification.dealershipBrand?.name || notification.dealershipDepartment?.name))}
            </Text>
          </View>
        )}
        
        <View className="flex-1 gap-1">
          <Text className="text-sm">
            {(() => {
              const [prefix, name, suffix, additionalName] = getNotificationMessage(notification);
              return (
                <>
                  {prefix}
                  <Text className="font-bold">{name}</Text>
                  {suffix}
                  {additionalName && <Text className="font-bold">{additionalName}</Text>}
                  <View className="transform translate-y-1 translate-x-1">{getNotificationIcon(notification.type)}</View>
                </>
              );
            })()}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatDate(notification.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      className="flex-1 bg-white pt-20 mb-20"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3D12FA"
          colors={["#3D12FA"]}
        />
      }
    >
      <View className="px-5">
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Notifications</Text>
        </View>

        {loading ? (
          <View className="mt-5">
            <NotificationSkeleton />
          </View>
        ) : (

          <View>
            {notifications.length > 0 ? (
              (() => {
                const { today, older } = groupNotifications(notifications);
                return (
                  <>
                    {today.length > 0 && (
                      <View>
                        <Text className="text-base font-semibold mb-2 mt-4">Today</Text>
                        {today.map(renderNotification)}
                      </View>
                    )}
                    
                    {older.length > 0 && (
                      <View className="mt-6">
                        <Text className="text-base font-semibold mb-2">Older</Text>
                        {older.map(renderNotification)}
                      </View>
                    )}
                  </>
                );
              })()
            ) : (
              <Text className="text-center mt-5 text-gray-500">
                No notifications yet
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>

  );
};

export default NotificationsScreen;
