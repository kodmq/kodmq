import EmptyValue from "@/components/content/EmptyValue"
import Heading from "@/components/content/Heading"
import StatusBadge from "@/components/content/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import kodmq from "@/lib/kodmq"
import { formatDate, titleize } from "@/lib/utils"
import Payload from "@/components/content/Payload"
import WorkersTable from "@/components/worker/WorkersTable"

export default async function WorkersPage() {
  const workers = await kodmq.getWorkers()

  return (
    <div>
      <Heading className="mb-6">Workers</Heading>

      <Card>
        <CardContent className="pt-6">
          <WorkersTable workers={workers} />
        </CardContent>
      </Card>
    </div>
  )
}
