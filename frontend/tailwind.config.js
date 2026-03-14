/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farm-green':       '#2d7a1f',
        'farm-green-dark':  '#1e5c14',
        'farm-green-light': '#4a9e38',
        'farm-yellow':      '#f5c518',
        'farm-yellow-dark': '#d4a800',
        'farm-bg':          '#f4f6f5',
        'farm-light':       '#edf7ea',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'float-in':  'floatIn 0.35s ease forwards',
        'pulse-slow':'pulse 2s ease-in-out infinite',
        'bounce-slow':'bounce 2s ease-in-out infinite',
        'fade-up':   'fadeUp 0.7s ease forwards',
      },
      keyframes: {
        floatIn: {
          from: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
          to:   { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'green': '0 4px 20px rgba(45,122,31,0.35)',
        'green-lg': '0 8px 32px rgba(45,122,31,0.45)',
        'yellow': '0 4px 16px rgba(245,197,24,0.35)',
      },
    },
  },
  plugins: [],
}
