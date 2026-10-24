/** @type {import('tailwindcss').Config} */
export default {
  // `class` lets the header toggle dark mode. The inline script in index.html
  // adds `dark` on <html> before paint so the first screen does not flash.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // One accent. Neutrals are Tailwind zinc. Do not add a second brand color.
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
        },
      },
      borderRadius: {
        control: "6px",
        card: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(24 24 27 / 0.06)",
        pop: "0 12px 32px -16px rgb(24 24 27 / 0.28)",
      },
    },
  },
  plugins: [],
};
