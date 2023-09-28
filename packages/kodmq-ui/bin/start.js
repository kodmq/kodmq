#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from "child_process"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log()
console.log("\x1b[36m%s\x1b[0m", "Starting Kodmq UI...")
console.log()

const appPath = resolve(__dirname, "../")
let nextBinPath

try {
  const result = execSync("which next", { cwd: appPath, stdio: "pipe" })
  nextBinPath = result.toString().trim()
} catch (e) {
  console.error("\x1b[31m%s\x1b[0m", "Error: Could not find executable for Next.js. Please, make sure you have Next.js installed in your project dependencies or globally.")
  console.log()
  console.log("\x1b[33m%s\x1b[0m", "To install Next.js globally run one of the following commands:")
  console.log("npm install next -g")
  console.log("pnpm install next -g")
  console.log("yarn install next -g")
  console.log("bun install next -g")
  console.log()

  process.exit(1)
}

execSync(`${nextBinPath} start`, { cwd: appPath, stdio: "inherit" })
