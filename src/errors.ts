export class KodMQError extends Error {
  public originalError?: Error

  constructor(message: string, originalError?: Error) {
    if (originalError) message += `: ${originalError.message}`

    super(message)

    this.name = "KodMQError"
    this.stack = originalError?.stack
    this.originalError = originalError
  }
}


export class KodMQAdapterError extends KodMQError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError)

    this.name = "KodMQAdapterError"
  }
}
