# 🔧 VAI Client Portal - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### 1. **Styles Not Loading / No Tailwind CSS**

**Symptoms:**
- Page looks unstyled
- No VAI design system colors
- Components appear as plain HTML

**Solutions:**

```bash
# 1. Ensure Tailwind is installed
npm install -D tailwindcss autoprefixer postcss

# 2. Create postcss.config.js
echo 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } }' > postcss.config.js

# 3. Check if Tailwind config exists
ls tailwind.config.js

# 4. Restart dev server
npm run dev
```

**Check these files exist:**
- `tailwind.config.js` ✅
- `postcss.config.js` ✅  
- `src/styles/index.css` ✅

### 2. **Environment Variables Not Loading**

**Symptoms:**
- "Missing Supabase environment variables" error
- Cannot connect to database

**Solutions:**

```bash
# 1. Create .env from template
cp .env.example .env

# 2. Add your actual Supabase credentials
# Edit .env file with:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key

# 3. Restart development server
npm run dev
```

**Important:** All environment variables must start with `VITE_` to be accessible in the frontend.

### 3. **Router/Navigation Issues**

**Symptoms:**
- "Cannot GET /portal/" error
- Navigation not working
- Pages not loading

**Solutions:**

```bash
# 1. Check base URL configuration in vite.config.js
# Should be: base: process.env.NODE_ENV === 'production' ? '/portal/' : '/'

# 2. For development, run on root:
# Visit: http://localhost:3001/ (not /portal/)

# 3. Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### 4. **Language Detection Issues**

**Symptoms:**
- Wrong language detected (German instead of French)
- Language not switching

**Solutions:**

```javascript
// 1. Clear localStorage
localStorage.removeItem('vai_portal_language')

// 2. Force language in URL
// Visit: http://localhost:3001/?lang=fr

// 3. Check browser language settings
// Should prioritize French > English
```

### 5. **Supabase Connection Problems**

**Symptoms:**
- "Authentication failed" 
- "Connection error"
- Database queries failing

**Solutions:**

```bash
# 1. Verify Supabase credentials in .env
# Check dashboard: https://supabase.com/dashboard

# 2. Test connection manually
# Open browser console, should see: "✅ Supabase connection successful"

# 3. Check RLS policies
# Ensure vai_studio_clients table has proper policies

# 4. Verify table exists
# Table: vai_studio_clients with access_password column
```

### 6. **Build/Deployment Issues**

**Symptoms:**
- Build failing
- Assets not loading in production
- White screen after deployment

**Solutions:**

```bash
# 1. Clean build
rm -rf dist node_modules
npm install
npm run build

# 2. Check base path configuration
# vite.config.js should handle production base path

# 3. Test production build locally
npm run preview

# 4. Check render.com environment variables
# Must be set in Render dashboard, not just .env
```

### 7. **PWA Installation Issues**

**Symptoms:**
- No install prompt
- PWA not working offline
- Icons not showing

**Solutions:**

```bash
# 1. Check manifest.json is generated
# Should be in dist/ after build

# 2. Verify HTTPS in production
# PWA requires HTTPS (except localhost)

# 3. Add proper icons to public/
# Required: pwa-192x192.png, pwa-512x512.png

# 4. Test service worker
# Check Application tab in DevTools
```

### 8. **Performance Issues**

**Symptoms:**
- Slow loading
- Large bundle size
- Poor mobile performance

**Solutions:**

```bash
# 1. Analyze bundle
npm run build
# Check dist/ folder size

# 2. Enable code splitting
# Already configured in vite.config.js

# 3. Optimize images
# Compress icons and assets

# 4. Check network requests
# Use DevTools Network tab
```

## 🛠️ Debug Commands

```bash
# Check all dependencies
npm list

# Verify environment
echo $NODE_ENV

# Test Tailwind compilation
npx tailwindcss -i ./src/styles/index.css -o ./test-output.css

# Check Vite configuration
npx vite --help

# Clear all caches
rm -rf node_modules/.vite dist .env
npm install
```

## 📱 Mobile Testing Checklist

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome  
- [ ] Test tablet sizes
- [ ] Check touch targets (44px minimum)
- [ ] Verify PWA install prompt
- [ ] Test offline functionality

## 🌐 Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Known Issues:**
- IE11: Not supported (modern JavaScript)
- Older Safari: May need polyfills

## 📞 Getting Help

If you're still stuck:

1. **Check browser console** for error messages
2. **Review network tab** for failed requests
3. **Clear all caches** and try again
4. **Test in incognito/private** browsing mode
5. **Contact VAI Studio** support

**Support Channels:**
- WhatsApp: +689 87 26 90 65
- Email: hello@vai.studio
- Documentation: README.md

## 🔍 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing Supabase environment variables" | .env not configured | Create .env with proper credentials |
| "Cannot GET /portal/" | Wrong base path | Visit localhost:3001/ for development |
| "Invalid access code" | Wrong password | Check vai_studio_clients table |
| "Failed to initialize portal" | Database connection issue | Verify Supabase credentials |
| "Warning: Received true for non-boolean attribute" | Component syntax error | Fixed in updated components |

Remember: When in doubt, restart the development server and clear your browser cache! 🔄