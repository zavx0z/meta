import React from 'react'
import {inject, observer} from 'mobx-react'
import {supervisorMove} from "./actions/supervisorActions"
import {useFrame, useThree, useUpdate} from "react-three-fiber"

const Supervisor = ({children, universe: {supervisor}}) => {
    const {setDefaultCamera} = useThree()

    const ref = useUpdate((camera) => setDefaultCamera(camera), [])
    useFrame(() => {
        supervisorMove(ref.current, supervisor.position,
            () => !supervisor.animated && supervisor.setAnimate(true),
            () => supervisor.animated && supervisor.setAnimate(false))
    })
    return <>
        <perspectiveCamera ref={ref} position={[0, 0, 10]}/>
        {children}
    </>
}

export default inject('universe')(observer(Supervisor))
