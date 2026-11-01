/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7FAF8',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F1F5F2',
          muted: '#E8EFEA',
        },
        forest: {
          50: '#F0F7F3',
          100: '#DDEFE4',
          200: '#BDDFC9',
          300: '#91C8A5',
          400: '#5EAB7C',
          500: '#3D8F5C',
          600: '#2C7247',
          700: '#1E5A37',
          800: '#154429',
          900: '#0E301D',
          950: '#071C10',
        },
        waste: {
          organic: {
            bg: '#ECFDF5',
            text: '#065F46',
            border: '#A7F3D0',
            dot: '#10B981',
          },
          recyclable: {
            bg: '#EFF6FF',
            text: '#1E40AF',
            border: '#BFDBFE',
            dot: '#3B82F6',
          },
          hazardous: {
            bg: '#FEF2F2',
            text: '#991B1B',
            border: '#FECACA',
            dot: '#EF4444',
          },
          ewaste: {
            bg: '#FAF5FF',
            text: '#6B21A8',
            border: '#E9D5FF',
            dot: '#A855F7',
          },
          landfill: {
            bg: '#F8FAFC',
            text: '#334155',
            border: '#CBD5E1',
            dot: '#64748B',
          },
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.04), 0 1px 2px 0 rgba(16, 24, 40, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(14, 48, 29, 0.08), 0 8px 10px -6px rgba(14, 48, 29, 0.04)',
        'dropdown': '0 12px 30px -4px rgba(14, 48, 29, 0.12), 0 4px 6px -2px rgba(14, 48, 29, 0.04)',
        'modal': '0 25px 50px -12px rgba(14, 48, 29, 0.25)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
      },
    },
  },
  plugins: [],
}
