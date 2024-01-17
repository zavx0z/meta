import { MathUtils } from "three"
/**
 * Parses a string value representing an angle in degrees, and returns the angle in radians.
 *
 * @param {string} value - The string containing the angle value in degrees. Should end with 'deg'.
 * @returns {number} The angle in radians.
 */
export const parseDeg = (value) => {
  const r = value.trim().match(/^([0-9\.\- ]+)deg$/)
  if (r) return MathUtils.degToRad(parseFloat(r[1]))
}
