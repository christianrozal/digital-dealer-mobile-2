import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface RadioProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

const Radio: React.FC<RadioProps> = ({ 
  checked, 
  onPress, 
  size = 20 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`justify-center items-center rounded-full border ${checked ? 'border-color1' : 'border-color4'}`}
      style={{ width: size, height: size }}
    >
      {checked && (
        <View 
          className="bg-color1 rounded-full"
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      )}
    </TouchableOpacity>
  );
};

export default Radio; 