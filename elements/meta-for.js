import * as THREE from "three"
import { EventEmitter } from "../util/EventEmitter.js"
import { registerThreeElement } from "../util/registerElement.js"
export class MetaFor extends HTMLElement {
  static get observedAttributes() {
    return ["observed"]
  }
  emitter = new EventEmitter()
  /* НАБЛЮДАТЕЛЬ */
  /**
   * meta-for необязательно позволяет пользователю запросить использование MutationObserver,
   * который будет уведомлять элементы, когда их атрибуты изменились любым другим
   * способом, кроме вызова `setAttribute`. Обычно это происходит, когда
   * пользователь изменяет атрибут в инструментах разработчика своего браузера.
   * Пользователи, желающие иметь возможность делать это, могут просто установить логический атрибут `observed`:
   * `<meta-for observed>`
   */
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const element = mutation.target
        const name = mutation.attributeName
        const newValue = element.getAttribute(name)

        if (newValue) element.attributeChangedCallback(name, null, newValue)
      }
    })
  })
  _observed = false
  get observed() {
    return this._observed
  }
  set observed(v) {
    /* Store value */
    this._observed = v
    /* React to the new value in a hopefully idempotent fashion */
    this.observer.disconnect()
    if (this._observed) {
      console.warn(
        "WARNING: You have enabled the `observed` attribute. This feature is intended for development only and should not be enabled in production projects, as it has a significant impact on performance."
      )
      this.observer.observe(this, {
        attributes: true,
        attributeOldValue: false,
        subtree: true,
        childList: true,
      })
    }
  }
  /* RENDERER */
  get renderer() {
    return this._renderer
  }
  set renderer(v) {
    this.cleanupRenderer()
    this._renderer = v
    this.setupRenderer()
  }
  _renderer = this.makeDefaultRenderer()
  /* OPTIMIZED RENDERING */
  /** Has a frame been requested to be rendered in the next tick? */
  frameRequested = true
  get autorender() {
    return this.hasAttribute("autorender")
  }
  set autorender(v) {
    if (v) this.setAttribute("autorender", "")
    else this.removeAttribute("autorender")
  }
  connectedCallback() {
    /* We'll plug our canvas into the shadow root. */
    const shadow = this.attachShadow({ mode: "open" })
    shadow.appendChild(this.renderer.domElement)
    /* Also apply some default styles. */
    const style = document.createElement("style")
    style.textContent = `:host {
      width: 100%;
      height: 100%;
      display: block;
    }`
    shadow.append(style)
    /* Handle window resizing */
    this.handleWindowResize = this.handleWindowResize.bind(this)
    window.addEventListener("resize", this.handleWindowResize, false)
    /* Initialize renderer size */
    this.setupRenderer()
    /* Look out for some specific stuff connecting within our branch of the document */
    this.addEventListener("connected", (e) => {
      /** @type {HTMLElement & { object?: any }} */
      const target = e.target
      if (target) {
        /*
        Подбирайте рендереры по мере их подключения. Нам нужно выяснить, представляет ли исходный элемент
        Three.js рендерер. Это немного затруднено тем, что у рендереров нет общего базового класса, и нет свойства 
        `isRenderer`, доступного. Пришло время проявить творческий подход и просто сделать дикое предположение. :>
        */
        if (target.tagName.endsWith("-RENDERER") && target.object.render) {
          this.renderer = target.object
        }
      }
    })
    /* Announce that we're ready */
    this.dispatchEvent(new Event("ready"))
    /* Start ticker */
    this.startTicking()
  }
  disconnectedCallback() {
    /* Stop observing */
    this.observer.disconnect()
    /* Stop ticking */
    this.stopTicking()
    /* Unregister event handlers */
    window.removeEventListener("resize", this.handleWindowResize, false)
    /* Remove canvas from page */
    this.cleanupRenderer()
  }
  /**
   * @param {string} key
   * @param {string|null} _
   * @param {string} value
   */
  attributeChangedCallback(key, _, value) {
    switch (key) {
      case "observed":
        this.observed = this.hasAttribute("observed")
        break
    }
  }
  setupRenderer() {
    this.shadowRoot.appendChild(this.renderer.domElement)
    this.handleWindowResize()
  }
  cleanupRenderer() {
    this.shadowRoot.removeChild(this.renderer.domElement)
  }
  makeDefaultRenderer() {
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      stencil: true,
      depth: true,
    })
    renderer.autoClear = false
    /* Configure color space */
    // renderer.outputEncoding = THREE.sRGBEncoding
    /* Enable shadow map */
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    return renderer
  }
  handleWindowResize() {
    /* Get width and height from this very element */
    const width = this.clientWidth
    const height = this.clientHeight
    /* Update canvas */
    this.renderer.setSize(width, height)
    /* Notify listeners */
    this.emitter.emit("resize", { width, height })
  }
  requestFrame() {
    this.frameRequested = true
  }
  /* TICKING */
  /** Are we currently ticking? */
  _ticking = false
  /** The time delta since the last frame, in fractions of a second. */
  deltaTime = 0
  startTicking() {
    let lastNow = performance.now()
    const tick = () => {
      /*
      Figure out deltatime. This is a very naive way of doing this, we'll eventually
      replace it with a better one.
      */
      const now = performance.now()
      const dt = (now - lastNow) / 1000
      lastNow = now
      /* Store deltaTime on instance for easy access */
      this.deltaTime = dt
      /* Execute tick and latetick events. */
      this.emitter.emit("tick", dt)
      this.emitter.emit("late-tick", dt)
      /* Has a frame been requested? */
      if (this.frameRequested || this.autorender) {
        this.frameRequested = false
        /* If we know that we're rendering a frame, execute frame callbacks. */
        this.emitter.emit("frame-tick", dt)
        /* Finally, emit render event. This will trigger scenes to render. */
        this.emitter.emit("render-tick", dt)
      }
    }
    /*
    If we have a WebGLRenderer, we'll use its setAnimationLoop. Otherwise,
    we'll perform normal rAF-style ticking.
    */
    this._ticking = true
    if (this.renderer instanceof THREE.WebGLRenderer) {
      this.renderer.setAnimationLoop(tick)
    } else {
      const loop = () => {
        tick()
        if (this._ticking) requestAnimationFrame(loop)
      }
      loop()
    }
  }
  stopTicking() {
    this._ticking = false
    if (this.renderer instanceof THREE.WebGLRenderer) {
      this.renderer.setAnimationLoop(null)
    }
  }
}
registerThreeElement("meta-for", "Game", MetaFor)
