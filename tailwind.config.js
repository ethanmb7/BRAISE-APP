/** @type {import('tailwindcss').Config} */
export default {
  // Class-based, not the 'media' default — this app toggles dark mode itself
  // (state.darkMode → a `.dark` class on .app-shell, see App.tsx), it's not driven by OS
  // preference. Any `dark:` variant needs this to actually sync with the app's own toggle.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sapie: {
          blue: '#3B82F6',
          'blue-2': '#1E48C4',
          'blue-ink': '#13214f',
          'blue-pale': '#EAF1FF',
          paper: '#FFFFFF',
          bg: '#F8FAFC',
          orange: '#F97316',
          'orange-ink': '#7c2d12',
          sun: '#FFC24B',
          'sun-ink': '#5c3a00',
          amber: '#F59E0B',
          coral: '#FF6F59',
          'coral-2': '#C23F2E',
          mint: '#10B981',
          'mint-text': '#0d7a5f',
          violet: '#8B5CF6',
          ink: '#16213A',
          // The actual neobrutalist tokens used everywhere else in the app (see :root in
          // index.css) — the plain names above predate that system and don't match it
          // (e.g. sapie.orange #F97316 vs. the real signature --neo-orange #FF4500), so a
          // component built with them would render a visibly different orange from every
          // other screen. Added rather than overwritten, since nothing currently reads the
          // old keys and this keeps the diff honest about which value is which.
          'neo-orange': '#FF4500',
          'neo-ink': '#151821',
          'neo-blue': '#1E3A8A',
          'neo-paper': '#FAF8F3',
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
