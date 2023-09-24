import RedisAdapter from "../dist/adapters/RedisAdapter.js"

beforeEach(async () => {
  const adapter = new RedisAdapter()
  await adapter.clearAll()
  await adapter.closeConnection()
})
