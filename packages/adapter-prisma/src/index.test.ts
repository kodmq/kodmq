import RedisAdapter from "@kodmq/adapter-redis"
import { Active, Busy, Failed, Idle, Pending, Scheduled } from "@kodmq/core/constants"
import { Job, JobCreate, Worker, WorkerCreate } from "@kodmq/core/types"
import Redis from "ioredis"
import t from "tap"

const jobsCreateData: JobCreate[] = [
  {
    name: "test",
    payload: { foo: "bar" },
    status: Pending,
  },
  {
    name: "anotherTest",
    payload: { baz: "qux" },
    status: Scheduled,
  },
]

const jobs: Job[] = [
  {
    id: 451,
    workerId: 1984,
    retryJobId: 777,
    status: Failed,
    name: "test",
    payload: { foo: "bar" },
    createdAt: new Date(Date.now() - 1000),
    runAt: new Date(Date.now() - 500),
    startedAt: new Date(Date.now() - 450),
    finishedAt: undefined,
    failedAt: new Date(Date.now() - 400),
    failedAttempts: 2,
    errorMessage: "Some error message",
    errorStack: "Some error stack",
  },
]

//
// Common
//

t.test("do not open connection automatically", async () => {
  const adapter = new RedisAdapter()
  t.equal(await adapter.isConnected(), false)
})

t.test("opens connection when send first command", async () => {
  const adapter = new RedisAdapter()
  await adapter.ping()

  t.equal(await adapter.isConnected(), true)
  await adapter.closeConnection()
})

t.test("accept Redis client as parameter", async () => {
  const redis = new Redis()
  const adapter = new RedisAdapter({ redis })

  t.ok(await adapter.ping())
  await adapter.closeConnection()
})

t.test("raise error if redis parameter is invalid", async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  t.throws(() => new RedisAdapter({ redis: 42 }), { message: "Redis client must be an instance of ioredis. Received: number" })
})

t.test("raise timeout error when credentials are invalid", async () => {
  const adapter = new RedisAdapter({
    redisOptions: {
      host: "locahost",
      connectTimeout: 50,
      commandTimeout: 50,
    },
  })

  await t.rejects(adapter.openConnection(), { message: "Cannot open connection → Connection is closed" })
  await t.rejects(adapter.ping(), { message: "Cannot ping → Command timed out" })
  await t.rejects(adapter.closeConnection(), { message: "Cannot close connection → Command timed out" })
})

t.test("all throws", async () => {
  const adapter = new RedisAdapter({
    redisOptions: {
      host: "locahost",
      connectTimeout: 10,
      commandTimeout: 10,
    },
  })

  await t.rejects(adapter.getNextJobId(), { name: "KodMQAdapterError" })
  await t.rejects(adapter.getJob(1), { name: "KodMQAdapterError" })
  await t.rejects(adapter.getJobs(), { name: "KodMQAdapterError" })
  await t.rejects(adapter.createJob(jobsCreateData[0]), { name: "KodMQAdapterError" })
  await t.rejects(adapter.updateJob(1, { status: Active }), { name: "KodMQAdapterError" })
  await t.rejects(adapter.removeJob(1), { name: "KodMQAdapterError" })
  await t.rejects(adapter.pushJobToQueue(1), { name: "KodMQAdapterError" })
  await t.rejects(adapter.popJobFromQueue(), { name: "KodMQAdapterError" })
  await t.rejects(adapter.prependJobToQueue(1), { name: "KodMQAdapterError" })
  await t.rejects(adapter.subscribeToJobs(async () => {}, async () => true), { name: "KodMQAdapterError" })
  await t.rejects(adapter.removeJobFromQueue(jobs[0]), { name: "KodMQAdapterError" })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await t.rejects(adapter.serializeJob(42), { name: "KodMQAdapterError" })
  await t.rejects(adapter.deserializeJob("42"), { name: "KodMQAdapterError" })

  await t.rejects(adapter.getNextWorkerId(), { name: "KodMQAdapterError" })
  await t.rejects(adapter.getWorker(1), { name: "KodMQAdapterError" })
  await t.rejects(adapter.getWorkers(), { name: "KodMQAdapterError" })
  await t.rejects(adapter.createWorker(workersCreateData[0]), { name: "KodMQAdapterError" })
  await t.rejects(adapter.updateWorker(1, { status: Busy }), { name: "KodMQAdapterError" })
  await t.rejects(adapter.removeWorker(1), { name: "KodMQAdapterError" })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await t.rejects(adapter.serializeWorker(42), { name: "KodMQAdapterError" })
  await t.rejects(adapter.deserializeWorker("42"), { name: "KodMQAdapterError" })

  await t.rejects(adapter.clearAll(), { name: "KodMQAdapterError" })
})

//
// Jobs
//

