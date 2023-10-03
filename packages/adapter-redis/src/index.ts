import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "@kodmq/core/adapter"
import { Pending, Scheduled } from "@kodmq/core/constants"
import { KodMQAdapterError } from "@kodmq/core/errors"
import { Job, Worker, ID, JobCreate, WorkerCreate, JobsAllOptions, WorkersAllOptions } from "@kodmq/core/types"
import Redis, { RedisOptions } from "ioredis"

type JobTuple = [
  Job["id"],
  Job["workerId"],
  Job["retryJobId"],
  Job["status"],
  Job["name"],
  Job["payload"],
  Job["createdAt"] | number,
  Job["runAt"] | number,
  Job["startedAt"] | number,
  Job["finishedAt"] | number,
  Job["failedAt"] | number,
  Job["failedAttempts"],
  Job["errorMessage"],
  Job["errorStack"],
]

type WorkerTuple = [
  Worker["id"],
  Worker["status"],
  Worker["clusterName"],
  Worker["startedAt"] | number,
  Worker["stoppedAt"] | number,
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

export type RedisAdapterOptions = {
  redis?: Redis
  redisOptions?: RedisOptions
}

export default class RedisAdapter extends Adapter {
  client: Redis

  constructor(options: RedisAdapterOptions = {}) {
    super()

    if (options.redis) {
      const isRedisClient = options.redis instanceof Redis
      if (!isRedisClient) throw new KodMQAdapterError(`Redis client must be an instance of ioredis. Received: ${typeof options.redis}`)

      this.client = options.redis
    } else {
      if (!options.redisOptions) {
        options.redisOptions = {
          host: process.env.KODMQ_REDIS_HOST ?? process.env.REDIS_HOST ?? "localhost",
          port: Number(process.env.KODMQ_REDIS_PORT ?? process.env.REDIS_PORT ?? 6379),
          password: process.env.KODMQ_REDIS_PASSWORD ?? process.env.REDIS_PASSWORD ?? undefined,
          db: Number(process.env.KODMQ_REDIS_DB ?? process.env.REDIS_DB ?? 0),
        }
      }

      try {
        this.client = new Redis({
          lazyConnect: true,
          connectTimeout: 5000,
          commandTimeout: 5000,
          maxRetriesPerRequest: 5,
          retryStrategy: (times) => times < 5 ? 100 : null,
          ...options.redisOptions,
        })
      } catch (e) {
        throw new KodMQAdapterError("Cannot create Redis client", e as Error)
      }
    }

    this.client.on("error", (error) => {
      // eslint-disable-next-line no-console
      console.error(`Redis error: ${error.message}`)
    })
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

  async getJobs(options: JobsAllOptions = {}) {
    try {
      const limit = (options.limit || 0)
      const offset = (options.offset || 0)

      const rawJobs = await this.getAll(JobsKey, "-inf", "+inf", offset, limit - 1)
      const jobs = await Promise.all(rawJobs.reverse().map((job) => this.deserializeJob(job)))

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

  async createJob(attributes: JobCreate) {
    try {
      const jobId = await this.getNextJobId()
      const job: Job = { ...attributes, id: jobId, createdAt: new Date() }

      const serialized = await this.serializeJob(job)
      await this.add(JobsKey, jobId, serialized)

      return job
    } catch (e) {
      throw new KodMQAdapterError("Cannot create job", e as Error)
    }
  }

  async updateJob(id: ID, attributes: Partial<Job>) {
    try {
      const existingJob = await this.getJob(id)
      if (!existingJob) throw new KodMQAdapterError(`Job ${id} not found`)

      const job = { ...existingJob, ...attributes }

      const serialized = await this.serializeJob(job)
      await this.add(JobsKey, job.id, serialized)

      return job
    } catch (e) {
      throw new KodMQAdapterError("Cannot save job", e as Error)
    }
  }

  async removeJob(id: ID) {
    try {
      const existingJob = await this.getJob(id)
      if (!existingJob) throw new KodMQAdapterError(`Job ${id} not found`)

      await this.remove(JobsKey, id)
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove job", e as Error)
    }
  }

  async pushJobToQueue(id: ID, runAt?: Date) {
    try {
      await this.add(
        runAt ? JobsScheduledKey : JobsQueueKey,
        runAt ? runAt.getTime() : id,
        id,
      )
    } catch (e) {
      throw new KodMQAdapterError("Cannot push job to queue", e as Error)
    }
  }

  async prependJobToQueue(id: ID) {
    try {
      const [score] = await this.getAllWithScore(JobsQueueKey, "-inf", "+inf", 0, 1)
      await this.add(JobsQueueKey, (Number(score) || 1) - 1, id)
    } catch (e) {
      throw new KodMQAdapterError("Cannot prepend job to queue", e as Error)
    }
  }

  async popJobFromQueue() {
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

  async removeJobFromQueue(job: Job) {
    try {
      await this.remove(
        JobsQueueKey,
        job.runAt ? job.runAt.getTime() : job.id,
      )
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove job from queue", e as Error)
    }
  }

  async subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!await keepSubscribed()) break

        // FIXME: This is hack to avoid picking the same job by multiple workers
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))

        const job = await this.popJobFromQueue()
        if (!job || ![Pending, Scheduled].includes(job.status)) continue

        await handler(job)
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot subscribe to jobs", e as Error)
    }
  }

  async serializeJob(job: Job) {
    try {
      if (typeof job !== "object") throw new KodMQAdapterError(`Job must be an object. Received: ${typeof job}`)

      const jobTuple: JobTuple = [
        job.id,
        job.workerId,
        job.retryJobId,
        job.status,
        job.name,
        job.payload,
        job.createdAt.getTime(),
        job.runAt?.getTime(),
        job.startedAt?.getTime(),
        job.finishedAt?.getTime(),
        job.failedAt?.getTime(),
        job.failedAttempts,
        job.errorMessage,
        job.errorStack,
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
        workerId,
        retryJobId,
        status,
        name,
        payload,
        createdAtRaw,
        runAtRaw,
        startedAtRaw,
        finishedAtRaw,
        failedAtRaw,
        failedAttempts,
        errorMessage,
        errorStack,
      ] = JSON.parse(serialized) as JobTuple

      return {
        id,
        workerId,
        retryJobId,
        status,
        name,
        payload,
        createdAt: new Date(createdAtRaw),
        runAt: runAtRaw ? new Date(runAtRaw) : undefined,
        startedAt: startedAtRaw ? new Date(startedAtRaw) : undefined,
        finishedAt: finishedAtRaw ? new Date(finishedAtRaw) : undefined,
        failedAt: failedAtRaw ? new Date(failedAtRaw) : undefined,
        failedAttempts,
        errorMessage,
        errorStack,
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
      return await this.client.incr(WorkersIDKey)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get next worker ID", e as Error)
    }
  }

  async getWorkers(options: WorkersAllOptions = {}) {
    try {
      const limit = (options.limit || 0)
      const offset = (options.offset || 0)

      const rawWorkers = await this.getAll(WorkersKey, "-inf", "+inf", offset, limit - 1)
      const workers = await Promise.all(rawWorkers.reverse().map((worker) => this.deserializeWorker(worker)))

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

  async createWorker(attributes: WorkerCreate) {
    try {
      const workerId = await this.getNextWorkerId()
      const worker: Worker = { ...attributes, id: workerId }

      const serialized = await this.serializeWorker(worker)
      await this.add(WorkersKey, workerId, serialized)

      return worker
    } catch (e) {
      throw new KodMQAdapterError("Cannot create worker", e as Error)
    }
  }

  async updateWorker(id: ID, attributes: Partial<Worker>) {
    try {
      const existingWorker = await this.getWorker(id)
      if (!existingWorker) throw new KodMQAdapterError(`Worker ${id} not found`)

      const worker = { ...existingWorker, ...attributes }

      const serialized = await this.serializeWorker(worker)
      await this.add(WorkersKey, worker.id, serialized)

      return worker
    } catch (e) {
      throw new KodMQAdapterError("Cannot update worker", e as Error)
    }
  }

  async removeWorker(id: ID) {
    try {
      const existingWorker = await this.getWorker(id)
      if (!existingWorker) throw new KodMQAdapterError(`Worker ${id} not found`)

      await this.remove(WorkersKey, id)
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove worker", e as Error)
    }
  }

  async serializeWorker(worker: Worker) {
    try {
      if (typeof worker !== "object") throw new KodMQAdapterError(`Worker must be an object. Received: ${typeof worker}`)

      const workerTuple: WorkerTuple = [
        worker.id,
        worker.status,
        worker.clusterName,
        worker.startedAt?.getTime(),
        worker.stoppedAt?.getTime(),
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
        clusterName,
        startedAtRaw,
        stoppedAtRaw,
        currentJobId,
        currentJobName,
        currentJobData,
      ] = JSON.parse(serialized) as WorkerTuple

      return {
        id,
        status,
        clusterName,
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
  
  async isConnected() {
    try {
      return this.client.status === "ready"
    } catch (e) {
      return false
    }
  }

  async ping() {
    try {
      return await this.client.ping()
    } catch (e) {
      throw new KodMQAdapterError("Cannot ping", e as Error)
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

  isKodMQAdapter() {
    return true
  }
}
