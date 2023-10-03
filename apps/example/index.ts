import RedisAdapter from "@kodmq/adapter-redis"
import KodMQ from "@kodmq/core"
import kodmqLauncher from "@kodmq/core/launcher"

const randomWindow = 300000

async function sendEmail({ to: _, subject: __, body: ___ }: { to: string, subject: string, body: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * randomWindow))
}

async function processPayment({ from: _, amount: __ }: { from: string, amount: number }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * randomWindow))
}

async function renewSubscription({ user: _ }: { user: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * randomWindow))
}

async function sendReward({ user: _ }: { user: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * randomWindow))

  if (Math.random() < 0.5) throw new Error("Failed to send invoice")
}

async function fireJim() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * randomWindow))
  throw new Error("Jim is never going to be fired")
}

const kodmq = new KodMQ({
  adapter: new RedisAdapter(),
  handlers: {
    sendEmail,
    processPayment,
    renewSubscription,
    sendReward,
    fireJim,
  },
})

if (!process.argv.includes("--no-clear")) {
  await kodmq.adapter.clearAll()
} else {
  // eslint-disable-next-line no-console
  console.log("Skipping clearAll()")
  // eslint-disable-next-line no-console
  console.log()
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
  "Scarlett Johansson",
  "Jennifer Aniston",
  "Jennifer Lawrence",
  "Emma Watson",
  "Daniel Radcliffe",
  "Rupert Grint",
  "Leonardo DiCaprio",
  "Tom Cruise",
]

const emails = [
  { subject: "Woody Harrelson", body: "You won!" },
  { subject: "Wow, it works!", body: "This is a test email." },
  { subject: "Amazing!", body: "This is a test email." },
  { subject: "Awesome!", body: "This is a test email." },
  { subject: "Great!", body: "This is a test email." },
  { subject: "Cool!", body: "This is a test email." },
  { subject: "Nice!", body: "This is a test email." },
  { subject: "Sweet!", body: "This is a test email." },
]

const payments = [
  451,
  1984,
  1000000,
  2000000,
  3000000,
  4000000,
  5000000,
  6000000,
  7000000,
  8000000,
  9000000,
  10000000,
]

for (const user of users) {
  setTimeout(() => kodmq.jobs.perform("sendReward", { user }), Math.random() * randomWindow)
  setTimeout(() => kodmq.jobs.performIn(Math.random() * randomWindow * 24, "renewSubscription", { user }), Math.random() * randomWindow)

  for (const email of emails) {
    setTimeout(() => kodmq.jobs.perform("sendEmail", { to: user, ...email }), Math.random() * randomWindow)
  }

  for (const amount of payments) {
    setTimeout(() => kodmq.jobs.perform("processPayment", { from: user, amount }), Math.random() * randomWindow)
  }
}

setTimeout(() => kodmq.jobs.perform("fireJim"), Math.random() * randomWindow)
await kodmqLauncher(kodmq)
