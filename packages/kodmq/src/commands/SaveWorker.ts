import { Active, Idle, Killed, Stopped, Stopping } from "../constants"
import KodMQ from "../kodmq"
import { ID, Worker, WorkerCallbackName, WorkerStatus } from "../types"
import Command from "./Command"

const StatusCallbacks: Record<WorkerStatus, WorkerCallbackName> = {
  [Idle]: "workerIdle",
  [Active]: "workerActive",
  [Stopping]: "workerStopping",
  [Stopped]: "workerStopped",
  [Killed]: "workerKilled",
}

export type SaveWorkerArgs = {
  workerId: ID,
  attributes: Partial<Worker>,
  kodmq: KodMQ,
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
    await this.kodmq.runCallbacks("workerChanged", this.worker)

    if (this.attributes?.status !== undefined) {
      await this.kodmq.runCallbacks(
        StatusCallbacks[this.attributes.status],
        this.worker,
      )
    }
  }
}
