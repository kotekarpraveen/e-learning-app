
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gray: {
          50: '#FCFAEE',
          100: '#F5F0E6',
          200: '#ECDFCC',
          300: '#D6CBB6',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        primary: {
          50: '#fbf8eb',
          100: '#f5edcf',
          200: '#ead9a0',
          300: '#dec070',
          400: '#d1a845',
          500: '#b38e20',
          600: '#967019',
          700: '#7a5615',
          800: '#634516',
          900: '#543b15',
        },
        secondary: {
          50: '#F6F8F4',
          100: '#EBF1E6',
          200: '#D4E0CC',
          300: '#BDCFA2',
          400: '#A5B68D',
          500: '#8A9E74',
          600: '#6E7E5A',
          700: '#556145',
          800: '#3F4A31',
          900: '#282F1E',
        }
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}
