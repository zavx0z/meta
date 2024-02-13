import {getParent, types} from "mobx-state-tree"

const title = types
    .model({})
    .views(self => ({
        get titleScale() {
            const {size} = self
            const scale = size * 2
            return [scale, scale, scale]
        },
        get titlePosition() {
            const {size} = self
            return [-(size / 2) - 0.04, (size / 2), size / 2]
        },
        get titleVisible() {
            const {level, active} = self
            if (level === 1) {
                return active
            } else {
                const parent = getParent(self, 2)
                return parent.active || active
            }
        },
    }))
export default title