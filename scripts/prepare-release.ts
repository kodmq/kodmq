/* eslint-disable no-console */

import fs from "fs"
import chalk from "chalk"
import gitBranch from "git-branch"
import { gitToJs } from "git-parse"
import prompts from "prompts"
import semver from "semver"
import { exec, getCurrentVersion, getPackages, withSpinner } from "./utils.js"

const isDryRun = process.argv.includes("--dry-run")
const skipChecks = process.argv.includes("--skip-checks")
const skipBranchCheck = process.argv.includes("--skip-branch-check")
const skipUncommittedCheck = process.argv.includes("--skip-uncommitted-check")

const AllowedBranches = ["main"]
const HeaderEndComment = "[//]: # (HeaderEnd)"

// Check for any uncommitted changes
const uncommittedChanges = exec(".", "git status --porcelain")

if (uncommittedChanges && !skipUncommittedCheck) {
  console.error(chalk.red("You have uncommitted changes, aborting. Use --skip-uncommitted-check to skip this check."))
  console.log()
  process.exit(1)
}

console.log(chalk.bold("Preparing release for a new version of KodMQ packages:"))

const packages = getPackages()

for (const name of packages) {
  console.log(` - ${chalk.cyan(name)}`)
}

console.log()

if (!AllowedBranches.includes(gitBranch.sync())) {
  if (skipBranchCheck) {
    console.warn(chalk.yellow(`You are not on ${AllowedBranches.join(" or ")} branch, but --skip-branch-check flag is set.`))
    console.log()
  } else {
    console.error(chalk.red(`You are not on ${AllowedBranches.join(" or ")} branch, aborting.`))
    console.log()
    process.exit(1)
  }
}

const currentVersion = getCurrentVersion()
const isCurrentBeta = currentVersion.prerelease.length > 0

const nextVersionBump = await prompts({
  type: "select",
  name: "value",
  message: `What version do you want to release? ${chalk.gray(`(current: ${chalk.yellow(currentVersion.format())})`)}`,
  choices: isCurrentBeta ? [
    { title: `Beta (${semver.inc(currentVersion, "prerelease")})`, value: "beta" },
    { title: `Release (${semver.inc(currentVersion, "patch")})`, value: "patch" },
    { title: `Keep current version (${currentVersion.format()})`, value: "keep" },
  ] : [
    { title: `Beta (${semver.inc(currentVersion, "prerelease", "beta")})`, value: "beta" },
    { title: `Patch (${semver.inc(currentVersion, "patch")})`, value: "patch" },
    { title: `Minor (${semver.inc(currentVersion, "minor")})`, value: "minor" },
    { title: `Major (${semver.inc(currentVersion, "major")})`, value: "major" },
    { title: `Keep current version (${currentVersion.format()})`, value: "keep" },
  ],
})

let nextVersion: semver.SemVer | undefined

if (nextVersionBump.value === "keep") {
  nextVersion = currentVersion
} else if (nextVersionBump.value === "beta") {
  nextVersion = currentVersion.inc("prerelease", "beta")
} else {
  nextVersion = currentVersion.inc(nextVersionBump.value as semver.ReleaseType)
}

// Find unpublished changes
const commits = await gitToJs(".")
const commitsPerPackage: Record<string, string[]> = {}
const allowedPackageTags = ["global", ...packages]

// Detect by commit name prefix (e.g. "[kodmq] Fix something")
for (const commit of commits) {
  const match = commit.message.match(/^\[(.+?)]/)
  if (!match) continue

  const packageName = match[1]
  if (!allowedPackageTags.includes(packageName)) continue

  const message = commit.message.replace(/^\[(.+?)]/, "").trim()
  commitsPerPackage[packageName] ||= []
  commitsPerPackage[packageName].push(message)
}

// Print potential changelog
console.log()
console.log(chalk.bold("Version Changelog:"))

for (const name of packages.concat("global")) {
  const commits = commitsPerPackage[name]
  if (!commits) continue

  console.log(` - ${chalk.cyan(name)}`)

  for (const commit of commits) {
    console.log(`   - ${commit}`)
  }

  console.log()
}

const confirm = await prompts({
  type: "confirm",
  name: "value",
  message: "Is this changelog looks good?",
})

console.log()

if (!confirm.value) {
  console.log(chalk.red("Aborting."))
  console.log()
  process.exit(1)
}

const updateChangelog = (path: string, packageName: string) => {
  if (!nextVersion) return

  const changelog = fs.readFileSync(path, "utf-8")
  let versionChangelog = `## v${nextVersion.format()}\n\n`

  // TODO: Just remove old content
  if (changelog.includes(versionChangelog)) {
    console.log(chalk.red(`Version ${nextVersion.format()} already exists in ${path}, aborting.`))
    process.exit(1)
  }

  if (commitsPerPackage[packageName] && commitsPerPackage[packageName].length > 0) {
    versionChangelog += commitsPerPackage[packageName].map((commit) => `- ${commit}`).join("\n")
  } else {
    versionChangelog += "No changes for this release"
  }

  // Keep content that's before `HeaderEndComment` at the top of the file
  const headerAndContent = changelog.split(HeaderEndComment)

  if (headerAndContent.length !== 2) {
    chalk.red(`Invalid changelog format in ${path}, aborting.`)
    process.exit(1)
  }

  const newChangelog = headerAndContent[0] + HeaderEndComment + "\n\n" + versionChangelog + headerAndContent[1]
  if (!isDryRun) fs.writeFileSync(path, newChangelog)
}

if (skipChecks) {
  console.log(chalk.yellow("Skipping checks..."))
  console.log()
} else {
  console.log(chalk.bold("Running checks:"))
  withSpinner("TypeScript checks", () => exec(".", "pnpm tsc"))
  withSpinner("ESLint checks", () => exec(".", "pnpm lint"))
  withSpinner("Tests", () => exec(".", "pnpm test"))
  console.log()
}

// Update global changelog
updateChangelog("CHANGELOG.md", "global")

// Update packages changelog
for (const name of packages) {
  updateChangelog(`packages/${name}/CHANGELOG.md`, name)
}

// Set main package version
if (!isDryRun) exec(".", `pnpm version ${nextVersion} --no-git-tag-version --allow-same-version`)

// Set packages version
// NOTE: Replace version using regex (because npm and pnpm don't work in workspaces)
for (const name of packages) {
  const path = `packages/${name}/package.json`
  const content = fs.readFileSync(path, "utf-8")
  const newContent = content.replace(/"version": ".*"/, `"version": "${nextVersion}"`)

  if (!isDryRun) fs.writeFileSync(path, newContent)
}

if (isDryRun) {
  console.log(chalk.yellow("Dry run, no changes were made."))
  console.log()
} else {
  console.log(chalk.green("Release prepared!"))
  console.log()
  console.log("Next steps:")
  console.log(` - Verify ${chalk.cyan("CHANGELOG.md")} files`)
  console.log(` - Run ${chalk.cyan("pnpm run release")} to publish packages, create git commit with tag and push changes`)
  console.log()
}
