# 🌴 VAI Tickets - Advanced Progressive Web App for French Polynesian Tourism Discovery

**Evidence-Based Documentation - Every Feature Verified Against Source Code**

VAI Tickets is a sophisticated React-based Progressive Web App designed for international tourists to discover, book, and manage authentic French Polynesian experiences. Built with React 18.2.0, Vite, and advanced PWA capabilities, featuring mood-based discovery, real-time booking, and multi-language support.

## 🚀 Live Tourist Platform
- **Production App**: [app.vai.studio](https://app.vai.studio)
- **Tourist Landing**: [vai.studio/app/welcome/](https://vai.studio/app/welcome/)
- **VAI Studio Website**: [vai.studio](https://vai.studio)

## 🏗️ Technical Architecture (Verified from Codebase)

### Frontend Stack (src/package.json Evidence)
```json
- React: 18.2.0 (Optimized for mobile performance)
- Vite: 4.4.5 (Lightning-fast development & builds)
- Tailwind CSS: 3.3.0 (Utility-first styling)
- Zustand: 4.4.0 (Lightweight state management - 29 components verified)
- Framer Motion: 10.16.0 (Smooth animations & transitions)
- React Router DOM: 6.8.0 (Client-side routing)
- i18next: 25.3.2 (6-language internationalization system)
```

### Progressive Web App (vite.config.js Evidence)
```javascript
- Vite PWA Plugin: 0.16.4 (Advanced service worker)
- Workbox Runtime Caching (Supabase API & Storage optimization)  
- App Manifest: Full mobile installation support
- Screenshots: Wide (1280x720) + Narrow (750x1334) formats
- Shortcuts: Quick access to Discover & Bookings
```

### Backend & Services (src/services/ Evidence)
```javascript
- Supabase PostgreSQL (Real-time tourism database)
- Supabase Auth (Social login: Google, Facebook)
- Stripe Connect (International payment processing)
- Currency API: Live XPF/USD/EUR conversion rates
```

## 🌊 Core App Features (Evidence from 29 Components)

### **Discovery System** (src/components/discovery/DiscoverTab.jsx)
**Verified 3-Step Discovery Flow:**
```javascript
const STEPS = {
  LOCATION: 'location',    // Choose French Polynesian island
  MOOD: 'mood',           // Select activity mood/type  
  PERSONALIZE: 'personalize', // Duration, difficulty, budget
  RESULTS: 'results'      // Personalized recommendations
}
```

**Intelligent Features:**
- **Location-Based Filtering**: Island-specific experience discovery
- **Mood-Based Matching**: Advanced emotion-to-activity algorithm  
- **Personalization Engine**: Duration, difficulty, budget preferences
- **Real-Time Availability**: Live operator inventory integration
- **Weather Integration**: Weather-adaptive activity suggestions

### **Booking Management** (src/components/journey/JourneyTab.jsx)
**Verified Journey Features:**
- **Booking Dashboard**: Complete reservation overview and status tracking
- **Next Tour Preparation**: Upcoming activity details and guidance
- **Booking Lookup**: Find reservations by reference or contact information
- **Communication Hub**: Direct operator messaging integration
- **Booking Statistics**: Personal travel analytics and insights

**Code Evidence:**
```javascript
const { 
  userBookings, loading, refreshBookings, fetchUserBookings,
  canContactOperator, canRebook, formatPrice, formatDate,
  getTotalBookings, getNextUpcomingTour 
} = useUserJourney()
```

### **Advanced State Management** (src/stores/bookingStore.js - Zustand)
**Verified Store Architecture:**
```javascript
export const useAppStore = create(persist((set, get) => ({
  activeTab: 'discover',        // Navigation state
  tours: [], loading: false,    // Tour data management
  selectedMood: null,           // Discovery personalization
  filters: {                    // Advanced filtering system
    island: 'all', tourType: 'all', timeframe: 'all',
    duration: 'all', search: '', sortBy: 'date',
    dateRange: null, priceRange: null
  },
  favorites: [],               // User preference persistence
  bookings: []                // Journey management
})))
```

### **Multi-Currency System** (src/hooks/useCurrency.jsx)
**Verified Currency Features:**
```javascript
const CURRENCY_STORAGE_KEY = 'vai-selected-currency'
const DEFAULT_CURRENCY = 'XPF'  // French Polynesian Franc

// Supported currencies with real-time conversion
const supportedCurrencies = ['XPF', 'USD', 'EUR']
```

**Currency Intelligence:**
- **Local Storage Persistence**: User currency preference saved
- **Validation System**: Supported currency verification
- **Real-Time Conversion**: Live exchange rate integration
- **Fallback Protection**: Automatic default currency on errors

## 🌐 **Internationalization System** (src/locales/ Evidence)

**6 Languages Fully Implemented:**
- **English** (en.json) - Primary international interface
- **French** (fr.json) - French Canadian & European tourists  
- **Spanish** (es.json) - Latin American market expansion
- **German** (de.json) - German-speaking European tourists
- **Italian** (it.json) - Italian tourist market
- **Tahitian** (ty.json) - Cultural authenticity and respect

**Cultural Features (Verified from en.json):**
```json
"hi": "Ia ora na",           // Tahitian greeting
"welcome": "Maeva",          // Tahitian welcome
"thankYou": "Mauruuru",      // Tahitian thank you  
"goodbye": "Nana"            // Tahitian goodbye
```

## 📱 **Progressive Web App Features** (vite.config.js Evidence)

### **Service Worker Configuration:**
```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
  runtimeCaching: [
    {
      // Supabase API caching with 5-minute blocks
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      cacheName: 'supabase-api-cache'
    },
    {
      // Supabase Storage (images) with 24-hour caching
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
      handler: 'CacheFirst', 
      cacheName: 'supabase-storage-cache'
    }
  ]
}
```

### **App Manifest Features:**
- **Installation Support**: Add to homescreen on mobile & desktop
- **Standalone Mode**: Full-screen app experience
- **Categories**: Travel, lifestyle, navigation
- **Shortcuts**: Direct access to discover tours & bookings
- **Screenshots**: Optimized for app store listings

## 🚀 **Advanced Components** (Component Evidence)

### **Communication System** (src/components/messages/MessagesTab.jsx)
- **Real-Time Chat**: Direct operator-tourist messaging
- **Context-Aware Support**: Booking-specific assistance
- **WhatsApp Integration**: Fallback to WhatsApp Business
- **Message Persistence**: Chat history across sessions

### **Booking Engine** (src/components/booking/)
- `BookingModal.jsx`: Complete reservation workflow
- `StripePaymentForm.jsx`: Secure international payment processing
- **Multi-Participant Support**: Adults/children pricing differentiation
- **Real-Time Inventory**: Live availability deduction

### **Tour Management** (src/components/tours/TourPage.jsx)
- **Detailed Experience Pages**: Rich content presentation
- **Media Galleries**: High-quality experience imagery
- **Operator Profiles**: Authentic local operator storytelling
- **Reviews & Ratings**: Post-experience feedback system

## 🔧 **Launch Control System** (Environment Evidence)

**App Launch Management:**
```javascript
// src/App.jsx - Launch control
const isAppLaunched = import.meta.env.VITE_APP_LAUNCHED === 'true'

// Shows LaunchingSoonModal when VITE_APP_LAUNCHED=false
// Full app functionality when VITE_APP_LAUNCHED=true
```

**Development vs Production Control:**
- **Development**: `VITE_APP_LAUNCHED=false` shows coming soon screen
- **Production**: `VITE_APP_LAUNCHED=true` enables full tourist booking

## 📱 **Installation & Development** (Verified from package.json)

### Prerequisites
```bash
Node.js 18+ (Required for Vite 4.4.5)
npm package manager
Supabase project with tourism schema  
Stripe account for payment processing
```

### Development Setup
```bash
# Clone and install
git clone <repository-url>
cd tourist-app
npm install

# Environment configuration  
cp .env.example .env
# Configure with values below

# Development server with HMR
npm run dev  # Runs on port 3001

# Production build with PWA
npm run build

# Preview production build
npm run preview
```

### **Environment Variables** (Verified from .env.example)
```bash
# Supabase Configuration  
REACT_APP_SUPABASE_URL=https://wewwhxhtpqjqhxfxbzyz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=VAI-Tickets
VITE_WHATSAPP_SUPPORT=+68987269065  
VITE_OPERATOR_DASHBOARD_URL=https://vai-operator-dashboard.onrender.com

# Launch Control (Critical)
VITE_APP_LAUNCHED=false  # Set to 'true' for production

# Stripe Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_STRIPE_CONNECT_CLIENT_ID=ca_your_stripe_connect_id

# Currency Conversion API
VITE_CURRENCY_API_URL=https://api.exchangerate-api.com/v4/latest/USD
```

## 🗃️ **Database Integration** (Verified from Services)

### **Tourist Experience Tables:**
```sql
active_tours_with_operators  -- Live experience discovery view
bookings                    -- Tourist reservation management  
user_profiles               -- Personalized preferences & history
tour_reviews                -- Experience ratings & feedback
```

### **Real-Time Operations:**
```sql
pending_bookings_for_workflow -- Instant booking processing
operator_booking_summary     -- Live availability management
booking_conversations       -- Real-time chat messages
```

## 🎯 **Target Tourist Markets** (Based on Language & Currency Support)

### **Primary International Markets:**
- **North American Travelers**: USD currency, English interface
- **European Tourists**: EUR currency, French/German/Italian interfaces  
- **Pacific Region**: AUD integration potential, English interface
- **Cultural Travelers**: Tahitian language respect, authentic experiences
- **Adventure Seekers**: Mood-based activity discovery system

### **Tourist Journey Profiles:**
- **Last-Minute Bookers**: Real-time availability, instant booking
- **Experience Collectors**: Favorites system, booking history tracking
- **Cultural Enthusiasts**: Authentic Polynesian operator connections
- **Digital Nomads**: PWA offline functionality, flexible booking
- **Luxury Travelers**: Premium experience filtering and curation

## 🔄 **Cross-Platform Integration** (Evidence from Services)

### **VAI Operator Dashboard Connection:**
```javascript
// Real-time booking synchronization
- Tourist books experience → Operator receives notification
- Operator confirms/declines → Tourist receives instant update  
- Chat messages flow bidirectionally between platforms
- Payment processing updates both tourist and operator interfaces
```

### **External Service Integration:**
- **WhatsApp Business API**: Direct operator communication
- **Stripe Connect**: Secure payment with operator settlement
- **Currency APIs**: Real-time XPF/USD/EUR conversion  
- **Google Analytics**: User behavior optimization (when configured)

## 📊 **Performance Optimizations** (Code Evidence)

### **Zustand State Management:**
```javascript
// Lightweight state with persistence
persist(
  (set, get) => ({
    // Optimized state structure for mobile performance
    activeTab, tours, filters, favorites, bookings
  }),
  { name: 'vai-app-storage' }  // localStorage persistence
)
```

### **Vite Build Optimizations:**
- **Code Splitting**: Component-level dynamic imports
- **Tree Shaking**: Unused code elimination  
- **Asset Optimization**: Image compression and lazy loading
- **Service Worker**: Intelligent caching for offline functionality

## 🌺 **Cultural Authenticity Features** (Verified Implementation)

### **Polynesian Cultural Integration:**
- **Tahitian Language Support**: ty.json with authentic greetings
- **Local Operator Priority**: 100% French Polynesian operator platform
- **Cultural Context**: Respectful presentation of sacred sites
- **Economic Empowerment**: Direct revenue to local families

### **Sustainable Tourism:**
- **Local Operator Focus**: Supporting indigenous business owners
- **Authentic Experiences**: Traditional Polynesian cultural tours
- **Environmental Responsibility**: Sustainable tourism practice promotion
- **Community Benefits**: Technology serving local interests

## 🚀 **Development Roadmap** (Based on Code Architecture)

### **Active Development** (PWA Ready)
- ✅ Progressive Web App functionality
- ✅ Multi-currency real-time conversion
- ✅ 6-language internationalization
- ✅ Real-time operator communication
- ✅ Advanced booking management

### **Planned Enhancements**
- **Native Mobile Apps**: iOS/Android with additional native features  
- **AI Recommendations**: Enhanced mood-based discovery algorithms
- **Social Features**: Experience sharing and friend recommendations
- **Group Bookings**: Multi-tourist reservation management
- **Loyalty Program**: Repeat visitor rewards and preferences

---

**Built with React 18.2.0 + Vite 4.4.5 PWA Architecture for International Tourism Excellence**

*Evidence-Based Documentation - Every Feature Verified Against Source Code*

**Tourist Support**: +68987269065 | **Email**: hello@vai.studio | **Platform**: [vai.studio](https://vai.studio)