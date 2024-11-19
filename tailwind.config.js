/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts}'],
  theme: {
    extend: {
      accentColor: {
        DEFAULT: '#000000',
      },
    },
  },
  plugins: [
    ({ addBase }) => {
      addBase({
        '[hidden]': { display: 'none !important' },
      });
    },
  ],
};
