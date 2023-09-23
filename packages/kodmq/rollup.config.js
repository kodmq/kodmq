import * as fs from "fs"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import bundleSize from "rollup-plugin-bundle-size"
import pkg from "./package.json" assert { type: "json" }

// Clean up the `dist` directory
fs.rmSync("dist", { recursive: true, force: true })

const bundleFiles = [
  "index",
  "errors",
  "statuses",
]

const plugins = [
  terser(),
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
      { file: `dist/${file}.js`, format: "cjs", sourcemap: true },
      { file: `dist/${file}.es.js`, format: "es", sourcemap: true },
    ],

    plugins,
    external,
  })),
  // {
  //   input: "dist/dts/src/index.d.ts",
  //   output: [{ file: pkg.types, format: "es" }],
  //   plugins: [dts()],
  // },
]
