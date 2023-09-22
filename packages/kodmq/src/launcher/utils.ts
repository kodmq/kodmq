import * as colorette from "colorette"

type ForegroundColorName = keyof colorette.Colorette

const Second = 1000
const Minute = 60 * Second
const Hour = 60 * Minute
const Day = 24 * Hour

export function titleize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (string) => string.toUpperCase())
}

export function formatDuration(start: Date | undefined, end: Date | undefined, color: ForegroundColorName = "blueBright") {
  if (!start || !end) return

  const duration = end.getTime() - start.getTime()
  const minutes = Math.floor(duration / 1000 / 60)
  const seconds = Math.floor(duration / 1000) % 60
  const hours = Math.floor(duration / 1000 / 60 / 60)
  const days = Math.floor(duration / 1000 / 60 / 60 / 24)

  let text

  // If less than 1 minute, show seconds
  if (duration < Second) {
    text = `${duration}ms`
  } else if (duration < Minute) {
    text = `${seconds}s`
  } else if (duration < Hour) {
    text = `${minutes}m ${seconds}s`
  } else if (duration < Day) {
    text = `${hours}h ${minutes}m`
  } else {
    text = `${days}d ${hours}h`
  }

  return colorette[color](text)
}

export function formatName(name: string) {
  return colorette.yellowBright(titleize(name))
}

export function formatJobPayload(payload: unknown) {
  if (payload === undefined) return ""

  return ` with payload ${colorette.gray(JSON.stringify(payload))}`
}
