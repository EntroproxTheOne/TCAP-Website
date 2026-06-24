/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#141218',
        'surface-variant': '#1a1a1a',
        'on-surface': '#e7e0e9',
        'on-surface-variant': '#cac4d0',
        'accent-red': '#FF0000',
        outline: '#948f9a',
        primary: '#FFFFFF',
      },
      fontFamily: {
        display: ['Bebas Neue', 'Anton', 'Impact', 'sans-serif'],
        bold: ['Anton', 'Impact', 'sans-serif'],
        condensed: ['Barlow Condensed', 'Arial Narrow', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Barlow Condensed', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-lg': ['72px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-sm': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '600' }],
        'mono-technical': ['14px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      maxWidth: {
        container: '1440px',
      },
      spacing: {
        'margin-desktop': '64px',
        'margin-mobile': '20px',
        'stack-sm': '24px',
        'stack-md': '48px',
        'stack-lg': '80px',
        gutter: '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
