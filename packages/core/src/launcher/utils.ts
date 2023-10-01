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
  let text

  if (duration < Second) {
    text = `${duration}ms`
  } else if (duration < Minute) {
    text = `${Math.round(duration / Second)}s`
  } else if (duration < Hour) {
    text = `${Math.round(duration / Minute)}m`
  } else if (duration < Day) {
    text = `${Math.round(duration / Hour)}h ${Math.round((duration % Hour) / Minute)}m`
  } else {
    text = `${Math.round(duration / Day)}d ${Math.round((duration % Day) / Hour)}h`
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
