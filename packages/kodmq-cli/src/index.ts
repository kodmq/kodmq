import { program } from "commander"
import chalk from "chalk"
import { resolve } from "path"
import process from "process"
import KodMQ from "kodmq/src"

program
  .name("kodmq")
  .description("KodMQ is a simple job queue")
  .version("0.0.1")
  .argument("[path]", "path to KodMQ config file", "./workers/index.(ts|js)")
  .option("-c, --concurrency <number>", "concurrency", "1")
  .parse(process.argv)

const options = program.opts()
const concurrency = parseInt(options.concurrency) || 1

let path = program.args[0]

const DefaultPaths = [
  "./workers/index.ts",
  "./workers/index.js",
]

if (!path) {
  for (const defaultPath of DefaultPaths) {
    if (await Bun.file(defaultPath).exists()) {
      path = defaultPath
      break
    }
  }
}

let kodmq: KodMQ

try {
  kodmq = await import(resolve(path)).then((m) => m.default)
} catch (e) {
  console.error(chalk.red(`[KodMQ]`), `Failed to load KodMQ config file`)
  process.exit(1)
}

if (!kodmq.isKodMQ()) {
  console.error(chalk.red(`[KodMQ]`), `KodMQ config file must export an instance of KodMQ`)
  process.exit(1)
}

console.log(chalk.green(`[KodMQ]`), "Listening for jobs...")

await kodmq.start({ concurrency })

process.on("SIGINT", () => {
  kodmq.stop()
})
