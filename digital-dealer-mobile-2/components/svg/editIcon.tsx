import React from "react";
import Svg, { Path } from "react-native-svg";

interface EditIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const EditIcon: React.FC<EditIconProps> = ({
  width = 16,
  height = 16,
  stroke = "#BECAD6",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.36887 2.26258H3.38833C2.06929 2.26258 1 3.33184 1 4.65084V12.6117C1 13.9307 2.06929 15 3.38833 15H11.3494C12.6685 15 13.7377 13.9307 13.7377 12.6117L13.7377 8.63129M4.98055 11.0195L7.87705 10.4359C8.03081 10.4049 8.172 10.3292 8.28288 10.2183L14.767 3.73081C15.0779 3.41978 15.0776 2.9156 14.7665 2.60482L13.3929 1.23285C13.0819 0.922199 12.578 0.922411 12.2672 1.23332L5.78247 7.72144C5.6718 7.83217 5.59623 7.97306 5.56522 8.12651L4.98055 11.0195Z"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default EditIcon;