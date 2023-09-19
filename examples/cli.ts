import KodMQ from "../src/KodMQ.ts";

async function processPhoto(data: { photoId: string }) {
  console.log(`Processing photo ${data.photoId}`);
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000))
  console.log(`Finished processing photo ${data.photoId}`);
}

const kodmq = new KodMQ({
  handlers: {
    processPhoto
  }
})

export default kodmq
