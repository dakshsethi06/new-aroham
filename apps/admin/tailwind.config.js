/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#5B1F24",
          light: "#7A2A30",
          dark: "#3D1418"
        },
        gold: {
          DEFAULT: "#C8A044",
          light: "#E0B85C",
          dark: "#A68230"
        },
        saffron: {
          DEFAULT: "#E78B2F",
          light: "#F0A352"
        },
        ivory: {
          DEFAULT: "#FAF7F2",
          dark: "#F0EAE0"
        },
        charcoal: {
          DEFAULT: "#222222",
          light: "#333333"
        },
        destructive: {
          DEFAULT: "#d4183d",
          hover: "#b31332"
        }
      }
    }
  },
  plugins: []
};
