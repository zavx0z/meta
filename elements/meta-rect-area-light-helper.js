import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js"
import { ThreeElement } from "../ThreeElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class ThreeRectAreaLightHelper extends ThreeElement.for(RectAreaLightHelper) {}
registerThreeElement("meta-rect-area-light-helper", "RectAreaLightHelper", ThreeRectAreaLightHelper)
