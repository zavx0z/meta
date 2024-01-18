import { Object3D, Raycaster, Vector2 } from "three"
import { MetaElement } from "./MetaElement.js"
import { normalizePointerPosition } from "./util/normalizePointerPosition.js"
/**
 * Clones the provided event by instantiating a new event using the original event's
 * constructor and passing the type and original event as arguments.
 * This allows dispatching events that inherit from the original event.
 * cloneEvent = <T extends Event>(originalEvent: T) =>
 */
const cloneEvent = (originalEvent) => new originalEvent.constructor(originalEvent.type, originalEvent)
/**
 * Creates a function that forwards events received as argument
 * to the provided DOM element
 *
 * @param {HTMLElement} element - Element that will receive forwarded events
 * @returns {(originalEvent: Event) => void} Function that takes an event and forwards it to element
 */
const eventForwarder = (element) => (originalEvent) => element.dispatchEvent(cloneEvent(originalEvent))
/**
 * @typedef {THREE.Intersection} Intersection
 * @typedef {THREE.Renderer} Renderer
 */
export class PointerEvents {
  position = new Vector2()
  /** @type {Intersection[]} last pointer event that performed raycast */ intersections = []
  /** @type {Event} last event pointermove */ __pointerMoveEvent
  /** @type {Intersection | undefined} The top-most of our current intersections. */ intersection
  raycaster = new Raycaster()

  /** @param {import("./elements/meta-scene.js").MetaScene} sceneElement */
  constructor(sceneElement) {
    this.sceneElement = sceneElement
  }
  start() {
    const scene = this.sceneElement.object
    const /** @type {{renderer: Renderer}} */ { renderer } = this.sceneElement.meta
    let /** @type {Intersection[]} */ previousIntersections
    let /** @type {Intersection | undefined} */ previousIntersection
    /* On every tick, raycast the current pointer position against the scene */
    this.sceneElement.meta.emitter.on("tick", () => {
      /* If we haven't previously received a pointermove event, bail now. */
      if (!this.__pointerMoveEvent) return
      const { camera } = this.sceneElement
      /* Raycast against all objects in scene, and keep the intersections for later. */
      this.raycaster.setFromCamera(this.position, camera)
      previousIntersections = this.intersections
      previousIntersection = this.intersection
      this.intersections = this.raycaster.intersectObjects(scene.children, true)
      this.intersection = this.intersections[0]
      /* Simulate pointerenter and friends */
      if (this.intersection?.object !== previousIntersection?.object) {
        if (previousIntersection) {
          this.dispatchEventToIntersection(
            new PointerEvent("pointerleave", this.__pointerMoveEvent),
            previousIntersection
          )
          this.dispatchEventToIntersection(
            new PointerEvent("pointerout", this.__pointerMoveEvent),
            previousIntersection
          )
        }
        if (this.intersection) {
          /* pointerenter */
          this.dispatchEventToIntersection(new PointerEvent("pointerenter"), this.intersection)
          /* pointerover */
          this.dispatchEventToIntersection(new PointerEvent("pointerover", this.__pointerMoveEvent), this.intersection)
        }
      }
    })
    /* When the pointer moves, update its position */
    renderer.domElement.addEventListener("pointermove", (e) => {
      /* Update normalized pointer position */
      this.__pointerMoveEvent = e
      normalizePointerPosition(renderer, e.x, e.y, this.position)
      /* pointermove */
      if (this.intersection) this.dispatchEventToIntersection(cloneEvent(this.__pointerMoveEvent), this.intersection)
    })
    /* Now just forward a bunch of DOM events to the current intersect. */
    for (const type of ["pointerdown", "pointerup", "click", "dblclick"]) {
      renderer.domElement.addEventListener(type, (e) => {
        const { camera } = this.sceneElement
        this.raycaster.setFromCamera(this.position, camera)
        const intersections = this.raycaster.intersectObjects(scene.children, true)
        if (intersections) {
          console.log(intersections.map(i => i.object.name))
          const intersection = intersections[0]
          if (intersection && intersection.object !== undefined)
            this.dispatchEventToIntersection(cloneEvent(e), intersections[0])
        }
      })
    }
  }
  /**
   * Dispatches a pointer event to the Three.js element
   * associated with the given intersection.
   *
   * Traverses up the intersection's object hierarchy to find
   * the first object with a 'threeElement' userData property.
   * Then dispatches the given event to that MetaElement's
   * underlying DOM element via the eventForwarder helper.
   *
   * @param {Event} event
   * @param {THREE.Intersection} intersection
   */
  dispatchEventToIntersection(event, intersection) {
    /* Find the first object that actually has a reference to an element */
    /** @type {Object3D | null} */
    let object
    for (object = intersection.object; object; object = object.parent) {
      if (object.userData.threeElement) {
        /** @type {MetaElement} Find the element representing the hovered scene object */
        const element = object.userData.threeElement
        eventForwarder(element)(event)
        return
      }
    }
  }
}
