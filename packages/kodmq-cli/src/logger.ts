/* eslint-disable no-console */
import chalk, { ForegroundColorName } from "chalk"

const GlobalPrefix = "[KodMQ]"
const GlobalPrefixLength = GlobalPrefix.length

export function log(...messages: unknown[]) {
  console.log(
    " ".repeat(GlobalPrefixLength),
    ...messages,
  )
}

export function logWithPrefix(...messages: unknown[]) {
  console.log(
    chalk.blueBright(GlobalPrefix),
    ...messages,
  )
}

export function logWithMultiplePrefixes(prefix: string | [ForegroundColorName, string], ...messages: unknown[]) {
  const [color, text] = Array.isArray(prefix) ? prefix : ["gray", prefix]

  console.log(
    chalk.blueBright("[KodMQ]"),
    chalk[color as ForegroundColorName](`[${text}]`),
    ...messages,
  )
}

export function logBlankLine() {
  console.log()
}

export function logWithCheckmark(...messages: unknown[]) {
  log(
    chalk.greenBright("✓"),
    ...messages,
  )
}

export function logError(...messages: unknown[]) {
  console.log(
    chalk.redBright("[Error]"),
    ...messages,
  )
}


export function logPlain(...messages: unknown[]) {
  console.log(...messages)
}
