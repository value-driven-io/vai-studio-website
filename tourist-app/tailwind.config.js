// tailwind.config.js - Complete Mobile-Optimized Configuration
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // VAI Studio Brand Colors - matching operator dashboard
      colors: {
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
      
      // Background gradients
      backgroundImage: {
        'vai-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'vai-coral': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'vai-sunset': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
        'vai-ocean': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      
      // Typography
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Enhanced shadows
      boxShadow: {
        'vai-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'vai-card': '0 10px 25px rgba(15, 23, 42, 0.5)',
        'vai-float': '0 20px 40px rgba(15, 23, 42, 0.6)',
      },
      
      // Backdrop blur
      backdropBlur: {
        'vai': '12px',
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
      
      // Custom keyframes
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
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
      },
      
      // ==================== MOBILE OPTIMIZATIONS ====================
      
      // Safe area support for modern mobile devices
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-x': 'env(safe-area-inset-left) env(safe-area-inset-right)',
        'safe-y': 'env(safe-area-inset-top) env(safe-area-inset-bottom)',
      },
      
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Touch-friendly minimum dimensions
      minHeight: {
        '44': '44px',   // Apple's minimum touch target
        '48': '48px',   // Android's minimum touch target
        '56': '56px',   // Material Design FAB minimum
        'screen-mobile': '100vh', // Full viewport height
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      
      minWidth: {
        '44': '44px',   // Apple's minimum touch target
        '48': '48px',   // Android's minimum touch target
        '0': '0',
        'xs': '320px',  // Minimum mobile width
      },
      
      maxWidth: {
        'xs': '320px',
        'mobile': '414px',  // iPhone Plus width
        'tablet': '768px',
        'desktop': '1024px',
      },
      
      // Enhanced spacing for mobile
      spacing: {
        '18': '4.5rem',    // 72px - mobile section spacing
        '22': '5.5rem',    // 88px - large mobile spacing
        '30': '7.5rem',    // 120px - extra large spacing
        'safe': 'env(safe-area-inset-bottom)',
      },
      
      // Mobile-specific breakpoints
      screens: {
        'xs': '375px',     // iPhone SE / small mobile
        'mobile': '414px', // iPhone Plus / large mobile
        'sm': '640px',     // Small tablet
        'md': '768px',     // Tablet
        'lg': '1024px',    // Desktop
        'xl': '1280px',    // Large desktop
        '2xl': '1536px',   // Extra large desktop
        
        // Orientation-based breakpoints
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        
        // Height-based breakpoints for mobile
        'tall': { 'raw': '(min-height: 640px)' },
        'short': { 'raw': '(max-height: 640px)' },
        'x-short': { 'raw': '(max-height: 500px)' },
        
        // Hover capability detection
        'hover': { 'raw': '(hover: hover)' },
        'no-hover': { 'raw': '(hover: none)' },
        
        // High DPI screens
        'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2)' },
      },
      
      // Enhanced z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
        'system': '1090',
      },
      
      // Improved border radius for mobile
      borderRadius: {
        'mobile': '0.5rem',      // 8px - standard mobile radius
        'mobile-lg': '0.75rem',  // 12px - large mobile radius
        'mobile-xl': '1rem',     // 16px - extra large mobile radius
      },
      
      // Enhanced font sizes for mobile readability
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],    // 16px - minimum for iOS
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      
      // Touch-friendly line heights
      lineHeight: {
        'mobile-tight': '1.25',
        'mobile-normal': '1.5',
        'mobile-relaxed': '1.75',
      },
      
      // Mobile-optimized transitions
      transitionProperty: {
        'touch': 'transform, box-shadow, background-color',
        'modal': 'opacity, transform',
        'drawer': 'transform',
      },
      
      transitionTimingFunction: {
        'mobile': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-mobile': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Enhanced backdrop blur for mobile performance
      backdropBlur: {
        'mobile': '8px',
        'mobile-lg': '12px',
        'vai': '12px',
      },
      
      // Mobile-optimized drop shadows
      dropShadow: {
        'mobile': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'mobile-xl': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'mobile-2xl': '0 25px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  
  // Global plugins and utilities
  plugins: [
    // Add any plugins you need here
    // Example: require('@tailwindcss/forms'),
  ],
  
  // Mobile-first approach (this is default but explicitly set)
  important: false,
  
  // Ensure proper CSS variable generation
  darkMode: 'class',
  
  // Performance optimizations
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}