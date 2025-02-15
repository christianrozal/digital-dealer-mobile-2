import React from "react";
import Svg, { Path } from "react-native-svg";

interface SearchIconProps {
  width?: number;
  height?: number;
  stroke?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({
  width = 24,
  height = 24,
  stroke = "black",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.7474 15.333L16.9185 17.4333M16.2184 11.8325C16.2184 14.5391 14.0243 16.7332 11.3177 16.7332C8.6111 16.7332 6.41699 14.5391 6.41699 11.8325C6.41699 9.12597 8.6111 6.93185 11.3177 6.93185C14.0243 6.93185 16.2184 9.12597 16.2184 11.8325Z"
        stroke={stroke}
        strokeWidth="1.25018"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default SearchIcon;
