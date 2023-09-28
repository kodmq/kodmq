#!/usr/bin/env node

import { execSync } from "child_process"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const appPath = resolve(__dirname, "../")
const nextBinPath = resolve(appPath, "node_modules/next/dist/bin/next")

execSync(`${nextBinPath} start`, { cwd: appPath, stdio: "inherit" })
