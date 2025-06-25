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
Email: hello@vai.studio
