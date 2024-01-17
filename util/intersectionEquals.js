import { Intersection } from "three"
/**
 *
 * @param {Intersection} a
 * @param {Intersection} b
 * @returns
 */
export const intersectionEquals = (a, b) => a.object === b.object && a.instanceId === b.instanceId
