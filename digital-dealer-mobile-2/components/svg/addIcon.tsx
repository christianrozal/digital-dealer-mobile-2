import React from 'react';
import { Svg, Rect, Path, G, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend} from 'react-native-svg';


interface AddIconProps {
    size?: number;
    color?: string;
}

const AddIcon: React.FC<AddIconProps> = ({ size = 72, color = "#3D12FA"}) => {
     const scaledSize = size
    return (
        <Svg width={scaledSize} height={scaledSize - 1} viewBox="0 0 72 71" fill="none">
             <G filter="url(#filter0_d_510_3320)">
                <Rect x="10" y="6.06226" width="52" height="51.3799" rx="25.6899" fill={color} />
                    <Path d="M40.125 31.7515H36M36 31.7515H31.875M36 31.7515V35.8765M36 31.7515L36 27.6265M47 31.7522C47 37.8273 42.0751 42.7522 36 42.7522C29.9249 42.7522 25 37.8273 25 31.7522C25 25.6771 29.9249 20.7522 36 20.7522C42.0751 20.7522 47 25.6771 47 31.7522Z" stroke="white" strokeWidth="2.44444" strokeLinecap="round"/>
             </G>
             <Defs>
                <Filter id="filter0_d_510_3320" x="0.6" y="0.662256" width="70.8" height="70.1799" filterUnits="userSpaceOnUse">
                    <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <FeOffset dy="4"/>
                    <FeGaussianBlur stdDeviation="4.7"/>
                    <FeComposite in2="hardAlpha" operator="out"/>
                    <FeColorMatrix type="matrix" values="0 0 0 0 0.60293 0 0 0 0 0.60293 0 0 0 0 0.60293 0 0 0 0.25 0"/>
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_510_3320"/>
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_510_3320" result="shape"/>
               </Filter>
           </Defs>
       </Svg>
    );
};

export default AddIcon;