import { Vector2 } from "three"
/**
 * Normalizes pointer position from screen coordinates to normalized device coordinates (-1 to 1).
 * @param {THREE.Renderer} renderer - The renderer.
 * @param {number} x - The x position in screen coordinates.
 * @param {number} y - The y position in screen coordinates.
 * @param {Vector2} [target] - Optional target Vector2 to store result in. If not provided, a new Vector2 is created.
 * @returns {Vector2} The normalized pointer position.
 */
export const normalizePointerPosition = (renderer, x, y, target) => {
  if (!target) target = new Vector2()
  const rect = renderer.domElement.getBoundingClientRect()
  x -= rect.left
  y -= rect.top
  target.x = (x / rect.width) * 2 - 1
  target.y = -(y / rect.height) * 2 + 1
  return target
}
