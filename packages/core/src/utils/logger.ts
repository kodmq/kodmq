/* eslint-disable no-console */
import * as colorette from "colorette"

type ForegroundColorName = keyof colorette.Colorette
type Prefix = string | [ForegroundColorName, string]

const GlobalPrefix = "[KodMQ]"
const GlobalPrefixLength = GlobalPrefix.length
const GlobalPrefixColor: ForegroundColorName = "blueBright"

export default class Logger {
  log = console.log

  constructor(log?: typeof console.log) {
    if (log) this.log = log
  }

  logWithPrefix(...messages: unknown[]) {
    this.log(
      colorette[GlobalPrefixColor](GlobalPrefix),
      ...messages,
    )
  }

  logBlankLine() {
    this.log()
  }

  logWithCheckmark(...messages: unknown[]) {
    this.log(
      " ".repeat(GlobalPrefixLength),
      colorette.greenBright("✓"),
      ...messages,
    )
  }

  logTimeline(prefix: Prefix | Prefix[] | null, ...messages: unknown[]) {
    const prefixes = []

    prefixes.push(colorette[GlobalPrefixColor](GlobalPrefix))
    prefixes.push(colorette.gray(`[${new Date().toLocaleTimeString()}]`))

    if (prefix !== null) {
      const [color, text] = Array.isArray(prefix) ? prefix : ["gray", prefix]
      prefixes.push(colorette[color as ForegroundColorName](`[${text}]`))
    }

    this.log(
      ...prefixes,
      ...messages,
    )
  } 
}
