import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError } from "zod"
import { Errors, ErrorWithMessage, KeysOfType, StringKeys } from "@/lib/types"

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

export function zodErrorToErrors(error: ZodError): Errors {
  return error.errors.reduce<Errors>((acc, curr) => {
    if (curr.path) acc[curr.path[0] || "base"] = curr.message
    return acc
  }, {})
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFromList<T, TList extends readonly T[]>(
  list: TList,
  value: T | undefined | null,
  defaultValue: TList[number],
): TList[number]{
  return list.includes(value) ? (value as TList[number]) : defaultValue
}

export function formatDate(date: Date | undefined, options: Intl.DateTimeFormatOptions = {}) {
  if (!date) return

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    ...options,
  }).format(date)
}

export function formatDuration(start: Date | undefined, end: Date | undefined) {
  if (!start || !end) return

  const duration = end.getTime() - start.getTime()
  const minutes = Math.floor(duration / 1000 / 60)
  const seconds = Math.floor(duration / 1000) % 60

  // Show milliseconds if duration is less than 1 second
  if (duration < 1000) {
    return `${duration}ms`
  } else if (duration < 60000) {
    return `${seconds}s`
  } else {
    return `${minutes}m ${seconds}s`
  }
}

export function titleize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (string) => string.toUpperCase())
}

export function numberWithOrdinal(n) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100

  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

type Filters<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K]
} & {
  [K in StringKeys<T> as `${K}In`]?: T[K][]
} & {
  [K in StringKeys<T> as `${K}Not`]?: T[K]
} & {
  [K in Extract<KeysOfType<T, Date>, string> as `${K}After`]?: T[K]
} & {
  [K in Extract<KeysOfType<T, Date>, string> as `${K}Before`]?: T[K]
}

export function filter<T extends Record<string, unknown>>(jobs: T[], filters: Filters<T>) {
  return jobs.filter((job) => {
    return Object.entries(filters).every(([key, value]) => {
      if (key.endsWith("In")) {
        const realKey = key.slice(0, -2) as StringKeys<T>
        return (value as T[StringKeys<T>][]).includes(job[realKey])
      } else if (key.endsWith("Not")) {
        const realKey = key.slice(0, -3) as StringKeys<T>
        return value !== job[realKey]
      } else if (key.endsWith("After")) {
        const realKey = key.slice(0, -5) as KeysOfType<T, Date>
        return job[realKey] && job[realKey] > value
      } else if (key.endsWith("Before")) {
        const realKey = key.slice(0, -6) as KeysOfType<T, Date>
        return job[realKey] && job[realKey] < value
      } else {
        return job[key as StringKeys<T>] === value
      }
    })
  })
}
