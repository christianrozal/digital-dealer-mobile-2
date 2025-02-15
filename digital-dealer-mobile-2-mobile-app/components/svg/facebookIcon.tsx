import React from "react";
import Svg, { Rect, Path, G, ClipPath, Defs } from "react-native-svg";

interface FacebookIconProps {
  width?: number;
  height?: number;
  bgColor?: string;
  fgColor?: string;
}

const FacebookIcon: React.FC<FacebookIconProps> = ({
  width = 26,
  height = 26,
  bgColor = "#3D12FA",
  fgColor = "white",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 26 26" fill="none">
      <Rect
        x="0.530273"
        y="-0.00927734"
        width="25.1541"
        height="25.1541"
        rx="12.5771"
        fill={bgColor}
      />
      <G clipPath="url(#clip0)">
        <Path
          d="M15.7408 12.5597L16.0565 10.4814H14.082V9.13331C14.082 8.56458 14.3574 8.0099 15.2417 8.0099H16.1399V6.24052C16.1399 6.24052 15.3251 6.1001 14.5464 6.1001C12.9196 6.1001 11.8574 7.09572 11.8574 8.89739V10.4814H10.0498V12.5597H11.8574V17.5842C12.2203 17.6417 12.5915 17.6712 12.9697 17.6712C13.3479 17.6712 13.7191 17.6417 14.082 17.5842V12.5597H15.7408Z"
          fill={fgColor}
        />
      </G>
      <Defs>
        <ClipPath id="clip0">
          <Rect
            width="12.1801"
            height="12.1801"
            fill="white"
            transform="translate(7.00488 5.79565)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default FacebookIcon;
