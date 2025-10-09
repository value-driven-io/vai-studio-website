# VAI Embed Widget - MVP Specification

**Version:** 2.0 (Lean)
**Date:** October 8, 2025
**Status:** Ready for Implementation
**Owner:** Kevin De Silva

---

## 1. What We're Building

### The MVP
A **lightweight button script** that operators can add to their websites. When clicked, opens a modal overlay showing VAI's booking flow.

**Tourist Experience:**
1. Visits `moorea-diving.pf` (operator's site)
2. Clicks "Book Whale Watching Tour"
3. **Modal opens on operator's site** (URL stays `moorea-diving.pf`)
4. VAI booking flow inside modal (same as Tourist App)
5. After booking, modal closes → back to operator's site

**Why This Matters:**
- Tourists don't feel "redirected to third party"
- Operators keep bookings on their branded domain
- VAI still processes payment (11% commission maintained)

---

## 2. Technical Architecture

```
tourist-app/
├── src/
│   ├── embed/                           # NEW
│   │   ├── button/
│   │   │   ├── index.js                 # Auto-initializes on page load
│   │   │   ├── modal.js                 # Creates overlay + iframe
│   │   │   └── styles.css               # Inline CSS (no Tailwind)
│   │   └── EmbedModeLayout.jsx          # Tourist App wrapper (hides nav/footer)
│   ├── App.jsx                          # Detects ?embed=true parameter
│   └── lib/
│       └── analytics.js                 # Stubbed (console.log) - see VAI_UNIFIED_ANALYTICS_SYSTEM.md
├── vite.config.js                       # Main app build
├── vite.config.embed.js                 # NEW: Embed script build
└── package.json

# Build outputs:
npm run build       → dist/          → app.vai.studio (Tourist App)
npm run build:embed → dist-embed/button.js → embed.vai.studio/button.js
```

**Key Decision:** Monorepo (embed code lives in `tourist-app`)

---

## 3. Implementation Plan

### Week 1-2: Foundation

**Task 1: Setup Embed Module**
```bash
# Create directory structure
mkdir -p src/embed/button
touch src/embed/button/index.js
touch src/embed/button/modal.js
touch src/embed/button/styles.css
touch src/embed/button/i18n.js        # NEW: English + French translations
touch src/lib/analytics/stub.js       # NEW: Analytics stub
touch vite.config.embed.js
```

**Task 2: Build Button Script** (Core Logic with i18n, theme, dark mode)
```javascript
// src/embed/button/index.js
import { t } from './i18n.js';
import { createModalOverlay } from './modal.js';
import { track } from '@/lib/analytics/stub.js';

class VAIEmbedWidget {
  init() {
    // Find all buttons with data-vai-tour-id
    document.querySelectorAll('[data-vai-tour-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tourId = btn.dataset.vaiTourId;
        const operatorId = btn.dataset.vaiOperatorId;
        const themeColor = btn.dataset.vaiThemeColor; // NEW: Theme customization

        // Track widget interaction
        track('embed.modal.opened', { operator_id: operatorId, tour_id: tourId });

        this.openModal(tourId, operatorId, themeColor);
      });

      // Track widget load
      track('embed.widget.loaded', {
        operator_id: btn.dataset.vaiOperatorId,
        tour_id: btn.dataset.vaiTourId,
        page_url: window.location.href
      });
    });
  }

  openModal(tourId, operatorId, themeColor = null) {
    // Detect dark mode from operator's site
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                       document.documentElement.classList.contains('dark');

    // Create overlay with dark mode support
    const modal = createModalOverlay(isDarkMode, themeColor);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://app.vai.studio/tour/${tourId}?embed=true&source=${operatorId}`;
    iframe.allow = 'payment';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';

    modal.querySelector('.vai-modal-content').appendChild(iframe);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent scroll

    // Listen for booking completion
    this.setupMessageListener(modal, operatorId, tourId);
  }

  setupMessageListener(modal, operatorId, tourId) {
    const handler = (e) => {
      if (e.origin === 'https://app.vai.studio' && e.data.type === 'VAI_BOOKING_COMPLETE') {
        // Track conversion
        track('embed.booking.completed', {
          operator_id: operatorId,
          tour_id: tourId,
          booking_id: e.data.bookingId,
          page_url: window.location.href
        });

        this.closeModal(modal);
        window.removeEventListener('message', handler);
      }
    };

    window.addEventListener('message', handler);
  }

  closeModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new VAIEmbedWidget().init());
} else {
  new VAIEmbedWidget().init();
}
```

**Task 3: Build i18n Module** (English + French)
```javascript
// src/embed/button/i18n.js
const translations = {
  en: {
    close: 'Close',
    loading: 'Loading...',
    error: 'Connection failed. Please try again.'
  },
  fr: {
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Échec de connexion. Veuillez réessayer.'
  }
};

