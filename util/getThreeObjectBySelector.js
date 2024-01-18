/**
 * Retrieve a Three.js object from a ThreeElement referenced by CSS selector.
 * @param {string} selector
 */
export const getThreeObjectBySelector = (selector) => {
  if (!selector) return
  const el = document.querySelector(selector)
  if (!el) return
  if (!("object" in el)) {
    console.error(`The DOM element found by the selector "${selector}" did not provide a Three.js object for us.`)
    return
  }
  return el["object"]
}
