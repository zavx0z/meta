import * as THREE from "three"
import { BaseElement } from "./BaseElement.js"
import { isDisposable } from "./types.js"
import { applyPropWithDirective } from "./util/applyProps.js"
import { attributeValueToArray } from "./util/attributeValueToArray.js"

/**
 * The `ThreeElement` class extends `BaseElement` with some code that manages an instance
 * of a given Three.js class. It's the centerpiece of three-elements, with most elements
 * provided by the library derived from it.
 * @template T
 * @extends {BaseElement}
 */
export class ThreeElement extends BaseElement {
  /**
   * Exposed properties from the base element.
   * @type {String[]}
   */
  static exposedProperties = BaseElement.exposedProperties
  /**
   * Constructor that will instantiate our object.
   * @type {import("./types.js").IConstructor}
   */
  static threeConstructor
  /*** MANAGED THREE.JS OBJECT ***/
  /**
   * The THREE.* object managed by this element.
   * @type {T}
   */
  get object() {
    if (!this._object) this._object = this.constructWrappedObject()
    return this._object
  }
  /**
   * @type {T}
   * @private
   */
  set object(v) {
    this._object = v
  }
  _object
  constructWrappedObject() {
    const constructor = this.constructor.threeConstructor
    /**
     * Constructs the wrapped Three.js object.
     * @protected
     * @returns {T}
     */
    if (constructor) {
      this.debug("Creating wrapped object instance")
      /**@type {T} */
      let object
      /* Create managed object */
      const args = this.getAttribute("args")
      if (args) object = new constructor(...attributeValueToArray(args))
      else object = new constructor()
      /*
      Store a reference to this element in the wrapped object's userData -- we'll
      need it whenever we want to link a Three.js scene object back to the DOM element
      that owns it.
      */
      if (object instanceof THREE.Object3D) {
        object.userData.threeElement = this
      }
      return object
    }
  }
  /*** CALLBACKS ***/
  mountedCallback() {
    super.mountedCallback()
    /* Handle attach attribute */
    this.handleAttach()
    /* Add object to scene */
    this.addObjectToParent()
    /* Make sure a frame is queued */
    this.meta.requestFrame()
  }
  removedCallback() {
    /* Queue a frame, because very likely something just changed in the scene :) */
    this.meta.requestFrame()
    /* If the wrapped object is parented, remove it from its parent */
    if (this.object instanceof THREE.Object3D && this.object.parent) {
      this.debug("Removing from scene:", this.object)
      this.object.parent.remove(this.object)
    }
    /* If the object can be disposed, dispose of it! */
    if (isDisposable(this.object)) {
      this.debug("Disposing:", this.object)
      this.object.dispose()
    }
    super.removedCallback()
  }
  /**
   *
   * @param {string} key
   * @param {any} oldValue
   * @param {any} newValue
   * @returns {boolean}
   */
/**
   * Обратный вызов, который вызывается всякий раз, когда один из атрибутов элемента изменяется.
   * Проверяет, справляется ли суперкласс с изменением, и возвращается рано, если да, то.
   * В противном случае пытается применить изменение атрибута к обернутому объекту.
   * Возвращает True, если изменение было обработано, иначе неверно.
   */
  attributeChangedCallback(key, oldValue, newValue) {
    if (super.attributeChangedCallback(key, oldValue, newValue)) return true
    return this.object ? applyPropWithDirective(this.object, key, newValue) : false
  }
  addObjectToParent() {
    /*
    If the wrapped object is an Object3D, add it to the scene. If we can find a parent somewhere in the
    tree above it, parent our object to that.
    */
    if (this.object instanceof THREE.Object3D && !(this.object instanceof THREE.Scene)) {
      /** @type {ThreeElement<THREE.Object3D>} */
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
      if (!parent) this.error(`Tried to attach to the "${attach} property, but there was no parent! 😢`)
      else if (parent instanceof ThreeElement) {
        this.debug("Attaching to:", parent)
        parent.object[attach] = this.object
      } else
        this.error(
          `Tried to attach to the "${attach} property of ${parent}, but it's not a ThreeElement! It's possible that the target element has not been upgraded to a ThreeElement yet.`
        )
    }
  }
  /**
   * Creates an anonymous class that inherits from ThreeElement, but sets
   * its own Three.js constructor property.
   * @template T The type of the Three.js object to be managed.
   * @param {import("./types.js").IConstructor<T>} constructor The constructor function for the Three.js object.
   * @returns {import("./types.js").IConstructor<ThreeElement<T>>} A constructor for a new class that extends ThreeElement.
   */
  static for(constructor) {
    return class extends this {
      static threeConstructor = constructor
    }
  }
}
