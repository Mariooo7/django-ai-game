/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- 核心是这行，扫描 src 内所有相关文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}