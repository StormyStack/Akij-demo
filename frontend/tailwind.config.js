/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#f0f6ff',
          100: '#e0edff',
          500: '#0078d4',
          600: '#0062ab',
          700: '#004e8a',
        },
        oracle: {
          50: '#fff5f5',
          500: '#f80000',
          600: '#c70000',
        },
        redis: {
          50: '#fef2f2',
          500: '#dc2626',
          600: '#b91c1c',
        }
      }
    },
  },
  plugins: [],
}
