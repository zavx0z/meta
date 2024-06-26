import { Texture, TextureLoader } from "three"
import { MetaElement } from "../MetaElement.js"
import { registerThreeElement } from "../util/registerElement.js"

export class ThreeTexture extends MetaElement.for(Texture) {
  static exposedProperties = [...MetaElement.exposedProperties, "url"]
  /** @type {string} */
  _url
  get url() {
    return this._url
  }
  set url(url) {
    /* If the URL has changed, initiate loading of texture. */
    if (this._url !== url) {
      /* Dispose any existing texture */
      this.object?.dispose()
      /* Set up a new texture object */
      if (url) this.object = new TextureLoader().load(url)
      else this.object = new Texture()
    }
    this._url = url
  }
}
registerThreeElement("meta-texture", "Texture", ThreeTexture)
