/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3f7',
          100: '#ebe7ef',
          200: '#d7cfe0',
          300: '#c3b7d0',
          400: '#9d8daf',
          500: '#766689',
          600: '#6b5c7b',
          700: '#594d67',
          800: '#473d52',
          900: '#392f43',
          950: '#251e2c',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#111827',
        },
      },
    },
  },
  plugins: [],
};

