import RedisAdapter from "@kodmq/adapter-redis"
import KodMQ from "@kodmq/core"

export default async function withKodMQ<T>(callback: (kodmq: KodMQ) => Promise<T> | T): Promise<T> {
  const kodmq = new KodMQ({ adapter: new RedisAdapter() })

  try {
    return await callback(kodmq)
  } finally {
    try {
      await kodmq.closeConnection()
    } catch (e) {
      // Ignore
    }
  }
}
