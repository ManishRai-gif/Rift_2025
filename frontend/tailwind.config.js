/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E10600',
        'primary/90': 'rgba(225, 6, 0, 0.9)',
        'primary/10': 'rgba(225, 6, 0, 0.1)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.08)',
        'glass-hover': '0 12px 40px rgba(225, 6, 0, 0.12)',
      },
      animation: {
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
