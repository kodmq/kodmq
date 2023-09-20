import KodMQ from "~/src/KodMQ"
import { JobData, JobName } from "~/src/types"

export default class Job<T extends JobData = any> {
  startedAt?: Date
  finishedAt?: Date

  constructor(
    public id: string | number,
    public name: JobName,
    public data: T,
    startedAt?: Date | string,
    finishedAt?: Date | string,
    public failedAttempts: number = 0,
    public errorMessage: string | null = null,
    public errorStack: string | null = null,
  ) {
    if (typeof startedAt === "string") this.startedAt = new Date(startedAt)
    if (typeof finishedAt === "string") this.finishedAt = new Date(finishedAt)
  }

  /**
   * Run the job
   *
   * @param kodmq
   */
  async run(kodmq: KodMQ) {
    const handler = kodmq.handlers[this.name]
    if (!handler) throw new Error(`No handler found for job: ${this.name}`)

    this.startedAt = new Date()
    await handler(this.data)
    this.finishedAt = new Date()
  }

  /**
   * Create a new job and assign it a random id
   *
   * @param name
   * @param data
   * @param kodmq
   */
  static async create<T extends JobData = any>(name: JobName, data: T, kodmq: KodMQ) {
    return new Job<T>(
      await kodmq.adapter.getNextJobId(),
      name,
      data
    )
  }
}
