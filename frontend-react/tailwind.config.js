/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Primary Blues - Trust & Stability
        primary: {
          dark: '#0A2540',
          DEFAULT: '#1E3A5F',
          light: '#2E5A8F',
          lighter: '#4A7AB7',
        },
        // Success Greens - Growth & Success
        success: {
          dark: '#0B5345',
          DEFAULT: '#27AE60',
          light: '#45C77D',
        },
        // Professional Grays
        gray: {
          darker: '#1A1D23',
          dark: '#252932',
          medium: '#353A46',
          light: '#4A5160',
          lighter: '#6C7589',
        },
        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: '#B8BFCC',
          muted: '#8A92A5',
          accent: '#00D4FF',
        },
        // Semantic Colors
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
        // Additional Tailwind-style naming
        border: '#353A46',
        input: '#353A46',
        ring: '#2E5A8F',
        background: '#1A1D23',
        foreground: '#FFFFFF',
        card: {
          DEFAULT: '#252932',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#252932',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#353A46',
          foreground: '#B8BFCC',
        },
        accent: {
          DEFAULT: '#2E5A8F',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#E74C3C',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '1': '0.5rem',
        '2': '1rem',
        '3': '1.5rem',
        '4': '2rem',
        '5': '2.5rem',
        '6': '3rem',
        '8': '4rem',
        '10': '5rem',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.4)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 20px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.6)',
        glow: '0 0 20px rgba(30, 58, 95, 0.5)',
        'glow-success': '0 0 20px rgba(39, 174, 96, 0.4)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-out': 'fade-out 0.3s ease-in-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
    },
  },
  plugins: [require('tw-animate-css')],
}
