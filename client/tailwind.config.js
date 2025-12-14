/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F0F14',
        secondary: '#1C1C22',
        'action-primary': '#3B82F6',
        'action-hover': '#6366F1',
        'text-main': '#F9FAFB',
        'text-muted': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'copilot-gradient': 'linear-gradient(to right, #3B82F6, #6366F1)',
      },
    },
  },
  plugins: [],
}
















