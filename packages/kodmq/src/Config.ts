import Adapter from "~/src/adapters/Adapter"
import { Callbacks, Handlers, Job } from "~/src/types"

export type Config<
  TAdapter extends Adapter = Adapter,
  THandlers extends Handlers = Handlers,
  TCallbacks extends Callbacks = Callbacks,
> = {
  adapter?: TAdapter
  handlers?: THandlers
  callbacks?: TCallbacks

  maxRetries?: number
  retryDelay?: number | number[] | ((job: Job) => number)
  retryType?: "fixed" | "exponential"
}

export const DefaultConfig: Omit<Config, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}
