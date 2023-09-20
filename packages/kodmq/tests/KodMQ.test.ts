import { handlers } from "./handlers"
import RedisAdapter from "~/src/adapters/RedisAdapter"
import KodMQ from "~/src/KodMQ"
import { Completed, Pending, Scheduled } from "~/src/statuses"

describe("KodMQ", () => {
  beforeEach(async () => {
    const adapter = new RedisAdapter()
    await adapter.clearAll()
    await adapter.closeConnection()
  })

  it("does not allow to create instance with wrong adapter", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new KodMQ({ adapter: "hello", handlers })).toThrow("KodMQ requires adapter to be an instance of Adapter")
  })

  it("does not allow to start worker without handlers", () => {
    const kodmq = new KodMQ()

    expect(async () => await kodmq.start()).rejects.toThrow("KodMQ requires at least one handler to start")
  })

  it("does not allow to start worker twice", async () => {
    const kodmq = new KodMQ({ handlers })

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(async () => await kodmq.start()).rejects.toThrow("KodMQ is already started")

    await kodmq.stop()
  })

  it("creates instance with config", async () => {
    const kodmq = new KodMQ({
      adapter: new RedisAdapter(),
      handlers,
    })

    expect(kodmq).toBeInstanceOf(KodMQ)
    expect(kodmq.adapter).toBeInstanceOf(RedisAdapter)
    expect(kodmq.handlers).toEqual(handlers)

    await kodmq.stop()
  })

  it("adds jobs to adapter", async () => {
    const kodmq = new KodMQ({ handlers })

    // Trigger jobs
    const job1 = await kodmq.perform("welcomeMessage", "John")
    const job2 = await kodmq.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.perform("promotionMessage", true)

    // Schedule a job
    const scheduleIn = 250
    const scheduledJob1 = await kodmq.schedule(new Date(Date.now() + scheduleIn), "promotionMessage", false)

    // Get all jobs from adapter
    const pendingJobs = await kodmq.getJobs({ status: Pending })
    const scheduledJobs = await kodmq.getJobs({ status: Scheduled })

    // Make sure all pending jobs in the queue
    expect(pendingJobs.length).toBe(3)
    expect(pendingJobs[0].name).toBe(job1.name)
    expect(pendingJobs[0].data).toEqual(job1.data)
    expect(pendingJobs[1].name).toBe(job2.name)
    expect(pendingJobs[1].data).toEqual(job2.data)
    expect(pendingJobs[2].name).toBe(job3.name)
    expect(pendingJobs[2].data).toEqual(job3.data)

    // Make sure all scheduled jobs in the queue
    expect(scheduledJobs.length).toBe(1)
    expect(scheduledJobs[0].name).toBe(scheduledJob1.name)
    expect(scheduledJobs[0].data).toEqual(scheduledJob1.data)

    // Make sure all jobs pops in the right order
    expect(await kodmq.adapter.popJob()).toEqual(job1)
    expect(await kodmq.adapter.popJob()).toEqual(job2)
    expect(await kodmq.adapter.popJob()).toEqual(job3)
    expect(await kodmq.adapter.popJob()).toBeNull()

    // Make sure scheduled job pops when time comes
    await new Promise((resolve) => setTimeout(resolve, scheduleIn + 10))
    expect(await kodmq.adapter.popJob()).toEqual(scheduledJob1)

    // Make sure there is no more jobs
    expect(await kodmq.getJobs({ status: Pending })).toEqual([])
    expect(await kodmq.getJobs({ status: Scheduled })).toEqual([])

    await kodmq.stop()
  })

  it("runs jobs", async () => {
    const welcomeMessage = jest.fn((_) => {})
    const happyBirthdayMessage = jest.fn((_) => {})
    const promotionMessage = jest.fn((_) => {})

    const kodmq = new KodMQ({
      handlers: {
        welcomeMessage,
        happyBirthdayMessage,
        promotionMessage,
      },
    })

    const job1 = await kodmq.perform("welcomeMessage", "John")
    const job2 = await kodmq.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.perform("promotionMessage", true)

    expect(welcomeMessage).not.toHaveBeenCalled()
    expect(happyBirthdayMessage).not.toHaveBeenCalled()
    expect(promotionMessage).not.toHaveBeenCalled()

    await Promise.race([
      kodmq.start(),
      kodmq.waitUntilAllJobsCompleted(),
    ])
      .then(async () => await kodmq.stop())

    expect(welcomeMessage).toHaveBeenCalledTimes(1)
    expect(welcomeMessage.mock.calls[0][0]).toEqual(job1.data)

    expect(happyBirthdayMessage).toHaveBeenCalledTimes(1)
    expect(happyBirthdayMessage.mock.calls[0][0]).toEqual(job2.data)

    expect(promotionMessage).toHaveBeenCalledTimes(1)
    expect(promotionMessage.mock.calls[0][0]).toEqual(job3.data)

    const completedJobs = await kodmq.getJobs({ status: Completed })
    expect(completedJobs.length).toBe(3)
    expect(completedJobs[0].id).toBe(job1.id)
    expect(completedJobs[1].id).toBe(job2.id)
    expect(completedJobs[2].id).toBe(job3.id)
    expect(completedJobs[0].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[0].finishedAt).toBeInstanceOf(Date)
    expect(completedJobs[1].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[1].finishedAt).toBeInstanceOf(Date)
    expect(completedJobs[2].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[2].finishedAt).toBeInstanceOf(Date)
  })

  it("gets information about workers", async () => {
    const kodmq = new KodMQ({ handlers })

    let workers = await kodmq.getWorkers()
    expect(workers.length).toBe(0)

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 50))

    workers = await kodmq.getWorkers()
    expect(workers.length).toBe(1)
    expect(workers[0].id).toBe(1)
    expect(workers[0].startedAt).toBeInstanceOf(Date)

    await kodmq.stop()
  })

  it("gracefully stops workers", async () => {
    const kodmq = new KodMQ({ handlers })

    const job = await kodmq.perform("longRunningJob")

    let pendingJobs = await kodmq.getJobs({ status: Pending })
    let completedJobs = await kodmq.getJobs({ status: Completed })

    expect(pendingJobs.length).toBe(1)
    expect(pendingJobs[0].id).toBe(job.id)
    expect(completedJobs.length).toBe(0)

    // Start workers, wait them to start and stop them before job is completed
    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    await kodmq.stop()
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Make sure job is completed due to graceful stop
    await kodmq.adapter.openConnection()
    pendingJobs = await kodmq.getJobs({ status: Pending })
    completedJobs = await kodmq.getJobs({ status: Completed })
    await kodmq.adapter.closeConnection()

    expect(pendingJobs.length).toBe(0)
    expect(completedJobs.length).toBe(1)
    expect(completedJobs[0].id).toBe(job.id)
  })
})
