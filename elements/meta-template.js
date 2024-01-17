import { observeAttributeChange } from "../util/observeAttributeChange.js"
import { registerThreeElement } from "../util/registerElement.js"
/*
Было бы проще просто настроить HTMLTemplateElement здесь, но это не будет работать в сафари, поэтому мы должны вместо этого выполнять дополнительную работу.
*/
export class MetaTemplate extends HTMLElement {
  get object() {
    return this.firstElementChild.object
  }
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    /* Steal the only/first child */
    const child = this.firstElementChild
    /* Clear our contents because we don't want to actually render them */
    this.innerHTML = ""
    /* Check the tag we will be using for this custom element */
    const tag = this.getAttribute("tag")
    if (!tag || tag === "") {
      console.error("You must specify the tag attribute when defining a <three-template>.")
      return
    }
    /* Create a class that will be handling the new custom element */
    const klass = class extends HTMLElement {
      /** @type {HTMLElement} */
      element
      constructor() {
        super()
      }
      connectedCallback() {
        /* Let's make a shadow DOM! */
        this.attachShadow({ mode: "open" })
        /** @type {HTMLElement} Copy the template*/
        this.element = child.cloneNode(true)
        this.appendChild(this.element)
        /* Apply all extra attributes we have */
        for (const key of this.getAttributeNames()) {
          this.element.setAttribute(key, this.getAttribute(key))
        }
        /* LOL */
        this.outerHTML = this.innerHTML
        /* Make sure future attribute changes are applied */
        observeAttributeChange(this, (key, value) => {
          this.element?.setAttribute(key, value)
        })
      }
    }
    /* and finally, create the custom element! It's a crazy, crazy world. */
    customElements.define(tag, klass)
  }
}
registerThreeElement("meta-template", "Template", MetaTemplate)
