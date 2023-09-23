/* eslint-disable no-console */
import KodMQ from "../src/kodmq"

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

export default kodmq

// Run this file using `kodmq ./examples/cli.ts`
