import { Handlers } from "./types.ts"
import Adapter from "./adapters/Adapter.ts"
import Job from "./Job.ts"

export type Config<
  TAdapter extends Adapter,
  THandlers extends Handlers
> = {
  adapter?: TAdapter
  handlers: THandlers

  maxRetries?: number
  retryDelay?: number | number[] | ((job: Job) => number)
  retryType?: "fixed" | "exponential"
}

export const DefaultConfig: Omit<Config<any, any>, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}
