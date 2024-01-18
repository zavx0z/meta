import * as THREE from "three"
import { MetaElement } from "../MetaElement.js"
import { dasherize } from "./dasherize.js"
import { registerThreeElement } from "./registerElement.js"
/**
 * For everything else inside THREE.* that can be constructed, automatically generate a custom element.
 */
export const defineThreeElements = () => {
  for (const threeProp of Object.getOwnPropertyNames(THREE)) {
    const threeClass = THREE[threeProp]
    const tagName = `meta-${dasherize(threeProp)}`
    if (typeof threeClass === "function" && "prototype" in threeClass)
      registerThreeElement(tagName, threeProp, MetaElement.for(threeClass))
  }
}
