import React from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  checked, 
  onPress, 
  size = 20 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`justify-center items-center rounded-sm border ${checked ? 'border-color1 bg-color1' : 'border-color4'}`}
      style={{ width: size, height: size }}
    >
      {checked && (
        <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 6L9 17L4 12"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

export default Checkbox; 