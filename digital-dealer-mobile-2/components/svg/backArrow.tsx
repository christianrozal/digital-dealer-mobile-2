import React from "react";
import Svg, { Path } from "react-native-svg";

interface BackArrowIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const BackArrowIcon: React.FC<BackArrowIconProps> = ({
  width = 18,
  height = 16,
  fill = "#B5B5B5",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 16" fill="none">
      <Path
        d="M1.04314 7.29289C0.652613 7.68342 0.652613 8.31658 1.04314 8.70711L7.4071 15.0711C7.79762 15.4616 8.43079 15.4616 8.82131 15.0711C9.21184 14.6805 9.21184 14.0474 8.82131 13.6569L3.16446 8L8.82131 2.34315C9.21184 1.95262 9.21184 1.31946 8.82131 0.928933C8.43079 0.538409 7.79762 0.538409 7.4071 0.928933L1.04314 7.29289ZM17.9834 7L1.75024 7L1.75024 9L17.9834 9L17.9834 7Z"
        fill={fill}
      />
    </Svg>
  );
};

export default BackArrowIcon;
