/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
}
