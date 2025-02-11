import React from "react";
import Svg, { Path } from "react-native-svg";

interface ProfileIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  width = 17,
  height = 18,
  stroke = "#9EA5AD",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 17 18" fill="none">
      <Path
        d="M2.29297 14.1296C3.2318 12.5637 5.28942 11.4919 8.49958 11.4919C11.7097 11.4919 13.7674 12.5637 14.7062 14.1296M11.0496 6.05464C11.0496 7.46297 9.90791 8.60464 8.49958 8.60464C7.09125 8.60464 5.94958 7.46297 5.94958 6.05464C5.94958 4.64631 7.09125 3.50464 8.49958 3.50464C9.90791 3.50464 11.0496 4.64631 11.0496 6.05464Z"
        stroke={stroke}
        strokeWidth="1.41667"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default ProfileIcon;
