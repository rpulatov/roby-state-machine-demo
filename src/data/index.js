import config from "./config.json"

export function keyToLowerCase(obj) {
  const keys = Object.keys(obj)

  let n = keys.length
  const newobj = {}
  while (n--) {
    const key = keys[n]
    newobj[key.toLowerCase()] = obj[key]
  }
  return newobj
}

export const eventsData = config.events.reduce((acc, obj) => {
  const item = keyToLowerCase(obj)
  acc[item.id] = item
  return acc
}, {})

export const servicesData = config.services.reduce((acc, obj) => {
  const item = keyToLowerCase(obj)
  acc[item.id] = item
  return acc
}, {})

export const statesData = config.states.reduce((acc, obj) => {
  const item = keyToLowerCase(obj)
  acc[item.code] = item
  return acc
}, {})
