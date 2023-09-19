import KodMQ from "./KodMQ.ts"

export default class Worker<TKodMQ extends KodMQ> {
  kodmq: TKodMQ
  isRunning: boolean = false

  constructor(kodmq: TKodMQ) {
    this.kodmq = kodmq
  }

  async start() {
    this.isRunning = true

    await this.kodmq.adapter.subscribeToJobs(
      (job) => job.run(this.kodmq),
      () => this.isRunning,
    )

    return this
  }

  stop() {
    this.isRunning = false
  }
}
