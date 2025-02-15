import * as React from "react";
import Svg, { Path, G } from "react-native-svg";

const ShareCopy = () => (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
        <G opacity={0.4}>
            <Path 
                d="M12.1624 5.48291H6.52837C5.83691 5.48291 5.27637 6.08497 5.27637 6.82766V12.879C5.27637 13.6217 5.83691 14.2238 6.52837 14.2238H12.1624C12.8538 14.2238 13.4144 13.6217 13.4144 12.879V6.82766C13.4144 6.08497 12.8538 5.48291 12.1624 5.48291Z" 
                stroke="#222222" 
                strokeWidth={1.36682} 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <Path 
                d="M2.77253 9.51724H2.14653C1.81448 9.51724 1.49603 9.37556 1.26123 9.12337C1.02644 8.87118 0.894531 8.52914 0.894531 8.17249V2.12112C0.894531 1.76447 1.02644 1.42242 1.26123 1.17024C1.49603 0.918046 1.81448 0.776367 2.14653 0.776367H7.78053C8.11258 0.776367 8.43103 0.918046 8.66583 1.17024C8.90063 1.42242 9.03253 1.76447 9.03253 2.12112V2.79349" 
                stroke="#222222" 
                strokeWidth={1.36682} 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </G>
    </Svg>
);

export default ShareCopy;
