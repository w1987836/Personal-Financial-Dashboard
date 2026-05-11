/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        primaryDark: "#1d4ed8",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        background: "#0f172a",
        card: "#111827"
      }
    }
  },
  plugins: []
};


