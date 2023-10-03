import KodMQ from "@kodmq/core"
import { InMemoryAdapter } from "@kodmq/core/adapters"
import { Completed, Failed, Idle, Pending, Scheduled } from "@kodmq/core/constants"
import t from "tap"
import { handlers } from "./helpers/handlers.js"

t.only("KodMQ", async (t) => {
  t.beforeEach(() => {
    new InMemoryAdapter().clearAll()
  })

  t.test("does not allow to create instance without config", async (t) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    t.throws(() => new KodMQ(), { message: "Config is required" })
  })

  t.test("does not allow to create instance with wrong adapter", async (t) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    t.throws(() => new KodMQ({ adapter: "hello", handlers }), { message: "Adapter must be an instance of Adapter" })
  })

  t.test("does not allow to start worker without handlers", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter() })

    await t.rejects(kodmq.workers.start(), { message: "At least one handler is required to start workers" })
    await kodmq.closeConnection()
  })

  t.test("does not allow to start worker twice", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter(), handlers })

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    await t.rejects(kodmq.workers.start(), { message: "Workers are already started" })
    await kodmq.stopAll()
  })

  t.test("creates instance with config", async (t) => {
    const kodmq = new KodMQ({
      adapter: new InMemoryAdapter(),
      handlers,
    })

    t.ok(kodmq instanceof KodMQ)
    t.ok(kodmq.adapter instanceof InMemoryAdapter)
    t.equal(kodmq.handlers, handlers)

    await kodmq.closeConnection()
  })

  t.only("push jobs to adapter and pops them", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter(), handlers })

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
    t.equal(pendingJobs.length, 3)
    t.equal(pendingJobs[0].name, job3.name)
    t.match(pendingJobs[0].payload, job3.payload)
    t.equal(pendingJobs[1].name, job2.name)
    t.match(pendingJobs[1].payload, job2.payload)
    t.equal(pendingJobs[2].name, job1.name)
    t.match(pendingJobs[2].payload, job1.payload)

    // Make sure all scheduled jobs in the queue
    t.equal(scheduledJobs.length, 2)
    t.equal(scheduledJobs[0].name, scheduledJob2.name)
    t.match(scheduledJobs[0].payload, scheduledJob2.payload)
    t.equal(scheduledJobs[1].name, scheduledJob1.name)
    t.match(scheduledJobs[1].payload, scheduledJob1.payload)

    // Make sure all jobs pops in the right order
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job1.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job2.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job3.id })
    t.notOk(await kodmq.adapter.popJobFromQueue())

    // Make sure scheduled job pops when time comes
    await new Promise((resolve) => setTimeout(resolve, scheduleIn + 10))
    t.match(await kodmq.adapter.popJobFromQueue(), { id: scheduledJob1.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: scheduledJob2.id })
    t.notOk(await kodmq.adapter.popJobFromQueue())

    await kodmq.closeConnection()
  })

  t.test("runs jobs", async (t) => {
    const welcomeMessageCalls = t.capture(handlers, "welcomeMessage")
    const happyBirthdayMessageCalls = t.capture(handlers, "happyBirthdayMessage")
    const promotionMessageCalls = t.capture(handlers, "promotionMessage")

    const kodmq = new KodMQ({
      adapter: new InMemoryAdapter(),
      handlers,
    })

    const job1 = await kodmq.jobs.perform("welcomeMessage", "John")
    const job2 = await kodmq.jobs.perform("happyBirthdayMessage", { name: "John", age: 18 })
    const job3 = await kodmq.jobs.perform("promotionMessage", true)

    // Make sure it does not run jobs before workers started
    t.match(welcomeMessageCalls(), [])
    t.match(happyBirthdayMessageCalls(), [])
    t.match(promotionMessageCalls(), [])

    await Promise.race([
      kodmq.workers.start(),
      kodmq.jobs.waitUntilAllFinished(),
    ])
      .finally(async () => await kodmq.stopAll({ closeConnection: false }))

    t.match(welcomeMessageCalls(), [{ args: [job1.payload] }])
    t.match(happyBirthdayMessageCalls(), [{ args: [job2.payload] }])
    t.match(promotionMessageCalls(), [{ args: [job3.payload] }])

    await new Promise((resolve) => setTimeout(resolve, 100))

    const workers = await kodmq.workers.all()
    const completedJobs = await kodmq.jobs.all({ status: Completed })
    await kodmq.adapter.closeConnection()

    t.equal(completedJobs.length, 3)
    t.equal(completedJobs[0].id, job3.id)
    t.equal(completedJobs[1].id, job2.id)
    t.equal(completedJobs[2].id, job1.id)
    t.ok(completedJobs[0].startedAt instanceof Date)
    t.ok(completedJobs[1].startedAt instanceof Date)
    t.ok(completedJobs[2].startedAt instanceof Date)
    t.ok(completedJobs[0].finishedAt instanceof Date)
    t.ok(completedJobs[1].finishedAt instanceof Date)
    t.ok(completedJobs[2].finishedAt instanceof Date)
    t.equal(completedJobs[0].workerId, workers[0].id)
    t.equal(completedJobs[1].workerId, workers[0].id)
    t.equal(completedJobs[2].workerId, workers[0].id)
  })

  t.test("gets information about workers", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter(), handlers })

    let workers = await kodmq.workers.all()
    t.equal(workers.length, 0)

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    workers = await kodmq.workers.all()
    t.equal(workers.length, 1)
    t.equal(workers[0].id, 1)
    t.equal(workers[0].status, Idle)

    await kodmq.stopAll()
  })

  t.test("gracefully stops workers", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter(), handlers })

    const job = await kodmq.jobs.perform("longRunningJob")

    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    let completedJobs = await kodmq.jobs.all({ status: Completed })

    t.equal(pendingJobs.length, 1)
    t.equal(pendingJobs[0].id, job.id)
    t.equal(completedJobs.length, 0)

    // Start workers and stop them before job is completed
    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 200))

    await kodmq.stopAll({ closeConnection: false })
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Make sure job is completed due to graceful stop
    pendingJobs = await kodmq.jobs.all({ status: Pending })
    completedJobs = await kodmq.jobs.all({ status: Completed })
    await kodmq.adapter.closeConnection()

    t.equal(pendingJobs.length, 0)
    t.equal(completedJobs.length, 1)
    t.equal(completedJobs[0].id, job.id)
  })

  t.test("runs callbacks", async (t) => {
    const callbacks = {
      jobCreated: (..._args: unknown[]) => undefined,
      jobActive: (..._args: unknown[]) => undefined,
      jobScheduledRetry: (..._args: unknown[]) => undefined,
      workerCreated: (..._args: unknown[]) => undefined,
      workerIdle: (..._args: unknown[]) => undefined,
      workerBusy: (..._args: unknown[]) => undefined,
    }

    const jobCreatedCalls = t.capture(callbacks, "jobCreated")
    const jobActiveCalls = t.capture(callbacks, "jobActive")
    const jobScheduledRetryCalls = t.capture(callbacks, "jobScheduledRetry")
    const workerCreatedCalls = t.capture(callbacks, "workerCreated")
    const workerIdleCalls = t.capture(callbacks, "workerIdle")
    const workerBusyCalls = t.capture(callbacks, "workerBusy")

    const kodmq = new KodMQ({
      adapter: new InMemoryAdapter(),
      handlers,
      callbacks,

      maxRetries: 1,
    })

    await kodmq.jobs.perform("welcomeMessage", "John")
    await kodmq.jobs.perform("iWasBornToFail")
    await kodmq.jobs.performIn(1000, "welcomeMessage", "Andrew")
    await kodmq.jobs.performAt(new Date(Date.now() + 2000), "welcomeMessage", "Alex")

    t.equal(jobCreatedCalls().length, 4)
    t.equal(jobActiveCalls().length, 0)
    t.equal(jobScheduledRetryCalls().length, 0)
    t.equal(workerCreatedCalls().length, 0)
    t.equal(workerIdleCalls().length, 0)
    t.equal(workerBusyCalls().length, 0)

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 500))
    await kodmq.stopAll()

    t.equal(jobCreatedCalls().length, 1)
    t.equal(jobActiveCalls().length, 2)
    t.equal(jobScheduledRetryCalls().length, 1)
    t.equal(workerCreatedCalls().length, 1)
    t.equal(workerIdleCalls().length, 3)
    t.equal(workerBusyCalls().length, 2)
  })

  t.test("kills worker and puts job back to queue", async (t) => {
    const kodmq = new KodMQ({
      adapter: new InMemoryAdapter(),
      handlers,
      stopTimeout: 1,
    })

    const job = await kodmq.jobs.perform("longRunningJob")

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    t.equal(pendingJobs.length, 0)

    await t.rejects(kodmq.stopAll({ closeConnection: false }), { message: "Worker 1 is not stopped after 1ms" })
    await new Promise((resolve) => setTimeout(resolve, 300))

    pendingJobs = await kodmq.jobs.all({ status: Pending })
    await kodmq.adapter.closeConnection()

    t.equal(pendingJobs.length, 1)
    t.equal(pendingJobs[0].id, job.id)
  })

  t.test("boosts job", async (t) => {
    const kodmq = new KodMQ({ adapter: new InMemoryAdapter(), handlers })

    const job1 = await kodmq.jobs.perform("welcomeMessage", "John")
    const job2 = await kodmq.jobs.perform("welcomeMessage", "Andrew")
    const job3 = await kodmq.jobs.perform("welcomeMessage", "Alex")
    const scheduledJob = await kodmq.jobs.performAt(new Date(0), "welcomeMessage", "Bob")
    const boostedJob = await kodmq.jobs.perform("welcomeMessage", "Bob")

    await kodmq.jobs.boost(boostedJob.id)

    // NOTE: Should job boosted job be above the scheduled job?
    t.match(await kodmq.adapter.popJobFromQueue(), { id: scheduledJob.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: boostedJob.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job1.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job2.id })
    t.match(await kodmq.adapter.popJobFromQueue(), { id: job3.id })

    await kodmq.closeConnection()
  })

  t.test("retries job", async (t) => {
    const kodmq = new KodMQ({
      adapter: new InMemoryAdapter(),
      handlers,
      maxRetries: 1,
      retryDelay: 200,
    })

    const job = await kodmq.jobs.perform("iWasBornToFail")

    setTimeout(() => kodmq.workers.start(), 1)
    await new Promise((resolve) => setTimeout(resolve, 100))

    let pendingJobs = await kodmq.jobs.all({ status: Pending })
    let scheduledJobs = await kodmq.jobs.all({ status: Scheduled })
    let failedJobs = await kodmq.jobs.all({ status: Failed })

    t.equal(pendingJobs.length, 0)
    t.equal(scheduledJobs.length, 1)
    t.equal(scheduledJobs[0].id, Number(job.id) + 1)
    t.equal(failedJobs.length, 1)
    t.equal(failedJobs[0].id, job.id)

    await new Promise((resolve) => setTimeout(resolve, 200))

    pendingJobs = await kodmq.jobs.all({ status: Pending })
    scheduledJobs = await kodmq.jobs.all({ status: Scheduled })
    failedJobs = await kodmq.jobs.all({ status: Failed })

    t.equal(pendingJobs.length, 0)
    t.equal(scheduledJobs.length, 0)
    t.equal(failedJobs.length, 2)
    t.equal(failedJobs[0].id, Number(job.id) + 1)
    t.equal(failedJobs[1].id, job.id)

    const workers = await kodmq.workers.all()

    t.equal(workers.length, 1)
    t.equal(workers[0].status, Idle)

    await kodmq.stopAll()
  })
})
