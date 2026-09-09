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
        'asva-bg': '#071018',
        'asva-card': '#0c1824',
        'asva-text': {
          primary: '#F7FAFC',
          secondary: '#AAB6C4',
          muted: '#718092',
        },
        'asva-status': {
          critical: '#FF453A',
          high: '#FF9F0A',
          moderate: '#FFD60A',
          success: '#30D158',
          info: '#0A84FF',
          voice: '#BF5AF2',
        },
        'crystal': {
          fill: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.16)',
          modal: 'rgba(255, 255, 255, 0.20)',
          border: 'rgba(255, 255, 255, 0.22)',
          highlight: 'rgba(255, 255, 255, 0.40)',
        }
      },
      borderRadius: {
        'card': '20px',
        'sheet': '30px',
        'btn': '17px',
      },
      backdropBlur: {
        'crystal': '24px',
        'strong': '32px',
      },
      animation: {
        'critical-glow': 'criticalPulse 2s ease-in-out infinite',
        'voice-pulse': 'voiceWave 1.8s ease-in-out infinite',
        'subtle-shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        criticalPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(255, 69, 58, 0.4), inset 0 0 12px rgba(255, 69, 58, 0.2)',
            borderColor: 'rgba(255, 69, 58, 0.8)'
          },
          '50%': { 
            boxShadow: '0 0 24px 6px rgba(255, 69, 58, 0.6), inset 0 0 20px rgba(255, 69, 58, 0.4)',
            borderColor: 'rgba(255, 69, 58, 1)'
          },
        },
        voiceWave: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(191, 90, 242, 0.5), 0 0 20px rgba(191, 90, 242, 0.3)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 35px 10px rgba(191, 90, 242, 0.7), 0 0 45px rgba(191, 90, 242, 0.5)',
            transform: 'scale(1.05)',
          }
        },
        shimmer: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
