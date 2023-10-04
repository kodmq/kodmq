import EmptyValue from "@/components/content/EmptyValue"
import Heading from "@/components/typography/Heading"
import Badge from "@/components/ui/Badge"
import * as InfoList from "@/components/ui/InfoList"

export default async function SettingsPage() {
  const host = process.env.KODMQ_REDIS_HOST ?? process.env.REDIS_HOST ?? "localhost"
  const port = process.env.KODMQ_REDIS_PORT ?? process.env.REDIS_PORT ?? "6379"
  const username = process.env.KODMQ_REDIS_USERNAME ?? process.env.REDIS_USERNAME
  const password = process.env.KODMQ_REDIS_PASSWORD ?? process.env.REDIS_PASSWORD
  const database = process.env.KODMQ_REDIS_DATABASE ?? process.env.REDIS_DATABASE ?? "0"
  const tls = ["1", "true"].includes(process.env.KODMQ_REDIS_TLS ?? process.env.REDIS_TLS ?? "false")

  return (
    <>
      <Heading>Settings</Heading>

      <InfoList.Root>
        <InfoList.Item label="Redis Host">
          {host}
        </InfoList.Item>

        <InfoList.Item label="Redis Port">
          {port}
        </InfoList.Item>

        <InfoList.Item label="Redis Username">
          {username ?? <EmptyValue />}
        </InfoList.Item>

        <InfoList.Item label="Redis Password">
          {password ? "********" : <EmptyValue />}
        </InfoList.Item>

        <InfoList.Item label="Redis Database">
          {database}
        </InfoList.Item>

        <InfoList.Item label="Redis TLS">
          <Badge>
            {tls ? "Enabled" : "Disabled"}
          </Badge>
        </InfoList.Item>
      </InfoList.Root>
    </>
  )
}
