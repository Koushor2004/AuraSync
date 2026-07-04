/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          300: '#b8a9ff',
          500: '#7c5cff',
          600: '#6a45f5',
          700: '#5834d1',
          900: '#2c1a6b',
        },
        surface: {
          light: '#f7f7fb',
          dark: '#0f1117',
          darkCard: '#171a23',
        },
        aura: {
          happy: '#FFD93D',
          sad: '#4D96FF',
          angry: '#FF4D4D',
          neutral: '#E5E7EB',
          fear: '#9B5DE5',
          excited: '#FF8A00',
          relaxed: '#4CD97B',
          surprised: '#00C2A8',
          disgusted: '#8D6E63',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.06)' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3.2s ease-in-out infinite',
        rotateSlow: 'rotateSlow 12s linear infinite',
        fadeUp: 'fadeUp 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
