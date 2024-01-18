import { Camera, Color, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { PointerEvents } from "../PointerEvents.js"
import { MetaElement } from "../MetaElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class MetaScene extends MetaElement.for(Scene) {
  static exposedProperties = [...MetaElement.exposedProperties, "backgroundColor", "camera"]
  /** @param {string} v - background color value */
  set backgroundColor(v) {
    this.object.background = new Color(v)
  }
  /** @type {Camera} current camera that is being used to render the scene */
  _camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  get camera() {
    return this._camera
  }
  set camera(camera) {
    if (camera instanceof Camera) {
      this._camera = camera
      this.handleWindowResize()
    } else this.error("Can't accept this as a camera:", camera)
  }
  /** @type {PointerEvents} pointer events system */
  pointer
  constructor() {
    super()
    this.camera.position.z = 10
    this.camera.lookAt(0, 0, 0)
  }
  mountedCallback() {
    super.mountedCallback()
    /* Set up event processor */
    this.pointer = new PointerEvents(this)
    /* Handle window resizing */
    this.handleWindowResize = this.handleWindowResize.bind(this)
    window.addEventListener("resize", this.handleWindowResize)
    this.handleWindowResize()
    /* Set up rendering */
    this.render = this.render.bind(this)
    this.renderTick = this.render
    /* Start processing events */
    this.pointer.start()
  }
  render() {
    const { renderer } = this.meta
    if (renderer instanceof WebGLRenderer) renderer.clearDepth()
    renderer.render(this.object, this.camera)
  }
  disconnectedCallback() {
    /* Unregister event handlers */
    this.meta.emitter.off("rendertick", this.render)
    window.removeEventListener("resize", this.handleWindowResize)
    super.disconnectedCallback()
  }
  handleWindowResize() {
    /* Get width and height from our parent element */
    const el = this.meta
    const width = el.clientWidth
    const height = el.clientHeight
    const aspect = width / height
    /* Update camera */
    if (this._camera instanceof PerspectiveCamera) {
      this._camera.aspect = aspect
      this._camera.updateProjectionMatrix()
    } else if (this._camera instanceof OrthographicCamera) {
      /* We're going to assume that the vertical frustum represents our frustum size. */
      const frustumSize = this._camera.top - this._camera.bottom
      /* Adjust horizontal frustum */
      this._camera.left = (frustumSize * aspect) / -2
      this._camera.right = (frustumSize * aspect) / 2
      this._camera.updateProjectionMatrix()
    }
    /* No matter what, we want to request a frame to be rendered. */
    this.meta.requestFrame()
  }
}
registerThreeElement("meta-scene", "Scene", MetaScene)
