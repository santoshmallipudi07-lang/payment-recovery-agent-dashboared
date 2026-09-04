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
        charcoal: {
          950: '#070809',
          900: '#0b0c0e',
          850: '#101114',
          800: '#15171b',
          750: '#1a1c22',
          700: '#22252c',
        },
        offwhite: {
          50: '#ffffff',
          100: '#fbf9f5',
          200: '#f5f2ea',
          300: '#e5e1d6',
          400: '#c5c0b4',
          500: '#9e9b93',
          600: '#6f6c64',
        },
        gold: {
          300: '#ebd18e',
          400: '#e0ba66',
          500: '#d4a349',
          600: '#b88632',
          700: '#916622',
          900: '#3e2908',
        },
        fintech: {
          green: '#34d399',
          'green-dim': '#0d281a',
          'green-border': 'rgba(52, 211, 153, 0.22)',
          red: '#f87171',
          'red-dim': '#2a1417',
          'red-border': 'rgba(248, 113, 113, 0.22)',
          blue: '#60a5fa',
          'blue-dim': '#102238',
          'blue-border': 'rgba(96, 165, 250, 0.22)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 163, 73, 0.12)',
        'gold-glow-lg': '0 0 35px -5px rgba(212, 163, 73, 0.22)',
        'subtle-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
