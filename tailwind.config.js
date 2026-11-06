/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './{App,index}.tsx', './{components,contexts,features,hooks,utils,views}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          deep: 'var(--green-deep)',
          dark: 'var(--green-dark)',
          mid: 'var(--green-mid)',
          light: 'var(--green-light)',
          pale: 'var(--green-pale)',
        },
        cream: {
          DEFAULT: 'var(--cream)',
          warm: 'var(--cream-warm)',
          dark: 'var(--cream-dark)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          light: 'var(--amber-light)',
        },
        text: {
          dim: 'var(--text-dim)',
          mid: 'var(--text-mid)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
        syne: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
