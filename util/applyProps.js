import { BaseElement } from "../BaseElement.js"
import { attributeValueToArray } from "./attributeValueToArray.js"
import { camelize } from "./camelize.js"
import { getThreeObjectBySelector } from "./getThreeObjectBySelector.js"
import { parseDeg } from "./parseDeg.js"

const IGNORED_KEYS = ["args", "id"]
/**
 * Applies properties from a props object to a target object
 * @param {Object} object - The target object
 * @param {Object} props - The props object
 */
export const applyProps = (object, props) => {
  for (const name in props) {
    applyProp(object, name, props[name])
  }
}
/**
 * Applies properties from a props object to a target object with directives
 * @param {Object} object - The target object
 * @param {string} name - The property name
 * @param {*} value - The property value
 * @returns {boolean}
 */
export const applyPropWithDirective = (object, name, value) => {
  let [directive, rest] = name.split(":")
  /* If no rest was returned, there was no directive. */
  if (!rest) return applyProp(object, name, value)
  /* Resolve "ref" directive */
  switch (directive) {
    case "ref":
      const referencedObject = getThreeObjectBySelector(value)
      return referencedObject ? applyProp(object, rest, referencedObject) : false
    default:
      console.error(`Unknown directive: ${directive}`)
      return false
  }
}
/**
 * Applies a property to an object
 * @param {Object} object - The target object
 * @param {string} name - The property name
 * @param {*} value - The property value
 * @returns {boolean}
 */
export const applyProp = (object, name, value) => {
  let [firstKey, ...rest] = name.split(".")
  const key = camelize(firstKey)
  /* Skip all ignored keys. */
  if (IGNORED_KEYS.includes(key)) return false
  /* Skip all data attributes. */
  if (firstKey.startsWith("data-")) return false
  /* If the object is one of our elements, only continue if the property is whitelisted. */
  if (object instanceof BaseElement && !object.constructor.exposedProperties.includes(key)) return false
  /* Recursively handle nested keys, eg. position.x */
  if (key in object && rest.length > 0) return applyProp(object[key], rest.join("."), value)
  /*
  Handle boolean properties. We will check against the only values that we consider false here,
  taking into account that they might be coming from string-based HTML element attributes, where a
  stand-alone boolean attribute like "cast-shadow" will emit a value of "".
  */
  if (typeof object[key] === "boolean") {
    object[key] = ![undefined, null, false, "no", "false"].includes(value)
    return true
  }
  /* Try to parse the value. */
  const parsed = typeof value === "string" ? parseJson(value) ?? parseDeg(value) : value
  /* Handle properties that provide .set methods */
  if (object[key]?.set !== undefined) {
    /* If the value is an array, feed its destructured representation to the set method. */
    if (Array.isArray(parsed)) {
      object[key].set(...parsed)
      return true
    }
    /* A bit of special handling for "scale" properties, where we'll also accept a single numerical value */
    if (key === "scale" && typeof parsed === "number") {
      object[key].setScalar(parsed)
      return true
    }
    /* If we have a parsed value, set it directly */
    if (parsed) {
      object[key].set(parsed)
      return true
    }
    /* Otherwise, set the original string value, but split by commas */
    const list = attributeValueToArray(value)
    object[key].set(...list)
    return true
  }
  /* Set the property if it exists on the object */
  if (key in object) {
    object[key] = parsed !== undefined ? parsed : value
    return true
  } else return false
}
/**
 * Parses a JSON string.
 * @param {string} value - The JSON string to parse.
 * @returns {any} The parsed JSON value.
 */
const parseJson = (value) => {
  let parsed = undefined
  try {
    parsed = JSON.parse(value)
  } catch (e) {}
  return parsed
}
