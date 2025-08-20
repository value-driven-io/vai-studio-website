# 🌺 VAI Studio Client Portal

A modern Progressive Web App (PWA) that provides VAI Studio clients with real-time access to their digital transformation project progress, proposal details, and financial information.

## ✨ Features

### 🏠 Core Functionality
- **Real-time Project Tracking**: Monitor your digital transformation progress
- **Interactive Proposal Display**: Dynamic pricing and service breakdown
- **Financial Calculator**: ROI calculations and payment options
- **Comprehensive FAQ**: Searchable knowledge base
- **Quick Actions**: Direct communication and resource access

### 📱 Technical Features
- **Progressive Web App**: Installable, offline-capable
- **Fully Responsive**: Mobile, tablet, and desktop optimized  
- **Bilingual Support**: French and English with i18n
- **Secure Authentication**: Password-based client access
- **Real-time Database**: Supabase integration
- **Modern UI/UX**: VAI Studio design system

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with VAI design system
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Internationalization**: react-i18next
- **PWA**: Vite PWA plugin with Workbox
- **Deployment**: render.com static hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vai-client-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3001/portal/
   ```

## 🗄️ Database Configuration

### Supabase Setup

The portal connects to the existing `vai_studio_clients` table:

```sql
-- Required table structure
vai_studio_clients (
  id uuid PRIMARY KEY,
  company_name text NOT NULL,
  client_name text NOT NULL, 
  slug text UNIQUE NOT NULL,
  email text NOT NULL,
  access_password text,
  proposal_data jsonb DEFAULT '{}',
  project_status text DEFAULT 'proposal',
  total_investment_xpf integer,
  monthly_costs_xpf integer,
  is_active boolean DEFAULT true,
  -- ... other fields
)
```

### Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional
VITE_DEBUG=true
VITE_SUPPORT_WHATSAPP=+68987269065
```

## 🎨 Design System

The portal uses the VAI Studio design system with consistent colors and components:

### Color Palette
- **vai-deep-ocean**: `#0f172a` - Primary background
- **vai-lagoon**: `#1e293b` - Card backgrounds  
- **vai-coral**: `#3b82f6` - Primary accent
- **vai-sunset**: `#f97316` - Secondary accent
- **vai-pearl**: `#f8fafc` - Primary text

### Components
- `vai-card`: Standard card layout
- `vai-button-primary`: Primary action buttons
- `vai-tab-button`: Navigation tabs
- `vai-status-*`: Status indicators

## 📱 PWA Features

### Installation
- Automatic install prompts on mobile
- Add to home screen capability
- Standalone app experience

### Offline Support
- Service worker caching
- Offline page access
- Background sync (planned)

### Performance
- Code splitting by route
- Lazy loading components
- Optimized bundle sizes

## 🌐 Internationalization

### Languages Supported
- **French (fr)**: Primary language
- **English (en)**: Secondary language

### Adding Translations
1. Edit `src/locales/fr.json` and `src/locales/en.json`
2. Use translation keys: `{t('common.loading')}`
3. Dynamic content: `{t('meta.title', { clientName: 'Company' })}`

## 🔐 Authentication Flow

### Client Access
1. Client enters access password
2. System queries `vai_studio_clients` table
3. Validates password and active status
4. Stores authentication in localStorage
5. Loads client-specific data

### Deep Linking
- `vai.studio/portal/` - Main entry
- `vai.studio/portal/?client=slug` - Direct client access
- `vai.studio/portal/?lang=en` - Language preference

## 📊 Project Structure

```
vai-client-portal/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout and navigation
│   │   ├── tabs/           # Main tab content
│   │   └── ui/             # Reusable UI components
│   ├── store/              # Zustand state management
│   ├── utils/              # Utilities and configuration
│   ├── locales/            # Translation files
│   ├── styles/             # Global styles
│   └── App.jsx             # Main application
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json
```

## 🚀 Deployment

### render.com Deployment

1. **Connect GitHub repository**
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Branch: `main`

3. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_production_url
   VITE_SUPABASE_ANON_KEY=your_production_key
   VITE_BASE_URL=/portal/
   ```

4. **Deploy**: Automatic on push to main branch

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to static hosting
```

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Development Guidelines
- Use TypeScript-style JSX
- Follow React hooks patterns
- Implement proper error boundaries
- Test on multiple devices
- Maintain accessibility standards

## 📱 Tab Structure

### 🏠 Overview
- Project summary and status
- Client information display
- Quick statistics

### 📊 Scope  
- Services breakdown
- Package details
- Add-on services

### 💰 Finances
- Investment summary
- Payment options
- ROI calculator
- Monthly costs

### ❓ FAQ
- Searchable questions
- Categorized content
- Contact support

### ⚡ Actions
- Contact VAI Studio
- Download resources
- Share portal
- Account management

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Authentication system
- [x] Tab navigation  
- [x] Basic content display
- [x] Responsive design
- [x] i18n implementation

### Phase 2: Enhanced Features (In Progress)
- [ ] PDF proposal generation
- [ ] Progress timeline visualization
- [ ] Push notifications
- [ ] Advanced analytics

### Phase 3: Advanced Features (Planned)
- [ ] Real-time chat integration
- [ ] Document uploads
- [ ] Calendar integration
- [ ] Advanced reporting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **WhatsApp**: +689 87 26 90 65
- **Email**: hello@vai.studio  
- **Website**: [vai.studio](https://vai.studio)
- **Documentation**: Available in project wiki

## 📄 License

Copyright © 2025 VAI Studio. All rights reserved.

**"International Quality. Island Style."**

---

Built with ❤️ in French Polynesia for the world to discover paradise.