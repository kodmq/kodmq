import KodMQ from "kodmq"

async function sendEmail({ email: _, text: __ }: { email: string, text: string }) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))
}

async function iWasBornToFail() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
  throw new Error("I was born to fail")
}

async function iWasBornToRunForever() {
  await new Promise((resolve) => setTimeout(resolve, 1000000))
}

const kodmq = new KodMQ({
  handlers: {
    sendEmail,
    iWasBornToFail,
    iWasBornToRunForever,
  },
})

setTimeout(async () => {
  await kodmq.performJob("sendEmail", { email: "andrew@kodkod.me", text: "Great job!" })
}, 1000)

setTimeout(async () => {
  await kodmq.scheduleJob(new Date(Date.now() + 8000), "sendEmail", { email: "andrew@kodkod.me", text: "Have a good day!" })
}, 2000)

setTimeout(async () => {
  await kodmq.performJob("iWasBornToFail")
}, 3000)

setTimeout(async () => {
  await kodmq.performJob("iWasBornToRunForever")
}, 10000)

export default kodmq
