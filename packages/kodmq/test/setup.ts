import RedisAdapter from "../src/adapters/RedisAdapter"

beforeEach(async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()
  await adapter.closeConnection()
})
