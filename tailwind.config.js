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
        dark: {
          bg: '#080c14',
          surface: '#0f172a',
          surfaceHover: '#142038',
          card: '#111c30',
          border: 'rgba(255, 255, 255, 0.08)',
          borderSubtle: '#1e293b',
          muted: '#64748b',
          subtext: '#94a3b8',
          text: '#f8fafc',
        },
        cyan: {
          glow: '#00d2ff',
          accent: '#38bdf8',
          dark: '#0284c7',
        },
        brand: {
          primary: '#0ea5e9',
          secondary: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(0, 210, 255, 0.25)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
