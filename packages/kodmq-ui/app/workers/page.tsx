import Heading from "@/components/content/Heading"
import { Card, CardContent } from "@/components/ui/card"
import WorkersTable from "@/components/worker/WorkersTable"
import kodmq from "@/lib/kodmq"

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
