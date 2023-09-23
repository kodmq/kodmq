import KodMQ from "../kodmq"
import { Active, Idle, Stopped, Stopping, Killed } from "../constants"
import { Worker, WorkerCallbackName, WorkerStatus, Job, ID } from "../types"
import Command from "./Command"

const StatusCallbacks: Record<WorkerStatus, WorkerCallbackName> = {
  [Idle]: "onWorkerIdle",
  [Active]: "onWorkerActive",
  [Stopping]: "onWorkerStopping",
  [Stopped]: "onWorkerStopped",
  [Killed]: "onWorkerKilled",
}

export type SaveWorkerArgs<
  TWorker extends Worker = Worker,
  TKodMQ extends KodMQ = KodMQ,
> = {
  workerId: ID,
  attributes: Partial<TWorker>,
  kodmq: TKodMQ,
}

export class SaveWorker<TArgs extends SaveWorkerArgs = SaveWorkerArgs> extends Command<TArgs> {
  workerId: TArgs["workerId"]
  worker: Worker
  attributes: TArgs["attributes"]
  kodmq: TArgs["kodmq"]

  steps = [
    "getLatestState",
    "updateObject",
    "saveToAdapter",
    "runCallbacks",
  ]

  alwaysRunSteps = []

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.workerId = args.workerId
    this.worker = {} as Worker
    this.attributes = args.attributes
    this.kodmq = args.kodmq
  }

  async getLatestState() {
    const worker = await this.kodmq.adapter.getWorker(this.workerId)
    if (!worker) return

    this.worker = worker
  }

  async updateObject() {
    Object.assign(this.worker, this.attributes)
  }

  async saveToAdapter() {
    await this.kodmq.adapter.saveWorker(this.worker)
  }

  async runCallbacks() {
    await this.kodmq.runCallbacks("onWorkerChanged", this.worker)

    if (this.attributes?.status !== undefined) {
      await this.kodmq.runCallbacks(
        StatusCallbacks[this.attributes.status],
        this.worker,
      )
    }

    if ("currentJob" in this.attributes) {
      await this.kodmq.runCallbacks("onWorkerCurrentJobChanged", this.worker, this.attributes.currentJob as Job)
    }
  }
}
