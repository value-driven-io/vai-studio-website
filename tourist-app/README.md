# 🌴 VAI - Discover French Polynesia | Tourist App

**Unlock Paradise with Last-Minute Experiences in French Polynesia**

VAI is the revolutionary tourism platform that connects travelers with authentic French Polynesian experiences through instant booking and transparent pricing. Stop missing out on paradise - discover, book, and experience French Polynesia like never before.

## 🚀 Live Application
- **Tourist App**: [app.vai.studio](https://app.vai.studio)
- **Landing Page**: [vai.studio/app/welcome/](https://vai.studio/app/welcome/)
- **Main Website**: [vai.studio](https://vai.studio)

## 🌺 What is VAI?

VAI transforms how tourists discover and book experiences in French Polynesia by:
- **Instant Access**: Real-time availability from local operators
- **Transparent Pricing**: No hidden fees, see exactly what you pay
- **Mood-Based Discovery**: Find experiences that match your current vibe
- **Authentic Experiences**: Direct connection with local Polynesian operators
- **Last-Minute Booking**: Perfect for spontaneous island adventures

## 🏝️ Key Features

### For Tourists
- **Real-Time Tour Discovery**: Live availability from verified operators
- **WhatsApp Integration**: Direct communication with tour operators
- **Mood-Powered Search**: "I feel adventurous" → Find matching experiences
- **Transparent Pricing**: See all costs upfront, no surprises
- **Instant Booking**: Secure your spot in minutes
- **Cultural Authenticity**: Experiences designed by locals

### Technical Features
- **Progressive Web App**: Works offline, mobile-optimized
- **Real-time Database**: Powered by Supabase
- **Automated Workflows**: n8n integration for booking management
- **Multi-language Support**: French and English
- **Mobile-First Design**: Optimized for smartphone users

## 🏗️ Technology Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Automation**: n8n workflows for booking processing
- **State Management**: Zustand with localStorage persistence
- **UI Components**: Custom VAI design system
- **Mobile**: PWA with offline capabilities
- **Authentication**: Supabase Auth with social login

## 🗃️ Database Integration

Connected to comprehensive Supabase schema:
- `active_tours_with_operators` → Tour discovery and search
- `bookings` → Booking creation and management
- `pending_bookings_for_workflow` → n8n automation triggers
- `operator_booking_summary` → Real-time statistics
- `user_profiles` → Tourist preferences and history

## 📱 Installation & Development

```bash
# Clone the repository
git clone <repository-url>
cd tourist-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your Supabase credentials in .env

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌊 Environment Configuration

Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_TOURIST_WEBHOOK=your_n8n_webhook_url
VITE_WHATSAPP_SUPPORT=+68987269065
```

## 🎯 Target Market

**Primary Users**: 
- Spontaneous travelers in French Polynesia
- Tourists seeking authentic local experiences
- Last-minute experience seekers
- Culturally-conscious travelers

**Geographic Focus**:
- Tahiti, Bora Bora, Moorea, Rangiroa
- Other French Polynesian islands
- International tourists visiting French Polynesia

## 🔄 Integration Points

- **Operator Dashboard**: Seamless operator onboarding and management
- **n8n Workflows**: Automated booking confirmations and notifications
- **WhatsApp Business**: Direct operator-tourist communication
- **Payment Processing**: Secure transaction handling (in development)

## 📞 Support & Contact

- **WhatsApp Support**: +68987269065
- **Email**: hello@vai.studio
- **Website**: [vai.studio](https://vai.studio)
- **Developer**: Kevin De Silva, VAI Studio

## 🌟 Coming Soon

- **Payment Integration**: Secure online transactions
- **Advanced Filtering**: More sophisticated search options
- **Review System**: Tourist feedback and ratings
- **Social Features**: Share experiences with friends
- **Offline Mode**: Download experiences for offline viewing

---

**Built with ❤️ in French Polynesia for the world to discover paradise.**