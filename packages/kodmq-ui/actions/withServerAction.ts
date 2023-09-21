import { ZodError } from "zod"
import { Errors } from "@/lib/types"
import { getErrorMessage, zodErrorToErrors } from "@/lib/utils"

export class ServerActionError extends Error {
  key?: string

  constructor(message: string, key?: string) {
    super(message)
    this.name = "ServerActionError"
    this.key = key
  }
}

export enum ServerAction {
  Success,
  Failure,
}

export type ServerActionResponse<T> = Promise<[ServerAction.Success, T, null] | [ServerAction.Failure, null, Errors]>

export function withServerAction<TArgs extends unknown[], TResult>(action: (...args: TArgs) => TResult): (...args: TArgs) => ServerActionResponse<Awaited<TResult>> {
  return async (...args: TArgs) => {
    try {
      return [ServerAction.Success, await action(...args), null]
    } catch (error) {
      if (error instanceof ZodError) {
        return [ServerAction.Failure, null, zodErrorToErrors(error)]
      } else {
        if (error instanceof ServerActionError) {
          return [ServerAction.Failure, null, { [error.key || "base"]: error.message }]
        } else {
          return [ServerAction.Failure, null, { base: getErrorMessage(error) }]
        }
      }
    }
  }
}
