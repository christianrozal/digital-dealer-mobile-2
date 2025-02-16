import * as React from "react";
import Svg, { Path, Rect, G, Defs, ClipPath } from "react-native-svg";

const ShareFacebook = () => (
    <Svg width={42} height={41} viewBox="0 0 42 41" fill="none">
        <Rect x={1.09432} y={0.512289} width={39.8104} height={39.8104} rx={19.9052} fill="#F4F8FC"/>
        <Rect x={1.09432} y={0.512289} width={39.8104} height={39.8104} rx={19.9052} stroke="#BECAD6" strokeWidth={0.790204}/>
        <G clipPath="url(#clip0_516_3146)">
            <Path d="M24.4092 21.2859L24.8159 18.6076H22.2715V16.8703C22.2715 16.1374 22.6263 15.4226 23.7659 15.4226H24.9235V13.1424C24.9235 13.1424 23.8734 12.9614 22.87 12.9614C20.7736 12.9614 19.4046 14.2445 19.4046 16.5663V18.6076H17.0752V21.2859H19.4046V27.7609C19.8723 27.8351 20.3507 27.8731 20.8381 27.8731C21.3254 27.8731 21.8039 27.8351 22.2715 27.7609V21.2859H24.4092Z" fill="#3D12FA"/>
        </G>
        <Defs>
            <ClipPath id="clip0_516_3146">
                <Rect width={15.6965} height={15.6965} fill="white" transform="translate(13.1514 12.5693)"/>
            </ClipPath>
        </Defs>
    </Svg>
);

export default ShareFacebook;
