/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          DEFAULT: '#1a202c',
        },
        text: {
          light: '#1a202c',
          DEFAULT: '#cbd5e1',
        }
      }
    },
  },
  plugins: [],
}