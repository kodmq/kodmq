import { Completed } from "kodmq"
import kodmq from "@/lib/kodmq"

export default async function HomePage() {
  const workers = await kodmq.getWorkers()
  const jobs = await kodmq.getJobs({ status: Completed })

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <pre>{JSON.stringify(workers, null, 2)}</pre>
      <pre>{JSON.stringify(jobs, null, 2)}</pre>
    </div>
  )
}
