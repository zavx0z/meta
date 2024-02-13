
export const move = (atom, position) => {
    // if (atom.position.distanceToSquared(position) > 0.0001) {
        atom.position.lerp(position, 0.1)
    // }
}
