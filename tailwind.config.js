/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Change these three families to recolor the starter.
        brand: {
          DEFAULT: "#0f766e",
          dark: "#115e59",
        },
      },
    },
  },
  plugins: [],
};
