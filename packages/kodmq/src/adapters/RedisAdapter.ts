import Redis, { RedisOptions } from "ioredis"
import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "~/src/adapters/Adapter"
import { KodMQAdapterError, KodMQError } from "~/src/errors"
import { GetJobsOptions, GetWorkersOptions } from "~/src/KodMQ"
import { Job, Worker, ID } from "~/src/types"

type JobTuple = [
  Job["id"],
  Job["status"],
  Job["name"],
  Job["payload"],
  Job["runAt"] | string,
  Job["startedAt"] | string,
  Job["finishedAt"] | string,
  Job["failedAt"] | string,
  Job["failedAttempts"],
  Job["errorMessage"],
  Job["errorStack"],
  Job["retryJobId"],
]

type WorkerTuple = [
  Worker["id"],
  Worker["status"],
  Worker["startedAt"] | string,
  Worker["stoppedAt"] | string,
  Job["id"]?,
  Job["name"]?,
  Job["payload"]?,
]

const GlobalPrefix = "kmq::"
const JobsKey = `${GlobalPrefix}j`
const JobsIDKey = `${GlobalPrefix}jid`
const JobsQueueKey = `${GlobalPrefix}jq`
const JobsScheduledKey = `${GlobalPrefix}js`
const WorkersKey = `${GlobalPrefix}w`
const WorkersIDKey = `${GlobalPrefix}wid`

export default class RedisAdapter extends Adapter {
  client: Redis

  constructor(options: RedisOptions = {}) {
    super()

    try {
      this.client = new Redis(options)
    } catch (e) {
      throw new KodMQAdapterError("Cannot create Redis client", e as Error)
    }
  }

  //
  // Jobs
  //

  async getNextJobId() {
    try {
      return await this.client.incr(JobsIDKey)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get next job ID", e as Error)
    }
  }

  async getJobs(options: GetJobsOptions = {}) {
    try {
      const limit = (options.limit || 0)
      const offset = (options.offset || 0)

      const rawJobs = await this.getAll(JobsKey, "-inf", "+inf", offset, limit - 1)
      const jobs = await Promise.all(rawJobs.map((job) => this.deserializeJob(job)))

      if (options.status !== undefined) {
        return jobs.filter((job) => job.status === options.status)
      } else {
        return jobs
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot get jobs", e as Error)
    }
  }

  async getJob(id: ID) {
    try {
      const serialized = await this.getOne(JobsKey, id)
      if (!serialized) return null

      return await this.deserializeJob(serialized)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get job", e as Error)
    }
  }

  async saveJob(job: Job) {
    try {
      const serialized = await this.serializeJob(job)
      await this.add(JobsKey, job.id, serialized)
    } catch (e) {
      throw new KodMQAdapterError("Cannot save job", e as Error)
    }
  }

  async removeJob(job: Job) {
    try {
      await this.remove(JobsKey, job.id)
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove job", e as Error)
    }
  }

  /**
   * Push a job to the queue
   *
   * @param job
   */
  async pushJob(job: Job) {
    try {
      const serialized = await this.serializeJob(job)

      await this.add(
        JobsKey,
        job.id,
        serialized
      )

      await this.add(
        job.runAt ? JobsScheduledKey : JobsQueueKey,
        job.runAt ? job.runAt.getTime() : job.id,
        job.id,
      )
    } catch (e) {
      throw new KodMQAdapterError("Cannot push job to queue", e as Error)
    }
  }

  async popJob() {
    try {
      const [scheduledJobId, score] = await this.getAllWithScore(
        JobsScheduledKey,
        "-inf",
        Date.now(),
        0,
        1,
      )

      if (scheduledJobId) {
        await this.remove(JobsScheduledKey, score)
        return await this.getJob(scheduledJobId)
      }

      // TODO: Use lpush and rpop to store pending jobs
      const jobId = await this.pop(JobsQueueKey)
      if (!jobId) return null

      return await this.getJob(jobId)
    } catch (e) {
      throw new KodMQAdapterError("Cannot pop job from queue", e as Error)
    }
  }

  async subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!await keepSubscribed()) break

        // FIXME: This is hack to avoid picking the same job by multiple workers
        // await new Promise((resolve) => setTimeout(resolve, Math.random() * 30))

        const job = await this.popJob()
        if (!job) continue

