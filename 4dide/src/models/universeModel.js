import worldModel from "./worldModel"
import {getRelativePath, resolvePath, types} from "mobx-state-tree"
import supervisorModel from "./supervisorModel"

const universeModel = types
    .model({
        worlds: worldModel,
        atoms: types.array(types.string),
        supervisor: supervisorModel,
        maxLevel: 0,
        space: 0.04
    })
    .volatile(self => ({
        expanded: false,
        ready: false,
    }))
    .actions(self => ({
        toggleReady() {
            console.log('ready')
            self.ready = true
        },
        extract(atomPath) {
            return resolvePath(self['worlds'], atomPath)
        },
        getFastAtom(path) {
            const {atoms} = self
            const idx = atoms.indexOf(path)
            const pathUp = atoms[idx - 1]
            return this.extract(pathUp)
        },
        getPath(atom) {
            return getRelativePath(self['worlds'], atom)
        },
    }))
    .views(self => ({
    }))
export default universeModel