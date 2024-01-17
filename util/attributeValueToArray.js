import { parseDeg } from "./parseDeg.js"
/**
 * Convert attribute value string to array
 * @param {string} value - The attribute value string
 * @returns {Array} The array converted from the attribute value string
 */
export function attributeValueToArray(value) {
  return value
    .split(/[, ]+/)
    .map((s) => s.trim())
    .map((s) => parseDeg(s) ?? floatOrNot(s))
}
/**
 * Parse a string to float if possible, otherwise return the original string
 * @param {string} s - The string to parse
 * @returns {number|string} The parsed float or the original string
 */
const floatOrNot = (s) => {
  const f = parseFloat(s)
  return f || f === 0 ? f : s
}
