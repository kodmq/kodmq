import * as colorette from "colorette"
import { onShutdown } from "node-graceful-shutdown"
import { KodMQLauncherError } from "../errors.js"
import KodMQ from "../kodmq.js"
import Logger from "./logger.js"
import { formatDuration, formatJobPayload, formatName } from "./utils.js"

export type LaunchOptions = {
  concurrency?: number
  clusterName?: string
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

  const envConcurrencyName = "KODMQ_CONCURRENCY"
  const concurrencyEnv = process.env[envConcurrencyName]
  const concurrencyArg = process.argv.find((arg) => arg.startsWith("--concurrency="))
  const concurrencyArgValue = concurrencyArg ? concurrencyArg.split("=")[1] : undefined

  const concurrency =  [
    concurrencyArgValue ? parseInt(concurrencyArgValue) : undefined,
    options.concurrency,
    concurrencyEnv ? parseInt(concurrencyEnv) : undefined,
    1,
  ].find((c) => c !== undefined)

  const envClusterName = "KODMQ_CLUSTER_NAME"
  const clusterNameEnv = process.env[envClusterName]
  const clusterNameArg = process.argv.find((arg) => arg.startsWith("--cluster-name="))
  const clusterNameArgValue = clusterNameArg ? clusterNameArg.split("=")[1] : undefined

  const clusterName = [
    clusterNameArgValue,
    options.clusterName,
    clusterNameEnv,
  ].find((c) => c !== undefined)

  const logger = new Logger(options.logger)
  logger.logWithPrefix("Starting KodMQ...")
  logger.logWithCheckmark("Concurrency:", colorette.yellowBright(concurrency!.toString()))
  if (clusterName) logger.logWithCheckmark("Cluster name:", colorette.yellowBright(clusterName))
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
      logger.logTimeline(`Worker #${worker.id}`, `Worker has been killed. Job #${worker.currentJob.id} ${formatName(worker.currentJob.name)} has been requeued`)
    } else {
      logger.logTimeline(`Worker #${worker.id}`, "Worker has been killed")
    }
  })

  kodmq.on("jobPending", (job) => {
    logger.logTimeline(`Job #${job.id}`, `Queued ${formatName(job.name)}${formatJobPayload(job.payload)}`)
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

  kodmq.on("scheduleJobRetry", (job, retryAt, failedJob) => {
    logger.logTimeline(`Job #${failedJob.id}`, `Retrying ${formatName(job.name)} with new ID #${job.id} in ${formatDuration(new Date(), retryAt, "yellowBright")}`)
  })

  onShutdown(async () => {
    logger.logTimeline("Bye", "Stopping KodMQ")
    await kodmq?.stopAllAndCloseConnection()
  })

  try {
    await kodmq.start({
      concurrency,
      clusterName,
    })
  } catch (e) {
    throw new KodMQLauncherError("Error starting KodMQ", e as Error)
  }
}
