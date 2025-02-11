import React from 'react';
import { Svg, Path, SvgProps } from 'react-native-svg';

interface AlexiumLogoIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const AlexiumLogoIcon: React.FC<AlexiumLogoIconProps> = ({
  size = 116,
  color,
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 116 116"
      fill="none"
      {...props}
    >
      <Path
        d="M0.205078 50.2536C0.205078 9.05613 9.03489 0.226318 50.2324 0.226318H65.7676C106.965 0.226318 115.795 9.05613 115.795 50.2536V65.7889C115.795 106.986 106.965 115.816 65.7676 115.816H50.2324C9.03489 115.816 0.205078 106.986 0.205078 65.7889V50.2536Z"
        fill={color || "#3D12FA"} // Use prop color or default color
      />
      <Path
        d="M44.5791 57.0021C42.7382 56.9991 41.5883 55.0043 42.5061 53.4061L50.5408 39.4147C55.0492 31.5639 66.3555 31.5546 70.8767 39.3979C75.398 47.2412 69.7368 57.0435 60.6943 57.0287L44.5791 57.0021Z"
        fill="white"
      />
      <Path
        d="M73.2239 50.934C74.1461 49.3343 76.4515 49.3343 77.3737 50.934L85.4384 64.9244C89.9448 72.7421 84.3117 82.5142 75.2988 82.5142C66.2859 82.5142 60.6528 72.7421 65.1592 64.9244L73.2239 50.934Z"
        fill="white"
      />
      <Path
        d="M63.9543 62.6674C64.8764 61.0676 63.7237 59.0679 61.8794 59.0679H45.75C36.7371 59.0679 31.104 68.84 35.6105 76.6577C40.1169 84.4754 51.3831 84.4754 55.8896 76.6577L63.9543 62.6674Z"
        fill="white"
      />
    </Svg>
  );
};

export default AlexiumLogoIcon;