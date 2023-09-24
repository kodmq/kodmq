import * as fs from "fs"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import bundleSize from "rollup-plugin-bundle-size"
import pkg from "./package.json" assert { type: "json" }

// Clean up the `dist` directory
fs.rmSync("dist", { recursive: true, force: true })

const bundleFiles = [
  "index",
  "types",
  "kodmq",
  "errors",
  "constants",
]

const plugins = [
  // terser(),
  typescript(),
  bundleSize(),
]

const external = [
  ...Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
  "process",
  "console",
]

export default [
  ...bundleFiles.map((file) => ({
    input: `src/${file}.ts`,

    output: [
      {
        name: file,
        file: `dist/${file}.js`,
        format: "esm",
        sourcemap: true,
      },
    ],

    plugins,
    external,
  })),
]
