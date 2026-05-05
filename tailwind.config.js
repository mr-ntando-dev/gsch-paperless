/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f7',
          100: '#b3e8e8',
          200: '#80d9d9',
          300: '#4dcaca',
          400: '#26bfbf',
          500: '#009999',
          600: '#008080',
          700: '#006666',
          800: '#004d4d',
          900: '#003333',
        },
        accent: {
          50: '#fde8e8',
          100: '#f9b8b8',
          200: '#f58888',
          300: '#f15858',
          400: '#ee3636',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#661414',
        }
      }
    },
  },
  plugins: [],
}
