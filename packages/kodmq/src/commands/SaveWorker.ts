import KodMQ, { Worker } from "~/src"
import Command from "~/src/commands/Command"

export type SaveWorkerArgs<
  TWorker extends Worker = Worker,
  TKodMQ extends KodMQ = KodMQ,
> = {
  worker: TWorker,
  attributes: Partial<TWorker>,
  kodmq: TKodMQ,
}

export class SaveWorker<TArgs extends SaveWorkerArgs = SaveWorkerArgs> extends Command<TArgs> {
  worker: TArgs["worker"]
  attributes: TArgs["attributes"]
  kodmq: TArgs["kodmq"]

  steps = [
    "retrieveLatestState",
    "updateObject",
    "saveToAdapter",
  ]

  alwaysRunSteps = []

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.worker = args.worker
    this.attributes = args.attributes
    this.kodmq = args.kodmq
  }

  async retrieveLatestState() {
    const latestWorkerState = await this.kodmq.adapter.getWorker(this.worker.id) as TArgs["worker"]
    if (!latestWorkerState) return

    this.worker = latestWorkerState
  }

  async updateObject() {
    Object.assign(this.worker, this.attributes)
  }

  async saveToAdapter() {
    await this.kodmq.adapter.saveWorker(this.worker)
  }
}
