/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode support
    theme: {
      extend: {
        colors:{
          surface:{
            light: '#7f9fbf77',
            dark: '#0d1520ff',
          },

        },
      },
    },
    plugins: [],
  }