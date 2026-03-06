import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        trust: {
          50: '#eefbff',
          100: '#d7f4ff',
          200: '#b4ebff',
          300: '#7adfff',
          400: '#34ccff',
          500: '#0ab6f0',
          600: '#0093cb',
          700: '#0175a4',
          800: '#056086',
          900: '#0a506e'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 12, 27, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
