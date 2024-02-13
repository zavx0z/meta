import universeModel from "../models/universeModel"
import atomStore from "./atomStore"
import supervisorStore from "./supervisorStore"
import {addMiddleware} from "mobx-state-tree"

import bigBoomAction from "../actions/bigBoomAction"
import {setExpand, updatePositionsAction} from "../actions/universeActions"

const {atoms, maxLevel} = bigBoomAction(atomStore)
const universeStore = universeModel.create({
    supervisor: supervisorStore,
    worlds: atomStore,
    atoms: atoms,
    maxLevel: maxLevel,
})
addMiddleware(atomStore, (call, next) => {
    const worldFullHeight = (world) => {
        const {position, size, child} = world
        if (child.length) {
            const extremePointUp = position.y + size / 2
            const fastAtom = child[child.length - 1]
            const extremePointDown = Math.abs(fastAtom.position.y) + fastAtom.size / 2
            return extremePointUp + extremePointDown
        } else return size
    }
    const worldCenterWithChild = (world, fullHeight) => {
        const {position, size} = world
        const extremePointUp = Math.abs(position.y) - size / 2
        return extremePointUp + fullHeight / 2
    }
    const {name, args, context} = call
    switch (name) {
        case 'setActive':
            const active = args[0]
            if (active) {
                const camera = args[1]
                setExpand(context)
                updatePositionsAction()
                const {child, size} = context
                const fullHeight = worldFullHeight(context)
                const visibleWidth = fullHeight * camera.aspect
                const x = child.length ? (size * 0.5) - (visibleWidth * 0.5) : 0
                const y = -worldCenterWithChild(context, fullHeight)
                const z = supervisorStore.computeDepth(camera.fov, fullHeight) + size * 0.5
                supervisorStore.setPosition(x, y, z)
            } else {
                context['child'].forEach(world => world.setExpanded(false))
            }
            break
        default:
            break
    }

    return next(call)
})
export default universeStore