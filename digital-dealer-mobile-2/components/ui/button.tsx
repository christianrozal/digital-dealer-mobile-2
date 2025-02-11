import React, { FC, ReactNode } from "react";
import { Text, TouchableOpacity, GestureResponderEvent, ActivityIndicator, View } from "react-native";

interface ButtonComponentProps {
  var2?: boolean;
  label: string;
  className?: string;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const ButtonComponent: FC<ButtonComponentProps> = ({
    var2 = false,
    label,
    className,
    onPress,
    disabled = false,
    loading = false,
    icon,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${className} ${
                var2 ? "bg-color3" : "bg-color1"
            } py-3 rounded-full justify-center items-center ${
                disabled ? "opacity-50" : "opacity-100"
            }`}
            disabled={disabled}
        >
            {loading ? (
              <View className="flex-row justify-center items-center gap-2">
                  <ActivityIndicator color={var2 ? '#3D12FA' : 'white'} />
                  <Text
                      className={`${
                          var2 ? "text-color1" : "text-white"
                      } text-center font-semibold`}
                  >
                      {label}
                    </Text>
              </View>
            ) : (
                <View className="flex-row justify-center items-center gap-2">
                    {icon}
                    <Text
                        className={`${
                            var2 ? "text-color1" : "text-white"
                        } text-center font-semibold`}
                    >
                        {label}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default ButtonComponent;