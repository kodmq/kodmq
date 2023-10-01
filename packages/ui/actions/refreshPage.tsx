"use server"

import { revalidatePath } from "next/cache"
import { withServerAction } from "@/actions/withServerAction"

export default withServerAction(async (path: string) => {
  revalidatePath(path)
})
