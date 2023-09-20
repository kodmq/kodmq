/* eslint-disable no-console */
import process from "process"
import KodMQ from "@/KodMQ"

async function processPhoto(data: { photoId: string }) {
  console.log(`Processing photo ${data.photoId}`)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000))
  console.log(`Finished processing photo ${data.photoId}`)
}

const kodmq = new KodMQ({
  handlers: {
    processPhoto,
  },
})

await kodmq.perform("processPhoto", { photoId: "123" })
await kodmq.perform("processPhoto", { photoId: "456" })
await kodmq.perform("processPhoto", { photoId: "789" })

await kodmq.start()

process.on("SIGINT", () => {
  kodmq.stop()
})
