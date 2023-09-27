import { expect, jest } from "@jest/globals"
import RedisAdapter from "../src/adapters/RedisAdapter"
import { Completed, Idle, Pending, Scheduled } from "../src/constants"
import KodMQ from "../src/kodmq"
import { handlers } from "./handlers"

describe("KodMQ", () => {
  it("does not allow to create instance with wrong adapter", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => new KodMQ({ adapter: "hello", handlers })).toThrow("Adapter must be an instance of Adapter")
  })

  it("does not allow to start worker without handlers", async () => {
    const kodmq = new KodMQ()

    await expect(kodmq.workers.start()).rejects.toThrow("At least one handler is required to start workers")
    await kodmq.closeConnection()
  })

  it("does not allow to start worker twice", async () => {
    const kodmq = new KodMQ({ handlers })

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    await expect(kodmq.workers.start()).rejects.toThrow("Workers are already started")
    await kodmq.stopAll()
  })

  it("creates instance with config", async () => {
    const kodmq = new KodMQ({
      adapter: new RedisAdapter(),
      handlers,
    })

    expect(kodmq).toBeInstanceOf(KodMQ)
    expect(kodmq.adapter).toBeInstanceOf(RedisAdapter)
    expect(kodmq.handlers).toEqual(handlers)

    await kodmq.closeConnection()
  })

  it("push jobs to adapter and pops them", async () => {
    const kodmq = new KodMQ({ handlers })

    // Trigger jobs
    const job1 = await kodmq.jobs.perform("welcomeMessage", "John")
    const job2 = await kodmq.jobs.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.jobs.perform("promotionMessage", true)

    // Schedule a job
    const scheduleIn = 250
    const scheduledJob1 = await kodmq.jobs.performAt(new Date(Date.now() + scheduleIn), "promotionMessage", true)
    const scheduledJob2 = await kodmq.jobs.performIn(scheduleIn + 1, "promotionMessage", false)

    // Get all jobs from adapter
    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    let scheduledJobs = await kodmq.jobs.all({ status: Scheduled })

    // Make sure all pending jobs in the queue
    expect(pendingJobs.length).toBe(3)
    expect(pendingJobs[0].name).toBe(job3.name)
    expect(pendingJobs[0].payload).toEqual(job3.payload)
    expect(pendingJobs[1].name).toBe(job2.name)
    expect(pendingJobs[1].payload).toEqual(job2.payload)
    expect(pendingJobs[2].name).toBe(job1.name)
    expect(pendingJobs[2].payload).toEqual(job1.payload)

    // Make sure all scheduled jobs in the queue
    expect(scheduledJobs.length).toBe(2)
    expect(scheduledJobs[0].name).toBe(scheduledJob2.name)
    expect(scheduledJobs[0].payload).toEqual(scheduledJob2.payload)
    expect(scheduledJobs[1].name).toBe(scheduledJob1.name)
    expect(scheduledJobs[1].payload).toEqual(scheduledJob1.payload)

    // Make sure all jobs pops in the right order
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job1.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job2.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job3.id)
    expect(await kodmq.adapter.popJobFromQueue()).toBeNull()

    // Make sure scheduled job pops when time comes
    await new Promise((resolve) => setTimeout(resolve, scheduleIn + 10))
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", scheduledJob1.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", scheduledJob2.id)
    expect(await kodmq.adapter.popJobFromQueue()).toBeNull()

    await kodmq.closeConnection()
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

    const job1 = await kodmq.jobs.perform("welcomeMessage", "John")
    const job2 = await kodmq.jobs.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.jobs.perform("promotionMessage", true)

    expect(welcomeMessage).not.toHaveBeenCalled()
    expect(happyBirthdayMessage).not.toHaveBeenCalled()
    expect(promotionMessage).not.toHaveBeenCalled()

    await Promise.race([
      kodmq.workers.start(),
      kodmq.jobs.waitUntilAllFinished(),
    ])
      .finally(async () => await kodmq.stopAll({ closeConnection: false }))

    expect(welcomeMessage).toHaveBeenCalledTimes(1)
    expect(welcomeMessage.mock.calls[0][0]).toEqual(job1.payload)

    expect(happyBirthdayMessage).toHaveBeenCalledTimes(1)
    expect(happyBirthdayMessage.mock.calls[0][0]).toEqual(job2.payload)

    expect(promotionMessage).toHaveBeenCalledTimes(1)
    expect(promotionMessage.mock.calls[0][0]).toEqual(job3.payload)

    await new Promise((resolve) => setTimeout(resolve, 100))

    const workers = await kodmq.workers.all()
    const completedJobs = await kodmq.jobs.all({ status: Completed })
    await kodmq.adapter.closeConnection()

    expect(completedJobs.length).toBe(3)
    expect(completedJobs[0].id).toBe(job3.id)
    expect(completedJobs[1].id).toBe(job2.id)
    expect(completedJobs[2].id).toBe(job1.id)
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

    let workers = await kodmq.workers.all()
    expect(workers.length).toBe(0)

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    workers = await kodmq.workers.all()
    expect(workers.length).toBe(1)
    expect(workers[0].id).toBe(1)
    expect(workers[0].status).toBe(Idle)

    await kodmq.stopAll()
  })

  it("gracefully stops workers", async () => {
    const kodmq = new KodMQ({ handlers })

    const job = await kodmq.jobs.perform("longRunningJob")

    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    let completedJobs = await kodmq.jobs.all({ status: Completed })

    expect(pendingJobs.length).toBe(1)
    expect(pendingJobs[0].id).toBe(job.id)
    expect(completedJobs.length).toBe(0)

    // Start workers and stop them before job is completed
    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    await kodmq.stopAll({ closeConnection: false })
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Make sure job is completed due to graceful stop
    pendingJobs = await kodmq.jobs.all({ status: Pending })
    completedJobs = await kodmq.jobs.all({ status: Completed })
    await kodmq.adapter.closeConnection()

    expect(pendingJobs.length).toBe(0)
    expect(completedJobs.length).toBe(1)
    expect(completedJobs[0].id).toBe(job.id)
  })

  it("runs callbacks", async () => {
    const onJobCreated = jest.fn((_) => {})
    const onJobActive = jest.fn((_) => {})
    const onJobActiveSecond = jest.fn((_) => {})
    const onJobScheduledRetry = jest.fn((_) => {})
    const onWorkerCreated = jest.fn((_) => {})
    const onWorkerIdle = jest.fn((_) => {})
    const onWorkerBusy = jest.fn((_) => {})

    const kodmq = new KodMQ({
      handlers,

      callbacks: {
        jobCreated: [onJobCreated],
        jobActive: [onJobActive],
        jobScheduledRetry: [onJobScheduledRetry],
        workerCreated: [onWorkerCreated],
        workerIdle: [onWorkerIdle],
        workerBusy: [onWorkerBusy],
      },

      maxRetries: 1,
    })

    kodmq.on("jobActive", onJobActiveSecond)
    await kodmq.jobs.perform("welcomeMessage", "John")
    await kodmq.jobs.perform("iWasBornToFail")

    expect(onJobCreated).toHaveBeenCalledTimes(2)
    expect(onJobActive).toHaveBeenCalledTimes(0)
    expect(onJobActiveSecond).toHaveBeenCalledTimes(0)
    expect(onJobScheduledRetry).toHaveBeenCalledTimes(0)
    expect(onWorkerCreated).toHaveBeenCalledTimes(0)
    expect(onWorkerIdle).toHaveBeenCalledTimes(0)
    expect(onWorkerBusy).toHaveBeenCalledTimes(0)

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 500))
    await kodmq.stopAll()

    expect(onJobCreated).toHaveBeenCalledTimes(3)
    expect(onJobActive).toHaveBeenCalledTimes(2)
    expect(onJobActiveSecond).toHaveBeenCalledTimes(2)
    expect(onJobScheduledRetry).toHaveBeenCalledTimes(1)
    expect(onWorkerCreated).toHaveBeenCalledTimes(1)
    expect(onWorkerIdle).toHaveBeenCalledTimes(2)
    expect(onWorkerBusy).toHaveBeenCalledTimes(2)
  })

  it("kills worker and puts job back to queue", async () => {
    const kodmq = new KodMQ({
      handlers,
      stopTimeout: 1,
    })

    const job = await kodmq.jobs.perform("longRunningJob")

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    expect(pendingJobs.length).toBe(0)

    await expect(kodmq.stopAll({ closeConnection: false })).rejects.toThrow("Worker 1 is not stopped after 1ms")
    await new Promise((resolve) => setTimeout(resolve, 300))

    pendingJobs = await kodmq.jobs.all({ status: Pending })
    await kodmq.adapter.closeConnection()

    expect(pendingJobs.length).toBe(1)
    expect(pendingJobs[0].id).toBe(job.id)
  })

  it("boosts job", async () => {
    const kodmq = new KodMQ({ handlers })

    const job1 = await kodmq.jobs.perform("welcomeMessage", "John")
    const job2 = await kodmq.jobs.perform("welcomeMessage", "Andrew")
    const job3 = await kodmq.jobs.perform("welcomeMessage", "Alex")
    const scheduledJob = await kodmq.jobs.performAt(new Date(0), "welcomeMessage", "Bob")
    const boostedJob = await kodmq.jobs.perform("welcomeMessage", "Bob")

    await kodmq.jobs.boost(boostedJob.id)

    // NOTE: Should job boosted job be above the scheduled job?
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", scheduledJob.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", boostedJob.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job1.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job2.id)
    expect(await kodmq.adapter.popJobFromQueue()).toHaveProperty("id", job3.id)

    await kodmq.closeConnection()
  })
})
