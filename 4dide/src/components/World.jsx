import React, {useEffect} from "react"
import {observer} from "mobx-react"
import {invalidate, useThree} from "react-three-fiber"

const World = ({atom}) => {
    const {camera} = useThree()
    useEffect(() => {
        if (atom.ready) {
            atom.setActive(true, camera)
            invalidate()
        }
        return () => atom.setActive(false)
    }, [atom, atom.ready, camera])

    return <></>
}
export default observer(World)

