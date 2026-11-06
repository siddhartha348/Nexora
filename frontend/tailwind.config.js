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
        obsidian: {
          DEFAULT: '#050707',
          950: '#030505',
          900: '#050707',
          850: '#070C0E',
          800: '#0A1012',
          750: '#0D1518',
          700: '#10191D',
          600: '#18242A',
        },
        glacial: {
          DEFAULT: '#A0C0D0',
          50: '#F4F8FA',
          100: '#E6EFF4',
          200: '#CEE0EA',
          300: '#B6D1DF',
          400: '#A0C0D0',
          500: '#7FA8BD',
          600: '#5F8DA3',
          700: '#466C7E',
          800: '#314E5B',
          900: '#1F343E',
        },
        cyber: {
          cyan: '#56D4E8',
          neon: '#38BDF8',
          ice: '#A0C0D0',
          green: '#00F0A8',
          amber: '#F59E0B',
          crimson: '#FF4D4D',
          dark: '#030708',
          panel: '#070D0F',
          border: 'rgba(86, 212, 232, 0.2)',
          'border-bright': 'rgba(86, 212, 232, 0.5)',
        },
        slate: {
          surface: '#0A1012',
          card: '#10191D',
          border: 'rgba(160, 192, 208, 0.12)',
          'border-subtle': '#72838A',
          muted: '#A6B4BA',
          text: '#EDF4F6',
          tertiary: '#72838A',
        },
        status: {
          critical: '#E36F70',
          'critical-bg': 'rgba(227, 111, 112, 0.12)',
          'critical-border': 'rgba(227, 111, 112, 0.25)',
          warning: '#D9AE68',
          'warning-bg': 'rgba(217, 174, 104, 0.12)',
          'warning-border': 'rgba(217, 174, 104, 0.25)',
          success: '#82B9A0',
          'success-bg': 'rgba(130, 185, 160, 0.12)',
          'success-border': 'rgba(130, 185, 160, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px -5px rgba(160, 192, 208, 0.15)',
        'cyber-cyan': '0 0 20px -3px rgba(86, 212, 232, 0.35)',
        'cyber-neon': '0 0 25px -4px rgba(56, 189, 248, 0.4)',
        'cyber-panel': '0 0 35px -5px rgba(5, 7, 7, 0.9), inset 0 1px 0 rgba(160, 192, 208, 0.15)',
        'ambient': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        'status-critical': '0 0 20px -5px rgba(227, 111, 112, 0.3)',
        'status-warning': '0 0 20px -5px rgba(217, 174, 104, 0.3)',
        'status-success': '0 0 20px -5px rgba(130, 185, 160, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'cyber': '20px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        cyberRadar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        'radar-sweep': 'cyberRadar 10s linear infinite',
      }
    },
  },
  plugins: [],
}

