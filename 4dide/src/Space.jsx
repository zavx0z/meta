import React from 'react'
import {Provider} from "mobx-react"
import {Canvas} from "react-three-fiber"
import universeStore from "./stores/universeStore"
import {BrowserRouter as Router} from "react-router-dom"
import {Stars} from "@react-three/drei"

const styles = {height: "100vh", backgroundColor: "black"}

export const Space = ({children}) => {
    return <>
        <Canvas
            style={styles}
            shadowMap
            invalidateFrameloop={true}
            onCreated={() => universeStore.toggleReady()}
        >
            <Stars radius={100} factor={2} fade/>
            <Router>
                <Provider universe={universeStore}>
                    {children}
                </Provider>
            </Router>
        </Canvas>
    </>
}