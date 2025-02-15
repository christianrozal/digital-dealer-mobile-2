import { View, Text, TouchableOpacity, Image, ScrollView, Animated, RefreshControl } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { router } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants';
import CloseIcon from "@/components/svg/closeIcon";

dayjs.extend(relativeTime);

interface Notification {
  id: number;
  type: string;
  read: boolean;
  user_id: number;
  entity_id: number;
  created_at: Date;
  updated_at: Date;
  entity: {
    entity_name: string;
    entity_id: number;
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

  useEffect(() => {
    loadUserAndNotifications();
  }, []);

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

  const loadUserAndNotifications = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      console.log('Stored userId:', storedUserId);
      if (storedUserId) {
        setUserId(parseInt(storedUserId));
        await fetchNotifications(parseInt(storedUserId));
      } else {
        console.log('No userId found in AsyncStorage');
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
      console.log('Fetching notifications for userId:', currentUserId);
      console.log('API URL:', `${API_URL}/notifications?userId=${currentUserId}`);
      const response = await axios.get(`${API_URL}/notifications?userId=${currentUserId}`);
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
      await axios.put(`${API_URL}/notifications/mark-all-read`, { userId });
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
    const entityName = notification.entity.entity_name;
    
    switch (notification.type) {
      case 'reassigned':
        return ['Customer from ', entityName, ' has been reassigned to another consultant'];
      case 'appointment':
        return ['New appointment scheduled in ', entityName];
      case 'customer_scan':
        return ['New customer scan in ', entityName];
      default:
        return ['Update from ', entityName];
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "EN";
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";
    
    if (!firstName) return "EN";
    
    if (lastName) {
      return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`;
    }
    
    return `${firstName[0].toUpperCase()}${firstName[1]?.toUpperCase() || 'N'}`;
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

  const renderNotification = (notification: Notification) => {
    return (
      <View 
        key={notification.id}
        className={`p-3 ${notification.read ? 'bg-white' : 'bg-color3'} mt-3 rounded-md flex-row gap-3 items-center`}
      >
        {notification.entity.entity_name ? (
          <View className="w-9 h-9 bg-color1 rounded-full flex items-center justify-center">
            <Text className="text-white font-bold text-xs">
              {getInitials(notification.entity.entity_name)}
            </Text>
          </View>
        ) : (
          <View className="w-9 h-9 bg-color1 rounded-full flex items-center justify-center">
            <Text className="text-white font-bold text-xs">EN</Text>
          </View>
        )}
        
        <View className="flex-1 gap-1">
          <Text className="text-sm">
            {(() => {
              const [prefix, name, suffix] = getNotificationMessage(notification);
              return (
                <>
                  {prefix}
                  <Text className="font-bold text-color1 text-sm">{name}</Text>
                  {suffix}
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
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3D12FA"
          colors={["#3D12FA"]}
        />
      }
    >
      <View className="px-5 pt-20">
        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-2xl font-semibold">Notifications</Text>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center gap-3 mt-10"
          onPress={markAllAsRead}
        >
          <Text className="text-xs font-medium text-gray-400">Mark all as read</Text>
        </TouchableOpacity>

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
