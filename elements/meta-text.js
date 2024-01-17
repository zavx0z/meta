import { ThreeElement as MetaElement } from "../ThreeElement.js"
import { registerElement } from "../util/registerElement.js"
import { Text } from "troika-three-text"

export class MetaText extends MetaElement.for(Text) {}

registerElement("meta-text", MetaText)
