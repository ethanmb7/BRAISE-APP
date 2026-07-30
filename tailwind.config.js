/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sapie: {
          blue: '#2F5FE3',
          'blue-2': '#1E48C4',
          'blue-ink': '#13214f',
          'blue-pale': '#EAF1FF',
          paper: '#FFFFFF',
          sun: '#FFC24B',
          'sun-ink': '#5c3a00',
          coral: '#FF6F59',
          'coral-2': '#C23F2E',
          mint: '#2FBE9F',
          'mint-text': '#146E5A',
          violet: '#8B6BE0',
          ink: '#16213A',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
