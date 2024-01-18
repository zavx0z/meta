import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js"
import { MetaElement } from "../MetaElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class ThreeRectAreaLightHelper extends MetaElement.for(RectAreaLightHelper) {}
registerThreeElement("meta-rect-area-light-helper", "RectAreaLightHelper", ThreeRectAreaLightHelper)