t.test("getNextJobId", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const id = await adapter.getNextJobId()
  t.equal(typeof id, "number")

  await adapter.closeConnection()
})

t.test("getJob", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const { id } = await adapter.createJob(jobsCreateData[0])

  const job = await adapter.getJob(id)
  if (!job) return t.fail("Job not found")

  t.equal(job.id, id)
  t.equal(job.name, jobsCreateData[0].name)
  t.equal(job.status, jobsCreateData[0].status)
  t.match(job.payload, jobsCreateData[0].payload)

  await adapter.closeConnection()
})

t.test("getJobs", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  for (const jobCreateData of jobsCreateData) {
    await adapter.createJob(jobCreateData)
  }

  const jobs = await adapter.getJobs()
  t.equal(jobs.length, jobsCreateData.length)

  for (const [index, job] of jobs.reverse().entries()) {
    t.equal(job.name, jobsCreateData[index].name)
    t.equal(job.status, jobsCreateData[index].status)
    t.match(job.payload, jobsCreateData[index].payload)
  }

  for (const job of await adapter.getJobs({ status: Pending })) {
    t.equal(job.status, Pending)
  }

  await adapter.closeConnection()
})

t.test("createJob", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const { id } = await adapter.createJob(jobsCreateData[0])
  t.equal(typeof id, "number")

  await adapter.closeConnection()
})

t.test("updateJob", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job = await adapter.createJob(jobsCreateData[0])

  t.equal(job.status, Pending)
  t.notOk(job.startedAt)

  const updatedJob = await adapter.updateJob(job.id, {
    status: Active,
    startedAt: new Date(),
  })

  t.equal(updatedJob.id, job.id)
  t.equal(updatedJob.status, Active)
  t.ok(updatedJob.startedAt)

  await adapter.closeConnection()
})

t.test("removeJob", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job = await adapter.createJob(jobsCreateData[0])
  t.ok(await adapter.getJob(job.id))

  await adapter.removeJob(job.id)
  t.notOk(await adapter.getJob(job.id))

  await adapter.closeConnection()
})

t.test("pushJobToQueue/popJobFromQueue (queue)", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job = await adapter.createJob(jobsCreateData[0])

  t.notOk(await adapter.popJobFromQueue())
  await adapter.pushJobToQueue(job.id)

  const poppedJob = await adapter.popJobFromQueue()
  if (!poppedJob) return t.fail("Job not found")

  t.equal(poppedJob.id, job.id)
  t.equal(poppedJob.name, job.name)
  t.match(poppedJob.payload, job.payload)

  await adapter.closeConnection()
})

t.test("pushJobToQueue/popJobFromQueue (scheduled job)", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job = await adapter.createJob(jobsCreateData[1])
  const runIn = 100

  t.notOk(await adapter.popJobFromQueue())
  await adapter.pushJobToQueue(job.id, new Date(Date.now() + runIn))

  t.notOk(await adapter.popJobFromQueue())
  await new Promise((resolve) => setTimeout(resolve, runIn + 5))

  const poppedJob = await adapter.popJobFromQueue()
  if (!poppedJob) return t.fail("Job not found")

  t.equal(poppedJob.id, job.id)
  t.equal(poppedJob.name, job.name)
  t.match(poppedJob.payload, job.payload)

  await adapter.closeConnection()
})

t.test("prependJobToQueue", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job1 = await adapter.createJob(jobsCreateData[0])
  const job2 = await adapter.createJob(jobsCreateData[1])

  t.notOk(await adapter.popJobFromQueue())
  await adapter.pushJobToQueue(job1.id)
  await adapter.prependJobToQueue(job2.id)

  const poppedJob = await adapter.popJobFromQueue()
  if (!poppedJob) return t.fail("Job not found")

  t.equal(poppedJob.id, job2.id)
  t.equal(poppedJob.name, job2.name)
  t.match(poppedJob.payload, job2.payload)

  await adapter.closeConnection()
})

t.test("subscribeToJobs", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const createdJobs: Job[] = []

  for (const jobCreateData of jobsCreateData) {
    const job = await adapter.createJob(jobCreateData)
    await adapter.pushJobToQueue(job.id)

    createdJobs.push(job)
  }

  const receivedJobs: Job[] = []
  const time = Date.now()

  const handler = async (job: Job) => { receivedJobs.push(job) }
  const keepSubscribed = async () => Date.now() - time < 1000

  await adapter.subscribeToJobs(handler, keepSubscribed)
  t.equal(receivedJobs.length, jobsCreateData.length)

  for (const [index, job] of receivedJobs.entries()) {
    t.equal(job.id, createdJobs[index].id)
    t.equal(job.name, createdJobs[index].name)
    t.match(job.payload, createdJobs[index].payload)
  }

  await adapter.closeConnection()
})

