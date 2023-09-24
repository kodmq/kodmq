import { getErrorMessage, KodMQCommandError } from "../errors.js"

export type RunOptions = {
  allowToFail?: boolean
}

export default abstract class Command<T = unknown> {
  args: T
  requiredArgs: string[] = []
  steps: string[] = []
  alwaysRunSteps: string[] = []
  isFailed: boolean = false
  isFinished: boolean = false
  errorMessage?: string
  errorStack?: string

  private reservedSteps = ["constructor", "run", "runStep"]

  protected constructor(args: T) {
    this.args = args
  }

  verify() {
    if (this.steps.length === 0) throw new KodMQCommandError("Steps must be defined")

    const allSteps = [
      ...this.steps,
      ...this.alwaysRunSteps,
    ]

    // Make sure all steps are defined and not reserved
    for (const stepKey of allSteps) {
      if (this.reservedSteps.includes(stepKey)) throw new KodMQCommandError(`Step "${stepKey}" is reserved`)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const step = this[stepKey]
      if (typeof step !== "function") throw new KodMQCommandError(`Step "${stepKey}" is not defined`)
    }

    // Make sure all required args are present
    for (const argKey of this.requiredArgs) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const arg = this.args[argKey]
      if (arg === undefined) throw new KodMQCommandError(`Argument "${argKey}" is required`)
    }
  }

  async run() {
    if (this.isFinished) throw new KodMQCommandError("Command has already finished")

    for (const step of this.steps) {
      await this.runStep(step)
      if (this.isFailed) break
    }

    for (const step of this.alwaysRunSteps) {
      await this.runStep(step, true)
    }

    this.markAsFinished()
    return this
  }

  async runStep(step: string, alwaysRun: boolean = false) {
    if (this.isFinished || (this.isFailed && !alwaysRun)) return

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this[step]()
    } catch (e) {
      this.isFailed = true

      if (e instanceof Error) {
        this.errorMessage = e.message
        this.errorStack = e.stack
      } else {
        this.errorMessage = getErrorMessage(e)
      }
    }
  }

  markAsFinished() {
    this.isFinished = true
  }

  static async run<T extends Command, TArgs extends T["args"]>(this: new (args: TArgs) => T, args: TArgs, opts: RunOptions = {}) {
    const command = new this(args)
    await command.run()

    if (command.isFailed && !opts.allowToFail) {
      throw new KodMQCommandError(`Command ${this.name} failed with error: ${command.errorMessage}`)
    }

    return command
  }
}
