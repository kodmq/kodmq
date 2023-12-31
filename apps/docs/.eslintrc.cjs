module.exports = {
  root: true,

  extends: [
    "kodmq",
    "plugin:astro/recommended",
    "plugin:tailwindcss/recommended",
  ],

  rules: {
    "tailwindcss/no-custom-classname": ["error", {
      "callees": ["classnames", "clsx", "cn", "ctl", "cva", "tv", "twMerge"],
    }],
  },

  overrides: [
    {
      // Define the configuration for `.astro` file.
      files: ["*.astro"],
      // Allows Astro components to be parsed.
      parser: "astro-eslint-parser",
      // Parse the script in `.astro` as TypeScript by adding the following configuration.
      // It's the setting you need when using TypeScript.
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {
        // override/add rules settings here, such as:
        // "astro/no-set-html-directive": "error"
      },
    },
    // ...
  ],

  ignorePatterns: [
    "node_modules/",
    "build/",
    "public/",
  ],
}
