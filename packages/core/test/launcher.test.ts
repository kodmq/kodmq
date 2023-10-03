import RedisAdapter from "@kodmq/adapter-redis"
import t from "tap"
import { Stopped } from "../src/constants.js"
import KodMQ from "../src/kodmq.js"
import launcher from "../src/launcher/index.js"
import { handlers } from "./handlers.js"

t.test("launcher", async (t) => {
  let consoleOutput = ""

  const consoleLogger = (message?: unknown, ...optionalParams: unknown[]) => {
    consoleOutput += (message + optionalParams.join(" "))
      // eslint-disable-next-line no-control-regex
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")
      .concat("\n")
  }

  t.beforeEach(async () => {
    consoleOutput = ""

    // Clear all queues
    const adapter = new RedisAdapter()
    await adapter.clearAll()
    await adapter.closeConnection()
  })

  t.test("does not allow to launch without KodMQ instance", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await t.rejects(launcher(), { message: "You must pass a KodMQ instance to launch()" })
  })

  t.test("does not allow to launch without job handlers", async () => {
    const kodmq = new KodMQ({ adapter: new RedisAdapter() })

    await t.rejects(launcher(kodmq), { message: "You must register at least one job handler before launching KodMQ" })
    await kodmq.stopAll()
  })

  t.test("does not allow to launch with invalid concurrency", async () => {
    const kodmq = new KodMQ({ adapter: new RedisAdapter(), handlers })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await t.rejects(launcher(kodmq, { concurrency: "hello" }), { message: "Concurrency must be a number" })
    await kodmq.stopAll()
  })

  t.test("launches KodMQ", async () => {
    const kodmq = new KodMQ({ adapter: new RedisAdapter(), handlers })

    setTimeout(async () => await kodmq.jobs.perform("welcomeMessage", "John"), 200)
    setTimeout(async () => await kodmq.jobs.perform("happyBirthdayMessage", { name: "John", age: 30 }), 300)
    setTimeout(async () => await kodmq.jobs.perform("iWasBornToFail"), 400)
    setTimeout(async () => await kodmq.stopAll(), 1500)
    await launcher(kodmq, { concurrency: 2, logger: consoleLogger })

    t.match(consoleOutput, "Starting KodMQ...")
    t.match(consoleOutput, "Concurrency: 2")
    t.match(consoleOutput, "[Worker #1] Worker is active and waiting for jobs")
    t.match(consoleOutput, "[Worker #2] Worker is active and waiting for jobs")
    t.match(consoleOutput, "[Worker #1] Worker is stopping")
    t.match(consoleOutput, "[Worker #2] Worker is stopping")
    t.match(consoleOutput, "[Worker #1] Worker has stopped")
    t.match(consoleOutput, "[Worker #2] Worker has stopped")

    // eslint-disable-next-line quotes
    t.match(consoleOutput, `[Job #1] Queued Welcome Message with payload "John"`)
    t.match(consoleOutput, "[Job #1] Running Welcome Message…")
    t.match(consoleOutput, "[Job #1] Completed Welcome Message in")

    // eslint-disable-next-line quotes
    t.match(consoleOutput, `[Job #2] Queued Happy Birthday Message with payload {"name":"John","age":30}`)
    t.match(consoleOutput, "[Job #2] Running Happy Birthday Message…")
    t.match(consoleOutput, "[Job #2] Completed Happy Birthday Message in")

    t.match(consoleOutput, "[Job #3] Queued I Was Born To Fail")
    t.match(consoleOutput, "[Job #3] Running I Was Born To Fail…")
    t.match(consoleOutput, "[Job #3] Failed I Was Born To Fail in")
    t.match(consoleOutput, "[Job #3] Retrying I Was Born To Fail as new job with id #4 in")

    t.match(consoleOutput, "[Job #4] Re-queued I Was Born To Fail")
  })

  t.test("loads parameters from environment variables", async () => {
    const desiredConcurrency = 4
    const desiredClusterName = "Fantastic"
    const kodmq = new KodMQ({ adapter: new RedisAdapter(), handlers })

    // Set environment variable
    process.env.KODMQ_CONCURRENCY = desiredConcurrency.toString()
    process.env.KODMQ_CLUSTER_NAME = desiredClusterName

    setTimeout(async () => await kodmq.stopAll(), 500)
    await launcher(kodmq, { logger: consoleLogger })
    await kodmq.workers.waitUntilAllInStatus(Stopped)

    t.match(consoleOutput, "Starting KodMQ...")
    t.match(consoleOutput, `Concurrency: ${desiredConcurrency}`)
    t.match(consoleOutput, `Cluster name: ${desiredClusterName}`)

    delete process.env.KODMQ_CONCURRENCY
    delete process.env.KODMQ_CLUSTER_NAME
  })

  t.test("loads parameters from CLI arguments", async () => {
    const desiredConcurrency = 3
    const desiredClusterName = "Nice"
    const kodmq = new KodMQ({ adapter: new RedisAdapter(), handlers })

    // Set CLI argument
    process.argv.push("--concurrency=3")
    process.argv.push("--cluster-name=Nice")

    setTimeout(async () => await kodmq.stopAll(), 500)
    await launcher(kodmq, { concurrency: desiredConcurrency, logger: consoleLogger })
    await kodmq.workers.waitUntilAllInStatus(Stopped)

    t.match(consoleOutput, "Starting KodMQ...")
    t.match(consoleOutput, `Concurrency: ${desiredConcurrency}`)
    t.match(consoleOutput, `Cluster name: ${desiredClusterName}`)

    process.argv.pop()
    process.argv.pop()
  })
})
