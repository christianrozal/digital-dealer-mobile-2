import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface UploadIconProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  style?: any;
}

const UploadIcon: React.FC<UploadIconProps> = ({
  width = 52,
  height = 53,
  backgroundColor = "white",
  borderColor = "#BECAD6",
  iconColor = "#3D12FA",
  style
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 52 53" 
      fill="none" 
      style={style}
    >
      <Rect
        x={0.5}
        y={1.43774}
        width={51}
        height={50.3799}
        rx={25.1899}
        fill={backgroundColor}
      />
      <Rect
        x={0.5}
        y={1.43774}
        width={51}
        height={50.3799}
        rx={25.1899}
        stroke={borderColor}
      />
      <Path
        d="M18 29.8321V33.5202C18 34.0791 18.2107 34.6152 18.5858 35.0104C18.9609 35.4056 19.4696 35.6277 20 35.6277H32C32.5304 35.6277 33.0391 35.4056 33.4142 35.0104C33.7893 34.6152 34 34.0791 34 33.5202V29.8321M26.0007 29.5702L26.0007 17.6277M26.0007 17.6277L21.4293 22.1909M26.0007 17.6277L30.5722 22.1909"
        stroke={iconColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default UploadIcon;
