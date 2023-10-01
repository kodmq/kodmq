import * as fs from "fs"
import * as path from "path"
import bundleSize from "rollup-plugin-bundle-size"
import esBuild from "rollup-plugin-esbuild"
import pkg from "./package.json" assert { type: "json" }

// Clean up the `dist` directory
fs.rmSync("dist", { recursive: true, force: true })

const bundleFiles = [
  "kodmq",
  "errors",
  "adapter",
  "constants",
  "launcher/index",
]

const external = [
  ...Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
  "os",
  "process",
  "console",
]

export default [
  ...bundleFiles.map((file) => ({
    input: `src/${file}.ts`,
    output: [
      {
        file: `dist/${file}.js`,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      bundleSize(),
      esBuild({
        minify: true,
        tsconfig: path.resolve("./tsconfig.json"),
      }),
    ],
    external,
  })),
]
