// export const observeAttributeChange = <T extends HTMLElement>( el: T, callback: (prop: string, value: any) => void ) => {
export const observeAttributeChange = (el, callback) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const element = mutation.target
        const name = mutation.attributeName
        const newValue = element.getAttribute(name)
        callback(name, newValue)
      }
    })
  })
  observer.observe(el, { attributes: true })
  return observer
}
