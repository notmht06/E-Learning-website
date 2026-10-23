/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        book: {
          bg: '#FAF8F5',          // Warm editorial paper / alabaster
          card: '#FFFFFF',
          border: '#E7E4DC',      // Soft stone border
          darkBorder: '#23252A',  // Crisp 1px obsidian border
          accent: '#8A532B',      // Refined traditional leather / umber
          accentHover: '#724320',
          accentDark: '#C58B43',  // Ancient bronze / copper for dark mode
          accentDarkHover: '#B27833',
          accentLight: '#F5EFE6',
          leather: '#24201C',
          text: '#18181B',        // Deep ink black
          subtext: '#52525B',     // Muted reading tone
          darkBg: '#0C0D0E',      // Deep pure obsidian
          darkCard: '#141518',    // Elevated dark surface
          darkText: '#F4F4F6',    // Matte chalk white
          darkSubtext: '#9CA3AF', // Balanced muted dark text
        }
      },
      fontFamily: {
        sans: ['Dana', 'var(--font-vazirmatn)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        vazir: ['var(--font-vazirmatn)', 'Dana', 'sans-serif'],
        lalezar: ['var(--font-lalezar)', 'serif'],
        serif: ['Dana', 'serif'],
        mono: ['Dana', 'monospace'],
        bookTitle: ['Dana', 'serif'],
        quote: ['Dana', 'serif'],
        enTitle: ['Dana', 'serif'],
      },
      boxShadow: {
        'book-3d': '-10px 14px 30px -4px rgba(28, 27, 26, 0.25), -2px 4px 10px -2px rgba(28, 27, 26, 0.12)',
        'book-hover': '-16px 22px 42px -4px rgba(28, 27, 26, 0.35), -4px 6px 14px -2px rgba(28, 27, 26, 0.18)',
        'soft': '0 8px 30px -4px rgba(0, 0, 0, 0.04), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'pill': '0 8px 24px -2px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
};
