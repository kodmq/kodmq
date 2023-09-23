import KodMQ from "../src/kodmq"
import launcher from "../src/launcher"
import { handlers } from "./handlers"

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
    await kodmq.stopAllAndCloseConnection()
  })

  it("does not allow to launch with invalid concurrency", async () => {
    const kodmq = new KodMQ({ handlers })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(launcher(kodmq, { concurrency: "hello" })).rejects.toThrow("Concurrency must be a number")
    await kodmq.stopAllAndCloseConnection()
  })

  it("launches KodMQ", async () => {
    const kodmq = new KodMQ({ handlers })

    setTimeout(async () => await kodmq.performJob("welcomeMessage", "John"), 100)
    setTimeout(async () => await kodmq.performJob("happyBirthdayMessage", { name: "John", age: 30 }), 200)
    setTimeout(async () => await kodmq.performJob("iWasBornToFail"), 300)
    setTimeout(async () => await kodmq.stopAllAndCloseConnection(), 1500)
    await launcher(kodmq, { concurrency: 2, logger: consoleLogger })

    expect(consoleOutput).toContain("Starting...")
    expect(consoleOutput).toContain("Starting KodMQ with concurrency 2")
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
    expect(consoleOutput).toContain("[Job #3] Retrying I Was Born To Fail with new ID #4 in")
  })
})
