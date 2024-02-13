import universeStore from "../stores/universeStore"
import {getParent} from "mobx-state-tree"


let fastElement = null
const _expand = (world, parentPosition) => {
    const {space} = universeStore
    if (world.expanded) {
        const y = fastElement.position.y - fastElement.size / 2 - world.size / 2
        world.setPosition(0, y - space, 0)
        fastElement = world
    } else world.setPosition(parentPosition.x, parentPosition.y, parentPosition.z)

    world.child.forEach(child => _expand(child, world.position))
}

export const updatePositionsAction = () => {
    const {worlds} = universeStore
    worlds.setPosition(0, 0, 0)
    fastElement = worlds
    worlds.child.forEach(world => _expand(world, worlds.position))
}

const expandParent = (world) => {
    if (world.level === 1) {
        world.setExpanded(true)
    } else {
        const parent = getParent(world, 2)
        parent.child.forEach(item => item.setExpanded(true))
        expandParent(parent)
    }
}
export const setExpand = (world) => {
    expandParent(world)
    world.child.forEach(world => world.setExpanded(true))
}