import { resolve } from "path"
import * as process from "process"
import chalk from "chalk"
import { program } from "commander"
import KodMQ from "kodmq/src"
import { log, logBlankLine, logError, logPlain, logWithCheckmark, logWithPrefix } from "./logger.ts"

program
  .name("kodmq-cli")
  .description("KodMQ CLI")
  .version("0.5.0")
  .argument("[path]", "Path to KodMQ file (defaults to KODMQ_PATH environment variable, then ./jobs/index.(ts|js))")
  .option("-c, --concurrency <number>", "Number of jobs to run concurrently (defaults to KODMQ_CONCURRENCY environment variable, then 1)")
  .parse()

const args = program.args
const options = program.opts()

const envConfigPathName = "KODMQ_PATH"
const envConfigPath = process.env[envConfigPathName]

const envConcurrencyName = "KODMQ_CONCURRENCY"
const envConcurrency = process.env[envConcurrencyName]

logWithPrefix("Starting...")

const configPaths = [
  args[0],
  envConfigPath,
  "./jobs/index.ts",
  "./jobs/index.js",
]

let configPath: string | undefined

for (const path of configPaths) {
  if (!path) continue

  const configExists = await Bun.file(path).exists()
  if (!configExists) continue

  configPath = path
}

if (!configPath) {
  logError("No config file found 🥲")
  logBlankLine()
  log("Tried the following paths:")

  for (const path of configPaths) {
    if (!path) continue
    log("- " + path)
  }

  logBlankLine()
  log("Try one of the following:")
  log(`- Set the ${envConfigPathName} environment variable`)
  log("- Run this command as `kodmq <path>`")

  process.exit(1)
}

logWithCheckmark("Using config file at", configPath)

// Get KodMQ instance from config file (exported as default)
let kodmq: KodMQ | undefined

try {
  const config = await import(resolve(configPath))
  kodmq = config.default
} catch (e) {
  logBlankLine()
  logError("Error loading config file 🥲")
  logBlankLine()
  logPlain(e)

  process.exit(1)
}

if (!kodmq || !kodmq.isKodMQ()) {
  logBlankLine()
  logError("Config file does not export a KodMQ instance 🥲")
  process.exit(1)
}

const concurrency =  [
  options.concurrency,
  envConcurrency ? parseInt(envConcurrency) : undefined,
  1,
].find((c) => c !== undefined)

logWithCheckmark("Starting KodMQ with concurrency", chalk.bold.yellowBright(concurrency))

// Handle exit
const handleExit = async () => {
  logWithPrefix("Stopping...")
  await kodmq?.stop()
  process.exit(0)
}

process.on("SIGINT", handleExit)
process.on("SIGQUIT", handleExit)
process.on("SIGTERM", handleExit)

try {
  await kodmq.start(concurrency)
} catch (e) {
  logBlankLine()
  logError("Error starting KodMQ 🥲")
  logBlankLine()
  logPlain(e)

  process.exit(1)
}

process.exit(0)
