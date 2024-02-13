import {Text} from "@react-three/drei"
import SourceCodePro from "../theme/fonts/Roboto-Regular.ttf"
import React from "react"

export default ({size, meshScale, meshPosition}) => {
    return <>
        <Text
            castShadow
            position={[0, 0, size / 2 * 1.2]}
            color={"#b6ccde"}
            font={SourceCodePro}
        >
            {size.toFixed(2).toString()}
        </Text>
        <Text
            anchorX={'left'}
            textAlign={'left'}
            anchorY={"middle"}
            position={[size / 2 + 0.2, size / 4, 0]}
            font={SourceCodePro}
            color={"#b7b7b7"}
        >
            s: {meshScale}
        </Text>
        <Text
            anchorX={'left'}
            textAlign={'left'}
            anchorY={"middle"}
            position={[size / 2 + 0.2, -size / 4, 0]}
            color={"#b7b7b7"}
            font={SourceCodePro}
        >
            Y: {meshPosition.y.toFixed(4).toString()}
        </Text>
    </>
}
