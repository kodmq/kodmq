/* eslint-disable no-console */

import cp from "child_process"
import fs from "fs"
import chalk from "chalk"
import ora from "ora"
import semver from "semver"
import pkg from "../package.json"

export function getPackages() {
  return fs
    .readdirSync("packages")
    .filter((name) => !name.includes(".") && !name.startsWith("eslint"))
    .sort((a, b) => a.localeCompare(b))
}

export function getCurrentVersion() {
  return new semver.SemVer(pkg.version)
}

export function getPackageVersion(name: string) {
  const packagePkg = JSON.parse(fs.readFileSync(`packages/${name}/package.json`, "utf-8"))
  return new semver.SemVer(packagePkg.version)
}

export function exec(dir: string, cmd: string) {
  try {
    const result = cp.execSync(cmd, { cwd: dir, stdio: "pipe" })
    return result.toString().trim()
  } catch (e) {
    console.error(chalk.red(`Command failed: ${cmd}`))
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    console.log(e.stdout.toString().trim())
    process.exit(1)
  }
}

export function withSpinner(text: string, fn: () => unknown) {
  const spinner = ora({ text, prefixText: "  " }).start()

  try {
    fn()
    spinner.succeed()
  } catch (e) {
    spinner.fail()
    process.exit(1)
  }
}
