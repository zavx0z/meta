import {getPath} from "mobx-state-tree"

const normalizePath = (name) => name.toLowerCase().replace(/ /g, '_').replace(/\//g, '-')
let atoms = []
let maxLevel = 0

const createWorld = (world, parentLevel, localCount, parentPath) => {
    const path = typeof parentPath === "undefined" ? '/' : parentPath === '/' ? encodeURIComponent(normalizePath(world.name)) : parentPath + '/' + encodeURIComponent(normalizePath(world.name))
    const level = typeof parentPath === "undefined" ? 1 : parentLevel
    const local = typeof localCount === "undefined" ? 1 : localCount

    atoms.push(getPath(world))
    level > maxLevel && (maxLevel = level)

    world.setLevel(level)
    world.setLocal(local)
    world.setPath(path)

    if (world.child.length) {
        let childLocal = 0
        world.child.forEach(item => {
            childLocal += 1
            const itemLevel = level + 1
            let selfLocal = childLocal
            createWorld(item, itemLevel, selfLocal, path)
        })
    }
}
const bigBoomAction = atomStore => {
    createWorld(atomStore)
    return {atoms: atoms, maxLevel: maxLevel}
}
export default bigBoomAction