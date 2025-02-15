import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SwitchIcon = (props: any) => (
    <Svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        {...props}
    >
        <Path
            d="M1.33331 8H14.6666M14.6666 8L11.3333 4.66667M14.6666 8L11.3333 11.3333"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default SwitchIcon; 