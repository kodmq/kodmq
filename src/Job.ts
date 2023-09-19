import { JobData, JobName } from "./types.ts"
import KodMQ from "./KodMQ.ts"

export default class Job<T extends JobData = any> {
  constructor(
    public name: JobName,
    public data: T
  ) {}

  async run(kodmq: KodMQ) {
    const handler = kodmq.handlers[this.name]
    if (!handler) throw new Error(`No handler found for job: ${this.name}`)

    await handler(this.data)
  }
}
