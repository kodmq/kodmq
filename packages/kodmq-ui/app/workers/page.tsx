import EmptyValue from "@/components/content/EmptyValue"
import Heading from "@/components/content/Heading"
import StatusBadge from "@/components/content/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import kodmq from "@/lib/kodmq"
import { formatDate } from "@/lib/utils"

export default async function WorkersPage() {
  const workers = await kodmq.getWorkers()

  return (
    <div>
      <Heading className="mb-6">Workers</Heading>

      <Card>
        <CardContent className="pt-6">
          <Table className="rounded overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Worker ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Current Job</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium pl-4">{worker.id}</TableCell>
                  <TableCell><StatusBadge status={worker.status} /></TableCell>
                  <TableCell>{formatDate(worker.startedAt, { year: undefined })}</TableCell>
                  <TableCell>
                    {worker.currentJob ? (
                      <span>
                        {worker.currentJob.name}
                      </span>
                    ) : (
                      <EmptyValue />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
