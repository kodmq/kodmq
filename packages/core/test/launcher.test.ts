import { Stopped } from "../src/constants"
import KodMQ from "../src/kodmq"
import launcher from "../src/launcher/index"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { handlers } from "./handlers.ts"

describe("Launcher", () => {
  let consoleOutput = ""

  const consoleLogger = (message?: unknown, ...optionalParams: unknown[]) => {
    consoleOutput += (message + optionalParams.join(" "))
      // eslint-disable-next-line no-control-regex
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "")
      .concat("\n")
  }

  beforeEach(async () => {
    consoleOutput = ""
  })
  
  it("does not allow to launch without KodMQ instance", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(launcher()).rejects.toThrow("You must pass a KodMQ instance to launch()")
  })

  it("does not allow to launch without job handlers", async () => {
    const kodmq = new KodMQ()

    await expect(launcher(kodmq)).rejects.toThrow("You must register at least one job handler before launching KodMQ")
    await kodmq.stopAll()
  })

  it("does not allow to launch with invalid concurrency", async () => {
    const kodmq = new KodMQ({ handlers })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(launcher(kodmq, { concurrency: "hello" })).rejects.toThrow("Concurrency must be a number")
    await kodmq.stopAll()
  })

  it("launches KodMQ", async () => {
    const kodmq = new KodMQ({ handlers })

    setTimeout(async () => await kodmq.jobs.perform("welcomeMessage", "John"), 200)
    setTimeout(async () => await kodmq.jobs.perform("happyBirthdayMessage", { name: "John", age: 30 }), 300)
    setTimeout(async () => await kodmq.jobs.perform("iWasBornToFail"), 400)
    setTimeout(async () => await kodmq.stopAll(), 1500)
    await launcher(kodmq, { concurrency: 2, logger: consoleLogger })

    expect(consoleOutput).toContain("Starting KodMQ...")
    expect(consoleOutput).toContain("Concurrency: 2")
    expect(consoleOutput).toContain("[Worker #1] Worker is active and waiting for jobs")
    expect(consoleOutput).toContain("[Worker #2] Worker is active and waiting for jobs")
    expect(consoleOutput).toContain("[Worker #1] Worker is stopping")
    expect(consoleOutput).toContain("[Worker #2] Worker is stopping")
    expect(consoleOutput).toContain("[Worker #1] Worker has stopped")
    expect(consoleOutput).toContain("[Worker #2] Worker has stopped")

    // eslint-disable-next-line quotes
    expect(consoleOutput).toContain(`[Job #1] Queued Welcome Message with payload "John"`)
    expect(consoleOutput).toContain("[Job #1] Running Welcome Message…")
    expect(consoleOutput).toContain("[Job #1] Completed Welcome Message in")

    // eslint-disable-next-line quotes
    expect(consoleOutput).toContain(`[Job #2] Queued Happy Birthday Message with payload {"name":"John","age":30}`)
    expect(consoleOutput).toContain("[Job #2] Running Happy Birthday Message…")
    expect(consoleOutput).toContain("[Job #2] Completed Happy Birthday Message in")

    // eslint-disable-next-line quotes
    expect(consoleOutput).toContain(`[Job #3] Queued I Was Born To Fail`)
    expect(consoleOutput).toContain("[Job #3] Running I Was Born To Fail…")
    expect(consoleOutput).toContain("[Job #3] Failed I Was Born To Fail in")
    expect(consoleOutput).toContain("[Job #3] Retrying I Was Born To Fail as new job with id #4 in")
  })

  it("loads parameters from environment variables", async () => {
    const desiredConcurrency = 4
    const desiredClusterName = "Fantastic"
    const kodmq = new KodMQ({ handlers })

    // Set environment variable
    process.env.KODMQ_CONCURRENCY = desiredConcurrency.toString()
    process.env.KODMQ_CLUSTER_NAME = desiredClusterName

    setTimeout(async () => await kodmq.stopAll(), 500)
    await launcher(kodmq, { logger: consoleLogger })
    await kodmq.workers.waitUntilAllInStatus(Stopped)

    expect(consoleOutput).toContain("Starting KodMQ...")
    expect(consoleOutput).toContain(`Concurrency: ${desiredConcurrency}`)
    expect(consoleOutput).toContain(`Cluster name: ${desiredClusterName}`)

    delete process.env.KODMQ_CONCURRENCY
    delete process.env.KODMQ_CLUSTER_NAME
  })

  it("loads parameters from CLI arguments", async () => {
    const desiredConcurrency = 3
    const desiredClusterName = "Nice"
    const kodmq = new KodMQ({ handlers })

    // Set CLI argument
    process.argv.push("--concurrency=3")
    process.argv.push("--cluster-name=Nice")

    setTimeout(async () => await kodmq.stopAll(), 500)
    await launcher(kodmq, { concurrency: desiredConcurrency, logger: consoleLogger })
    await kodmq.workers.waitUntilAllInStatus(Stopped)

    expect(consoleOutput).toContain("Starting KodMQ...")
    expect(consoleOutput).toContain(`Concurrency: ${desiredConcurrency}`)
    expect(consoleOutput).toContain(`Cluster name: ${desiredClusterName}`)

    process.argv.pop()
    process.argv.pop()
  })
})
