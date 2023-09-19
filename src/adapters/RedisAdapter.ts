import Redis, { RedisOptions } from "ioredis"
import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "./Adapter.ts"
import { JobStatus } from "../types.ts"
import Job from "../Job.ts"
import { GetJobsOptions } from "../KodMQ.ts"
import Worker, { WorkerData } from "../Worker.ts"
import { KodMQAdapterError } from "../errors.ts"

const GlobalPrefix = "kmq:"
const WorkersKeyPrefix = `${GlobalPrefix}:w:`

const JobKeys: Record<JobStatus, string> = {
  [JobStatus.Pending]: `${GlobalPrefix}:j:p`,
  [JobStatus.Scheduled]: `${GlobalPrefix}:j:s`,
  [JobStatus.Active]: `${GlobalPrefix}:j:a`,
  [JobStatus.Completed]: `${GlobalPrefix}:j:c`,
  [JobStatus.Failed]: `${GlobalPrefix}:j:f`,
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

  async getNextJobId() {
    try {
      return this.client.incr(`${GlobalPrefix}:j:id`)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get next job ID", e as Error)
    }
  }

  async getJobs(options: GetJobsOptions = {}) {
    try {
      const status = options.status || JobStatus.Pending
      const limit = (options.limit || 0)
      const offset = (options.offset || 0)

      const jobs = await this.getFromSet(JobKeys[status], "-inf", "+inf", offset, limit - 1)

      return Promise.all(jobs.map((job) => this.deserializeJob(job)))
    } catch (e) {
      throw new KodMQAdapterError("Cannot get jobs", e as Error)
    }
  }

  async saveJob(job: Job, status: JobStatus) {
    try {
      const serialized = await this.serializeJob(job)
      await this.addToSet(JobKeys[status], job.id as number, serialized)
    } catch (e) {
      throw new KodMQAdapterError("Cannot save job", e as Error)
    }
  }

  /**
   * Push a job to the queue. Please notice that scheduled jobs are stored in a different key and structure.
   *
   * @param job
   * @param runAt
   */
  async pushJob(job: Job, runAt?: Date) {
    try {
      const serialized = await this.serializeJob(job)

      if (runAt) {
        await this.addToSet(
          JobKeys[JobStatus.Scheduled],
          runAt.getTime(),
          serialized
        )
      } else {
        await this.addToSet(
          JobKeys[JobStatus.Pending],
          job.id as number,
          serialized
        )
      }
    } catch (e) {
      throw new KodMQAdapterError("Cannot push job to queue", e as Error)
    }
  }

  async popJob() {
    try {
      const [scheduledJob, score] = await this.getFromSetWithScores(
        JobKeys[JobStatus.Scheduled],
        "-inf",
        Date.now(),
        0,
        1,
      )

      if (scheduledJob) {
        const job = await this.deserializeJob(scheduledJob)
        await this.removeFromSet(JobKeys[JobStatus.Scheduled], score)

        return job
      }

      const job = await this.popFromSet(JobKeys[JobStatus.Pending])
      if (!job) return null

      return this.deserializeJob(job)
    } catch (e) {
      throw new KodMQAdapterError("Cannot pop job from queue", e as Error)
    }
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
    try {
      return JSON.stringify([job.id, job.name, job.data, job.failedAttempts, job.errorMessage, job.errorStack])
    } catch (e) {
      throw new KodMQAdapterError("Cannot serialize job", e as Error)
    }
  }

  async deserializeJob(serialized: string) {
    try {
      const [id, name, data, failedAttempts, errorMessage, errorStack] = JSON.parse(serialized) as any
      return new Job(id, name, data, failedAttempts, errorMessage, errorStack)
    } catch (e) {
      throw new KodMQAdapterError("Cannot deserialize job", e as Error)
    }
  }

  //
  // Workers
  //

  async getNextWorkerId() {
    try {
      return this.client.incr(`${GlobalPrefix}:w:id`)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get next worker ID", e as Error)
    }
  }

  async getWorkers() {
    try {
      const workersKeys = await this.client.keys(`${WorkersKeyPrefix}*`)
      const workers = await Promise.all(workersKeys.map((key) => this.client.get(key)))
      return Promise.all(workers.filter(Boolean).map((worker) => this.deserializeWorker(worker)))
    } catch (e) {
      throw new KodMQAdapterError("Cannot get workers", e as Error)
    }
  }

  async saveWorker(worker: Worker) {
    try {
      await this.client.set(`${WorkersKeyPrefix}${worker.id}`, await this.serializeWorker(worker))
    } catch (e) {
      throw new KodMQAdapterError("Cannot save worker", e as Error)
    }
  }

  async deleteWorker(worker: Worker) {
    try {
      await this.client.del(`${WorkersKeyPrefix}${worker.id}`)
    } catch (e) {
      throw new KodMQAdapterError("Cannot delete worker", e as Error)
    }
  }

  async serializeWorker(worker: Worker) {
    try {
      return JSON.stringify([worker.id, worker.startedAt, worker.status, worker.currentJob?.id, worker.currentJob?.name, worker.currentJob?.data])
    } catch (e) {
      throw new KodMQAdapterError("Cannot serialize worker", e as Error)
    }
  }

  async deserializeWorker(serialized: string): Promise<WorkerData> {
    try {
      const [id, startedAtRaw, status, currentJobId, currentJobName, currentJobData] = JSON.parse(serialized) as any
      const startedAt = new Date(startedAtRaw)
      const currentJob = currentJobId ? new Job(currentJobId, currentJobName, currentJobData) : null

      return { id, startedAt, status, currentJob }
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

  //
  // Redis sorted sets
  //

  private async getFromSet(key: string, min: number | string, max: number | string, offset: number, limit: number) {
    try {
      return await this.client.zrangebyscore(key, min, max, "LIMIT", offset, offset + limit)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get from sorted set", e as Error)
    }
  }

  private async getFromSetWithScores(key: string, min: number | string, max: number | string, offset: number, limit: number) {
    try {
      return await this.client.zrangebyscore(key, min, max, "WITHSCORES", "LIMIT", offset, offset + limit)
    } catch (e) {
      throw new KodMQAdapterError("Cannot get from sorted set with scores", e as Error)
    }
  }

  private async addToSet(key: string, score: number, value: string) {
    try {
      await this.client.zadd(key, score, value)
    } catch (e) {
      throw new KodMQAdapterError("Cannot add to sorted set", e as Error)
    }
  }

  private async popFromSet(key: string) {
    try {
      const item = await this.client.zpopmin(key)
      return item ? item[0] : null
    } catch (e) {
      throw new KodMQAdapterError("Cannot pop from sorted set", e as Error)
    }
  }

  private async removeFromSet(key: string, score: number | string) {
    try {
      await this.client.zremrangebyscore(key, score, score)
    } catch (e) {
      throw new KodMQAdapterError("Cannot remove from sorted set", e as Error)
    }
  }
}
