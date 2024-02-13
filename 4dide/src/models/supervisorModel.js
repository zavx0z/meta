import {getRoot, types} from "mobx-state-tree"
import {MathUtils, Vector3} from "three"

export default types
    .model({})
    .volatile(self => ({
        position: new Vector3(0, 0, 10),
        animated: false
    }))
    .actions(self => ({
        setAnimate(bool) {
            self.animated = bool
        },
        setPosition(x, y, z) {
            self.position = new Vector3(x, y, z)
        },
        getVisibleHeight(camera, depth) {
            const cameraOffset = camera.position.z
            if (depth < cameraOffset) depth -= cameraOffset
            else depth += cameraOffset
            const vFOV = MathUtils.degToRad(camera.fov)
            return 2 * Math.tan(vFOV * 0.5) * Math.abs(depth)
        },
        getVisibleWidth(camera, depth) {
            return this.getVisibleHeight(camera, depth) * camera.aspect
        },
        computeDepth(fov, size) {
            return size / 2 / Math.tan(MathUtils.degToRad(fov) * 0.5)
        }
    }))
    .views(self => ({
        get ready() {
            return getRoot(self).ready
        }
    }))