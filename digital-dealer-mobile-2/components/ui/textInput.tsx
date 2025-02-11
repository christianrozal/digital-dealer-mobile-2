import React from 'react';
import { TextInput as RNTextInput, View, Text, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  error?: string;
  label?: string;
}

const TextInput: React.FC<Props> = ({ error, label, ...props }) => {
  return (
    <View className="w-full rounded-md">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}

      <RNTextInput
        className={`placeholder:text-color2 py-3 border border-color4 rounded-md  px-4 w-full focus:outline-color1 ${
          error ? "border-red-500" : ""
        }`}
        placeholderTextColor="#6B6B6B"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-[10px] mt-1">{error}</Text>
      )}
    </View>
  );
};

export default TextInput; 