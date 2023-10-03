/* eslint-disable no-console */

import { Handlers } from "../../src/types.js"

export function welcomeMessage(_name: string) {}
export function happyBirthdayMessage({ name: _, age: __ }: { name: string, age: number }) {}
export function promotionMessage(_promoted: boolean) {}

export async function longRunningJob() {
  return await new Promise((resolve) => setTimeout(resolve, 1000))
}

export async function iWasBornToFail() {
  throw new Error("I was born to fail")
}

export const handlers: Handlers = {
  welcomeMessage,
  happyBirthdayMessage,
  promotionMessage,
  longRunningJob,
  iWasBornToFail,
}
