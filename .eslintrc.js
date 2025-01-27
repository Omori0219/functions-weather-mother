module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-console": ["error", { allow: ["info", "error", "warn"] }],
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};
