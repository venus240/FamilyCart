/** @type {import('tailwindcss').Config} */
module.exports = {
  // เพิ่ม ./app เข้าไปเพื่อให้ Tailwind สแกนไฟล์ในโฟลเดอร์ app ด้วย
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#ff8e9d',
            DEFAULT: '#ff8e9d', // Sweet Pink
            600: '#e11d48',
          },
          brown: {
            50: '#fdf8f6',
            100: '#f2e8e5',
            200: '#eaddd7',
            300: '#d1bebc',
            400: '#a38d89',
            DEFAULT: '#5d4037', // Coffee Brown
            600: '#4e342e',
            700: '#3e2723',
            800: '#2d1d19',
            900: '#1c1210',
          },
          cream: '#fffaf0',
        }
      }
    },
  },
  plugins: [],
}
