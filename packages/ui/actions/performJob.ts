"use server"

import { Job } from "@kodmq/core/types"
import { revalidatePath } from "next/cache"
import { withServerAction } from "@/actions/withServerAction"
import kodmq from "@/lib/kodmq"

export default withServerAction(async ({ name, payload, runAt }: Pick<Job, "name" | "payload" | "runAt">) => {
  const job = await kodmq.jobs.perform(name, payload, runAt)
  revalidatePath("/")

  return job
})
