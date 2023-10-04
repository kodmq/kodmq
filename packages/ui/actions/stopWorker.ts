"use server"

import { revalidatePath } from "next/cache"
import { withServerAction } from "@/actions/withServerAction"
import withKodMQ from "@/lib/kodmq"

export default withServerAction(async (workerId: string | number) => {
  await withKodMQ((kodmq) => kodmq.workers.stop(workerId))
  revalidatePath("/")

  return true
})
