// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#F97316', // Orange
        secondary: {
          light: '#F3F4F6', // Light Gray
          dark: '#1F2937', // Dark Gray
        },
        accent: '#EA580C', // Dark Orange
        white: '#FFFFFF',
        black: '#000000',
        lightGray: '#D1D5DB', // Dark mode Light Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;