/**
 * Camelize a string
 * @param {string} str - The string to camelize
 * @returns {string} The camelized string
 */
export function camelize(str) {
  var arr = str.split(/[_-]/)
  var newStr = ""
  for (var i = 1; i < arr.length; i++) newStr += arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
  return arr[0] + newStr
}
