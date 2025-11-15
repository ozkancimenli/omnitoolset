/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        secondary: '#8b5cf6',
        bg: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#cbd5e1',
        },
      },
    },
  },
  plugins: [],
}
