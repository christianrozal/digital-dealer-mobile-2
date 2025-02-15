import React from "react";
import { SVGProps } from 'react';

interface FilterIconProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  stroke?: string;
  showCircle?: boolean;
}

const FilterIcon: React.FC<FilterIconProps> = ({
  width = 22,
  height = 22,
  stroke = "black",
  showCircle = false,
  ...props
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 22 22" fill="none" {...props}>
      <path
        d="M5.79592 11.1827H15.7145M3.5918 6.70557H17.9186M9.10211 15.6598H12.4083"
        stroke={stroke}
        strokeWidth="1.79085"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showCircle && (
        <circle
          cx="16.978"
          cy="6.70557"
          r="3.42432"
          fill="#3D12FA"
          stroke="white"
        />
      )}
    </svg>
  );
};

export default FilterIcon;