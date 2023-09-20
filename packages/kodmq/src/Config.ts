import Adapter from "@/adapters/Adapter"
import Job from "@/Job"
import { Handlers } from "@/types"

export type Config<
  TAdapter extends Adapter = Adapter,
  THandlers extends Handlers = Handlers
> = {
  adapter?: TAdapter
  handlers?: THandlers

  maxRetries?: number
  retryDelay?: number | number[] | ((job: Job) => number)
  retryType?: "fixed" | "exponential"
}

export const DefaultConfig: Omit<Config, "adapter" | "handlers"> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryType: "exponential",
}
