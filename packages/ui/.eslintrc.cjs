module.exports = {
  root: true,

  extends: [
    "kodmq",
    "plugin:react/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@next/next/recommended",
  ],

  rules: {
    "react/jsx-indent": [
      "error",
      2
    ],
    "react/jsx-tag-spacing": [
      "error",
      {
        "closingSlash": "never",
        "beforeSelfClosing": "always",
        "afterOpening": "never",
        "beforeClosing": "never"
      }
    ],
    "react/jsx-closing-bracket-location": [
      "error",
      "tag-aligned"
    ],
    "react/jsx-curly-newline": "error",
    "react/jsx-curly-spacing": [
      "error",
      {
        "when": "never",
        "children": true
      }
    ],
    "react/jsx-equals-spacing": [
      "error",
      "never"
    ],
    "react/jsx-first-prop-new-line": [
      "error",
      "multiline"
    ],
    "react/jsx-fragments": [
      "error",
      "syntax"
    ],
    "react/jsx-max-props-per-line": [
      "error",
      {
        "maximum": 1,
      }
    ],
    "react/jsx-no-constructed-context-values": "error",
    "react/jsx-no-useless-fragment": "error",
    "react/jsx-handler-names": "error",
    "react/jsx-pascal-case": "error",
    "react/jsx-wrap-multilines": [
      "error",
      {
        "declaration": "parens-new-line",
        "assignment": "parens-new-line",
        "return": "parens-new-line",
        "arrow": "parens-new-line",
        "condition": "parens-new-line",
        "logical": "parens-new-line",
        "prop": "parens-new-line"
      }
    ],
    "react/no-access-state-in-setstate": "error",
    "react/no-unstable-nested-components": "error",
    "react/self-closing-comp": "error",
    "tailwindcss/no-custom-classname": ["error", {
      "callees": ["classnames", "clsx", "cn", "ctl", "cva", "tv", "twMerge"],
    }],
  },

  settings: {
    react: {
      version: "detect",
    }
  },

  ignorePatterns: [
    ".next/",
    "node_modules/",
    "build/",
    "public/",
  ],

  globals: {
    "React": true,
    "JSX": true,
  },
}
