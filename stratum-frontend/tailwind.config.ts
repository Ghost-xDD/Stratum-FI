import type { Config } from 'tailwindcss';

const config: Config = {
  //   darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f5f6f7',
          100: '#e7e9ed',
          200: '#d1d4dd',
          300: '#b9bec9',
          400: '#9fa4b0',
          500: '#848998',
          600: '#6a6f7f',
          700: '#525766',
          800: '#3a3f4d',
          900: '#252833',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        dark: {
          background: '#08090B',
          surface: '#111216',
          surfaceLight: '#1B1D23',
        },
        text: {
          primary: '#F2F3F5',
          secondary: '#C7CBD3',
          muted: '#8F94A1',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: [
          'clamp(2.75rem, 2vw + 2rem, 3.75rem)',
          { lineHeight: '1.05', fontWeight: '700' },
        ],
        h1: [
          'clamp(2rem, 1.4vw + 1.6rem, 2.75rem)',
          { lineHeight: '1.1', fontWeight: '700' },
        ],
        h2: [
          'clamp(1.6rem, 1vw + 1.3rem, 2.125rem)',
          { lineHeight: '1.2', fontWeight: '600' },
        ],
        h3: [
          'clamp(1.3rem, 0.8vw + 1.1rem, 1.75rem)',
          { lineHeight: '1.25', fontWeight: '600' },
        ],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        small: [
          '14px',
          { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0.01em' },
        ],
        tiny: [
          '12px',
          { lineHeight: '1.5', fontWeight: '500', letterSpacing: '0.02em' },
        ],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient':
          'linear-gradient(135deg, rgba(8, 10, 14, 0.9), rgba(20, 24, 32, 0.78))',
        'primary-gradient': 'linear-gradient(135deg, #A3E635 0%, #65A30D 100%)',
        'secondary-gradient':
          'linear-gradient(135deg, rgba(244, 244, 245, 0.18) 0%, rgba(244, 244, 245, 0.04) 100%)',
      },
      boxShadow: {
        glass: '0 18px 55px rgba(0, 0, 0, 0.35)',
        'glass-hover': '0 22px 65px rgba(163, 230, 53, 0.18)',
        glow: '0 0 24px rgba(163, 230, 53, 0.45)',
        'inner-glow': 'inset 0 0 20px rgba(163, 230, 53, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  //   plugins: [require('tailwindcss-animate')],
};

export default config;
