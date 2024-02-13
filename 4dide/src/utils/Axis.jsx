import React from 'react'
import {MathUtils} from "three"
import Points from "./Points"

export default (props) => {
    return <>
        <group name={'axis'}
               rotation={[0, 0, -MathUtils.degToRad(90)]}
        >
            <axesHelper args={[3]}/>
            <Points/>
        </group>
    </>
}