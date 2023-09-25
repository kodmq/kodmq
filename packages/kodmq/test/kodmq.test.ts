import { jest } from "@jest/globals"
import RedisAdapter from "../src/adapters/RedisAdapter"
import { Completed, Idle, Pending, Scheduled } from "../src/constants"
import KodMQ from "../src/kodmq"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { handlers } from "./handlers.ts"

describe("KodMQ", () => {
  it("does not allow to create instance with wrong adapter", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new KodMQ({ adapter: "hello", handlers })).toThrow("KodMQ requires adapter to be an instance of Adapter")
  })

  it("does not allow to start worker without handlers", async () => {
    const kodmq = new KodMQ()

    await expect(kodmq.start()).rejects.toThrow("KodMQ requires at least one handler to start")
    await kodmq.stopAllAndCloseConnection()
  })

  it("does not allow to start worker twice", async () => {
    const kodmq = new KodMQ({ handlers })

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    await expect(kodmq.start()).rejects.toThrow("KodMQ is already started")
    await kodmq.stopAllAndCloseConnection()
  })

  it("creates instance with config", async () => {
    const kodmq = new KodMQ({
      adapter: new RedisAdapter(),
      handlers,
    })

    expect(kodmq).toBeInstanceOf(KodMQ)
    expect(kodmq.adapter).toBeInstanceOf(RedisAdapter)
    expect(kodmq.handlers).toEqual(handlers)

    await kodmq.stopAllAndCloseConnection()
  })

  it("push jobs to adapter and pops them", async () => {
    const kodmq = new KodMQ({ handlers })

    // Trigger jobs
    const job1 = await kodmq.perform("welcomeMessage", "John")
    const job2 = await kodmq.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.perform("promotionMessage", true)

    // Schedule a job
    const scheduleIn = 250
    const scheduledJob1 = await kodmq.performAt(new Date(Date.now() + scheduleIn), "promotionMessage", false)

    // Get all jobs from adapter
    let pendingJobs = await kodmq.getJobs({ status: Pending })
    let scheduledJobs = await kodmq.getJobs({ status: Scheduled })

    // Make sure all pending jobs in the queue
    expect(pendingJobs.length).toBe(3)
    expect(pendingJobs[0].name).toBe(job1.name)
    expect(pendingJobs[0].payload).toEqual(job1.payload)
    expect(pendingJobs[1].name).toBe(job2.name)
    expect(pendingJobs[1].payload).toEqual(job2.payload)
    expect(pendingJobs[2].name).toBe(job3.name)
    expect(pendingJobs[2].payload).toEqual(job3.payload)

    // Make sure all scheduled jobs in the queue
    expect(scheduledJobs.length).toBe(1)
    expect(scheduledJobs[0].name).toBe(scheduledJob1.name)
    expect(scheduledJobs[0].payload).toEqual(scheduledJob1.payload)

    // Make sure all jobs pops in the right order
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job1.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job2.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job3.id)
    expect(await kodmq.adapter.popJobFromQueue()).toBeNull()

    // Make sure scheduled job pops when time comes
    await new Promise((resolve) => setTimeout(resolve, scheduleIn + 10))
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", scheduledJob1.id)
    expect(await kodmq.adapter.popJobFromQueue()).toBeNull()

    await kodmq.stopAllAndCloseConnection()
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
      kodmq.waitUntilAllJobsAreCompleted(),
    ])
      .finally(async () => await kodmq.stopAllAndCloseConnection())

    expect(welcomeMessage).toHaveBeenCalledTimes(1)
    expect(welcomeMessage.mock.calls[0][0]).toEqual(job1.payload)

    expect(happyBirthdayMessage).toHaveBeenCalledTimes(1)
    expect(happyBirthdayMessage.mock.calls[0][0]).toEqual(job2.payload)

    expect(promotionMessage).toHaveBeenCalledTimes(1)
    expect(promotionMessage.mock.calls[0][0]).toEqual(job3.payload)

    await new Promise((resolve) => setTimeout(resolve, 100))
    await kodmq.adapter.openConnection()

    const workers = await kodmq.getWorkers()
    const completedJobs = await kodmq.getJobs({ status: Completed })
    await kodmq.adapter.closeConnection()

    expect(completedJobs.length).toBe(3)
    expect(completedJobs[0].id).toBe(job1.id)
    expect(completedJobs[1].id).toBe(job2.id)
    expect(completedJobs[2].id).toBe(job3.id)
    expect(completedJobs[0].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[1].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[2].startedAt).toBeInstanceOf(Date)
    expect(completedJobs[0].finishedAt).toBeInstanceOf(Date)
    expect(completedJobs[1].finishedAt).toBeInstanceOf(Date)
    expect(completedJobs[2].finishedAt).toBeInstanceOf(Date)
    expect(completedJobs[0].workerId).toBe(workers[0].id)
    expect(completedJobs[1].workerId).toBe(workers[0].id)
    expect(completedJobs[2].workerId).toBe(workers[0].id)
  })

  it("gets information about workers", async () => {
    const kodmq = new KodMQ({ handlers })

    let workers = await kodmq.getWorkers()
    expect(workers.length).toBe(0)

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    workers = await kodmq.getWorkers()
    expect(workers.length).toBe(1)
    expect(workers[0].id).toBe(1)
    expect(workers[0].status).toBe(Idle)

    await kodmq.stopAllAndCloseConnection()
  })

  it("gracefully stops workers", async () => {
    const kodmq = new KodMQ({ handlers })

    const job = await kodmq.perform("longRunningJob")

    let pendingJobs = await kodmq.getJobs({ status: Pending })
    let completedJobs = await kodmq.getJobs({ status: Completed })

    expect(pendingJobs.length).toBe(1)
    expect(pendingJobs[0].id).toBe(job.id)
    expect(completedJobs.length).toBe(0)

    // Start workers and stop them before job is completed
    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    await kodmq.stopAllAndCloseConnection()
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Make sure job is completed due to graceful stop
    await kodmq.adapter.openConnection()
    pendingJobs = await kodmq.getJobs({ status: Pending })
    completedJobs = await kodmq.getJobs({ status: Completed })
    await kodmq.adapter.closeConnection()

    expect(pendingJobs.length).toBe(0)
    expect(completedJobs.length).toBe(1)
    expect(completedJobs[0].id).toBe(job.id)
  })

  it("runs callbacks", async () => {
    const onJobActive = jest.fn((_) => {})
    const onJobActiveSecond = jest.fn((_) => {})
    const onScheduleJobRetry = jest.fn((_) => {})
    const onWorkerIdle = jest.fn((_) => {})
    const onWorkerActive = jest.fn((_) => {})

    const kodmq = new KodMQ({
      handlers,

      callbacks: {
        jobActive: [onJobActive],
        scheduleJobRetry: [onScheduleJobRetry],
        workerIdle: [onWorkerIdle],
        workerActive: [onWorkerActive],
      },

      maxRetries: 1,
    })

    kodmq.on("jobActive", onJobActiveSecond)
    await kodmq.perform("iWasBornToFail")

    expect(onJobActive).toHaveBeenCalledTimes(0)
    expect(onJobActiveSecond).toHaveBeenCalledTimes(0)
    expect(onScheduleJobRetry).toHaveBeenCalledTimes(0)
    expect(onWorkerIdle).toHaveBeenCalledTimes(0)
    expect(onWorkerActive).toHaveBeenCalledTimes(0)

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 500))
    await kodmq.stopAllAndCloseConnection()

    expect(onJobActive).toHaveBeenCalledTimes(1)
    expect(onJobActiveSecond).toHaveBeenCalledTimes(1)
    expect(onScheduleJobRetry).toHaveBeenCalledTimes(1)
    expect(onWorkerIdle).toHaveBeenCalledTimes(1)
    expect(onWorkerActive).toHaveBeenCalledTimes(1)
  })

  it("kills worker and puts job back to queue", async () => {
    const kodmq = new KodMQ({
      handlers,
      stopTimeout: 1,
    })

    const job = await kodmq.perform("longRunningJob")

    setTimeout(() => kodmq.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    let pendingJobs = await kodmq.getJobs({ status: Pending })
    expect(pendingJobs.length).toBe(0)

    await expect(kodmq.stopAllAndCloseConnection()).rejects.toThrow("Worker 1 is not stopped after 1ms")
    await new Promise((resolve) => setTimeout(resolve, 300))

    await kodmq.adapter.openConnection()
    pendingJobs = await kodmq.getJobs({ status: Pending })
    await kodmq.adapter.closeConnection()

    expect(pendingJobs.length).toBe(1)
    expect(pendingJobs[0].id).toBe(job.id)
  })
})
