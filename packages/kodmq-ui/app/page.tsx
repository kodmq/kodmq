import { Active, Completed, Failed, Idle, Pending, Scheduled } from "kodmq/constants"
import Link from "next/link"
import { createElement } from "react"
import Heading from "@/components/content/Heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WorkersTable from "@/components/worker/WorkersTable"
import kodmq from "@/lib/kodmq"
import { filter } from "@/lib/utils"
import { JobStatusIcons } from "@/lib/utils/job"

export default async function HomePage() {
  const jobs = await kodmq.getJobs()
  const workers = await kodmq.getWorkers()
  const idleAndActiveWorkers = filter(workers, { statusIn: [Idle, Active] })

  const jobsPendingCount = filter(jobs, { status: Pending }).length
  const jobsScheduledCount = filter(jobs, { status: Scheduled }).length
  const jobsActiveCount = filter(jobs, { status: Active }).length
  const jobsCompletedCount = filter(jobs, { status: Completed }).length
  const jobsFailedCount = filter(jobs, { status: Failed }).length

  const cards = [
    {
      title: "Pending",
      icon: JobStatusIcons[Pending],
      href: `/jobs?status=${Pending}`,
      value: jobsPendingCount,
    },
    {
      title: "Scheduled",
      icon: JobStatusIcons[Scheduled],
      href: `/jobs?status=${Scheduled}`,
      value: jobsScheduledCount,
    },
    {
      title: "Active",
      icon: JobStatusIcons[Active],
      href: `/jobs?status=${Active}`,
      value: jobsActiveCount,
    },
    {
      title: "Completed",
      icon: JobStatusIcons[Completed],
      href: `/jobs?status=${Completed}`,
      value: jobsCompletedCount,
    },
    {
      title: "Failed",
      icon: JobStatusIcons[Failed],
      href: `/jobs?status=${Failed}`,
      value: jobsFailedCount,
    },
  ]
  
  return (
    <>
      <Heading className="mb-8">
        Dashboard
      </Heading>

      <Heading tag="h2" className="mb-4">
        Jobs
      </Heading>
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="relative dark:hover:bg-neutral-900">
            <CardHeader className="text-center pb-4">
              <CardTitle>
                {createElement(card.icon, { className: "h-5 w-5 mr-1.5 inline-block -translate-y-px" })}
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center text-4xl font-bold">
              {card.value}
            </CardContent>

            <Link
              href={card.href}
              className="absolute inset-0 z-10"
            />
          </Card>
        ))}
      </div>

      <Heading tag="h2" className="mt-8 mb-4">
        Workers
      </Heading>

      <WorkersTable workers={idleAndActiveWorkers} />
    </>
  )
}
