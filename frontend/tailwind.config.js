/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F1226',
        ink2: '#171B3A',
        coral: '#FF6B5B',
        coralDeep: '#E8503F',
        brandGreen: '#4ADE9B',
        violet: '#7C7FF2',
        ivory: '#FDF6EC',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF6B5B 0%, #7C7FF2 60%, #4ADE9B 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(255,107,91,0.14) 0%, rgba(124,127,242,0.14) 60%, rgba(74,222,155,0.14) 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 18, 38, 0.45)',
      },
    },
  },
  plugins: [],
}
