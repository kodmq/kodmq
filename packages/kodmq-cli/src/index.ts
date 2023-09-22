import { resolve } from "path"
import * as process from "process"
import chalk from "chalk"
import { program } from "commander"
import KodMQ from "kodmq"
import {
  log,
  logBlankLine,
  logError, logTimeline,
  logPlain,
  logWithCheckmark,
  logWithPrefix,
} from "./logger.ts"
import { formatDuration, formatJobPayload, formatName } from "./utils.ts"
import { onShutdown } from "node-graceful-shutdown"

program
  .name("kodmq-cli")
  .description("KodMQ CLI")
  .version("0.5.0")
  .argument("[path]", "Path to KodMQ file (defaults to KODMQ_PATH environment variable, then ./jobs/index.(ts|js))")
  .option("-c, --concurrency <number>", "Number of jobs to run concurrently (defaults to KODMQ_CONCURRENCY environment variable, then 1)")
  .exitOverride()
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

logWithCheckmark("Starting KodMQ with concurrency", chalk.yellowBright(concurrency))
logBlankLine()

kodmq.on("onWorkerActive", (worker) => {
  logTimeline(`Worker #${worker.id}`, "Worker is active and waiting for jobs")
})

kodmq.on("onWorkerStopping", (worker) => {
  logTimeline(`Worker #${worker.id}`, "Worker is stopping")
})

kodmq.on("onWorkerStopped", (worker) => {
  logTimeline(`Worker #${worker.id}`, "Worker has stopped")
})

kodmq.on("onWorkerKilled", (worker) => {
  if (worker.currentJob) {
    logTimeline(`Worker #${worker.id}`, `Worker has been killed. Job #${worker.currentJob.id} ${formatName(worker.currentJob.name)} has been requeued`)
  } else {
    logTimeline(`Worker #${worker.id}`, "Worker has been killed")
  }
})

kodmq.on("onJobPending", (job) => {
  logTimeline(`Job #${job.id}`, `Queued ${formatName(job.name)}${formatJobPayload(job.payload)}`)
})

kodmq.on("onJobScheduled", (job) => {
  logTimeline(`Job #${job.id}`, `Scheduled ${formatName(job.name)} to run in ${formatDuration(new Date(), job.runAt, "greenBright")}${formatJobPayload(job.payload)}`)
})

kodmq.on("onJobActive", (job) => {
  logTimeline(`Job #${job.id}`, `Running ${formatName(job.name)}…`)
})

kodmq.on("onJobCompleted", (job) => {
  logTimeline(`Job #${job.id}`, `Completed ${formatName(job.name)} in ${formatDuration(job.startedAt, job.finishedAt, "greenBright")}`)
})

kodmq.on("onJobFailed", (job) => {
  logTimeline(`Job #${job.id}`, `Failed ${formatName(job.name)} in ${formatDuration(job.startedAt, job.failedAt, "redBright")}`)
})

onShutdown(async () => {
  logTimeline("Bye", "Stopping KodMQ")
  await kodmq?.stopAllAndCloseConnection()
})

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
