import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { ThreeElement } from "../ThreeElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class ThreeOrbitControls extends ThreeElement {
  createControls() {
    const previousTarget = this.object?.target
    this.object?.dispose()
    /* Create new controls */
    this.object = new OrbitControls(this.scene.camera, this.meta.renderer.domElement)
    if (previousTarget) this.object.target.copy(previousTarget)
    this.applyAllAttributes()
    this.object.addEventListener("change", () => {
      this.meta.requestFrame()
    })
  }
  mountedCallback() {
    let { camera } = this.scene
    this.createControls()
    this.tick = () => {
      /* Create a new controls instance if the camera changes */
      if (this.scene.camera !== camera) {
        this.createControls()
        camera = this.scene.camera
      }
      this.object.update()
    }
  }
  removedCallback() {
    this.object?.dispose()
    super.removedCallback()
  }
}
registerThreeElement("meta-orbit-controls", "OrbitControls", ThreeOrbitControls)
