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
          950: '#000000',
          900: '#050707',
          850: '#0B1113',
          800: '#10191D',
          750: '#162329',
          700: '#1C2C34',
          600: '#253A45',
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
        slate: {
          surface: '#10191D',
          card: '#162329',
          border: '#2C414B',
          'border-bold': '#A0C0D0',
          muted: '#A6B4BA',
          text: '#EDF4F6',
          tertiary: '#72838A',
        },
        status: {
          critical: '#E36F70',
          'critical-bg': '#2E1516',
          'critical-border': '#E36F70',
          warning: '#D9AE68',
          'warning-bg': '#2E2211',
          'warning-border': '#D9AE68',
          success: '#82B9A0',
          'success-bg': '#14271F',
          'success-border': '#82B9A0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        // Neo-Brutalist Hard Offset Shadows (NO BLUR)
        'neo': '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-accent': '4px 4px 0px 0px #A0C0D0',
        'neo-accent-sm': '2px 2px 0px 0px #A0C0D0',
        'neo-critical': '4px 4px 0px 0px #E36F70',
        'neo-warning': '4px 4px 0px 0px #D9AE68',
        'neo-success': '4px 4px 0px 0px #82B9A0',
        'neo-white': '4px 4px 0px 0px #EDF4F6',
        'glass': '4px 4px 0px 0px #000000',
        'glass-glow': '4px 4px 0px 0px #A0C0D0',
        'ambient': '6px 6px 0px 0px #000000',
        'status-critical': '4px 4px 0px 0px #E36F70',
        'status-warning': '4px 4px 0px 0px #D9AE68',
        'status-success': '4px 4px 0px 0px #82B9A0',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}

