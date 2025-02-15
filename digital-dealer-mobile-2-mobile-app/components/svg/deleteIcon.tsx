import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DeleteIconProps {
    width?: number;
    height?: number;
    stroke?: string;
    style?: any;
}

const DeleteIcon = ({ width = 13, height = 14, stroke = "#9EA5AD", style }: DeleteIconProps) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 13 14" fill="none" style={style}>
            <Path 
                d="M2.14746 3.93574H10.7373M4.83179 2.23041H8.05298M5.36865 9.6202V6.20953M7.51611 9.6202V6.20953M8.32141 11.894H4.56335C3.97035 11.894 3.48962 11.385 3.48962 10.7571L3.24449 4.52785C3.23178 4.20491 3.47562 3.93574 3.78089 3.93574H9.10387C9.40915 3.93574 9.65298 4.20491 9.64027 4.52785L9.39514 10.7571C9.39514 11.385 8.91442 11.894 8.32141 11.894Z" 
                stroke={stroke} 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default DeleteIcon;
