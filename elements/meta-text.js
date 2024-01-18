import { ThreeElement as MetaElement } from "../ThreeElement.js"
import { registerElement } from "../util/registerElement.js"
import { Text } from "troika-three-text"

export class MetaText extends MetaElement.for(Text) {
  synccomplete = () => {
    this.meta.requestFrame()
  }
  mountedCallback() {
    super.mountedCallback()
    this.object.addEventListener("synccomplete", this.synccomplete)
  }
  removedCallback() {
    this.object.removeEventListener("synccomplete", this.synccomplete)
    super.removedCallback()
  }
}

registerElement("meta-text", MetaText)
