/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kementan: {
          green: '#006633',
          light: '#e8f5e9',
          gold: '#FFCC00',
          dark: '#1B365D',
        }
      }
    },
  },
  plugins: [],
}
