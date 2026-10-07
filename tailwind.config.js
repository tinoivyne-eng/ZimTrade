/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf3",
          100: "#d1fadf",
          500: "#12b76a",
          600: "#079455",
          700: "#067647",
          800: "#085d3a",
          900: "#074d31",
        },
        accent: { 400: "#fdc500", 500: "#f5b800" },
      },
    },
  },
  plugins: [],
};