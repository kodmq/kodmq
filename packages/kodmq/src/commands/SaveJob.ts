import KodMQ, { JobCallbackName, JobStatus, Job } from "~/src"
import Command from "~/src/commands/Command"
import { Active, Completed, Failed, Pending, Scheduled } from "~/src/statuses"

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
  job: TJob
  attributes?: Partial<TJob>
  kodmq: TKodMQ
}

export class SaveJob<TArgs extends SaveJobArgs> extends Command<TArgs> {
  job: TArgs["job"]
  attributes?: TArgs["attributes"]
  kodmq: TArgs["kodmq"]

  steps = [
    "retrieveLatestState",
    "updateObject",
    "saveToAdapter",
    "runCallbacks",
  ]

  constructor(args: TArgs) {
    super(args)
    this.verify()

    this.job = args.job
    this.attributes = args.attributes
    this.kodmq = args.kodmq
  }

  async retrieveLatestState() {
    const latestJobState = await this.kodmq.adapter.getJob(this.job.id) as TArgs["job"]
    if (!latestJobState) return

    this.job = latestJobState
  }

  updateObject() {
    if (!this.attributes) return

    Object.assign(this.job, this.attributes)
  }
  
  async saveToAdapter() {
    await this.kodmq.adapter.saveJob(this.job)
  }
  
  async runCallbacks() {
    await this.kodmq.runCallbacks("onJobChanged", this.job)

    if (this.attributes?.status !== undefined) {
      await this.kodmq.runCallbacks(
        StatusCallbacks[this.attributes.status],
        this.job,
      )
    }
  }
}
