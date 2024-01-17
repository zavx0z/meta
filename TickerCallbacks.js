import { BaseElement } from "./BaseElement.js"
/**
 * @typedef {function} TickerFunction
 * @param {number} dt
 * @param {HTMLElement} el
 * @returns {any}
 * 
 * @typedef {TickerFunction | string} Ticker 
*/

export class TickerCallbacks {
  /**
   * A dictionary of ticker callbacks ("update", "lateUpdate", etc.)
   * @type {Object.<string, ((timestamp: number) => void)|undefined>}
   */
  callbacks = {}
  /**
   *  The element we're attached to.
   * @type {import("./BaseElement.js").BaseElement}
   */
  element
  /** @param {BaseElement} element */
  constructor(element) {
    this.element = element
  }
  /**
   * Returns the callback that is currently registered for our element and the
   * specified ticker event.
   *
   * @param {string} name Name of the ticker event.
   */
  get(name) {
    return this.callbacks[name]
  }
  /**
   * Hooks a new callback up with the meta's ticker. Automatically unmounts
   * any callback that was previously registered for our element and the
   * specified ticker event.
   *
   * @param {string} name Name of the ticker callback (eg. "update", "frameUpdate")
   * @param {Ticker} fn Callback function or string
   */
  set(name, fn) {
    /* Unregister previous callback */
    const previousCallback = this.callbacks[name]
    if (previousCallback) {
      this.element.meta.emitter.off(name, previousCallback)
    }
    /* Store new value, constructing a function from a string if necessary */
    this.callbacks[name] = this.createCallbackFunction(fn)
    /* Register new callback */
    const newCallback = this.callbacks[name]
    if (newCallback) {
      /*
      We're using queueMicrotask here because at the point when a ticker event
      property is assigned, it's possible that the elements required to make this
      work are not done initializing yet.
      */
      queueMicrotask(() => {
        this.element.meta.emitter.on(name, newCallback)
      })
    }
  }
  /**
   * Creates a callback function from the given input.
   * If `fn` is a string, it will compile it into a callback function.
   * If `fn` is already a function, it will be returned as-is.
   * 
   * @param {Ticker} [fn] - The callback function or string.
   * @returns {TickerFunction} The callback function.
   */
  createCallbackFunction(fn) {
    switch (typeof fn) {
      case "string":
        return new Function("dt", "object = this.object", fn).bind(this.element)
      case "function":
        return (dt) => fn(dt, this.element)
    }
  }
}
