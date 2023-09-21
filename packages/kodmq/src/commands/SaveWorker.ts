import KodMQ, {
  Active, Idle, Stopped, Stopping,
  Worker,
  WorkerCallbackName,
  WorkerStatus,
} from "~/src"
import Command from "~/src/commands/Command"

const StatusCallbacks: Record<WorkerStatus, WorkerCallbackName> = {
  [Idle]: "onWorkerIdle",
  [Active]: "onWorkerActive",
  [Stopping]: "onWorkerStopping",
  [Stopped]: "onWorkerStopped",
}

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
    "runCallbacks",
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

  async runCallbacks() {
    await this.kodmq.runCallback("onWorkerChanged", this.worker)

    if (this.attributes?.status !== undefined) {
      await this.kodmq.runCallback(
        StatusCallbacks[this.attributes.status],
        this.worker,
      )
    }

    if ("currentJob" in this.attributes) {
      await this.kodmq.runCallback("onWorkerCurrentJobChanged", this.worker)
    }
  }
}
