/**
 * Represents a generic constructor type.
 * @template T The type that the constructor will create.
 * @typedef {Function} IConstructor
 * @property {Function} new The constructor function that creates an instance of type T.
 */

/**
 * Represents an object with string keys and any type of values.
 * @typedef {Object.<string, any>} IStringIndexable
 */

/**
 * Represents a disposable object.
 * @typedef {Object} IDisposable
 * @property {Function} dispose Function to dispose of resources.
 */

/**
 * Custom type guard that checks if the given object implements the IDisposable interface.
 * @param {any} object Object to check.
 * @returns {boolean} True if the object has a dispose method, false otherwise.
 */
export const isDisposable = (object) => {
  return object && typeof object.dispose === "function"
}
