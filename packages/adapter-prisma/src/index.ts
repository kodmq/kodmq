import Adapter from "@kodmq/core/adapter"
import { Canceled, Pending } from "@kodmq/core/constants"
import { Job, JobCreate, JobsAllOptions, Worker, WorkerCreate, WorkersAllOptions, Thread } from "@kodmq/core/types"
import { PrismaClient } from "@prisma/client"

export type PrismaAdapterOptions = {
  prisma: PrismaClient
}

export default class PrismaAdapter extends Adapter {
  prisma: PrismaClient

  constructor(options: PrismaAdapterOptions) {
    super()

    this.prisma = options.prisma
  }

  getJobs(options: JobsAllOptions): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: {
        status: options.status ?? undefined,
      },
      take: options.limit ?? undefined,
      skip: options.offset ?? undefined,
    })
  }

  getJob(id: string): Promise<Job | null | void> {
    return this.prisma.job.findUnique({
      where: {
        id,
      },
    })
  }

  createJob(attributes: JobCreate): Promise<Job> {
    return this.prisma.job.create({
      data: attributes,
    })
  }

  updateJob(id: string, attributes: JobCreate): Promise<Job> {
    return this.prisma.job.update({
      where: {
        id,
      },
      data: attributes,
    })
  }

  removeJob(id: string): Promise<void> {
    return this.prisma.job.delete({
      where: {
        id,
      },
    })
  }

  pushJobToQueue(id: string): Promise<void> {
    return this.prisma.job.update({
      where: {
        id,
      },
      data: {
        status: Pending,
      },
    })
  }

  async prependJobToQueue(id: string): Promise<void> {
    const highestPriority = await this.prisma.job.aggregate({
      _max: {
        priority: true,
      },
    })

    return this.prisma.job.update({
      where: {
        id,
      },
      data: {
        status: Pending,
        priority: (highestPriority._max.priority ?? 0) + 1,
      },
    })
  }

  removeJobFromQueue(job: Job): Promise<void> {
    return this.prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        status: Canceled,
      },
    })
  }

  // TODO: Lock mechanism
  // TODO: Queue name
  async popJobFromQueue(): Promise<Job | null> {
    // Find first scheduled job
    const scheduledJob = await this.prisma.job.findFirst({
      where: {
        status: Pending,
        runAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        priority: "asc",
      },
    })

    if (scheduledJob) {
      return scheduledJob
    }

    // Find first pending job
    const pendingJob = await this.prisma.job.findFirst({
      where: {
        status: Pending,
      },
      orderBy: {
        priority: "asc",
      }
    })

    if (pendingJob) {
      return pendingJob
    }

    return null
  }

  //
  // Workers
  //

  getWorkers(options?: WorkersAllOptions): Promise<Worker[]> {
    return this.prisma.worker.findMany({
      where: {
        status: options?.status ?? undefined,
      },
      take: options?.limit ?? undefined,
      skip: options?.offset ?? undefined,
    })
  }

  getWorker(id: string): Promise<Worker | null> {
    return this.prisma.worker.findUnique({
      where: {
        id,
      },
    })
  }

  createWorker(attributes: WorkerCreate): Promise<Worker> {
    return this.prisma.worker.create({
      data: attributes,
    })
  }

  updateWorker(id: string, attributes: WorkerCreate): Promise<Worker> {
    return this.prisma.worker.update({
      where: {
        id,
      },
      data: attributes,
    })
  }

  removeWorker(id: string): Promise<void> {
    return this.prisma.worker.delete({
      where: {
        id,
      },
    })
  }

  //
  // Threads
  //

  getThreads(options?: ThreadsAllOptions): Promise<Thread[]> {
    return this.prisma.thread.findMany({
      where: {
        status: options?.status ?? undefined,
      },
      take: options?.limit ?? undefined,
      skip: options?.offset ?? undefined,
    })
  }

  getThread(id: string): Promise<Thread | null> {
    return this.prisma.thread.findUnique({
      where: {
        id,
      },
    })
  }

  createThread(attributes: ThreadCreate): Promise<Thread> {
    return this.prisma.thread.create({
      data: attributes,
    })
  }

  updateThread(id: string, attributes: ThreadCreate): Promise<Thread> {
    return this.prisma.thread.update({
      where: {
        id,
      },
      data: attributes,
    })
  }

  removeThread(id: string): Promise<void> {
    return this.prisma.thread.delete({
      where: {
        id,
      },
    })
  }

  //
  // Other
  //

  clearAll(): Promise<void> {
    return this.prisma.$executeRaw`TRUNCATE TABLE "Job", "Thread", "Worker" RESTART IDENTITY CASCADE`
  }

  async openConnection() {}
  async closeConnection() {}
  async isConnected() { return true }
  async ping() { return this.prisma.$queryRaw`SELECT 1` }
  isKodMQAdapter() { return true }
}
