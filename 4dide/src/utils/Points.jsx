import {useUpdate} from "react-three-fiber"
import {Vector3} from "three"

export default () => {
    const ref = useUpdate(geometry => {
        geometry.vertices.push(new Vector3(0, 0, 0))

        geometry.vertices.push(new Vector3(0, 1, 0))
        geometry.vertices.push(new Vector3(0, 2, 0))
        geometry.vertices.push(new Vector3(0, 3, 0))

        geometry.vertices.push(new Vector3(1, 0, 0))
        geometry.vertices.push(new Vector3(2, 0, 0))
        geometry.vertices.push(new Vector3(3, 0, 0))
    }, [])
    return <points>
        <geometry attach="geometry" ref={ref} args={[1, -1, 1]}/>
        <pointsMaterial color={"#fff"} size={4} sizeAttenuation={false}/>
    </points>
}
