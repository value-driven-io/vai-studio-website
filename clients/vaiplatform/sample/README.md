# Moana Ocean Adventures - Sample Operator Website

This is a sample operator website created for **testing the VAI Embed Widget**.

## 📋 Overview

**Moana Ocean Adventures** is a fictional tour operator in French Polynesia showcasing how real operators would integrate the VAI booking widget into their existing websites.

## 🎯 Purpose

This sample demonstrates:
- ✅ Real-world operator website design
- ✅ Multiple tour offerings with different pricing
- ✅ VAI Embed Widget integration using data attributes
- ✅ Custom theme colors per tour
- ✅ Dark mode support
- ✅ Mobile responsive design
- ✅ Professional operator branding

## 🚀 How to Test

### Prerequisites

1. Build the VAI Embed Widget first:
   ```bash
   cd /Users/desilva/Desktop/vai-studio-website/tourist-app
   npm run build:embed
   ```

2. Make sure the Tourist App is running (for iframe booking):
   ```bash
   cd /Users/desilva/Desktop/vai-studio-website/tourist-app
   npm run dev
   ```

### Option 1: Open Directly (File Protocol)

Simply open `index.html` in your browser:
```bash
open /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample/index.html
```

**Note:** You'll need to update the script path in `index.html` to point to the built embed widget.

### Option 2: Run a Local Server (Recommended)

Use Python's built-in server:
```bash
cd /Users/desilva/Desktop/vai-studio-website/clients/vaiplatform/sample
python3 -m http.server 8000
```

Then open: http://localhost:8000

Or use Node's `http-server`:
```bash
npx http-server -p 8000
```

## 🧪 Testing Checklist

### Basic Integration
- [ ] All 6 "Book Now" buttons work
- [ ] Modal opens when clicking any button
- [ ] Modal shows Tourist App booking page in iframe
- [ ] Different tours use different theme colors (close button color changes)

### Theme Colors
- [ ] **Snorkeling Safari**: Purple theme (#667eea)
- [ ] **Sunset Sailing**: Pink theme (#f5576c)
- [ ] **Deep Dive**: Cyan theme (#00f2fe)
- [ ] **Cultural Heritage**: Orange/Yellow theme (#fa709a)
- [ ] **Private Charter**: Teal theme (#a8edea)
- [ ] **Whale Watching**: Blue/Purple theme (#30cfd0)

### Dark Mode
- [ ] Toggle dark mode using button (top-right corner)
- [ ] Website switches between light/dark themes
- [ ] Modal overlay adapts to dark mode
- [ ] Dark mode preference persists on page reload

### Responsive Design
- [ ] Test on desktop (1920px width)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Tour cards stack properly on mobile
- [ ] Navigation remains accessible

### Modal Functionality
- [ ] Click overlay background to close modal
- [ ] Click X button to close modal
- [ ] Press Escape key to close modal
- [ ] Body scroll disabled when modal open
- [ ] Loading indicator shows while iframe loads

### Analytics (Console)
- [ ] Open browser console (F12)
- [ ] Click a "Book Now" button
- [ ] Verify analytics events logged:
  - `embed.widget.loaded` (on page load)
  - `embed.modal.opened` (on button click)

## 📊 Test Tours

### 1. Snorkeling Safari
- **ID:** `tour_snorkeling_safari_456`
- **Theme:** #667eea (Purple)
- **Price:** €89/person
- **Badge:** 🏆 Most Popular

### 2. Sunset Sailing Cruise
- **ID:** `tour_sunset_sailing_789`
- **Theme:** #f5576c (Pink)
- **Price:** €149/person
- **Badge:** 🌅 Romantic

### 3. Deep Dive Experience
- **ID:** `tour_scuba_diving_101`
- **Theme:** #00f2fe (Cyan)
- **Price:** €199/person
- **Badge:** 🤿 Advanced

### 4. Polynesian Heritage Tour
- **ID:** `tour_cultural_heritage_202`
- **Theme:** #fa709a (Orange/Pink)
- **Price:** €119/person
- **Badge:** 🗿 Cultural

### 5. Private Island Charter
- **ID:** `tour_private_charter_303`
- **Theme:** #a8edea (Teal)
- **Price:** €899/group
- **Badge:** ⭐ Premium

### 6. Whale Watching Safari
- **ID:** `tour_whale_watching_404`
- **Theme:** #30cfd0 (Blue/Purple)
- **Price:** €169/person
- **Badge:** 🐋 Seasonal

## 🔧 Integration Code

### Data Attributes Method (Used in this sample)

```html
<button
  data-vai-operator="op_demo_moana_123"
  data-vai-tour="tour_snorkeling_safari_456"
  data-vai-theme="#667eea"
>
  Book Now
</button>

<script src="https://embed.vai.studio/button.js"></script>
```

### Programmatic Method (Alternative)

```javascript
const button = VAI.createBookingButton({
  operatorId: 'op_demo_moana_123',
  tourId: 'tour_snorkeling_safari_456',
  buttonText: 'Book Now',
  themeColor: '#667eea',
  onBookingComplete: (data) => {
    console.log('Booking completed:', data.bookingId);
  }
});

document.getElementById('container').appendChild(button);
```

## 🐛 Known Issues / Limitations

1. **Demo IDs**: All tour IDs and operator ID are fictional (prefixed with `demo_`)
2. **Image Placeholders**: Uses emoji/gradient placeholders instead of real images
3. **Script Path**: Currently pointing to local build - update for production testing
4. **CORS**: If testing with file:// protocol, you may encounter CORS issues

## 📝 Notes for Real Operators

When real operators integrate VAI, they would:

1. **Copy the script tag only:**
   ```html
   <script src="https://embed.vai.studio/button.js"></script>
   ```

2. **Add data attributes to their existing buttons:**
   ```html
   <button
     data-vai-operator="[YOUR_OPERATOR_ID]"
     data-vai-tour="[YOUR_TOUR_ID]"
     data-vai-theme="[YOUR_BRAND_COLOR]"
   >
     Book This Tour
   </button>
   ```

3. **That's it!** No CSS needed, no custom JavaScript, no complex integration.

## 🎨 Customization Options

Operators can customize:
- `data-vai-theme` - Brand color for modal elements
- `data-vai-dark` - Force dark/light mode (`"true"` or `"false"`)
- `data-vai-schedule` - Pre-select specific schedule
- `data-vai-participants` - Pre-fill participant count

## 🔗 Related Files

- **Embed Widget Source**: `/tourist-app/src/embed/button/`
- **Built Widget**: `/tourist-app/dist/embed/button.js`
- **Spec Document**: `/tourist-app/documentation/implementation and concepts/embed system/VAI_EMBED_WIDGET_MVP_SPEC.md`

## ✅ Success Criteria

This sample helps validate:
- ✅ Widget integrates seamlessly with operator websites
- ✅ No styling conflicts with operator's CSS
- ✅ Bundle size remains under 12KB gzipped
- ✅ Works in light and dark mode
- ✅ Mobile responsive
- ✅ Accessible (keyboard navigation, ARIA labels)
- ✅ Analytics events tracked correctly

## 📞 Support

For questions about the VAI Embed Widget:
- **Documentation**: See `/tourist-app/documentation/implementation and concepts/embed system/`
- **Issues**: Report to VAI development team
- **Production URL**: `https://embed.vai.studio/button.js` (when deployed)

---

**Created:** October 2025
**Purpose:** VAI Embed Widget MVP Testing
**Status:** Development Sample
