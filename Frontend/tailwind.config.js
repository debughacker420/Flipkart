/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flipblue: '#2874F0',
        flipyellow: '#F9A825',
        fliporange: '#FB641B',
        flipgreen: '#388E3C',
        flipbg: '#F1F3F6',
        flipsoftbg: '#F0F2F5',
        flipprimary: '#212121',
        flipsecondary: '#878787',
        flipborder: '#E0E0E0',
        flipmuted: '#717478',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
