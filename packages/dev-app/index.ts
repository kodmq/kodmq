import KodMQ from "kodmq"
import chalk from "chalk"

async function sendEmail({ subject, body }: { subject: string, body: string }) {
  // console.log(`Sending email with subject "${subject}" and body "${body}"`)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function processPayment({ amount }: { amount: number }) {
  // console.log(`Processing payment for ${amount} USD`)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function renewSubscription({ user }: { user: string }) {
  // console.log(`Renewing subscription for user ${user}`)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function sendInvoice({ user }: { user: string }) {
  // console.log(`Sending invoice to user ${user}`)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))

  if (Math.random() < 0.5) throw new Error("Failed to send invoice")
}

async function fireJim() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
  throw new Error("Jim is never going to be fired")
}

const kodmq = new KodMQ({
  handlers: {
    sendEmail,
    processPayment,
    renewSubscription,
    sendInvoice,
    fireJim,
  },

  callbacks: {
    // onJobActive: (job) => {
    //   console.log(chalk.blueBright("[DevApp]"), `Job ${job.name} (${JSON.stringify(job.payload)}) is active`)
    // },

    onWorkerCurrentJobChanged: (worker) => {
      if (!worker.currentJob) return
      console.log(chalk.blueBright("[DevApp]"), `Worker ${worker.id} is now working on job #${worker.currentJob.id} ${worker.currentJob.name}`)
    },

    onJobCompleted: (job) => {
      const duration = job.startedAt && job.finishedAt ? (job.finishedAt.getTime() - job.startedAt.getTime()) / 1000 : undefined
      console.log(chalk.greenBright("[DevApp]"), `Job ${job.name} is completed in ${duration?.toFixed(2) ?? "-"} seconds`)
    },

    onJobFailed: (job) => {
      console.log(chalk.redBright("[DevApp]"), `Job ${job.name} has failed with error: ${job.errorMessage}`)
    },

    onWorkerStopping: (worker) => {
      console.log(chalk.yellowBright("[DevApp]"), `Worker ${worker.id} is stopping`)
    },

    onWorkerStopped: (worker) => {
      console.log(chalk.redBright("[DevApp]"), `Worker ${worker.id} has stopped`)
    }
  },
})

await kodmq.adapter.clearAll()

// const emails = [
//   { subject: "Hello, World!", body: "This is a test email." },
//   { subject: "Wow, it works!", body: "This is a test email." },
//   { subject: "Amazing!", body: "This is a test email." },
//   { subject: "Awesome!", body: "This is a test email." },
//   { subject: "Great!", body: "This is a test email." },
// ]
//
// for (const email of emails) {
//   await kodmq.perform("sendEmail", email)
// }
//
// const payments = [
//   1000000,
//   2000000,
//   3000000,
//   4000000,
//   5000000,
// ]
//
// for (const amount of payments) {
//   await kodmq.perform("processPayment", { amount })
// }
//
// const users = [
//   "Woody Harrelson",
//   "Joaquin Phoenix",
//   "Keanu Reeves",
//   "Brad Pitt",
//   "Morgan Freeman",
//   "Robert Downey Jr.",
//   "Angelina Jolie",
//   "Megan Fox",
// ]
//
// for (const user of users) {
//   await kodmq.perform("sendInvoice", { user })
//   await kodmq.schedule(new Date(Date.now() + 1000 * 60 * 60 * (Math.random() * 10)), "renewSubscription", { user })
// }

await kodmq.performJob("fireJim")
await kodmq.start({ concurrency: 2 })

process.on("SIGINT", async () => {
  await kodmq.stopAllAndCloseConnection()
  process.exit(0)
})
