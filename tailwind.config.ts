import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E84C3D',
          50: '#fef2f1',
          100: '#fde0de',
          500: '#E84C3D',
          600: '#d43a2b',
          700: '#b52d20',
        },
      },
    },
  },
  plugins: [],
}
export default config
