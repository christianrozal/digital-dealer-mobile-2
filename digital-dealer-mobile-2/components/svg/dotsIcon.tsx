import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface DotsIconProps {
    width?: number;
    height?: number;
    fill?: string;
    style?: any;
}

const DotsIcon = ({ width = 21, height = 22, fill = "#9EA5AD", style }: DotsIconProps) => {
    return (
        <Svg width={width} height={height} viewBox="0 0 21 22" fill="none" style={style}>
            <Circle 
                cx="6.60815" 
                cy="10.5622" 
                r="1.41772" 
                transform="rotate(-90 6.60815 10.5622)" 
                fill={fill}
            />
            <Circle 
                cx="10.8552" 
                cy="10.5622" 
                r="1.41772" 
                transform="rotate(-90 10.8552 10.5622)" 
                fill={fill}
            />
            <Circle 
                cx="15.1013" 
                cy="10.5622" 
                r="1.41772" 
                transform="rotate(-90 15.1013 10.5622)" 
                fill={fill}
            />
        </Svg>
    );
};

export default DotsIcon;
