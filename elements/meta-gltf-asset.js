import { Group } from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { ThreeElement } from "../ThreeElement.js"
import { registerThreeElement } from "../util/registerElement.js"
const loader = new GLTFLoader()

export class ThreeGLTFAsset extends ThreeElement.for(Group) {
  static exposedProperties = [...ThreeElement.exposedProperties, "url"]
  /**
   * Has the GLTF been loaded?
   */
  loaded = false
  /**
   * URL of the GLTF to load.
   */
  get url() {
    return this._url
  }
  set url(url) {
    /* Only act if the URL has changed. */
    if (url != this._url) {
      this._url = url
      /* Clear this group */
      this.object?.clear()
      this.loaded = false
      if (url) {
        loader.load(url, (gltf) => {
          this.loaded = true
          this.dispatchEvent(new Event("loaded", { bubbles: false, cancelable: false }))
          this.setupGLTF(gltf)
        })
      }
    }
  }
  /** @type {string} */
  _url
  /**
   * @param { GLTF} gltf
   */
  setupGLTF(gltf) {
    /* Create a copy of the GLTF just for this element */
    const scene = gltf.scene.clone(true)
    /* Apply shadows and layer settings */
    scene.traverse((node) => {
      node.layers.mask = this.object.layers.mask
      node.castShadow = this.object.castShadow
      node.receiveShadow = this.object.receiveShadow
    })
    /* Add the GLTF to our local group */
    this.object.add(scene)
    /* And make sure a frame will be rendered */
    this.meta.requestFrame()
  }
}
registerThreeElement("meta-gltf-asset", "GLTFAsset", ThreeGLTFAsset)
