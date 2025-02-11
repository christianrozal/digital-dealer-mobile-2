import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface EditIcon2Props {
    width?: number;
    height?: number;
    stroke?: string;
    style?: any;
}

const EditIcon2 = ({ width = 9, height = 10, stroke = "#9EA5AD", style }: EditIcon2Props) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 9 10" fill="none" style={style}>
            <Path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M6.16201 1.07337C6.35718 0.87809 6.67368 0.877957 6.86901 1.07307L8.04572 2.24845C8.24113 2.44364 8.24127 2.7603 8.04602 2.95566L3.06711 7.9373C2.99747 8.00698 2.90879 8.05453 2.81222 8.07399L0.599609 8.51982L1.04623 6.30984C1.06571 6.21346 1.11317 6.12497 1.18268 6.05543L6.16201 1.07337Z" 
                stroke={stroke} 
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default EditIcon2;
