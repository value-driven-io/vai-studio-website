# 🌺 VAI Studio - Digital Solutions for French Polynesia

**Professional web solutions and digital platforms connecting tourists with authentic French Polynesian experiences.**

## 🏝️ Project Overview

VAI Studio develops cutting-edge digital solutions for French Polynesian businesses, with a focus on tourism technology that connects travelers with authentic local experiences. Our flagship project, VAI, revolutionizes how tourists discover and book experiences in paradise.

## 🌊 Live Platforms

- **Main Website**: [vai.studio](https://vai.studio)
- **Tourist App**: [app.vai.studio](https://app.vai.studio)
- **Operator Dashboard**: [vai-operator-dashboard.onrender.com](https://vai-operator-dashboard.onrender.com)

## 🚀 Project Structure

### 1. Main Website (`/`)
Professional website showcasing VAI Studio's services and digital solutions.
- **Technology**: HTML5, CSS3, Vanilla JavaScript
- **Features**: Bilingual (French/English), responsive design, service showcase
- **Target**: French Polynesian businesses seeking digital solutions

### 2. Tourist App (`/tourist-app/`)
React-based progressive web application for tourists to discover and book authentic French Polynesian experiences.
- **Technology**: React 18 + Vite + Tailwind CSS + Supabase
- **Features**: Real-time booking, mood-based discovery, WhatsApp integration
- **Target**: International tourists visiting French Polynesia

### 3. Operator Dashboard (`/operator-dashboard/`)
Comprehensive business platform for French Polynesian tour operators to manage bookings and grow their businesses.
- **Technology**: React 18 + Create React App + Supabase
- **Features**: 10% commission, revenue recovery, automated workflows
- **Target**: Local tourism operators and experience providers

### 4. Landing Pages (`/app/welcome/` & `/app/operator-welcome/`)
Conversion-optimized landing pages for user acquisition and operator onboarding.
- **Technology**: HTML5, CSS3, JavaScript with bilingual support
- **Features**: Registration forms, feature showcases, social proof
- **Purpose**: Convert visitors to app users and business partners

## 🔧 Technology Stack

### Frontend
- **Tourist App**: React 18 + Vite + Tailwind CSS
- **Operator Dashboard**: React 18 + Create React App
- **Main Website**: HTML5 + CSS3 + Vanilla JavaScript
- **Mobile**: Progressive Web App (PWA) capabilities

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth with social login
- **Automation**: n8n workflows for booking management
- **Hosting**: Render.com (static sites + Docker containers)
- **CDN**: Integrated with hosting platforms

### Integration Points
- **WhatsApp Business API**: Direct operator-tourist communication
- **n8n Automation**: Booking workflows and notifications
- **Analytics**: Google Analytics + custom tracking
- **Payment Processing**: In development

## 🗃️ Database Architecture

Comprehensive Supabase schema supporting the entire VAI ecosystem:

### Core Tables
- `operators` - Tourism business profiles and verification
- `tours` - Experience listings and availability
- `bookings` - Transaction and booking management
- `user_profiles` - Tourist preferences and history

### Operational Views
- `active_tours_with_operators` - Real-time tour discovery
- `operator_booking_summary` - Business analytics
- `pending_bookings_for_workflow` - n8n automation triggers

### Security
- Row Level Security (RLS) policies implemented
- User authentication and authorization
- Data privacy compliance for tourism industry

## 🌐 Environment Configuration

### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://rizqwxcmpzhdmqjjqgyw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# n8n Webhook Endpoints
VITE_N8N_TOURIST_WEBHOOK=https://n8n-stable-latest.onrender.com/webhook/vai-app-user-registration
VITE_N8N_OPERATOR_WEBHOOK=https://n8n-stable-latest.onrender.com/webhook/vai-app-operator-registration

# External App URLs
VITE_OPERATOR_DASHBOARD_URL=https://vai-operator-dashboard.onrender.com
VITE_TOURIST_APP_URL=https://app.vai.studio

# Contact Information
VITE_WHATSAPP_SUPPORT=+68987269065
```

## 📱 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Supabase account and project
- n8n instance for automation (optional for basic development)

### Installation
```bash
# Clone the main repository
git clone <your-repo-url>
cd vai-studio-project

# Tourist App Setup
cd tourist-app
npm install
cp .env.example .env
npm run dev

# Operator Dashboard Setup  
cd ../operator-dashboard
npm install
cp .env.example .env
npm start

# Main Website (no build required)
# Open index.html in browser for development
```

## 🎯 Business Model

### For Tourists
- **Free Platform**: No cost to discover and book experiences
- **Transparent Pricing**: See all costs upfront
- **Authentic Experiences**: Direct connection with local operators

### For Operators
- **10% Commission**: Industry-leading low fee structure
- **Revenue Recovery**: Capture bookings from cancellations
- **Direct Relationships**: Maintain customer connections
- **Growth Tools**: Analytics and automated marketing

### For VAI Studio
- **Commission Revenue**: Sustainable from operator bookings
- **Premium Services**: Advanced features for operators
- **Digital Solutions**: Web development for other businesses

## 📈 Key Metrics & Goals

### Tourist Acquisition
- **Target**: 1,000+ registered tourists by Q4 2025
- **Focus**: International visitors to French Polynesia
- **Channels**: Organic search, social media, partnerships

### Operator Onboarding
- **Target**: 50+ verified operators by Q4 2025
- **Coverage**: All major French Polynesian islands
- **Quality**: Authentic, culturally-respectful experiences

### Business Growth
- **Revenue**: Commission-based sustainable model
- **Expansion**: Additional digital services for businesses
- **Impact**: Supporting local Polynesian tourism economy

## 🌺 Cultural Commitment

VAI Studio is committed to:
- **Authentic Representation**: Respectful portrayal of Polynesian culture
- **Local Empowerment**: Supporting indigenous business owners
- **Sustainable Tourism**: Promoting responsible travel practices
- **Community Benefit**: Ensuring technology serves local interests

## 📞 Contact & Support

- **Developer**: Kevin De Silva, VAI Studio
- **WhatsApp**: +68987269065
- **Email**: hello@vai.studio
- **Location**: Based in Moorea, French Polynesia
- **Website**: [vai.studio](https://vai.studio)

## 🚀 Roadmap

### Q3 2025
- ✅ Tourist app MVP launch
- ✅ Operator dashboard beta
- ⏳ Payment integration
- ⏳ Advanced analytics

### Q4 2025
- 📅 Mobile app releases (iOS/Android)
- 📅 Multi-currency support
- 📅 Advanced search filters
- 📅 Review and rating system

### 2026
- 📅 API for third-party integrations
- 📅 Expansion to other Pacific islands
- 📅 Enterprise solutions for resorts
- 📅 AI-powered experience recommendations

---

**Built with ❤️ in French Polynesia**

*Connecting the world to authentic Polynesian experiences through technology that respects culture and empowers local communities.*