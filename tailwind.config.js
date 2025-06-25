/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scheme
        sakura: '#DFB1B6',
        'astral-ink': '#101E42',
        'cold-current': '#234272',
        'spooled-white': '#F5EAE3',
        'pink-ballad': '#A6427C',
        
        // Extended palette for UI elements
        primary: {
          50: '#FDF8F9',
          100: '#FAF1F3',
          200: '#F5E3E6',
          300: '#EFC5CC',
          400: '#E89FA9',
          500: '#DFB1B6', // sakura
          600: '#D68A94',
          700: '#C66673',
          800: '#A94D5A',
          900: '#8B3A46',
        },
        secondary: {
          50: '#E9EBF0',
          100: '#C7CCDB',
          200: '#9FA8C1',
          300: '#7784A7',
          400: '#516690',
          500: '#234272', // cold-current
          600: '#1D3660',
          700: '#172A4E',
          800: '#101E42', // astral-ink
          900: '#0A1328',
        },
        accent: {
          50: '#FAE8F2',
          100: '#F3C5DE',
          200: '#E99DC6',
          300: '#DD74AD',
          400: '#C94F93',
          500: '#A6427C', // pink-ballad
          600: '#923A6E',
          700: '#7D315F',
          800: '#682850',
          900: '#541F40',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'sakura': '0 4px 20px -2px rgba(223, 177, 182, 0.25)',
        'astral': '0 4px 20px -2px rgba(16, 30, 66, 0.25)',
      },
    },
  },
  plugins: [],
}