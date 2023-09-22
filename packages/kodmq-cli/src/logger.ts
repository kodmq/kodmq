/* eslint-disable no-console */
import chalk, { ForegroundColorName } from "chalk"

const GlobalPrefix = "[KodMQ]"
const GlobalPrefixLength = GlobalPrefix.length
const GlobalPrefixColor: ForegroundColorName = "blueBright"

type Prefix = string | [ForegroundColorName, string]

export function log(...messages: unknown[]) {
  console.log(
    " ".repeat(GlobalPrefixLength),
    ...messages,
  )
}

export function logWithPrefix(...messages: unknown[]) {
  console.log(
    chalk[GlobalPrefixColor](GlobalPrefix),
    ...messages,
  )
}

export function logWithMultiplePrefixes(prefix: Prefix, ...messages: unknown[]) {
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

export function logTimeline(prefix: Prefix | Prefix[] | null, ...messages: unknown[]) {
  const prefixes = []

  prefixes.push(chalk[GlobalPrefixColor](GlobalPrefix))
  prefixes.push(chalk.gray(`[${new Date().toLocaleTimeString()}]`))

  if (prefix !== null) {
    const [color, text] = Array.isArray(prefix) ? prefix : ["gray", prefix]
    prefixes.push(chalk[color as ForegroundColorName](`[${text}]`))
  }

  console.log(
    ...prefixes,
    ...messages,
  )
}
