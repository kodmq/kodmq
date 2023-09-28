/* eslint-disable no-console */

import chalk from "chalk"
import prompts from "prompts"
import { exec, getCurrentVersion, getPackages, getPackageVersion, withSpinner } from "./utils.js"

const isDryRun = process.argv.includes("--dry-run")

const version = getCurrentVersion()
const packages = getPackages()

console.log(`You're about to release ${chalk.yellowBright.bold(version.format())} of the following packages:`)

for (const name of packages) {
  console.log(` - ${chalk.cyan(name)}`)
}

console.log()

const sure = await prompts({
  type: "confirm",
  name: "value",
  message: "Do you want to continue?",
})

if (!sure.value) {
  process.exit(1)
}

// Validate package versions
for (const name of packages) {
  const packageVersion = getPackageVersion(name)

  if (packageVersion.compare(version) !== 0) {
    console.error(chalk.red(`Version mismatch for ${name}: expected ${version.format()}, got ${packageVersion.format()}`))
    process.exit(1)
  }
}

console.log()

withSpinner("Committing", () => {
  exec(".", `git commit -am "Release ${version.format()}"${isDryRun ? " --dry-run" : ""}`)
})

withSpinner("Tagging", () => {
  if (isDryRun) return
  exec(".", `git tag v${version.format()}`)
})

withSpinner("Pushing", () => {
  exec(".", `git push --follow-tags${isDryRun ? " --dry-run" : ""}`)
  exec(".", `git push origin v${version.format()}${isDryRun ? " --dry-run" : ""}`)
})

withSpinner("Create GitHub release", () => {
  if (isDryRun) return
  exec(".", `gh release create v${version.format()} --title v${version.format()} --notes ""`)
})

for (const name of packages) {
  withSpinner(`Releasing ${name}`, () => {
    exec(`packages/${name}`, `pnpm publish --access public${isDryRun ? " --dry-run" : ""}}`)
  })
}

console.log()
console.log(chalk.green("Done!"), `Version ${chalk.yellow(version.format())} has been released.`)
console.log()
