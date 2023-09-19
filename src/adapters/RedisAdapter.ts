import Redis, { RedisOptions } from "ioredis"
import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "./Adapter.ts"
import { JobStatus, JobStatusHistory } from "../types.ts"
import Job from "../Job.ts"
import { GetJobsOptions } from "../KodMQ.ts"
import Worker, { WorkerData } from "../Worker.ts"

const WorkersKey = "kmq:w"

const KeysByStatus: Record<JobStatus, string> = {
  [JobStatus.Pending]: "kmq:j:p",
  [JobStatus.Scheduled]: "kmq:j:s",
  [JobStatus.Active]: "kmq:j:a",
  [JobStatus.Completed]: "kmq:j:c",
  [JobStatus.Failed]: "kmq:j:f",
}

export default class RedisAdapter extends Adapter {
  client: Redis

  constructor(options: RedisOptions = {}) {
    super()
    this.client = new Redis(options)
  }

  //
  // Jobs
  //

  async getJobs(options: GetJobsOptions = {}) {
    const status = options.status || JobStatus.Pending
    const key = KeysByStatus[status]

    const limit = (options.limit || 0)
    const offset = (options.offset || 0)

    // Retrieve jobs from the Redis based on the status
    const jobs = status === JobStatus.Scheduled
      ? await this.client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, offset + limit - 1)
      : await this.client.lrange(key, offset, offset + limit - 1)

    return Promise.all(jobs.map((job) => this.deserializeJob(job)))
  }

  async saveJob(job: Job, status: JobStatusHistory) {
    const serialized = await this.serializeJob(job)
    await this.client.lset(KeysByStatus[status], job.id, serialized)
  }

  /**
   * Push a job to the queue. Please notice that scheduled jobs are stored in a different key and structure.
   *
   * @param job
   * @param runAt
   */
  async pushJob(job: Job, runAt?: Date) {
    const serialized = await this.serializeJob(job)

    if (runAt) {
      await this.client.zadd(
        KeysByStatus[JobStatus.Scheduled],
        runAt.getTime(),
        serialized
      )
    } else {
      await this.client.rpush(
        KeysByStatus[JobStatus.Pending],
        serialized
      )
    }
  }

  async popJob() {
    const scheduledJobs = await this.client.zrangebyscore(
      KeysByStatus[JobStatus.Scheduled],
      "-inf",
      Date.now(),
      "LIMIT",
      0,
      1,
    )

    if (scheduledJobs.length > 0) {
      await this.client.zrem(KeysByStatus[JobStatus.Scheduled], ...scheduledJobs)
      return this.deserializeJob(scheduledJobs[0])
    }

    const job = await this.client.lpop(KeysByStatus[JobStatus.Pending])
    if (!job) return null

    return this.deserializeJob(job)
  }

  async subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    while (true) {
      if (!keepSubscribed()) break

      const job = await this.popJob()
      if (!job) continue

      await handler(job)
    }
  }

  async serializeJob(job: Job) {
    return JSON.stringify([job.id, job.name, job.data, job.failedAttempts, job.errorMessage, job.errorStack])
  }

  async deserializeJob(serialized: string) {
    const [id, name, data, failedAttempts, errorMessage, errorStack] = JSON.parse(serialized)
    return new Job(id, name, data, failedAttempts, errorMessage, errorStack)
  }

  //
  // Workers
  //

  async getWorkers() {
    const workers = await this.client.lrange(WorkersKey, 0, -1)
    return Promise.all(workers.map((worker) => this.deserializeWorker(worker)))
  }

  async saveWorker(worker: Worker) {
    await this.client.lset(WorkersKey, worker.id, await this.serializeWorker(worker))
  }

  async deleteWorker(worker: Worker) {
    await this.client.lset(WorkersKey, worker.id, "")
  }

  async serializeWorker(worker: Worker) {
    return JSON.stringify([worker.id, worker.startedAt, worker.isRunning, worker.currentJob?.id, worker.currentJob?.name, worker.currentJob?.data])
  }

  async deserializeWorker(serialized: string): Promise<WorkerData> {
    const [id, startedAtRaw, isRunning, currentJobId, currentJobName, currentJobData] = JSON.parse(serialized)
    const startedAt = new Date(startedAtRaw)
    const currentJob = currentJobId ? new Job(currentJobId, currentJobName, currentJobData) : null

    return { id, startedAt, isRunning, currentJob }
  }

  //
  // Other
  //

  async clearAll() {
    for (const key of Object.values(KeysByStatus)) {
      await this.client.del(key)
    }
  }
}
