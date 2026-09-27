import next from "eslint-config-next";

// eslint-config-next 16 起原生导出 flat config（含 next / next/typescript 与默认 ignores）
const eslintConfig = [
  ...next,
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      ".tmp-icons/**",
      "public/**",
    ],
  },
];

export default eslintConfig;
