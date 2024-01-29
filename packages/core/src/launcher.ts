import * as os from "os"
import * as colorette from "colorette"
import { onShutdown } from "node-graceful-shutdown"
import { KodMQLauncherError } from "./errors.js"
import Logger from "./utils/logger.js"
import { formatDuration, formatJobPayload, formatName } from "./utils/utils.js"
import KodMQ from "./index.js"

export type LaunchOptions = {
  concurrency?: number
  name?: string
  logger?: typeof console.log
}

export default async function launcher(kodmq: KodMQ, options: LaunchOptions = {}) {
  if (!kodmq || !kodmq.isKodMQ()) {
    throw new KodMQLauncherError("You must pass a KodMQ instance to launch()")
  }

  if (Object.keys(kodmq.handlers).length === 0) {
    throw new KodMQLauncherError("You must register at least one job handler before launching KodMQ")
  }

  if (options.concurrency && typeof options.concurrency !== "number") {
    throw new KodMQLauncherError("Concurrency must be a number")
  }

  let concurrency: number | undefined
  let concurrencyArg = process.argv.find((arg) => arg.startsWith("--concurrency="))
  let concurrencyEnv = process.env.KODMQ_CONCURRENCY
  let concurrencyOption = options.concurrency
  
  if (concurrencyArg) {
    concurrency = parseInt(concurrencyArg.split("=")[1])
  } else if (concurrencyOption !== undefined) {
    concurrency = concurrencyOption
  } else if (concurrencyEnv) {
    concurrency = parseInt(concurrencyEnv)
  } else {
    try {
      concurrency = os.cpus().length
    } catch (e) {
      concurrency = 1
    }
  }
  
  if (isNaN(concurrency)) {
    throw new KodMQLauncherError("Concurrency must be a number")
  } else if (concurrency < 1) {
    throw new KodMQLauncherError("Concurrency must be at least 1")
  } else if (concurrency > 128) {
    throw new KodMQLauncherError("Concurrency cannot be greater than 128")
  }
  
  let name: string | undefined
  const nameArg = process.argv.find((arg) => arg.startsWith("--cluster-name="))
  const nameEnv = process.env.KODMQ_CLUSTER_NAME
  const nameOption = options.name
  
  if (nameArg) {
    name = nameArg.split("=")[1]
  } else if (nameOption !== undefined) {
    name = nameOption
  } else if (nameEnv) {
    name = nameEnv
  }

  const logger = new Logger(options.logger)
  logger.logWithPrefix("Starting KodMQ...")
  logger.logWithCheckmark("Concurrency:", colorette.yellowBright(concurrency!.toString()))
  if (name) logger.logWithCheckmark("Cluster name:", colorette.yellowBright(name))
  logger.logBlankLine()

  kodmq.on("workerStarted", (worker) => {
    logger.logTimeline(`Worker #${worker.id}`, "Worker is active and waiting for jobs")
  })

  kodmq.on("workerStopping", (worker) => {
    logger.logTimeline(`Worker #${worker.id}`, "Worker is stopping")
  })

  kodmq.on("workerStopped", (worker) => {
    logger.logTimeline(`Worker #${worker.id}`, "Worker has stopped")
  })

  kodmq.on("workerKilled", (worker) => {
    if (worker.currentJob) {
      logger.logTimeline(`Worker #${worker.id}`, `Worker has been killed. Job ${colorette.gray(`#${worker.currentJob.id}`)} ${formatName(worker.currentJob.name)} has been requeued`)
    } else {
      logger.logTimeline(`Worker #${worker.id}`, "Worker has been killed")
    }
  })

  kodmq.on("jobPending", (job) => {
    if (job.failedAttempts) {
      logger.logTimeline(`Job #${job.id}`, `Re-queued ${formatName(job.name)}${formatJobPayload(job.payload)}`)
    } else {
      logger.logTimeline(`Job #${job.id}`, `Queued ${formatName(job.name)}${formatJobPayload(job.payload)}`)
    }
  })

  kodmq.on("jobScheduled", (job) => {
    logger.logTimeline(`Job #${job.id}`, `Scheduled ${formatName(job.name)} to run in ${formatDuration(new Date(), job.runAt, "greenBright")}${formatJobPayload(job.payload)}`)
  })

  kodmq.on("jobActive", (job) => {
    logger.logTimeline(`Job #${job.id}`, `Running ${formatName(job.name)}…`)
  })

  kodmq.on("jobCompleted", (job) => {
    logger.logTimeline(`Job #${job.id}`, `Completed ${formatName(job.name)} in ${formatDuration(job.startedAt, job.finishedAt, "greenBright")}`)
  })

  kodmq.on("jobFailed", (job) => {
    logger.logTimeline(`Job #${job.id}`, `Failed ${formatName(job.name)} in ${formatDuration(job.startedAt, job.failedAt, "redBright")}`)
  })

  kodmq.on("jobScheduledRetry", (job, retryAt, failedJob) => {
    logger.logTimeline(`Job #${failedJob.id}`, `Retrying ${formatName(job.name)} as new job with id ${colorette.gray(`#${job.id}`)} in ${formatDuration(new Date(), retryAt, "yellowBright")}`)
  })

  onShutdown(async () => {
    if (kodmq) {
      logger.logTimeline("Bye", "Stopping...")
      await kodmq.stopAll()
    } else {
      logger.logTimeline("Bye", "See you soon!")
    }
  })

  try {
    await kodmq.workers.start({
      concurrency,
      name,
    })
  } catch (e) {
    throw new KodMQLauncherError("Error starting KodMQ", e as Error)
  }
}
