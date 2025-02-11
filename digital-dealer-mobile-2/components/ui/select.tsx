  import React from 'react';
  import { View, Text, TouchableOpacity, FlatList } from 'react-native';
  import ChevronDownIcon from '@/components/svg/chevronDown';

  interface Option {
    id: string;
    label: string;
  }

  interface Props {
    label?: string;
    placeholder?: string;
    value: Option | null;
    options: Option[];
    isOpen: boolean;
    onPress: () => void;
    onSelect: (option: Option) => void;
    error?: string;
    maxHeight?: number;
  }

  const Select: React.FC<Props> = ({
    label,
    placeholder = "Select an option",
    value,
    options,
    isOpen,
    onPress,
    onSelect,
    error,
    maxHeight = 112
  }) => {
    const renderItem = ({ item: option }: { item: Option }) => (
      <TouchableOpacity
        key={option.id}
        className={`px-5 py-2 ${value?.id === option.id ? "bg-color3" : "bg-white"}`}
        onPress={() => onSelect(option)}
      >
        <Text className={`text-sm ${value?.id === option.id ? "text-black" : "text-gray-700"}`}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
        )}
        
        <View className="relative z-20">
          <TouchableOpacity
            className={`border  rounded-md px-5 py-2 flex-row items-center justify-between bg-[#FAFAFA] ${error ? "border-red-500" : ""} ${isOpen ? "border-color1" : "border-gray-200"}`}
            onPress={onPress}
          >
            <Text className={`text-sm ${value ? "text-black" : "text-gray-400"}`}>
              {value?.label || placeholder}
            </Text>
            <View
              className="transition-transform duration-300"
              style={{
                transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
              }}
            >
              <ChevronDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>

          {isOpen && options.length > 0 && (
            <View 
              className="mt-1 bg-white border border-gray-200 rounded-md absolute w-full"
              style={{
                top: "100%",
                maxHeight,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                zIndex: 1000
              }}
            >
              <FlatList
                data={options}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}
        </View>

        {error && (
          <Text className="text-red-500 text-[10px] mt-1">{error}</Text>
        )}
      </View>
    );
  };

  export default Select; 