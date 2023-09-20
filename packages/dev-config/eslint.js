module.exports = {
  "env": {
    "node": true,
    "jest/globals": true
  },

  "parser": "@typescript-eslint/parser",

  "plugins": [
    "jest",
    "import",
    "unused-imports",
    "@typescript-eslint"
  ],

  "extends": [
    "eslint:recommended",
    "plugin:promise/recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  "ignorePatterns": [
    ".next/",
    ".turbo/",
    "node_modules/",
    "dist/",
    "public/",
  ],

  "rules": {
    "quotes": [
      "error",
      "double"
    ],
    "indent": [
      "error",
      2
    ],
    "semi": [
      "error",
      "never"
    ],
    "comma-dangle": [
      "error",
      "always-multiline"
    ],
    "arrow-parens": [
      "error",
      "always"
    ],
    "space-before-function-paren": [
      "error",
      {
        "asyncArrow": "always",
        "anonymous": "never",
        "named": "never"
      }
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "@typescript-eslint/type-annotation-spacing": [
      "error",
      {
        "before": false,
        "after": true,
        "overrides": {
          "arrow": {
            "before": true,
            "after": true
          }
        }
      }
    ],
    "import/order": [
      "error",
      {
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        },
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "never"
      }
    ],
    "import/no-anonymous-default-export": [
      "error",
      {
        "allowObject": true,
        "allowArray": true
      }
    ],
    "import/extensions": [
      "error",
      "never"
    ],
    "unused-imports/no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_"
      }
    ],
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "promise/always-return": "off",
    "prefer-const": "off",
    "multiline-ternary": "off",
    "no-empty-function": "off",
    "no-unused-vars": "off",
    "no-console": "warn",
    "no-debugger": "warn"
  }
}
