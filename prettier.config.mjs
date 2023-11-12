/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: true,
  tabWidth: 2,
  printWidth: 150,
  singleQuote: true,
  trailingComma: "es5"
};

export default config;
