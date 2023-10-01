export class KodMQError extends Error {
  public originalError?: Error

  constructor(message: string, originalError?: Error) {
    if (originalError) message += ` → ${originalError.message}`

    super(message)

    this.name = "KodMQError"
    this.stack = originalError?.stack
    this.originalError = originalError
  }
}

export class KodMQCommandError extends KodMQError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)

    this.name = "KodMQCommandError"
  }
}

export class KodMQAdapterError extends KodMQError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)

    this.name = "KodMQAdapterError"
  }
}

export class KodMQLauncherError extends KodMQError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)

    this.name = "KodMQLauncherError"
  }
}

export type ErrorWithMessage = {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}
