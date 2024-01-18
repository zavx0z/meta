/**
 * Convenience method to create a new custom element.
 * @param {string} name - Name of the custom element to create
 * @param {CustomElementConstructor} constructor - Class that will handle this element
 */
export const registerElement = (name, constructor) => {
  if (customElements.get(name)) return
  customElements.define(name, constructor)
}
/**
 * Tracks registered elements by mapping them from PascalCaseNames to their kebab-case equivalents.
 *  @type {Object.<string, string>}
 */
export const registeredThreeElements = {}
/**
 * Registers an element and adds it to the dictionary that's mapping THREE.* namespace properties (and more) to tag names.
 * @param {string} tagName
 * @param {string} threeName
 * @param {Function} elementClass
 */
export const registerThreeElement = (tagName, threeName, elementClass) => {
  registerElement(tagName, elementClass)
  registeredThreeElements[threeName] = tagName
}
