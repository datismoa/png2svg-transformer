import { setTimeout as setTimeoutPromise } from 'node:timers/promises'

// function relativeTimeToMs(relTime) {
//   // can't parse float values
//   const { value: notParsedValue, unit } = relTime.match(
//     /^(?<value>\d+(?:.\d+)?)(?<unit>\w+)$/
//   ).groups

//   const value = parseFloat(notParsedValue)

//   const unitRelationsToMs = {
//     ms: 1,
//     s: 1000,
//     m: 60000,
//   }

//   if (!Reflect.has(unitRelationsToMs, unit)) {
//     throw `Can not process the unit (${unit}).`
//   }

//   return unitRelationsToMs[unit] * value
// }

export class Timer {
  constructor(options) {
    this.duration = options.duration
  }

  start() {
    const abortController = new AbortController()
    const { signal } = abortController

    const startedAt = new Date()

    const getDelta = () => ({ delta: new Date() - startedAt })

    const timerProcess =
      setTimeoutPromise(this.duration, null, { signal })
        .then(getDelta)
        .catch(getDelta)

    return {
      timerProcess,
      abortController
    }
  }
}
