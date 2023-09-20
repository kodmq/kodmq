import KodMQ from "kodmq"

async function sendEmail({ subject, body }: { subject: string, body: string }) {
  console.log(`Sending email with subject "${subject}" and body "${body}"`)
}

async function processPayment({ amount }: { amount: number }) {
  console.log(`Processing payment of $${amount}`)
}

const kodmq = new KodMQ({
  handlers: {
    sendEmail,
    processPayment,
  },
})

await kodmq.adapter.clearAll()
await kodmq.perform("sendEmail", { subject: "Hello, World!", body: "This is a test email." })
await kodmq.perform("processPayment", { amount: 1000000 })
await kodmq.start()

process.on("SIGINT", async () => {
  await kodmq.stop()
  process.exit(0)
})