function getLanguage() {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('fr')) return 'fr';
  return 'en'; // Default to English
}

export const t = (key) => {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations.en[key];
};
```

**Task 4: Build Modal Component** (with dark mode + theme colors)
```javascript
// src/embed/button/modal.js
import { t } from './i18n.js';

export function createModalOverlay(isDarkMode = false, themeColor = null) {
  const overlay = document.createElement('div');
  overlay.className = `vai-modal-overlay${isDarkMode ? ' dark-mode' : ''}`;

  // Apply custom theme color if provided
  if (themeColor) {
    overlay.style.setProperty('--vai-theme-color', themeColor);
  }

  overlay.innerHTML = `
    <div class="vai-modal-content">
      <button class="vai-modal-close" aria-label="${t('close')}">
        <span aria-hidden="true">×</span>
      </button>
      <div class="vai-modal-loading">${t('loading')}</div>
    </div>
  `;

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });

  // Close on button click
  overlay.querySelector('.vai-modal-close').addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return overlay;
}
```

**Task 5: Create Inline CSS** (with theme variables + dark mode)
```css
/* src/embed/button/styles.css */

/* Modal Overlay */
.vai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-in;
}

/* Dark mode */
.vai-modal-overlay.dark-mode {
  background: rgba(0, 0, 0, 0.95);
}

/* Modal Content */
.vai-modal-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.vai-modal-overlay.dark-mode .vai-modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
}

/* Close Button */
.vai-modal-close {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vai-theme-color, #10b981); /* Uses custom color or default */
  color: white;
  border: 2px solid white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.vai-modal-close:hover {
  transform: scale(1.1);
  background: var(--vai-theme-color, #059669); /* Darker on hover */
}

/* Loading State */
.vai-modal-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 16px;
  font-family: system-ui, -apple-system, sans-serif;
}

.vai-modal-overlay.dark-mode .vai-modal-loading {
  color: #999;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .vai-modal-content {
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
  }

  .vai-modal-close {
    top: 10px;
    right: 10px;
  }
}
```

**Task 6: Stub Analytics Module**
```javascript
// src/lib/analytics/stub.js
/**
 * Analytics stub for MVP
 * Later: Replace with full implementation (see VAI_UNIFIED_ANALYTICS_SYSTEM.md)
 */
export const track = (eventName, properties = {}) => {
  console.log('[VAI Analytics]', eventName, {
    timestamp: new Date().toISOString(),
    ...properties
  });

  // TODO: In production, write to events table
  // await supabase.from('events').insert({ event_name: eventName, properties, ... });
};
```

**Task 3: Tourist App Embed Mode**
```javascript
// src/App.jsx
const [embedMode, setEmbedMode] = useState(false);

useEffect(() => {
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true';
  setEmbedMode(isEmbed);
}, []);

return (
  <div className={embedMode ? 'embed-mode' : ''}>
    {!embedMode && <Header />}
    <Routes>{/* ... */}</Routes>
    {!embedMode && <Footer />}
  </div>
);
```

**Task 4: PostMessage Communication**
```javascript
// In booking confirmation page
if (embedMode) {
  window.parent.postMessage({
    type: 'VAI_BOOKING_COMPLETE',
    bookingId: booking.id,
    bookingReference: booking.booking_reference
  }, '*');
}
```

---

### Week 3-4: Beta Testing
- Onboard 5 operators with existing websites
- Collect feedback on integration difficulty
- Measure conversion rate (widget clicks → bookings)
- Iterate based on real usage

---

### Week 5-6: Production Launch
- Deploy to `embed.vai.studio`
- Add "Get Embed Code" button in Operator Dashboard
- Write documentation (see Section 6)
- Launch to 20-50 operators

---

## 4. Operator Integration (How They Use It)

### Basic Integration

```html
<!-- Step 1: Add script (once, before </body>) -->
<script src="https://embed.vai.studio/button.js"></script>

