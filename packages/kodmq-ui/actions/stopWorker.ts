"use server"

import { revalidatePath } from "next/cache"
import { ServerActionError, withServerAction } from "@/actions/withServerAction"
import kodmq from "@/lib/kodmq"

export default withServerAction(async (workerId: string | number) => {
  const worker = await kodmq.getWorker(workerId)
  if (!worker) throw new ServerActionError("Worker not found")

  await kodmq.stopWorker(worker)
  revalidatePath("/")

  return true
})
