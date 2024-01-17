/**
 * @typedef {Function} EventListener
 * @typedef {Object.<string, EventListener[]>} EventMap
 */
export class EventEmitter {
  /** @type {EventMap} */
  #events = {}
  /**
   * @param {string} event
   * @param {EventListener} listener
   */
  on(event, listener) {
    this.#events[event] ||= []
    this.#events[event].push(listener)
  }
  /**
   * Remove an event listener
   * @param {string} event - The event name
   * @param {EventListener} listener - The callback function
   */
  off(event, listener) {
    const listeners = this.#events[event]
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) listeners.splice(index, 1)
    }
  }
  /**
   * Emit an event
   * @template T
   * @param {string} event
   * @param {T} data
   */
  emit(event, data) {
    const listeners = this.#events[event]
    if (listeners) for (let i = 0; i < listeners.length; i++) listeners[i](data)
  }
}
