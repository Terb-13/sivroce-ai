tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F3A5F',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#1F3A5F',
          950: '#102A43',
        },
        teal: {
          DEFAULT: '#0D9488',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(31, 58, 95, 0.08)',
        card: '0 8px 32px -8px rgba(31, 58, 95, 0.12)',
        nav: '0 1px 0 0 rgba(31, 58, 95, 0.06)',
      },
    },
  },
};
