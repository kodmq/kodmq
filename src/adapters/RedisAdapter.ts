import Redis, { RedisOptions } from "ioredis"
import Adapter, { AdapterHandler, AdapterKeepSubscribed } from "./Adapter.ts"
import { JobStatus } from "../types.ts"
import Job from "../Job.ts"
import { GetJobsOptions } from "../KodMQ.ts"

const KeysByStatus: Record<JobStatus, string> = {
  [JobStatus.Pending]: "j:p",
  [JobStatus.Scheduled]: "j:s",
  [JobStatus.Active]: "j:a",
  [JobStatus.Completed]: "j:c",
  [JobStatus.Failed]: "j:f",
}

export default class RedisAdapter extends Adapter {
  client: Redis

  constructor(options: RedisOptions = {}) {
    super()
    this.client = new Redis(options)
  }

  async pushJob(
    job: Job,
    runAt?: Date,
  ) {
    const serialized = await this.serialize(job)

    if (runAt && runAt.getTime() > Date.now()) {
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
      return this.deserialize(scheduledJobs[0])
    }

    const job = await this.client.lpop(KeysByStatus[JobStatus.Pending])
    if (!job) return null

    return this.deserialize(job)
  }

  async getJobs(options: GetJobsOptions = {}) {
    const status = options.status || JobStatus.Pending
    const key = KeysByStatus[status]

    const limit = (options.limit || 0)
    const offset = (options.offset || 0)

    const jobs = status === JobStatus.Scheduled
      ? await this.client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, offset + limit - 1)
      : await this.client.lrange(key, offset, offset + limit - 1)

    return Promise.all(jobs.map((job) => this.deserialize(job)))
  }

  async subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    while (true) {
      if (!keepSubscribed()) break

      const job = await this.popJob()
      if (!job) continue

      await handler(job)
    }
  }

  async clearAll() {
    for (const key of Object.values(KeysByStatus)) {
      await this.client.del(key)
    }
  }

  async serialize(job: Job) {
    return JSON.stringify([job.name, job.data])
  }

  async deserialize(serialized: string) {
    const [name, data] = JSON.parse(serialized)
    return new Job(name, data)
  }
}
