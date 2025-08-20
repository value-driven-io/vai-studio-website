# 🚀 VAI Client Portal - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Install all required packages
npm install

# Or if you prefer yarn
yarn install
```

### Step 2: Create PostCSS Config

Create `postcss.config.js` in your root folder:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 3: Environment Configuration

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your actual Supabase credentials:

```bash
# Required - Get from Supabase dashboard
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Optional
VITE_DEBUG=true
VITE_SUPPORT_WHATSAPP=+68987269065
```

### Step 4: Create Basic Assets

Create a basic favicon in `public/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#grad)"/>
  <text x="16" y="22" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="white">V</text>
</svg>
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3001/** (not `/portal/`)

## ✅ Expected Result

You should see:
- ✅ VAI Studio login screen with proper styling
- ✅ Language switcher (FR/EN) in top right
- ✅ Responsive design on mobile/desktop
- ✅ No style/console errors
- ✅ "✅ Supabase connection successful" in console

## 🔧 If Something's Wrong

### No Styles Loading?
```bash
# Check if Tailwind is working
npx tailwindcss -i ./src/styles/index.css -o ./test.css
cat test.css | head -20
```

### Can't Connect to Database?
```bash
# Test your Supabase URL manually
curl "https://your-project-id.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key"
```

### Wrong Language Detection?
```bash
# Force French language
# Visit: http://localhost:3001/?lang=fr
```

## 🗄️ Test Database Setup

Create a test client in your Supabase `vai_studio_clients` table:

```sql
INSERT INTO vai_studio_clients (
  company_name,
  client_name,
  slug,
  email,
  access_password,
  project_status,
  total_investment_xpf,
  monthly_costs_xpf,
  is_active,
  proposal_data
) VALUES (
  'Test Lagoon Adventures',
  'Test Client',
  'test-client',
  'test@example.com',
  'test123',
  'active',
  250000,
  5400,
  true,
  '{
    "client_info": {
      "company_name": "Test Lagoon Adventures",
      "business_type": "Whale Watching",
      "island": "Moorea"
    },
    "pricing": {
      "base_package": 250000,
      "add_ons": [],
      "monthly_costs": 5400
    }
  }'::jsonb
);
```

## 🎯 Test Login

1. Open portal: http://localhost:3001/
2. Enter password: `test123`
3. Should see complete client dashboard

## 📱 Test Responsive Design

- **Desktop**: Full sidebar navigation
- **Mobile**: Bottom tab navigation + header
- **Tablet**: Optimized layouts

## 🚀 Ready for Production

Once everything works locally:

```bash
# Build for production
npm run build

# Test production build
npm run preview
```

## 📞 Need Help?

**Common Issues:**
- Check `TROUBLESHOOTING.md` for detailed solutions
- Verify all files from the complete structure exist
- Ensure `.env` has correct Supabase credentials

**Support:**
- WhatsApp: +689 87 26 90 65
- Email: hello@vai.studio

---

**🌺 Enjoy your VAI Studio Client Portal!**