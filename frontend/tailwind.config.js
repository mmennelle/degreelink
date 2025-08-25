/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode support
    theme: {
      extend: {
       // colors:{
         // surface:{
           // light: '#e6e7e6fb',
            //dark: '#0d1520ff',
          //},
        //},
        backgroundImage:{
          "surface-light": 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to))',
          "surface-dark": 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-via, transparent), var(--tw-gradient-to))',
        },
      },
    },
    plugins: [],
  }

  