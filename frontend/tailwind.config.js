/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        surface: '#111827',
        panel: '#1A2333',
        teal: {
          DEFAULT: '#14B8A6',
          light: '#5EEAD4',
        },
        indigoAccent: {
          DEFAULT: '#6366F1',
          light: '#A5B4FC',
        },
        coral: {
          DEFAULT: '#FB7185',
          dark: '#E11D48',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #14B8A6 0%, #6366F1 60%, #FB7185 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(99,102,241,0.15) 60%, rgba(251,113,133,0.15) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