<!-- Step 2: Add button for each tour -->
<button
  data-vai-tour-id="whale-watching-abc123"
  data-vai-operator-id="moorea-diving"
>
  Book Whale Watching Tour
</button>
```

**That's it.** No API keys, no configuration, copy-paste only.

---

### Advanced: Custom Brand Color (Optional)

Operators can match VAI's modal to their brand color:

```html
<button
  data-vai-tour-id="whale-watching-abc123"
  data-vai-operator-id="moorea-diving"
  data-vai-theme-color="#0066cc"  <!-- Custom brand color -->
  style="background: #0066cc; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;"
>
  Book Whale Watching Tour
</button>
```

**Result:** Modal's close button uses `#0066cc` instead of VAI's default green.

---

### Features Included Automatically

- ✅ **Multi-language**: Auto-detects French vs English (based on browser)
- ✅ **Dark mode**: Auto-detects operator's site theme (light/dark)
- ✅ **Mobile responsive**: Works on all devices
- ✅ **Analytics**: Tracked automatically (widget loads, conversions)
- ✅ **Real-time availability**: Synced with VAI platform
- ✅ **Secure payments**: Stripe PCI compliant (iframe isolation)

---

## 5. Finalized Decisions ✅

All decisions confirmed on October 8, 2025:

### Q1: Styling Approach ✅ CONFIRMED
**Decision:** Inline CSS (no Tailwind)

**Implementation:**
- Keep button script lightweight (<10KB)
- Modal overlay uses vanilla CSS
- Tourist App inside iframe uses Tailwind (unchanged)
- No conflicts with operator's site styling

---

### Q2: Multi-Language Support ✅ CONFIRMED
**Decision:** English + French (MVP)

**What needs translation:**
- Close button: "Close" / "Fermer"
- Loading state: "Loading..." / "Chargement..."
- Error message: "Connection failed" / "Échec de connexion"

**Implementation:**
```javascript
// src/embed/button/i18n.js
const translations = {
  en: { close: 'Close', loading: 'Loading...', error: 'Connection failed' },
  fr: { close: 'Fermer', loading: 'Chargement...', error: 'Échec de connexion' }
};

function getLanguage() {
  return navigator.language.startsWith('fr') ? 'fr' : 'en';
}

export const t = (key) => translations[getLanguage()][key];
```

**Effort:** 15 minutes
**Note:** Tourist App inside iframe already has 8 languages (no changes needed)

---

### Q3: Analytics ✅ CONFIRMED
**Decision:** Stubbed for MVP (console.log), ready for unified analytics module

**Implementation:**
```javascript
// src/lib/analytics/stub.js (MVP)
export const track = (eventName, properties) => {
  console.log('[VAI Analytics]', eventName, properties);
  // Future: Will write to events table (see VAI_UNIFIED_ANALYTICS_SYSTEM.md)
};

// Usage in button script
import { track } from '@/lib/analytics';
track('embed.widget.loaded', { operator_id, tour_id });
```

**Post-MVP:** Replace stub with full analytics module (batched writes to `events` table)

---

### Q4: Documentation ✅ CONFIRMED
**Decision:** Write during beta testing (Week 3-4)

**Timeline:**
- Week 3: Draft integration guide based on beta operator feedback
- Week 4: Refine documentation with real issues encountered
- Week 5: Create 5-minute video tutorial (screen recording)

---

### Q5a: Theme Color Customization ✅ CONFIRMED
**Decision:** Include in MVP (simple CSS variable approach)

**Implementation:**
```html
<!-- Operator adds custom brand color -->
<button
  data-vai-tour-id="abc-123"
  data-vai-theme-color="#0066cc"
>
```

