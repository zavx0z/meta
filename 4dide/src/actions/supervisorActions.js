import {invalidate} from "react-three-fiber"

export const supervisorMove = (supervisor, position, onStart, onStop) => {
    if (supervisor.position.distanceToSquared(position) > 0.0001) {
        onStart()
        supervisor.lookAt(supervisor.position.lerp(position, 0.1))
        invalidate()
    } else onStop()
}
