// components/SuccessAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import CheckIcon from '@/components/svg/checkIcon';

interface SuccessAnimationProps {
  onAnimationComplete?: () => void;
  message?: string;
  isSuccess?: boolean;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  onAnimationComplete,
  message = "Success",
  isSuccess = true,
}) => {
  const translateY = useRef(new Animated.Value(-40)).current; // Initial position above view

  useEffect(() => {
    console.log("Starting animation with message:", message); // Debug log

    // Start the animation
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Hold for 2 seconds
      Animated.timing(translateY, {
        toValue: -40,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [translateY, onAnimationComplete, message]);

  return (
    <Animated.View style={{ zIndex: 1000, transform: [{ translateY }] }} className="w-full absolute">
      <View
        className="flex-row items-center justify-center gap-3 mx-auto rounded-lg p-3"
        style={{ backgroundColor: 'white', borderWidth: 1, borderColor: isSuccess ? '#84C953' : '#FF0000', width: '80%', boxShadow: isSuccess ? '0px 4px 10px 0px rgba(7, 170, 48, 0.25)' : '0px 4px 10px 0px rgba(239, 68, 68, 0.25)'}}
      >





        <CheckIcon /><Text className={`text-sm ${isSuccess ? 'text-[#018221]' : 'text-red-500'}`}>{message}</Text>
      </View>
    </Animated.View>
  );
};

export default SuccessAnimation;