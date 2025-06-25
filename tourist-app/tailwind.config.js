// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VAI Studio Brand Colors - matching operator dashboard
        'vai': {
          'deep-ocean': '#0f172a',      // slate-900
          'lagoon': '#1e293b',          // slate-800  
          'coral': '#3b82f6',           // blue-500
          'sunset': '#f97316',          // orange-500
          'teal': '#14b8a6',            // teal-500
          'pearl': '#f8fafc',           // slate-50
          'vanilla': '#fef3c7',         // amber-100
          'hibiscus': '#ec4899',        // pink-500
          'bamboo': '#22c55e',          // green-500
        },
        // Polynesian-inspired gradients
        'polynesian': {
          'ocean-start': '#0f172a',
          'ocean-end': '#1e293b',
          'lagoon-start': '#1e293b', 
          'lagoon-end': '#334155',
          'coral-start': '#3b82f6',
          'coral-end': '#8b5cf6',
        }
      },
      backgroundImage: {
        'vai-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'vai-coral': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'vai-sunset': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
        'vai-ocean': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vai-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'vai-card': '0 10px 25px rgba(15, 23, 42, 0.5)',
        'vai-float': '0 20px 40px rgba(15, 23, 42, 0.6)',
      },
      backdropBlur: {
        'vai': '12px',
      },
      animation: {
        'vai-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'vai-bounce': 'bounce 1s infinite',
        'vai-float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}