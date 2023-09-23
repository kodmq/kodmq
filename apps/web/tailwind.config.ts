import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{html,ts,astro,mdx}",
  ],

  plugins: [
    require("@tailwindcss/typography"),
  ]
}

export default config
