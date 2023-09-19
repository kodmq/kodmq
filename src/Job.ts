import { JobData, JobName } from "./types.ts"
import KodMQ from "./KodMQ.ts"

export default class Job<T extends JobData = any> {
  constructor(
    public id: string | number,
    public name: JobName,
    public data: T,
    public failedAttempts: number = 0,
    public errorMessage: string | null = null,
    public errorStack: string | null = null,
  ) {}

  /**
   * Run the job
   *
   * @param kodmq
   */
  async run(kodmq: KodMQ) {
    const handler = kodmq.handlers[this.name]
    if (!handler) throw new Error(`No handler found for job: ${this.name}`)

    await handler(this.data)
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