t.test("removeJobFromQueue", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const job = await adapter.createJob(jobsCreateData[0])

  await adapter.pushJobToQueue(job.id)
  t.ok(await adapter.popJobFromQueue())

  await adapter.pushJobToQueue(job.id)
  await adapter.removeJobFromQueue(job)
  t.notOk(await adapter.popJobFromQueue())

  await adapter.closeConnection()
})

t.test("serializeJob/deserializeJob", async () => {
  const adapter = new RedisAdapter()

  for (const job of jobs) {
    const serializedJob = await adapter.serializeJob(job)
    t.ok(serializedJob)

    const deserializedJob = await adapter.deserializeJob(serializedJob)
    t.ok(deserializedJob)
    t.match(deserializedJob, job)
  }
})

//
// Workers
//

const workersCreateData: WorkerCreate[] = [
  {
    name: "test",
    status: Idle,
  },
  {
    name: "anotherTest",
    status: Idle,
  },
]

const workers: Worker[] = [
  {
    id: 1000000,
    status: Busy,
    name: "test",
    currentJob: {
      id: 123,
      name: "test",
      payload: true,
    },
    startedAt: new Date(Date.now() - 1000),
    stoppedAt: undefined,
  },
]

t.test("getNextWorkerId", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const id = await adapter.getNextWorkerId()
  t.equal(typeof id, "number")

  await adapter.closeConnection()
})

t.test("getWorker", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const { id } = await adapter.createWorker(workersCreateData[0])

  const worker = await adapter.getWorker(id)
  if (!worker) return t.fail("Worker not found")

  t.equal(worker.id, id)
  t.equal(worker.name, workersCreateData[0].name)
  t.equal(worker.status, workersCreateData[0].status)

  await adapter.closeConnection()
})

t.test("getWorkers", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  for (const workerCreateData of workersCreateData) {
    await adapter.createWorker(workerCreateData)
  }

  const workers = await adapter.getWorkers()
  t.equal(workers.length, workersCreateData.length)

  for (const [index, worker] of workers.reverse().entries()) {
    t.equal(worker.name, workersCreateData[index].name)
    t.equal(worker.status, workersCreateData[index].status)
  }

  for (const worker of await adapter.getWorkers({ status: Idle })) {
    t.equal(worker.status, Idle)
  }

  await adapter.closeConnection()
})

t.test("createWorker", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const { id } = await adapter.createWorker(workersCreateData[0])
  t.equal(typeof id, "number")

  await adapter.closeConnection()
})

t.test("updateWorker", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const worker = await adapter.createWorker(workersCreateData[0])

  t.equal(worker.status, Idle)

  const currentJob = {
    id: 123,
    name: "test",
    payload: { foo: "bar" },
  }

  const updatedWorker = await adapter.updateWorker(worker.id, {
    status: Busy,
    currentJob,
  })

  t.equal(updatedWorker.id, worker.id)
  t.equal(updatedWorker.status, Busy)
  t.match(updatedWorker.currentJob, currentJob)

  await adapter.closeConnection()
})

t.test("removeWorker", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  const worker = await adapter.createWorker(workersCreateData[0])
  t.ok(await adapter.getWorker(worker.id))

  await adapter.removeWorker(worker.id)
  t.notOk(await adapter.getWorker(worker.id))

  await adapter.closeConnection()
})

t.test("serializeWorker/deserializeWorker", async () => {
  const adapter = new RedisAdapter()

  for (const worker of workers) {
    const serializedWorker = await adapter.serializeWorker(worker)
    t.ok(serializedWorker)

    const deserializedWorker = await adapter.deserializeWorker(serializedWorker)
    t.ok(deserializedWorker)
    t.match(deserializedWorker, worker)
  }
})

t.test("clearAll", async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()

  await adapter.createJob(jobsCreateData[0])
  await adapter.createWorker(workersCreateData[0])
  let jobs = await adapter.getJobs()
  let workers = await adapter.getWorkers()

  t.equal(jobs.length, 1)
  t.equal(workers.length, 1)

  await adapter.clearAll()
  jobs = await adapter.getJobs()
  workers = await adapter.getWorkers()

  t.equal(jobs.length, 0)
  t.equal(workers.length, 0)

  await adapter.closeConnection()
})

t.test("openConnection/closeConnection", async () => {
  const adapter = new RedisAdapter()
  t.equal(await adapter.isConnected(), false)

  await adapter.openConnection()
  t.equal(await adapter.isConnected(), true)

  await adapter.closeConnection()
  await new Promise((resolve) => setTimeout(resolve, 50))
  t.equal(await adapter.isConnected(), false)
})

t.test("ping", async () => {
  const adapter = new RedisAdapter()
  t.equal(await adapter.ping(), "PONG")

  await adapter.closeConnection()
})
