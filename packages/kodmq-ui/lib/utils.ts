import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
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

// Convert camelCase to title case
export function titleize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (string) => string.toUpperCase())
}
