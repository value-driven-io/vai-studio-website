# VAI Embed Widget - Template Integration Updates

**Date:** October 9, 2025
**Status:** ✅ Completed
**Build:** Successfully built (3.62 KB gzipped)

---

## 📝 Summary

Updated the VAI Embed Widget to open **template pages** instead of direct booking pages. This allows users to browse available dates and schedules before booking.

### **Flow Change:**

**Before (Option B - Direct Booking):**
```
Operator Website → Click "Book Now" → Modal opens → /booking?tour_id={instance_id}
→ User fills form → Books specific date
```

**After (Option A - Template Browsing):**
```
Operator Website → Click "Book Now" → Modal opens → /template/{template_id}
→ User browses dates → Selects schedule → Books
```

---

## 🔧 Changes Made

### 1. **Embed Widget Button Script** (`src/embed/button/index.js`)

#### Changed Data Attribute:
- **Before:** `data-vai-tour` (instance/tour ID)
- **After:** `data-vai-template` (template ID)

#### Updated Functions:
- `validateConfig()` - Now validates `templateId` instead of `tourId`
- `buildIframeUrl()` - Opens `/template/{templateId}` instead of `/booking`
- `autoInitialize()` - Looks for `[data-vai-operator][data-vai-template]`
- Analytics tracking - Uses `template_id` instead of `tour_id`

#### Integration Examples:

**Method 1: Data Attributes (Auto-init)**
```html
<button
  data-vai-operator="c78f7f64-cab8-4f48-9427-de87e12ec2b9"
  data-vai-template="db896f3d-da54-4304-bdf4-9a8499c2a7de"
  data-vai-theme="#667eea"
>
  Book Now
</button>

<script src="https://embed.vai.studio/button.js"></script>
```

**Method 2: Programmatic API**
```javascript
VAI.createBookingButton({
  operatorId: 'c78f7f64-cab8-4f48-9427-de87e12ec2b9',
  templateId: 'db896f3d-da54-4304-bdf4-9a8499c2a7de',
  buttonText: 'Book Now',
  themeColor: '#667eea',
  onBookingComplete: (data) => {
    console.log('Booking completed:', data.bookingId);
  }
});
```

---

### 2. **Sample Operator Website** (`clients/vaiplatform/sample/`)

Updated with **real template IDs** from production database:

| Template ID | Name | Type | Location | Price |
|------------|------|------|----------|-------|
| `db896f3d-da54-4304-bdf4-9a8499c2a7de` | Dive with the Turtles | Diving | Tahiti | 260 XPF |
| `e8fd6a14-953f-4f92-b64c-632fa4df6a01` | Sunset Lagoon Tour | Lagoon Tour | Moorea | 180 XPF |
| `795569b4-1921-4943-976f-4bb48fd75f28` | Dance with the Whales | Whale Watching | Moorea | 210 XPF |
| `b8ce19ea-4361-4077-b5de-c63324e56e6a` | Traditional Cooking Workshop | Culinary | Tahiti | 260 XPF |

**Operator ID:** `c78f7f64-cab8-4f48-9427-de87e12ec2b9`

---

## ✅ Testing Instructions

### Build and Run:

```bash
# 1. Build the embed widget
cd /Users/desilva/Desktop/vai-studio-website/tourist-app
npm run build:embed

# 2. Start Tourist App (for iframe)
npm run dev

# 3. Serve sample operator website
cd /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample
python3 -m http.server 8000

# 4. Open browser
open http://localhost:8000
```

### What to Test:

✅ **Click any "Book Now" button** → Modal should open
✅ **Template page loads** in iframe (e.g., `/template/db896f3d-da54-4304-bdf4-9a8499c2a7de`)
✅ **User can browse dates** on template page
✅ **Different theme colors** per tour (close button color changes)
✅ **Dark mode toggle** works for both website + modal
✅ **All 3 close methods** work (overlay click, X button, Escape key)
✅ **Analytics events** logged in console:
  - `embed.widget.loaded`
  - `embed.modal.opened`
  - `embed.booking.completed` (after completing booking)

---

## 📊 Build Metrics

```
CSS:  3.24 KB (1.10 KB gzipped)
JS:   6.50 KB (2.52 KB gzipped)
─────────────────────────────────
Total: 3.62 KB gzipped ✅

Target: <12 KB gzipped
Status: ✅ PASSED (70% under target)
```

---

## 🚀 Deployment Notes

### For Production:

1. **Build both apps:**
   ```bash
   npm run build:all  # Builds main app + embed widget
   ```

2. **Deploy embed widget:**
   - Upload `dist/embed/button.js` to `https://embed.vai.studio/button.js`
   - Update CORS settings to allow iframe embedding

3. **Update tourist app:**
   - Ensure template pages work in embed mode (hide header/nav)
   - Test postMessage communication for booking completion

### For Operators:

Replace the script tag in integration docs:
```html
<!-- Development -->
<script src="http://localhost:5173/src/embed/button/index.js" type="module"></script>

<!-- Production -->
<script src="https://embed.vai.studio/button.js"></script>
```

---

## 📚 Related Files

### Modified:
- ✅ `/tourist-app/src/embed/button/index.js` - Button script (tour → template)
- ✅ `/tourist-app/src/embed/button/modal.js` - Modal component (no changes)
- ✅ `/tourist-app/src/embed/button/styles.css` - Styles (no changes)
- ✅ `/tourist-app/src/embed/button/i18n.js` - Translations (no changes)
- ✅ `/tourist-app/src/lib/analytics/stub.js` - Analytics (no changes)
- ✅ `/clients/vaiplatform/sample/index.html` - Sample website (real templates)

### Build Configuration:
- ✅ `/tourist-app/vite.config.embed.js` - Build config (no changes)
- ✅ `/tourist-app/package.json` - Build scripts (no changes)

---

## 🐛 Known Issues

1. **Build Warnings:**
   - `preserveEntrySignatures` warning (Vite/Rollup mismatch - safe to ignore)
   - Named + default exports warning (doesn't affect functionality)

2. **Sample Website:**
   - Currently loading embed widget from local build (production will use CDN)
   - Need to update script path for production testing

---

## 🎯 Next Steps

1. ✅ **Week 1-2:** Core implementation complete
2. **Week 3-4:** Beta testing with 5 operators
   - Collect feedback on template vs direct booking flow
   - Measure conversion rates
   - Iterate based on real usage
3. **Week 5-6:** Production deployment
   - Deploy to `embed.vai.studio`
   - Add "Get Embed Code" in Operator Dashboard
   - Create video tutorial

---

## 📞 Support

**Questions?** See documentation:
- `/tourist-app/documentation/implementation and concepts/embed system/VAI_EMBED_WIDGET_MVP_SPEC.md`
- `/tourist-app/documentation/implementation and concepts/embed system/README.md`

**Issues?** Report in project tracker

---

**Built with ❤️ by VAI Studio**
