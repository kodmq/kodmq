import { Active, Completed, Failed, Idle, Pending, Scheduled } from "kodmq/constants"
import Heading from "@/components/typography/Heading"
import Text from "@/components/typography/Text"
import { Card, CardDescription, CardPadding, CardTitle } from "@/components/ui/Card"
import WorkersTable from "@/components/worker/WorkersTable"
import kodmq from "@/lib/kodmq"
import { filter } from "@/lib/utils"

export default async function HomePage() {
  const workers = await kodmq.getWorkers()
  const idleAndActiveWorkers = filter(workers, { statusIn: [Idle, Active] })

  const jobs = await kodmq.getJobs()
  const jobsPendingCount = filter(jobs, { status: Pending }).length
  const jobsScheduledCount = filter(jobs, { status: Scheduled }).length
  const jobsActiveCount = filter(jobs, { status: Active }).length
  const jobsCompletedCount = filter(jobs, { status: Completed }).length
  const jobsFailedCount = filter(jobs, { status: Failed }).length

  const cards = [
    {
      title: "Pending",
      href: `/jobs?status=${Pending}`,
      value: jobsPendingCount,
      pattern: 0,
    },
    {
      title: "Scheduled",
      href: `/jobs?status=${Scheduled}`,
      value: jobsScheduledCount,
      pattern: 1,
    },
    {
      title: "Active",
      href: `/jobs?status=${Active}`,
      value: jobsActiveCount,
      pattern: 2,
    },
    {
      title: "Completed",
      href: `/jobs?status=${Completed}`,
      value: jobsCompletedCount,
      pattern: 3,
    },
    {
      title: "Failed",
      href: `/jobs?status=${Failed}`,
      value: jobsFailedCount,
      pattern: 0,
    },
  ]
  
  return (
    <div>
      <Heading>Dashboard</Heading>
      <Text>Use the Protocol API to access contacts, conversations, group messages, and more and seamlessly integrate your product into the workflows of dozens of devoted Protocol users.</Text>

      <Heading
        tag="h2"
        className="mt-8"
      >
        Jobs
      </Heading>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card
            animated
            key={card.title}
            href={card.href}
          >
            <CardPadding>
              <CardTitle className="mb-1">{card.title}</CardTitle>
              <CardDescription className="text-4xl font-semibold text-black dark:text-white">{card.value}</CardDescription>
            </CardPadding>
          </Card>
        ))}
      </div>
      
      <Heading
        tag="h2"
        className="mt-8"
      >
        Workers
      </Heading>

      <Card>
        <WorkersTable workers={idleAndActiveWorkers} />
      </Card>
    </div>
  )
}
