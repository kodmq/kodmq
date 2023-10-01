/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
	],

  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 4px rgb(0 0 0 / 0.1)',
      },

      maxWidth: {
        lg: '33rem',
        '2xl': '40rem',
        '3xl': '50rem',
        '5xl': '66rem',
      },

      opacity: {
        1: '0.01',
        2.5: '0.025',
        7.5: '0.075',
        15: '0.15',
      },
    },
  },
}