```javascript
// Button script applies color
openModal(tourId, operatorId, themeColor) {
  const modal = this.createModalOverlay();
  if (themeColor) {
    modal.style.setProperty('--vai-theme-color', themeColor);
  }
}
```

```css
/* CSS uses variable with fallback */
.vai-modal-close {
  background: var(--vai-theme-color, #10b981); /* Default: VAI green */
}
```

**Effort:** 10 minutes

---

### Q5b: Dark Mode Support ✅ CONFIRMED
**Decision:** Auto-detect operator's site color scheme

**Implementation:**
```javascript
// Detect dark mode
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                   document.documentElement.classList.contains('dark');

const modal = this.createModalOverlay();
if (isDarkMode) {
  modal.classList.add('dark-mode');
}
```

```css
/* Light mode (default) */
.vai-modal-overlay { background: rgba(0, 0, 0, 0.8); }
.vai-modal-content { background: white; }

/* Dark mode */
.vai-modal-overlay.dark-mode { background: rgba(0, 0, 0, 0.95); }
.vai-modal-overlay.dark-mode .vai-modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
}
```

**Effort:** 20 minutes
**Note:** Tourist App inside iframe already handles dark mode (no changes needed)

---

### Total Added Scope
**Extra Implementation Time:** ~45 minutes (English/French + Theme colors + Dark mode)
**Bundle Size Impact:** +2KB (translations + CSS variables)
**Final Bundle Target:** <12KB (gzipped)

---

## 6. Success Metrics

### Must Achieve (Month 3):
- ✅ 50+ operators integrated
- ✅ Conversion rate >2% (widget clicks → bookings)
- ✅ <5 support tickets/week
- ✅ Zero cannibalization (VAI Tickets traffic stable)

