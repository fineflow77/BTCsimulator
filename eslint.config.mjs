export default [
  {
    ignores: ["node_modules/**/*"], // 無視するディレクトリ
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // `any` 型を許容
      "@typescript-eslint/no-unused-vars": [
        "warn", // 未使用変数を警告に変更
        { "argsIgnorePattern": "^_" } // "_"で始まる変数を無視
      ]
    },
  },
];