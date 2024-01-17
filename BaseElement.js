import { MetaFor } from "./elements/meta-for.js"
import { TickerCallbacks } from "./TickerCallbacks.js"
import { applyPropWithDirective } from "./util/applyProps.js"
import { camelize } from "./util/camelize.js"

/** @typedef {import("./TickerCallbacks.js").TickerFunction | string | undefined} Ticker */
/**
 * The `BaseElement` class extends the built-in HTMLElement class with a bit of convenience
 * functionality, first and foremost in the addition of the `mountedCallback` and `removedCallback` hooks.
 * `BaseElement` knows how to hook into a scene and/or a meta powered by meta-elements, but otherwise doesn't
 * interact with Three.js in any way. You can use it as a base class for logic-only custom components that
 * need access to the meta's ticker or renderer.
 */
export class BaseElement extends HTMLElement {
  /**
   * A list of properties that can also be set through attributes on the element's tag.
   * Attribute names are expected to be kebab-cased versions of the original
   * property names (eg. "renderTick" can be set through the attribute "render-tick".)
   */
  static exposedProperties = ["tick", "lateTick", "frameTick", "renderTick"]
  isMounted = false
  /**
   * Returns the instance of Metafor that this element is nested under.
   * @type {import("./elements/meta-for.js").Metafor}
   */
  get meta() {
    if (!this._meta) this._meta = this.findGame()
    return this._meta
  }
  /** @type {import("./elements/meta-for.js").MetaFor} */
  _meta
  findGame() {
    if (!this.isConnected)
      throw "Something is accessing my .meta property while I'm not connected. This shouldn't happen! 😭"
    const /** @type {import("./elements/meta-for.js").MetaFor}  */ meta = this.find((node) => node instanceof MetaFor)
    if (!meta)
      throw "No <meta-for> tag found! If you're seeing this error, it might be a sign that you're importing multiple versions of three-elements."
    return meta
  }
  /**
   * Returns the instance of MetaScene that this element is nested under.
   * @type {import("./elements/meta-scene.js").MetaScene}
   */
  get scene() {
    if (!this._scene) this._scene = this.findScene()
    return this._scene
  }
  /** @type {import("./elements/meta-scene.js").MetaScene} */
  _scene
  findScene() {
    if (!this.isConnected)
      throw "Something is accessing my .scene property while I'm not connected. This shouldn't happen! 😭"
    const /** @type {import("./elements/meta-scene.js").MetaScene} */ scene = this.find((node) => node.object?.isScene)
    if (!scene) throw "No <meta-scene> tag found!"
    return scene
  }
  /*** TICKER CALLBACKS ***/
  callbacks = new TickerCallbacks(this)
  get tick() {
    return this.callbacks.get("tick")
  }
  /** @param {Ticker} fn */
  set tick(fn) {
    this.callbacks.set("tick", fn)
  }
  get lateTick() {
    return this.callbacks.get("late-tick")
  }
  /** @param {Ticker} fn */
  set lateTick(fn) {
    this.callbacks.set("late-tick", fn)
  }
  get frameTick() {
    return this.callbacks.get("frame-tick")
  }
  /** @param {Ticker} fn */
  set frameTick(fn) {
    this.callbacks.set("frame-tick", fn)
  }
  get renderTick() {
    return this.callbacks.get("render-tick")
  }
  /** @param {Ticker} fn */
  set renderTick(fn) {
    this.callbacks.set("render-tick", fn)
  }
  constructor() {
    super()
    /* Bind some convenience functions to make it easier to destructure elements in tick event handlers. */
    this.requestFrame = this.requestFrame.bind(this)
  }
  /**
   * We're overloading setAttribute so it also invokes attributeChangedCallback. We
   * do this because we can't realistically make use of observedAttributes (since we don't
   * know at the time element classes are defined what properties their wrapped objects
   * are exposing.)
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name, value) {
    this.attributeChangedCallback(name, this.getAttribute(name), value)
    super.setAttribute(name, value)
  }
  /**
   * This callback is invoked when the element is deemed properly initialized. Most
   * importantly, this happens in a microtask that is very likely executed after all
   * the other elements in the document have finished running their connectedCallbacks.
   */
  mountedCallback() {}
  /**
   * While disconnectedCallback is invoked whenever the element is removed from the DOM
   * _or_ just moved to a new parent, removedCallback will only be invoked when the
   * element is actually being removed from the DOM entirely.
   */
  removedCallback() {}
  connectedCallback() {
    /*
    From MDN:
    > Note: connectedCallback may be called once your element is no longer connected,
    > use Node.isConnected to make sure."
    Okay!
    */
    if (!this.isConnected) {
      this.debug("connectedCallback called while not connected")
      return
    }
    this.debug("connectedCallback")
    /* Emit connected event */
    this.dispatchEvent(new Event("connected", { bubbles: true, cancelable: false }))
    /*
    Some stuff relies on all custom elements being fully defined and connected. However:

    If there are already tags in the DOM, newly created custom elements will connect in the order they
    are defined, which isn't always what we want (because a Material node that intends to attach itself to
    a Mesh might be defined before the element that represents that Mesh. Woops!)

    For this reason, we'll run some extra initialization inside a microtask:
    https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
    */
    queueMicrotask(() => {
      /* Apply all attributes */
      this.applyAllAttributes()
      /* Mount the component if this is our first time connecting */
      if (!this.isMounted) {
        this.isMounted = true
        this.mountedCallback()
        this.dispatchEvent(new Event("mounted", { bubbles: true, cancelable: false }))
      }
    })
  }
  /**
   * Helper method that will make sure all attributes set on the element are passed
   * through `attributeChangedCallback`. We mostly need this because of how we're
   * _not_ using `observedAttributes`.
   */
  applyAllAttributes() {
    for (const key of this.getAttributeNames()) {
      this.attributeChangedCallback(key, "", this.getAttribute(key))
    }
  }
  disconnectedCallback() {
    this.debug("disconnectedCallback")
    /*
    If isConnected is false, this element is being removed entirely. In this case,
    we'll do some extra cleanup.
    */
    if (!this.isConnected) {
      queueMicrotask(() => {
        /* Remove event handlers */
        this.tick = undefined
        this.lateTick = undefined
        this.frameTick = undefined
        this.renderTick = undefined
        /* Invoke removedCallback */
        this.removedCallback()
      })
    }
  }
  /**
   *
   * @param {string} key
   * @param {any} _
   * @param {any} value
   * @returns {boolean}
   */
  attributeChangedCallback(key, _, value) {
    return applyPropWithDirective(this, camelize(key), value)
  }
  requestFrame() {
    this.meta.requestFrame()
  }
  /**
   * Takes a function, then walks up the node tree and returns the first
   * node where the function returns true.
   * @template T
   * @param {function(HTMLElement): any} fn
   * @returns {(T | undefined)}
   */
  find(fn) {
    /* TODO: We might be able to replace this entire function with something like this.closest(). */
    /* Start here */
    let node
    node = this
    do {
      /* Get the immediate parent, or, if we're inside a shadow DOM, the host element */
      node = node.parentElement || node.getRootNode().host
      /* Check against the supplied function */
      if (node && fn(node)) return node
    } while (node)
  }
  /**
   * Finds an element with the provided constructor instance.
   * @template T
   * @param {Function} constructor - The constructor function to check instance of.
   * @returns {(T|undefined)} The found element or undefined if not found.
   */
  findElementWithInstanceOf(constructor) {
    return this.find((node) => node.object instanceof constructor)
  }
  /**
   * Returns this element's tag name, formatted as an actual HTML tag (eg. "<meta-mesh>").
   */
  get htmlTagName() {
    return `<${this.tagName.toLowerCase()}>`
  }
  debug(...output) {
    // console.debug(`${this.htmlTagName}`, ...output)
  }
  error(...output) {
    console.error(`${this.htmlTagName}>`, ...output)
  }
}
