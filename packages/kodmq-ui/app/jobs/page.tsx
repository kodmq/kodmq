import { Pending, ReadableJobStatuses } from "kodmq"
import Heading from "@/components/content/Heading"
import JobStatusSwitcher from "@/components/job/JobStatusSwitcher"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import kodmq from "@/lib/kodmq"

export default async function JobsPage() {
  const jobs = await kodmq.getJobs({ status: Pending })

  return (
    <div>
      <Heading className="mb-6">Jobs</Heading>

      <JobStatusSwitcher
        currentStatus={Pending}
        statuses={ReadableJobStatuses}
        className="mb-4"
      />

      <Card>
        <CardContent className="pt-6">
          <Table className="rounded overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Job ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium pl-4">{worker.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
