/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#167D9A",
          dark: "#145477",
          light: "#EAF4F8"
        }
      }
    },
  },
  plugins: [],
};

