import { Intersection } from "three"
import { intersectionEquals } from "./intersectionEquals"

/**
 *
 * @param {Intersection} intersection
 * @param {Intersection[]} list
 * @returns
 */
export const intersectionInList = (intersection, list) => list.find((i) => intersectionEquals(i, intersection))
