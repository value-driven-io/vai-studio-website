/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // VAI Studio Brand Colors (matching operator dashboard)
      colors: {
        'vai': {
          // Primary palette
          'deep-ocean': '#0f172a',      // slate-900 - Primary background
          'lagoon': '#1e293b',          // slate-800 - Card backgrounds
          'coral': '#3b82f6',           // blue-500 - Primary accent
          'sunset': '#f97316',          // orange-500 - Secondary accent
          'teal': '#14b8a6',            // teal-500 - Success states
          'pearl': '#f8fafc',           // slate-50 - Text primary
          'vanilla': '#fef3c7',         // amber-100 - Highlights
          'hibiscus': '#ec4899',        // pink-500 - Progress indicators
          'bamboo': '#22c55e',          // green-500 - Completed states
          
          // Extended palette for portal
          'ocean-light': '#334155',     // slate-700 - Lighter backgrounds
          'coral-light': '#60a5fa',     // blue-400 - Light accent
          'sunset-light': '#fb923c',    // orange-400 - Light secondary
          'muted': '#94a3b8',           // slate-400 - Muted text
        }
      },
      
      // Background gradients
      backgroundImage: {
        'vai-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'vai-coral': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'vai-sunset': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
        'vai-ocean': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        'vai-card': 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
      },
      
      // Typography
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Enhanced shadows for depth
      boxShadow: {
        'vai-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'vai-card': '0 10px 25px rgba(15, 23, 42, 0.5)',
        'vai-float': '0 20px 40px rgba(15, 23, 42, 0.6)',
        'vai-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      
      // Backdrop blur for glassmorphism
      backdropBlur: {
        'vai': '12px',
      },
      
      // Custom border radius
      borderRadius: {
        'vai': '16px',
        'vai-lg': '20px',
        'vai-xl': '24px',
      },
      
      // Spacing for consistent layout
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Enhanced animations
      animation: {
        'vai-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'vai-bounce': 'bounce 1s infinite',
        'vai-float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      // Mobile-first breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}