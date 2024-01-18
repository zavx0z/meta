import Stats from "three/addons/libs/stats.module.js"
import { MetaElement } from "../MetaElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class MetaStats extends MetaElement {
  #stats
  #update = () => this.#stats.update()
  mountedCallback() {
    const stats = new Stats()
    document.body.appendChild(stats.dom)
    this.#stats = stats
    this.meta.emitter.on("render-tick", this.#update)
  }
  removedCallback() {
    this.#stats.dom.remove()
    super.removedCallback()
    this.meta.emitter.off("render-tick", this.#update)
  }
}
registerThreeElement("meta-stats", "Stats", MetaStats)
