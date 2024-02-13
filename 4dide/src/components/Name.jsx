import React, {useState} from "react"
import {Text} from "@react-three/drei"
import SourceCodePro from "../theme/fonts/Roboto-Regular.ttf"
import {useThree, useUpdate} from "react-three-fiber"

export default ({hover, readyTransform, world, position, scale, title, getVisibleWidth}) => {
    const {camera} = useThree()
    const [sync, setSync] = useState(null)
    const ref = useUpdate(text => {
        if (sync && readyTransform) {
            text.scale.x !== scale[0] && text.scale.fromArray(scale)

            text.geometry.computeBoundingBox()
            const {max, min} = text.geometry.boundingBox
            const width = max.x - min.x
            const fullWidth = getVisibleWidth(camera, world.size / 2)
            let busy = world.active ? world.size : world.size * 2 - (world.size * 1.5)
            busy += 0.04
            const emptyWidth = fullWidth - busy

            // console.log(text.text, width, emptyWidth, busy)
            if (emptyWidth - width < 0) {
                if (title.split(' ').length > 1) {
                    text.maxWidth = emptyWidth
                } else {
                    const k = emptyWidth / width
                    text.scale.x = k
                    text.scale.y = k
                    text.scale.z = k
                }
            }
        }
    }, [readyTransform])
    return <>
        <Text
            ref={ref}
            anchorX={'right'}
            textAlign={'right'}
            anchorY={"top"}
            position={position}
            scale={scale}
            color={hover ? "#6476ec" : "#949494"}
            font={SourceCodePro}
            // maxWidth={1}
            onSync={setSync}
        >
            {title}
        </Text>
    </>
}