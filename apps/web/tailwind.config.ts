import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{html,ts,astro,mdx}",
  ],

  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },

      opacity: {
        1: '0.01',
        2.5: '0.025',
        7.5: '0.075',
        15: '0.15',
      }
    }
  },

  plugins: [
    require("@tailwindcss/typography"),
  ]
}

export default config
