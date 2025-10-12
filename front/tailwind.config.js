/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f3d2e",
          light: "#1f6f5b",
          dark: "#09261c"
        },
        accent: "#f5c16c"
      },
      fontFamily: {
        display: ["Tajawal", "sans-serif"],
        body: ["Noto Naskh Arabic", "serif"],
        sans: ["Tajawal", "sans-serif"],
        serif: ["Noto Naskh Arabic", "serif"]
      }
    }
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    rtl: true,
    themes: [
      {
        quranic: {
          primary: "#0f3d2e",
          secondary: "#1f6f5b",
          accent: "#f5c16c",
          neutral: "#1a1a1a",
          "base-100": "#0c1a16",
          info: "#3abff8",
          success: "#1abc9c",
          warning: "#f4c152",
          error: "#f87272"
        }
      }
    ]
  }
};
