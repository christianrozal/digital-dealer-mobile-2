import React from "react";
import Svg, { Path } from "react-native-svg";

interface CustomersIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const CustomersIcon: React.FC<CustomersIconProps> = ({
  width = 25,
  height = 25,
  stroke = "#BECAD6",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M2.58984 18.7321C3.68849 16.8996 6.09635 15.6454 9.85296 15.6454C13.6096 15.6454 16.0174 16.8996 17.1161 18.7321M17.8111 14.2558C19.8005 15.2505 20.7952 16.2452 21.7898 18.2346M15.7421 6.65286C16.6781 7.15641 17.3145 8.14517 17.3145 9.28256C17.3145 10.3871 16.7144 11.3515 15.8224 11.8674M12.837 9.28253C12.837 10.9306 11.501 12.2666 9.85296 12.2666C8.2049 12.2666 6.86889 10.9306 6.86889 9.28253C6.86889 7.63447 8.2049 6.29846 9.85296 6.29846C11.501 6.29846 12.837 7.63447 12.837 9.28253Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default CustomersIcon;
