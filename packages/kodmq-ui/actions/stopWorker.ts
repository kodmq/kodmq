"use server"

import { revalidatePath } from "next/cache"
import { withServerAction } from "@/actions/withServerAction"
import kodmq from "@/lib/kodmq"

export default withServerAction(async (workerId: string | number) => {
  await kodmq.stopWorker(workerId)
  revalidatePath("/")

  return true
})
