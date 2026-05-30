import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0C10',
          secondary: '#111318',
          card: '#161A22',
          hover: '#1C2029',
        },
        accent: {
          blue: '#1A56DB',
          'blue-light': '#3B82F6',
          gold: '#F59E0B',
          'gold-light': '#FCD34D',
        },
        status: {
          completed: '#22C55E',
          ongoing: '#3B82F6',
          suspended: '#F59E0B',
          terminated: '#EF4444',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
      },
    },
  },
  plugins: [],
};
export default config;
