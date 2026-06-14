/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1877f2',
          dark: '#166fe5',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      }
    },
  },
  plugins: [],
}
