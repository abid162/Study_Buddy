/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { DEFAULT: '#1E1B4F', deep: '#141238', soft: '#2D2A72', glow: '#3E3A9A' },
        ink: { DEFAULT: '#17153A', soft: '#4A4870', faint: '#8A88AD' },
        mist: { DEFAULT: '#EEF0FB', deep: '#DCE0F5' },
        paper: '#FFFFFF',
        sun: { DEFAULT: '#FFC93C', deep: '#E8A900', soft: '#FFF3CC' },
        coral: { DEFAULT: '#FF6B57', deep: '#D94530', soft: '#FFE4DF' },
        mint: { DEFAULT: '#22C58B', deep: '#0F8A5F', soft: '#D8F7EA' },
        grape: { DEFAULT: '#7C5CFF', deep: '#5B3BE0', soft: '#ECE6FF' },
        sea: { DEFAULT: '#3E8EF0', deep: '#2563C9', soft: '#BFE1FF' },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next Variable"', 'system-ui', 'sans-serif'],
        display: ['"Fredoka Variable"', '"Atkinson Hyperlegible Next Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(23,21,58,0.04), 0 10px 30px -12px rgba(23,21,58,0.25)',
        pop: '0 4px 0 rgba(23,21,58,0.18), 0 14px 28px -12px rgba(23,21,58,0.45)',
        glow: '0 0 0 6px rgba(255,201,60,0.25)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
