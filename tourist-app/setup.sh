#!/bin/bash
# VAI-Tickets Tourist App Setup Script

echo "🌴 Setting up VAI-Tickets Tourist App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional dependencies
npm install @supabase/supabase-js@latest lucide-react react-hot-toast framer-motion zustand react-router-dom date-fns

# Install dev dependencies
npm install -D @vitejs/plugin-react vite-plugin-pwa autoprefixer postcss tailwindcss

# Initialize Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p src/components/{ui,tours,booking,layout,user}
mkdir -p src/{services,hooks,utils,stores,styles}
mkdir -p public/icons

# Create basic index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="description" content="Discover and book last-minute tours in French Polynesia" />
    <title>VAI-Tickets - Discover French Polynesia</title>
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create global CSS
cat > src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-vai-gradient text-vai-pearl antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .vai-glassmorphism {
    @apply bg-vai-lagoon/50 backdrop-blur-vai border border-slate-700;
  }
  
  .vai-card {
    @apply bg-gradient-to-br from-vai-deep-ocean to-vai-lagoon rounded-2xl border border-slate-700 hover:border-slate-600 transition-all duration-300;
  }
  
  .vai-button-primary {
    @apply bg-vai-coral hover:shadow-vai-glow text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105;
  }
  
  .vai-input {
    @apply w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral transition-colors;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-slate-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-slate-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-500;
}

/* Loading animations */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  background: linear-gradient(90deg, #1e293b 0px, #334155 100px, #1e293b 200px);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}
EOF

# Create .env template
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=VAI-Tickets
VITE_WHATSAPP_SUPPORT=+68987269065
VITE_OPERATOR_DASHBOARD_URL=http://localhost:3000

# Optional: Analytics & Monitoring
VITE_GA_TRACKING_ID=
VITE_SENTRY_DSN=
EOF

# Create basic package.json scripts
echo "📝 Adding helpful scripts..."
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.deploy="npm run build && firebase deploy"

# Create deployment config
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
EOF

# Create README with setup instructions
cat > README.md << 'EOF'
# 🌴 VAI-Tickets Tourist App

Last-minute tour booking platform for French Polynesia, built with React + Vite + Supabase.

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd vai-tickets-tourist-app
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 Features

- **Real-time Tour Discovery**: Live availability from Supabase
- **Automated Booking Flow**: Integrated with n8n workflows  
- **WhatsApp Integration**: Direct operator communication
- **Progressive Web App**: Offline-capable mobile experience
- **Polynesian Design**: Culturally authentic UI/UX
- **Advanced Mobile Features**: GPS, notifications, camera integration

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Automation**: n8n workflows for booking management
- **State Management**: Zustand with persistence
- **Mobile**: PWA with offline capabilities
- **Styling**: Custom VAI Studio design system

## 🔧 Database Integration

The app connects to your existing Supabase schema:
- `active_tours_with_operators` → Tour discovery
- `bookings` → Booking creation (triggers n8n)
- `pending_bookings_for_workflow` → Automation processing
- `operator_booking_summary` → Real-time stats

## 📞 Support

WhatsApp: +68987269065
Email: contact@vai.studio
EOF

# Create PWA icons directory structure
mkdir -p public/icons
echo "🎨 Remember to add your PWA icons to public/icons/"
echo "Required sizes: 192x192, 512x512, apple-touch-icon"

# Final setup message
echo ""
echo "✅ VAI-Tickets Tourist App setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Copy .env.example to .env and add your Supabase credentials"
echo "2. Add your PWA icons to public/icons/"
echo "3. Run 'npm run dev' to start development"
echo "4. Test the booking flow with your existing operator dashboard"
echo ""
echo "🌴 Ready to conquer the French Polynesian market!"
echo ""
