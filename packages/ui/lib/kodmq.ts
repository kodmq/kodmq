import RedisAdapter from "@kodmq/adapter-redis"
import KodMQ from "@kodmq/core"

const kodmq = new KodMQ({
  adapter: new RedisAdapter(),
})

export default kodmq
