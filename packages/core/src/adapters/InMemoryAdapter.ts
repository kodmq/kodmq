// This file is for testing purposes only

import { AdapterHandler, AdapterKeepSubscribed } from "../adapter.js"
import Adapter from "../adapter.js"
import { Pending, Scheduled } from "../constants.js"
import { JobsAllOptions, WorkerCreate } from "../types.js"
import { ID, Job, JobCreate, Worker, WorkersAllOptions } from "../types.js"

let jobId = 0
let jobs: Job[] = []

let workerId = 0
let workers: Worker[] = []

let queue: ID[] = []
let scheduledQueue: Record<ID, number> = {}

export default class InMemoryAdapter extends Adapter {
  constructor() {
    super()
  }
  
  async getNextJobId() {
    return ++jobId
  }
  
  async getJobs(options: JobsAllOptions = {}) {
    if (options.status !== undefined) {
      return jobs.filter((job) => job.status === options.status).reverse()
    } else {
      return jobs.reverse()
    }
  }
  
  async getJob(id: ID) {
    return jobs.find((job) => job.id === id)
  }

  async createJob(attributes: JobCreate) {
    const job: Job = {
      id: await this.getNextJobId(),
      createdAt: new Date(),
      ...attributes,
    }

    jobs.push(job)
    return job
  }

  async updateJob(id: ID, attributes: Partial<Job>) {
    const job = await this.getJob(id)
    if (!job) throw new Error(`Job ${id} not found`)

    Object.assign(job, attributes)
    return job
  }

  async removeJob(id: ID) {
    const index = jobs.findIndex((job) => job.id === id)
    if (index === -1) throw new Error(`Job ${id} not found`)

    jobs.splice(index, 1)
  }

  async pushJobToQueue(id: ID, runAt?: Date) {
    if (runAt) {
      scheduledQueue[id] = runAt.getTime()
    } else {
      queue.push(id)
    }
  }

  async prependJobToQueue(id: ID) {
    queue.unshift(id)
  }

  async popJobFromQueue() {
    const currentTime = Date.now()

    // Find the first job that is scheduled to run in the past
    const scheduledEntries = Object.entries(scheduledQueue)
    const index = scheduledEntries.findIndex(([_id, runAt]) => runAt <= currentTime)

    if (index !== -1) {
      const [jobId] = scheduledEntries[index]
      delete scheduledQueue[jobId]

      return jobs.find((job) => job.id === Number(jobId))!
    }

    // If no scheduled jobs are found, return the first job in the queue
    const id = queue.shift()
    if (!id) return null

    return jobs.find((job) => job.id === id)!
  }

  async removeJobFromQueue(job: Job) {
    const index = queue.findIndex((id) => id === job.id)
    if (index === -1) throw new Error(`Job ${job.id} not found in queue`)

    queue.splice(index, 1)
  }

  async subscribeToJobs(handler: AdapterHandler, keepSubscribed: AdapterKeepSubscribed) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!await keepSubscribed()) break

      // FIXME: This is hack to avoid picking the same job by multiple workers
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 50))

      const job = await this.popJobFromQueue()
      if (!job || ![Pending, Scheduled].includes(job.status)) continue

      await handler(job)
    }
  }

  async getNextWorkerId() {
    return ++workerId
  }

  async getWorkers(options: WorkersAllOptions = {}) {
    if (options.status !== undefined) {
      return workers.filter((worker) => worker.status === options.status).reverse()
    } else {
      return workers.reverse()
    }
  }

  async getWorker(id: ID) {
    return workers.find((worker) => worker.id === id) ?? null
  }

  async createWorker(attributes: WorkerCreate) {
    const worker: Worker = {
      id: await this.getNextWorkerId(),
      ...attributes,
    }

    workers.push(worker)
    return worker
  }

  async updateWorker(id: ID, attributes: Partial<Worker>) {
    const worker = await this.getWorker(id)
    if (!worker) throw new Error(`Worker ${id} not found`)

    Object.assign(worker, attributes)
    return worker
  }

  async removeWorker(id: ID) {
    const index = workers.findIndex((worker) => worker.id === id)
    if (index === -1) throw new Error(`Worker ${id} not found`)

    workers.splice(index, 1)
  }

  async clearAll() {
    jobId = 0
    jobs = []
    workerId = 0
    workers = []
    queue = []
    scheduledQueue = {}
  }

  async openConnection() {}
  async closeConnection() {}
  async isConnected() { return true }
  async ping() { return true }
  isKodMQAdapter() { return true }
}
