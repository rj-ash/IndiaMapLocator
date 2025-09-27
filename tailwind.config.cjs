module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      screens: {
        '2xs': {'max': '380px'}
      },
      colors: {
        success: '#16a34a',
        warn: '#f59e0b',
        error: '#dc2626'
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
};
