import * as THREE from "three"
import { BaseElement } from "./BaseElement.js"
import { applyPropWithDirective } from "./util/applyProps.js"
import { attributeValueToArray } from "./util/attributeValueToArray.js"

export class ThreeElement extends BaseElement {
  /** Exposed properties from the base element. @type {String[]} */
  static exposedProperties = BaseElement.exposedProperties
  /* Constructor that will instantiate our object. */
  static threeConstructor
  /*** MANAGED THREE.JS OBJECT ***/
  /* The THREE.* object managed by this element. */
  get object() {
    if (!this._object) this._object = this.constructWrappedObject()
    return this._object
  }
  set object(v) {
    this._object = v
  }
  _object
  constructWrappedObject() {
    const constructor = this.constructor.threeConstructor
    /* Constructs the wrapped Three.js object. */
    if (constructor) {
      this.debug("Creating wrapped object instance")
      let object
      /* Create managed object */
      const args = this.getAttribute("args")
      if (args) object = new constructor(...attributeValueToArray(args))
      else object = new constructor()
      /* Store a reference to this element in the wrapped object's userData 
      -- we'll need it whenever we want to link a Three.js scene object back to the DOM element that owns it. */
      if (object instanceof THREE.Object3D) object.userData.threeElement = this
      return object
    }
  }
  /*** CALLBACKS ***/
  mountedCallback() {
    super.mountedCallback()
    this.handleAttach() /* Handle attach attribute */
    this.addObjectToParent() /* Add object to scene */
    this.meta.requestFrame() /* Make sure a frame is queued */
  }
  removedCallback() {
    /* Queue a frame, because very likely something just changed in the scene */
    this.meta.requestFrame()
    /* If the wrapped object is parented, remove it from its parent */
    if (this.object instanceof THREE.Object3D && this.object.parent) {
      this.debug("Removing from scene:", this.object)
      this.object.parent.remove(this.object)
    }
    if ("dispose" in this) this.object.dispose()
    super.removedCallback()
  }
  /**
   * Обратный вызов, который вызывается всякий раз, когда один из атрибутов элемента изменяется.
   * Проверяет, справляется ли суперкласс с изменением, и возвращается рано, если да, то.
   * В противном случае пытается применить изменение атрибута к обернутому объекту.
   * Возвращает True, если изменение было обработано, иначе неверно.
   * @param {string} key
   * @param {any} oldValue
   * @param {any} newValue
   * @returns {boolean}
   */
  attributeChangedCallback(key, oldValue, newValue) {
    if (super.attributeChangedCallback(key, oldValue, newValue)) return true
    return this.object ? applyPropWithDirective(this.object, key, newValue) : false
  }
  /**
   * If the wrapped object is an Object3D, add it to the scene.
   * If we can find a parent somewhere in the tree above it, parent our object to that.
   */
  addObjectToParent() {
    if (this.object instanceof THREE.Object3D && !(this.object instanceof THREE.Scene)) {
      const parent = this.findElementWithInstanceOf(THREE.Object3D)
      if (parent) {
        this.debug("Parenting under:", parent)
        parent.object.add(this.object)
      } else throw `Found no suitable parent for ${this.htmlTagName}. Did you forget to add a <meta-scene> tag?`
    }
  }
  handleAttach() {
    if (!this.object) return
    /* Use provided attach, or auto-set it based on the tag name. */
    let attach = this.getAttribute("attach")
    if (attach === null) {
      if (this.object.isMaterial) attach = "material"
      else if (this.object.isGeometry || this.object.isBufferGeometry) attach = "geometry"
      else if (this.object.isFog) attach = "fog"
      else if (this.object.isColor) attach = "color"
    }
    /*
    If the wrapped object has an "attach" attribute, automatically assign it to the
    value of the same name in the parent object.
    */
    if (attach) {
      const parent = this.find((node) => node instanceof ThreeElement)
      if (!parent) this.error(`Tried to attach to the "${attach} property, but there was no parent!`)
      else if (parent instanceof ThreeElement) {
        this.debug("Attaching to:", parent)
        parent.object[attach] = this.object
      } else
        this.error(
          `Tried to attach to the "${attach} property of ${parent}, but it's not a ThreeElement! It's possible that the target element has not been upgraded to a ThreeElement yet.`
        )
    }
  }
  /** Creates an anonymous class that inherits from ThreeElement, but sets its own Three.js constructor property. */
  static for(constructor) {
    return class extends this {
      static threeConstructor = constructor
    }
  }
}
