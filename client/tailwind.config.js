/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Define custom colors or extend existing ones
        background: {
          light: '#ffffff',  // Light mode background
          DEFAULT: '#1a202c',  // Default to dark mode background
        },
        text: {
          light: '#1a202c',  // Light mode text
          DEFAULT: '#cbd5e1',  // Default to dark mode text
        }
      }
    },
  },
  plugins: [],
}