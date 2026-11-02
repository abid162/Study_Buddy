/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky: { DEFAULT: '#CFE3F6', deep: '#B4D2EF', soft: '#E6F1FB' },
        ink: { DEFAULT: '#14284B', soft: '#3D5478', faint: '#7F93B2' },
        paper: '#FFFFFF',
        brick: {
          red: '#D9312B',
          redDeep: '#B3221D',
          yellow: '#F6C21C',
          yellowSoft: '#FFF4CC',
          blue: '#1C5FCC',
          blueDeep: '#144AA3',
          green: '#2E9E4F',
          greenDeep: '#1F7A3B',
          greenSoft: '#DDF3E3',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next Variable"', 'system-ui', 'sans-serif'],
        display: ['"Lilita One"', '"Atkinson Hyperlegible Next Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 2px 0 rgba(20,40,75,0.08), 0 12px 28px -12px rgba(20,40,75,0.28)',
        lift: '0 3px 0 rgba(20,40,75,0.18), 0 10px 18px -10px rgba(20,40,75,0.35)',
      },
    },
  },
  plugins: [],
}