        await handler(job)
      }
    } catch (e) {
      if (e instanceof KodMQError) throw e
      throw new KodMQAdapterError("Cannot subscribe to jobs", e as Error)
    }
  }

  async serializeJob(job: Job) {
    try {
      const jobTuple: JobTuple = [
        job.id,
        job.status,
        job.name,
        job.payload,
        job.runAt,
        job.startedAt,
        job.finishedAt,
        job.failedAt,
        job.failedAttempts,
        job.errorMessage,
        job.errorStack,
        job.retryJobId,
      ]

      return JSON.stringify(jobTuple)
    } catch (e) {
      throw new KodMQAdapterError("Cannot serialize job", e as Error)
    }
  }

  async deserializeJob(serialized: string): Promise<Job> {
    try {
      const [
        id,
        status,
        name,
        payload,
        runAtRaw,
        startedAtRaw,
        finishedAtRaw,
        failedAtRaw,
        failedAttempts,
        errorMessage,
        errorStack,
        retryJobId,
      ] = JSON.parse(serialized) as JobTuple

      return {
        id,
        status,
        name,
        payload,
        runAt: runAtRaw ? new Date(runAtRaw) : undefined,
        startedAt: startedAtRaw ? new Date(startedAtRaw) : undefined,
        finishedAt: finishedAtRaw ? new Date(finishedAtRaw) : undefined,
        failedAt: failedAtRaw ? new Date(failedAtRaw) : undefined,
        failedAttempts,
        errorMessage,
        errorStack,
        retryJobId,
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot deserialize job", e as Error)
    }
  }

  //
  // Workers
  //

  async getNextWorkerId() {
    try {
      return this.client.incr(WorkersIDKey)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get next worker ID", e as Error)
    }
  }

  async getWorkers(options: GetWorkersOptions = {}) {
    try {
      const limit = (options.limit || 0)
      const offset = (options.offset || 0)

      const rawWorkers = await this.getAll(WorkersKey, "-inf", "+inf", offset, limit - 1)
      const workers = await Promise.all(rawWorkers.map((worker) => this.deserializeWorker(worker)))

      if (options.status) {
        return workers.filter((worker) => worker.status === options.status)
      } else {
        return workers
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot get workers", e as Error)
    }
  }

  async getWorker(id: ID) {
    try {
      const worker = await this.getOne(WorkersKey, id)
      if (!worker) return null

      return this.deserializeWorker(worker)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get worker", e as Error)
    }
  }

  async saveWorker(worker: Worker) {
    try {
      const serialized = await this.serializeWorker(worker)
      await this.add(WorkersKey, worker.id, serialized)
    } catch (e) {
      throw new KodMQAdapterError("Cannot save worker", e as Error)
    }
  }

  async removeWorker(worker: Worker) {
    try {
      await this.remove(WorkersKey, worker.id)
    } catch (e) {
      throw new KodMQAdapterError("Cannot delete worker", e as Error)
    }
  }

  async serializeWorker(worker: Worker) {
    try {
      const workerTuple: WorkerTuple = [
        worker.id,
        worker.status,
        worker.startedAt,
        worker.stoppedAt,
        worker.currentJob?.id,
        worker.currentJob?.name,
        worker.currentJob?.payload,
      ]

      return JSON.stringify(workerTuple)
    } catch (e) {
      throw new KodMQAdapterError("Cannot serialize worker", e as Error)
    }
  }

  async deserializeWorker(serialized: string): Promise<Worker> {
    try {
      const [
        id,
        status,
        startedAtRaw,
        stoppedAtRaw,
        currentJobId,
        currentJobName,
        currentJobData,
      ] = JSON.parse(serialized) as WorkerTuple

      return {
        id,
        status,
        startedAt: startedAtRaw ? new Date(startedAtRaw) : undefined,
        stoppedAt: stoppedAtRaw ? new Date(stoppedAtRaw) : undefined,
        currentJob: currentJobId ? { id: currentJobId, name: currentJobName!, payload: currentJobData! } : undefined,
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot deserialize worker", e as Error)
    }
  }

  //
  // Other
  //

  async clearAll() {
    try {
      const keys = await this.client.keys(`${GlobalPrefix}*`)

      for (const key of keys) {
        await this.client.del(key)
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot clear all data", e as Error)
    }
  }

  async openConnection() {
    try {
      await this.client.connect()
    } catch (e) {
      throw new KodMQAdapterError("Cannot open connection", e as Error)
    }
  }

  async closeConnection() {
    try {
      await this.client.quit()
    } catch (e) {
      throw new KodMQAdapterError("Cannot close connection", e as Error)
    }
  }

  //
  // Redis sorted sets
  //

  private async getAll(key: string, min: ID, max: ID, offset: number, limit: number) {
    try {
      return await this.client.zrangebyscore(key, min, max, "LIMIT", offset, offset + limit)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get from sorted set", e as Error)
    }
  }

  private async getAllWithScore(key: string, min: ID, max: ID, offset: number, limit: number) {
    try {
      return await this.client.zrangebyscore(key, min, max, "WITHSCORES", "LIMIT", offset, offset + limit)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get from sorted set with scores", e as Error)
    }
  }

  private async getOne(key: string, score: ID) {
    try {
      const items = await this.client.zrangebyscore(key, Number(score), Number(score))
      return items[0] || null
    } catch (e) {
      throw new KodMQAdapterError("Cannot get from sorted set", e as Error)
    }
  }

  private async add(key: string, score: ID, value: string | number) {
    try {
      await this.client.zremrangebyscore(key, Number(score), Number(score)) // Remove existing item
      await this.client.zadd(key, Number(score), value)
    } catch (e) {
      throw new KodMQAdapterError("Cannot add to sorted set", e as Error)
    }
  }

  private async pop(key: string) {
    try {
      const item = await this.client.zpopmin(key)
      return item ? item[0] : null
    } catch (e) {
      throw new KodMQAdapterError("Cannot pop from sorted set", e as Error)
    }
  }

  private async remove(key: string, score: ID) {
    try {
      await this.client.zremrangebyscore(key, Number(score), Number(score))
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove from sorted set", e as Error)
    }
  }
}
