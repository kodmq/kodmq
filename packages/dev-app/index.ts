import { KodMQ, kodmqLauncher } from "kodmq"

async function sendEmail({ subject: _, body: __ }: { subject: string, body: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function processPayment({ amount: _ }: { amount: number }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function renewSubscription({ user: _ }: { user: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 10000))
}

async function sendInvoice({ user: _ }: { user: string }) {
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
})

await kodmq.adapter.clearAll()

const emails = [
  { subject: "Hello, World!", body: "This is a test email." },
  { subject: "Wow, it works!", body: "This is a test email." },
  { subject: "Amazing!", body: "This is a test email." },
  { subject: "Awesome!", body: "This is a test email." },
  { subject: "Great!", body: "This is a test email." },
]

for (const email of emails) {
  await kodmq.performJob("sendEmail", email)
}

const payments = [
  1000000,
  2000000,
  3000000,
  4000000,
  5000000,
]

for (const amount of payments) {
  await kodmq.performJob("processPayment", { amount })
}

const users = [
  "Woody Harrelson",
  "Joaquin Phoenix",
  "Keanu Reeves",
  "Brad Pitt",
  "Morgan Freeman",
  "Robert Downey Jr.",
  "Angelina Jolie",
  "Megan Fox",
]

for (const user of users) {
  await kodmq.performJob("sendInvoice", { user })
  await kodmq.scheduleJob(new Date(Date.now() + 1000 * 60 * 60 * (Math.random() * 10)), "renewSubscription", { user })
}

await kodmq.performJob("fireJim")
await kodmqLauncher(kodmq)
