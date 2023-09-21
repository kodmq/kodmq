import KodMQ, { Active, Completed, Failed, JobCallbackName, JobStatus, Job } from "~/src"
import Command from "~/src/commands/Command"

const StatusCallbacks: Partial<Record<JobStatus, JobCallbackName>> = {
  [Active]: "onJobActive",
  [Completed]: "onJobCompleted",
  [Failed]: "onJobFailed",
}

export type SaveJobToArgs<
  TJob extends Job = Job,
  TKodMQ extends KodMQ = KodMQ,
> = {
  job: TJob
  attributes?: Partial<TJob>
  to: JobStatus
  from?: JobStatus
  kodmq: TKodMQ
}

export class SaveJobTo<TArgs extends SaveJobToArgs> extends Command<TArgs> {
  job: TArgs["job"]
  attributes?: TArgs["attributes"]
  to: TArgs["to"]
  removeFrom?: TArgs["from"]
  kodmq: TArgs["kodmq"]

  steps = [
    "updateObject",
    "removeJobFromPreviousStatus",
    "saveJobToNewStatus",
    "runCallbacks",
  ]

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.job = args.job
    this.attributes = args.attributes
    this.to = args.to
    this.removeFrom = args.from
    this.kodmq = args.kodmq
  }

  updateObject() {
    if (!this.attributes) return

    Object.assign(this.job, this.attributes)
  }
  
  async removeJobFromPreviousStatus() {
    if (!this.removeFrom) return

    await this.kodmq.adapter.removeJobFrom(this.job, this.removeFrom)
  }
  
  async saveJobToNewStatus() {
    await this.kodmq.adapter.saveJobTo(this.job, this.to)
  }
  
  async runCallbacks() {
    const callbackName = StatusCallbacks[this.to]
    if (!callbackName) return

    await this.kodmq.runCallback(callbackName, this.job)
  }
}
