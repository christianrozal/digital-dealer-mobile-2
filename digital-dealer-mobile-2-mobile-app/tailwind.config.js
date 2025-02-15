/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        color1: "#3D12FA",
        color2: "#6B6B6B",
        color3: "#F4F8FC",
      },
    },
  },
  plugins: [],
}