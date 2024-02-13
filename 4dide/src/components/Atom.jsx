import React, {useRef} from "react"
import ItemName from "./Name"
import {observer} from "mobx-react"
import {useFrame} from "react-three-fiber"
import {useNavigate} from "react-router-dom"
import {move} from "../actions/atomActions"
import {getRoot} from "mobx-state-tree"

const AtomMesh = ({world}) => {
    const {animated, getVisibleWidth, computeDepth} = getRoot(world).supervisor
    const nav = useNavigate()
    const atom = useRef()
    useFrame(() => move(atom.current, world.position))
    const handleClick = (e) => {
        e.stopPropagation()
        world.active && world.level > 1 ? nav(-1) : nav(process.env.REACT_APP_BASE_PATH + '/' + world.path)
    }
    return <>
        <mesh
            ref={atom}
            receiveShadow
            castShadow
            onPointerOver={(e) => world.setHover(e, true)}
            onPointerOut={(e) => world.setHover(e, false)}
            onClick={handleClick}

        >
            <icosahedronBufferGeometry args={[world.sizeGeometry / 2, world.detail]}/>
            <meshLambertMaterial
                emissive={world.color}
                opacity={world.hover ? 0.4 : 0.98}
                transparent={true}
                wireframe
                emissiveIntensity={1}
            />
            {world.titleVisible &&
            <ItemName
                world={world}
                hover={world.hover}
                scale={world.titleScale}
                position={world.titlePosition}
                title={world.title}
                readyTransform={!animated}
                getVisibleWidth={getVisibleWidth}
                computeDepth={computeDepth}
            />}
        </mesh>
    </>
}
export const Atom = observer(AtomMesh)