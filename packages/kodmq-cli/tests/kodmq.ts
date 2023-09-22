import KodMQ from "kodmq"

async function sendEmail({ email: _, text: __ }: { email: string, text: string }) {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

const kodmq = new KodMQ({
  handlers: {
    sendEmail,
  },
})

export default kodmq
