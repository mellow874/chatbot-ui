import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        mono:    ['Geist Mono', 'JetBrains Mono', 'monospace'],
        // NO body font — system-ui intentionally
      },
      colors: {
        void: {
          DEFAULT: '#030305',
          1: '#0a0a12',
          2: '#0f0f1a',
          3: '#141420',
          4: '#1c1c2a',
          5: '#24242e',
        },
        bone: {
          DEFAULT: '#e8e6df',
          dim:     '#a09e98',
          muted:   '#5a5855',
          ghost:   '#2e2c2a',
        },
        violet: {
          DEFAULT: '#5c4eff',
          dim:     'rgba(92,78,255,0.10)',
          glow:    'rgba(92,78,255,0.05)',
          border:  'rgba(92,78,255,0.20)',
          active:  'rgba(92,78,255,0.40)',
          text:    '#8b7fff',
          bright:  '#a096ff',
        },
        signal: '#39ff14',
        danger: '#ff3b3b',
      },
      animation: {
        'enter-up':     'enterUp 280ms cubic-bezier(0.15,0,0,1) both',
        'enter-fade':   'enterFade 400ms ease both',
        'cursor-blink': 'cursorBlink 900ms step-end infinite',
        'live-ring':    'liveRing 2.4s ease-out infinite',
        'shake':        'shake 450ms ease',
      },
      keyframes: {
        enterUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        enterFade: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        cursorBlink: { '50%': { opacity: '0' } },
        liveRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(57,255,20,0.4)' },
          '100%': { boxShadow: '0 0 0 6px rgba(57,255,20,0)' },
        },
        shake: {
          '0%,100%':      { transform: 'translateX(0)' },
          '15%,45%,75%':  { transform: 'translateX(-4px)' },
          '30%,60%,90%':  { transform: 'translateX(4px)' },
        },
      },
      maxWidth: {
        content: '680px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
