/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Single Geometric Sans-Serif: Outfit only (no serif) ──────────────────
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'], // Allowed for code/telemetry
      },

      // ── Palette System (CSS Variables for Light & Dark) ────────────────────
      colors: {
        paper: 'var(--color-paper)',
        ink: 'var(--color-ink)',
        surface: 'var(--color-surface)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        'accent-yellow': 'var(--color-accent-yellow)',
        'accent-pink': 'var(--color-accent-pink)',
        'severity-red': 'var(--color-severity-red)',
        'severity-yellow': 'var(--color-severity-yellow)',
        'severity-green': 'var(--color-severity-green)',

        // ── Fresh Vibrant Neo-Brutalist Block Colors ────────────────────────
        neo: {
          yellow: '#FFE600',
          pink: '#FF6EA7',
          mint: '#2CEAA3',
          purple: '#A368FC',
          coral: '#FF5E5B',
          blue: '#2F4BFF',
          cream: '#FFFBF0',
          dark: '#111111',
          lime: '#CCFF00',
        },
        obsidian: {
          DEFAULT: 'var(--color-paper)',
          950: 'var(--color-paper)',
          900: 'var(--color-paper)',
          850: 'var(--color-surface)',
          800: 'var(--color-surface)',
          750: 'var(--color-surface)',
          700: 'var(--color-surface)',
          600: 'var(--color-surface)',
        },
        glacial: {
          DEFAULT: 'var(--color-primary)',
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
          surface: 'var(--color-surface)',
          card: 'var(--color-surface)',
          border: 'var(--color-ink)',
          'border-bold': 'var(--color-ink)',
          muted: 'var(--color-text-muted)',
          text: 'var(--color-ink)',
          tertiary: 'var(--color-text-muted)',
        },
        status: {
          critical: 'var(--color-severity-red)',
          'critical-bg': 'var(--color-severity-red-bg)',
          'critical-border': 'var(--color-ink)',
          warning: 'var(--color-severity-yellow)',
          'warning-bg': 'var(--color-severity-yellow-bg)',
          'warning-border': 'var(--color-ink)',
          success: 'var(--color-severity-green)',
          'success-bg': 'var(--color-severity-green-bg)',
          'success-border': 'var(--color-ink)',
        },
      },

      // ── Border Width & Radius (3px solid near-black, 6px / 0px radius) ─────
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        DEFAULT: '6px',
        'neo': '6px',
        'sm': '4px',
        'md': '6px',
        'lg': '6px',
        'xl': '6px',
        '2xl': '8px',
      },

      // ── Fluid/Clamped Typography (Min @ 320px, Max @ 1440px) ────────────────
      fontSize: {
        'fluid-xs':   ['clamp(0.6875rem, 0.65rem + 0.19vw, 0.75rem)',   { lineHeight: '1.5' }],
        'fluid-sm':   ['clamp(0.8125rem, 0.77rem + 0.22vw, 0.875rem)',  { lineHeight: '1.55' }],
        'fluid-base': ['clamp(0.9375rem, 0.88rem + 0.29vw, 1rem)',      { lineHeight: '1.6' }],
        'fluid-lg':   ['clamp(1.0625rem, 0.98rem + 0.41vw, 1.125rem)',  { lineHeight: '1.55' }],
        'fluid-xl':   ['clamp(1.1875rem, 1.07rem + 0.59vw, 1.25rem)',   { lineHeight: '1.45' }],
        'fluid-2xl':  ['clamp(1.375rem,  1.17rem + 1.03vw, 1.5rem)',    { lineHeight: '1.35' }],
        'fluid-3xl':  ['clamp(1.75rem,   1.41rem + 1.69vw, 2rem)',      { lineHeight: '1.25' }],
        'fluid-4xl':  ['clamp(2rem,      1.47rem + 2.65vw, 2.5rem)',    { lineHeight: '1.15' }],
        'fluid-5xl':  ['clamp(2.25rem,   1.47rem + 3.9vw, 3rem)',       { lineHeight: '1.05' }],
        'fluid-6xl':  ['clamp(2.5rem,    1.5rem + 5vw,    3.75rem)',    { lineHeight: '1' }],
      },

      // ── Spacing & Layout (dvh & Safe-Area) ──────────────────────────────────
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      height: {
        screen: '100dvh',
      },
      minHeight: {
        screen: '100dvh',
      },
      maxHeight: {
        screen: '100dvh',
      },

      // ── Neo-Brutalist Hard Offset Shadows (NO BLUR, solid ink) ─────────────
      boxShadow: {
        'neo':          '4px 4px 0px 0px var(--color-ink)',
        'neo-sm':       '2px 2px 0px 0px var(--color-ink)',
        'neo-lg':       '6px 6px 0px 0px var(--color-ink)',
        'neo-xl':       '8px 8px 0px 0px var(--color-ink)',
        'neo-primary':  '4px 4px 0px 0px var(--color-primary)',
        'neo-accent':   '4px 4px 0px 0px var(--color-accent-pink)',
        'neo-yellow':   '4px 4px 0px 0px var(--color-accent-yellow)',
        'neo-critical': '4px 4px 0px 0px var(--color-severity-red)',
        'neo-warning':  '4px 4px 0px 0px var(--color-severity-yellow)',
        'neo-success':  '4px 4px 0px 0px var(--color-severity-green)',
        'neo-white':    '4px 4px 0px 0px #FFFFFF',
        'glass':        '4px 4px 0px 0px var(--color-ink)',
        'glass-glow':   '4px 4px 0px 0px var(--color-primary)',
        'ambient':      '4px 4px 0px 0px var(--color-ink)',
        'status-critical': '4px 4px 0px 0px var(--color-severity-red)',
        'status-warning':  '4px 4px 0px 0px var(--color-severity-yellow)',
        'status-success':  '4px 4px 0px 0px var(--color-severity-green)',
      },

      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
