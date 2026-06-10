import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#004E89',
        accent: '#F77F00',
        success: '#06A77D',
        warning: '#FFC300',
        danger: '#E63946',
        light: '#F8F9FA',
        dark: '#1A1A1A',
        cream: '#FFF8EE',
        'card-orange': '#FFE8DC',
        'card-blue': '#E0F4FF',
        'card-yellow': '#FFF4CC',
        'card-green': '#E6F7EF',
      },
      boxShadow: {
        'arcade-sm': '3px 3px 0 #1A1A1A',
        arcade: '4px 4px 0 #1A1A1A',
        'arcade-lg': '6px 6px 0 #1A1A1A',
      },
      backgroundImage: {
        gradient: 'linear-gradient(135deg, #FF6B35 0%, #004E89 100%)',
      },
    },
  },
  plugins: [],
}

export default config
