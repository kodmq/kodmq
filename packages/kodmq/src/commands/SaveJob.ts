import KodMQ from "~/src"
import Command from "~/src/commands/Command"
import { Active, Completed, Failed, Pending, Scheduled } from "~/src/statuses"
import { JobCallbackName, JobStatus, Job, ID } from "~/src/types"

const StatusCallbacks: Record<JobStatus, JobCallbackName> = {
  [Pending]: "onJobPending",
  [Scheduled]: "onJobScheduled",
  [Active]: "onJobActive",
  [Completed]: "onJobCompleted",
  [Failed]: "onJobFailed",
}

export type SaveJobArgs<
  TJob extends Job = Job,
  TKodMQ extends KodMQ = KodMQ,
> = {
  jobId: ID
  attributes?: Partial<TJob>
  kodmq: TKodMQ
}

export class SaveJob<TArgs extends SaveJobArgs> extends Command<TArgs> {
  jobId: TArgs["jobId"]
  job: Job
  attributes?: TArgs["attributes"]
  kodmq: TArgs["kodmq"]

  steps = [
    "getLatestState",
    "updateObject",
    "saveToAdapter",
    "runCallbacks",
  ]

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.jobId = args.jobId
    this.job = {} as Job
    this.attributes = args.attributes
    this.kodmq = args.kodmq
  }

  async getLatestState() {
    const job = await this.kodmq.adapter.getJob(this.jobId)
    if (!job) return

    this.job = job
  }

  updateObject() {
    if (!this.attributes) return

    Object.assign(this.job, this.attributes)
  }
  
  async saveToAdapter() {
    await this.kodmq.adapter.saveJob(this.job!)
  }
  
  async runCallbacks() {
    await this.kodmq.runCallbacks("onJobChanged", this.job!)

    if (this.attributes?.status !== undefined) {
      await this.kodmq.runCallbacks(
        StatusCallbacks[this.attributes.status],
        this.job!,
      )
    }
  }
}