### Measuring Success:
```javascript
// Stub analytics (console.log)
track('embed.widget.loaded', { operator_id, tour_id });
track('embed.modal.opened', { operator_id, tour_id });
track('embed.booking.completed', { booking_id, operator_id });

// Later: Query events table
SELECT
  COUNT(*) FILTER (WHERE event_name = 'embed.widget.loaded') AS loads,
  COUNT(*) FILTER (WHERE event_name = 'embed.booking.completed') AS bookings,
  (bookings::float / loads) * 100 AS conversion_rate
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## 7. What's NOT in MVP (Future Iterations)

### Phase 2 (Month 6-9):
- [ ] Multi-language support (French, Spanish, Tahitian)
- [ ] Custom theming (operator can set modal colors)
- [ ] Preloading (faster modal open)
- [ ] Full analytics dashboards

### Phase 3 (Month 12+):
- [ ] JavaScript SDK (native integration, no iframe)
- [ ] Headless API (operators build custom booking UI)
- [ ] White-label platform (tourism boards deploy branded marketplaces)

---

## 8. Recommendations (Industry Best Practices)

### From an Award-Winning Engineer's Perspective:

#### 1. **Ship Fast, Iterate Faster**
- ✅ Don't over-engineer MVP
- ✅ 6-week timeline is aggressive but doable
- ✅ Get to beta testing by Week 3 (real feedback > perfect code)

#### 2. **Bundle Size is King**
- ✅ Target: <10KB for button.js (gzipped)
- ✅ No Tailwind in embed script (inline CSS only)
- ✅ No heavy dependencies (vanilla JS preferred)

#### 3. **Security First**
- ✅ Origin validation in postMessage
- ✅ Payment stays in iframe (PCI compliant)
- ✅ No API keys exposed (public button script)

#### 4. **Developer Experience Matters**
- ✅ Copy-paste integration (no config files)
- ✅ Self-service "Get Embed Code" in dashboard
- ✅ Fail gracefully (if script errors, show fallback link)

#### 5. **Measure What Matters**
- ✅ Conversion rate (not just loads)
- ✅ Operator adoption rate (50+ by Month 3)
- ✅ Support burden (<5 tickets/week)

#### 6. **Preserve VAI Platform Benefits**

| Benefit | How Embed Widget Preserves It |
|---------|-------------------------------|
| **8-language support** | iframe loads Tourist App (already localized) |
| **Tailwind design system** | Tourist App inside iframe uses Tailwind |
| **Real-time availability** | iframe connects to same Supabase backend |
| **11% commission** | All bookings still processed by VAI |
| **7-day XPF payouts** | Payment flow unchanged |
| **Stripe security** | Payment happens in iframe (PCI compliant) |

---

## 9. Next Steps

### Immediate (Before Week 1):
- [ ] ✅ Confirm all 5 alignment questions (Section 5)
- [ ] Assign frontend developer
- [ ] Assign backend developer (for deployment/analytics stub)

### Week 1 Kickoff:
- [ ] Create `/src/embed/` directory structure
- [ ] Setup `vite.config.embed.js`
- [ ] Write button script (index.js, modal.js, styles.css)
- [ ] Test locally (create test operator site)

---

## 10. Related Documents

- [VAI Unified Analytics System](../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md) - How analytics works (separate project)
- [Tourist App Master Spec](../../VAI_TICKETS_MASTER_SPECIFICATION.md)
- [Operator Dashboard Master Spec](../../../../operator-dashboard/documentation/VAI_OPERATOR_DASHBOARD_MASTER_SPECIFICATION.md)
- [Business Plan](../../../../../presentation/VAI/businessplan/en.json)

---

## Document Status

**Version:** 2.1 - Finalized & Ready
**Date:** October 8, 2025
**Status:** ✅ **READY FOR WEEK 1 IMPLEMENTATION**

### All Decisions Confirmed ✅
- Q1: Inline CSS (no Tailwind)
- Q2: English + French
- Q3: Analytics stubbed (ready for module)
- Q4: Docs during beta (Week 3-4)
- Q5a: Theme colors included
- Q5b: Dark mode included

### Implementation Scope
**Core Features:**
- Modal overlay booking widget
- English + French translations
- Dark mode auto-detection
- Custom theme colors (CSS variables)
- Analytics stubbed (console.log → ready for events table)
- Tourist App embed mode
- postMessage communication

**Bundle Target:** <12KB (gzipped)
**Timeline:** 6 weeks MVP + 3 months validation
**Success Criteria:** 50+ operators, >2% conversion, <5 tickets/week

---

## Next Steps - Ready to Start

### Pre-Week 1 (Assign Resources):
- [ ] Assign frontend developer
- [ ] Assign backend developer (deployment + analytics stub)
- [ ] Confirm 6-week timeline with team

### Week 1 Kickoff Checklist:
```bash
# 1. Create directory structure
cd /Users/desilva/Desktop/vai-studio-website/tourist-app
mkdir -p src/embed/button
mkdir -p src/lib/analytics

# 2. Create files
touch src/embed/button/index.js
touch src/embed/button/modal.js
touch src/embed/button/styles.css
touch src/embed/button/i18n.js
touch src/lib/analytics/stub.js
touch vite.config.embed.js

# 3. Update package.json
# Add: "build:embed": "vite build --config vite.config.embed.js"

# 4. Start coding (all specs in Section 3)
```

### Development Tracker (Todo List Active)
Use the todo system to track:
- [x] Update MVP spec with finalized decisions
- [x] Update implementation plan with new features
- [x] Update operator integration examples
- [x] Finalize MVP spec document
- [ ] Setup embed module directory structure
- [ ] Create vite.config.embed.js
- [ ] Build button script core (index.js)
- [ ] Build modal component (modal.js)
- [ ] Create inline CSS (styles.css)
- [ ] Add i18n module (i18n.js)
- [ ] Implement dark mode detection
- [ ] Implement theme color customization
- [ ] Add Tourist App embed mode detection
- [ ] Implement postMessage communication
- [ ] Stub analytics module
- [ ] Create test operator website
- [ ] Test locally (Chrome, Safari, Firefox)

---

## Questions or Blockers?

**Contact:** Kevin De Silva (kevin@vai.studio)
**Related Docs:**
- [Analytics System](../analytics/VAI_UNIFIED_ANALYTICS_SYSTEM.md)
- [Tourist App Master Spec](../../VAI_TICKETS_MASTER_SPECIFICATION.md)
- [Business Plan](../../../../../presentation/VAI/businessplan/en.json)
