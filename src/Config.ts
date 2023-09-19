import { Handlers } from "./types.ts"
import { Adapter } from "./adapters/Adapter.ts"

export type Config<
  TAdapter extends Adapter,
  THandlers extends Handlers
> = {
  adapter?: TAdapter
  handlers: THandlers
}
