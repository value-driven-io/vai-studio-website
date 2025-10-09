# VAI Embed Widget System - Project Specification

**Version:** 1.0
**Date:** October 8, 2025
**Status:** Planning Phase
**Owner:** Kevin De Silva
**Strategic Priority:** Medium (Post Channel Manager MVP)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Strategic Context](#2-strategic-context)
3. [Technical Architecture](#3-technical-architecture)
4. [Implementation Specification](#4-implementation-specification)
5. [Timeline & Milestones](#5-timeline--milestones)
6. [Success Metrics](#6-success-metrics)
7. [Progress Log](#7-progress-log)
8. [Technical Decisions](#8-technical-decisions)
9. [Risks & Mitigation](#9-risks--mitigation)
10. [Future Roadmap](#10-future-roadmap)

---

## 1. Executive Summary

### Vision
Transform VAI from a standalone marketplace into **embeddable booking infrastructure** that operators can integrate into their own websites, while maintaining VAI's core business model (11% commission, 7-day XPF payouts).

### Problem Being Solved
**Target Segment:** 200-500 operators (10-12% of market) who already have websites but lack booking functionality.

**Current Pain Points:**
- Operators with websites can only link to `app.vai.studio` (redirects tourists away from their brand)
- Tourists perceive redirection as "third-party booking" (trust friction)
- Operators lose conversion due to external redirect (estimated 15-25% drop)
- No alternative to expensive booking systems (€200-500/month)

### MVP Approach: Modal Overlay Widget
**What:** Lightweight embed script that opens VAI booking flow in a modal overlay on operator's website.

**How Tourist Experiences It:**
1. Tourist visits `moorea-diving.pf`
2. Clicks "Book Whale Watching Tour"
3. Modal overlay appears (URL stays `moorea-diving.pf`)
4. VAI booking flow inside modal
5. After booking, modal closes → back to operator site

**Value Proposition:**
- **For Operators:** Bookings happen on their domain (brand consistency), no redirection friction
- **For VAI:** Become embedded infrastructure (like Stripe for payments), still collect 11% commission
- **For Tourists:** Seamless experience, no perception of "leaving operator's site"

### MVP Scope
- **Modal Overlay Button** (Pattern B from implementation analysis)
- **Monorepo Integration** (embed code lives in `tourist-app` repo)
- **Anonymous Booking** (guest checkout, no login required)
- **Modular Analytics** (leverage unified platform analytics system, not embed-specific)

### Development Estimate
- **Timeline:** 2-3 months (assuming dedicated focus)
- **Effort:** 60-80 hours of development
- **Resources:** 1 frontend developer, 1 backend developer (part-time)

---

## 2. Strategic Context

### Alignment with VAI Business Plan

#### From Business Plan: "Channel Manager is our competitive moat"
The embed widget **strengthens** this positioning by:
- Making operator's own website another channel synchronized with VAI calendar
- Validating the claim: *"Manage availability across all channels from one calendar"*
- Proving VAI is infrastructure, not just a marketplace

#### From Business Plan: "11% Fair Commission to repatriate capital"
The embed widget **maintains** this model:
- All bookings still process through VAI backend
- Commission remains 11% (no change)
- Operators still get 7-day XPF payouts
- Replaces Viator/GetYourGuide widgets (20-30% commission) on operator sites

#### From Business Plan: "Addressing Digital Invisibility"
The embed widget **complements** but does not replace:
- **Primary solution (90% of operators):** Free one-pager websites on VAI domain
- **Secondary solution (10% of operators):** Embed widget for those with existing sites
- Does not cannibalize the core VAI Tickets discovery marketplace

### Target Market Sizing

| Operator Segment | Size Estimate | VAI Current Solution | Embed Widget Fit |
|------------------|---------------|----------------------|------------------|
| **Segment A:** No website, digitally invisible | ~4,000 operators | ✅ Free one-pager (vai.studio/operator/xxx) | ❌ Not needed |
| **Segment B:** Has website, no booking system | ~200-500 operators | ⚠️ Can only link to app.vai.studio | ✅ **Primary target** |
| **Segment C:** Third-party platforms (hotels, DMCs, blogs) | ~50-100 entities | ❌ No solution | ✅ Strategic opportunity |

**Total Addressable Market for Embed Widget:** 250-600 entities

### Strategic Risks to Monitor

#### Risk 1: Marketplace Cannibalization
**Threat:** Tourists book directly on operator sites → VAI Tickets marketplace sees less traffic
**Impact:** Undermines mood-based discovery, tourism dispersal goals
**Mitigation:**
- Widget only works for **direct traffic** (tourists who already found operator)
- VAI Tickets remains **discovery engine** for new customer acquisition
- Track both channels separately in analytics

#### Risk 2: Premature Scaling
**Threat:** Building this before Channel Manager MVP validated
**Impact:** Distraction from core product-market fit
**Decision:** Embed widget is **Phase 2** (after Channel Manager proves demand)

---

## 3. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VAI Embed Widget System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐                                   │
│  │  Operator's Website       │                                   │
│  │  (moorea-diving.pf)       │                                   │
│  │                           │                                   │
│  │  ┌─────────────────────┐ │                                   │
│  │  │ <button> Book Now   │ │  ← Operator pastes snippet       │
│  │  └─────────────────────┘ │                                   │
│  │                           │                                   │
│  │  <script src=            │                                   │
│  │   "embed.vai.studio/     │                                   │
│  │    button.js">           │                                   │
│  └──────────┬───────────────┘                                   │
│             │                                                     │
│             │ On Click                                           │
│             ▼                                                     │
│  ┌──────────────────────────┐                                   │
│  │  Modal Overlay (Full-    │                                   │
│  │  screen on operator site)│                                   │
│  │  ┌────────────────────┐  │                                   │
│  │  │ <iframe>           │  │                                   │
│  │  │ src="app.vai.studio│  │                                   │
│  │  │ /tour/xxx?embed=1" │  │                                   │
│  │  └────────────────────┘  │                                   │
│  └──────────┬───────────────┘                                   │
│             │                                                     │
│             │ Loads                                              │
│             ▼                                                     │
│  ┌──────────────────────────┐                                   │
│  │  Tourist App             │                                   │
│  │  (app.vai.studio)        │                                   │
│  │  • Detects ?embed=true   │                                   │
│  │  • Hides nav/footer      │                                   │
│  │  • Optimized for modal   │                                   │
│  │  • Same booking flow     │                                   │
│  └──────────┬───────────────┘                                   │
│             │                                                     │
│             │ Booking Complete                                   │
│             ▼                                                     │
│  ┌──────────────────────────┐                                   │
│  │  PostMessage to Parent   │                                   │
│  │  { type: 'BOOKING_       │                                   │
│  │    COMPLETE',             │                                   │
│  │    bookingId: 'xxx' }    │                                   │
│  └──────────┬───────────────┘                                   │
│             │                                                     │
│             │ Close Modal                                        │
│             ▼                                                     │
│  ┌──────────────────────────┐                                   │
│  │  Back to Operator Site   │                                   │
│  │  (moorea-diving.pf)      │                                   │
│  │  Success message shown   │                                   │
│  └──────────────────────────┘                                   │
│                                                                   │
│  Backend: Supabase + Stripe (no changes needed)                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Component 1: Embed Button Script
**Repository:** `tourist-app/src/embed/` (monorepo)
**Deployed to:** `embed.vai.studio/button.js`
**Purpose:** Lightweight script that creates modal overlay with iframe

**Responsibilities:**
- Detect button elements with `data-vai-*` attributes
- Create modal overlay on click
- Load Tourist App in iframe with `?embed=true` parameter
- Listen for `postMessage` events from iframe
- Close modal on booking completion
- Fire analytics events via unified analytics module

**Bundle Size Target:** <10KB (gzipped)
**Build Output:** Separate from main Tourist App bundle (independent deployment)

#### Component 2: Tourist App Embed Mode
**Repository:** `tourist-app` (existing)
**Deployed to:** `app.vai.studio`
**Changes Required:** Detect embed mode, adjust UI

**Modifications:**
1. Detect URL parameter `?embed=true`
2. When embed mode active:
   - Hide navigation bar
   - Hide footer
   - Remove padding/margins (use full modal height)
   - Disable PWA install prompts
   - Track embed source (which operator's site)
3. After booking completion:
   - Send `postMessage` to parent window
   - Don't redirect to journey tab (stay on booking confirmation)

#### Component 3: Backend (Supabase)
**Changes Required:** Minimal - leverages unified analytics system

**No Embed-Specific Tables Required**

The embed widget will use the **modular VAI Analytics System** (separate project), which tracks all user interactions across the platform. See Section 11 (Modular Analytics Design) for details.

**What Embed Widget Needs:**
```javascript
// Import shared analytics module
import { trackEvent } from '@/lib/analytics';

// Track embed-specific events
trackEvent('embed.widget.loaded', {
  source: 'embed',
  channel: 'operator_website',
  operator_id: 'moorea-diving',
  tour_id: 'whale-watching-abc123',
  page_url: window.location.href,
  referrer: document.referrer
});

trackEvent('embed.booking.completed', {
  source: 'embed',
  channel: 'operator_website',
  operator_id: 'moorea-diving',
  booking_id: 'abc-123-def'
});
```

**Analytics Module Handles:**
- Storage (unified `events` table)
- Batching (reduces database writes)
- Privacy compliance (anonymization)
- Aggregation (conversion funnels, dashboards)

**Result:** Embed widget is analytics-agnostic. If analytics system changes, embed code unchanged.

---

## 4. Implementation Specification

### Phase 1: Foundation (Weeks 1-2)

#### Task 1.1: Setup Embed Module in Monorepo
**Owner:** Kevin
**Effort:** 2 hours
**Deliverables:**
- Create `/tourist-app/src/embed/` directory
- Configure Vite for multiple build outputs (main app + embed script)
- Setup deployment pipeline to `embed.vai.studio`

**Directory Structure:**
```
tourist-app/
├── src/
│   ├── embed/                    # NEW: Embed module
│   │   ├── button/
│   │   │   ├── index.js          # Entry point, auto-initializes
│   │   │   ├── modal.js          # Modal overlay creation
│   │   │   ├── iframe-handler.js # iframe messaging logic
│   │   │   └── styles.css        # Minimal modal styles
│   │   ├── EmbedModeLayout.jsx   # Embed-specific UI wrapper
│   │   └── README.md             # Embed documentation
│   ├── App.jsx                   # Detects embed mode
│   ├── pages/                    # Existing Tourist App pages
│   └── components/               # Existing components
├── vite.config.js                # UPDATED: Multiple entry points
├── vite.config.embed.js          # NEW: Embed-specific build config
└── package.json

**Vite Configuration (Multiple Builds):**
// vite.config.embed.js - Separate build for embed script

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/embed/button/index.js',
      name: 'VAIEmbed',
      fileName: 'button',
      formats: ['iife'] // Immediately invoked for <script> tag
    },
    outDir: 'dist-embed',
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    },
    minify: 'terser'
  }
});

**Package.json Scripts:**
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:embed": "vite build --config vite.config.embed.js",
    "build:all": "npm run build && npm run build:embed"
  }
}

**Result:**
- Main Tourist App: dist/ → app.vai.studio
- Embed Script: dist-embed/button.js → embed.vai.studio/button.js
```

#### Task 1.2: Build Embed Button Script
**Owner:** Frontend Developer
**Effort:** 16 hours
**Acceptance Criteria:**
- Script auto-initializes on page load
- Detects all elements with `data-vai-tour-id` attribute
- Creates click handlers
- Opens full-screen modal with close button (X in top-right)
- Modal responsive on mobile (100vw x 100vh)
- Escape key closes modal
- Click outside modal closes it

**Code Spec:**
```javascript
// src/index.js

class VAIEmbedWidget {
  constructor() {
    this.modal = null;
    this.iframe = null;
  }

  init() {
    // Find all booking buttons
    const buttons = document.querySelectorAll('[data-vai-tour-id]');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tourId = btn.dataset.vaiTourId;
        const operatorId = btn.dataset.vaiOperatorId || '';
        this.openModal(tourId, operatorId);
      });

      // Add visual indicator (optional)
      btn.classList.add('vai-booking-button');
    });
  }

  openModal(tourId, operatorId) {
    // Create modal overlay
    this.modal = this.createModalOverlay();

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = `https://app.vai.studio/tour/${tourId}?embed=true&source=${operatorId}`;
    this.iframe.allow = 'payment'; // Required for Stripe
    this.iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;

    // Append iframe to modal
    const modalContent = this.modal.querySelector('.vai-modal-content');
    modalContent.appendChild(this.iframe);

    // Add to DOM
    document.body.appendChild(this.modal);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Listen for booking completion
    this.setupMessageListener();
  }

  createModalOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'vai-modal-overlay';
    overlay.style.cssText = `
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
    `;

    const content = document.createElement('div');
    content.className = 'vai-modal-content';
    content.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 800px;
      height: 90vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'vai-modal-close';
    closeBtn.style.cssText = `
      position: absolute;
      top: -15px;
      right: -15px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      border: 2px solid #333;
      font-size: 24px;
      cursor: pointer;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.addEventListener('click', () => this.closeModal());

    content.appendChild(closeBtn);
    overlay.appendChild(content);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });

    return overlay;
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security: Verify origin
      if (event.origin !== 'https://app.vai.studio') return;

      if (event.data.type === 'VAI_BOOKING_COMPLETE') {
        // Booking completed successfully
        console.log('Booking completed:', event.data.bookingId);

        // Optional: Track conversion
        this.trackEvent('booking_completed', event.data);

        // Close modal
        this.closeModal();

        // Optional: Show success message on operator site
        this.showSuccessMessage(event.data);
      }
    });
  }

  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.iframe = null;
      document.body.style.overflow = ''; // Restore scroll
    }
  }

  trackEvent(eventType, data) {
    // Use unified analytics module (not embed-specific)
    // Import: import { track } from '@/lib/analytics'
    if (window.VAI_Analytics) {
      window.VAI_Analytics.track(`embed.${eventType}`, {
        source: 'embed',
        channel: 'operator_website',
        ...data
      });
    }
  }

  showSuccessMessage(data) {
    // Optional: Show toast notification on operator's site
    const toast = document.createElement('div');
    toast.textContent = `Booking confirmed! Reference: ${data.bookingReference}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VAIEmbedWidget().init();
  });
} else {
  new VAIEmbedWidget().init();
}
```

#### Task 1.3: Tourist App Embed Mode Detection
**Owner:** Frontend Developer
**Effort:** 8 hours
**Location:** `tourist-app/src/App.jsx`

**Changes Required:**
```javascript
// tourist-app/src/App.jsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function App() {
  const [searchParams] = useSearchParams();
  const [embedMode, setEmbedMode] = useState(false);
  const [embedSource, setEmbedSource] = useState(null);

  useEffect(() => {
    // Detect embed mode from URL parameters
    const isEmbed = searchParams.get('embed') === 'true';
    const source = searchParams.get('source'); // operator ID

    setEmbedMode(isEmbed);
    setEmbedSource(source);

    // Track embed session
    if (isEmbed && source) {
      analytics.track('embed_session_started', {
        source,
        referrer: document.referrer
      });
    }
  }, [searchParams]);

  return (
    <div className={`app ${embedMode ? 'embed-mode' : ''}`}>
      {/* Conditionally render header */}
      {!embedMode && <Header />}

      {/* Main content */}
      <Routes>
        {/* ... existing routes ... */}
      </Routes>

      {/* Conditionally render footer */}
      {!embedMode && <Footer />}
    </div>
  );
}
```

**CSS Changes:**
```css
/* tourist-app/src/index.css */

/* Embed mode styles */
.app.embed-mode {
  /* Remove padding/margins for full modal use */
  padding: 0;
  margin: 0;
}

.app.embed-mode .pwa-install-prompt {
  /* Hide PWA install banner in embed mode */
  display: none !important;
}

.app.embed-mode .page-container {
  /* Optimize for modal height */
  min-height: auto;
  padding: 20px;
}
```

**Booking Completion Handler:**
```javascript
// tourist-app/src/pages/TourBooking/BookingConfirmation.jsx

useEffect(() => {
  // If in embed mode, notify parent window
  if (embedMode) {
    window.parent.postMessage({
      type: 'VAI_BOOKING_COMPLETE',
      bookingId: booking.id,
      bookingReference: booking.booking_reference,
      tourId: booking.tour_id,
      amount: booking.total_amount
    }, '*'); // In production: restrict to operator domains
  }
}, [booking, embedMode]);
```

---

### Phase 2: Testing & Refinement (Weeks 3-4)

#### Task 2.1: Local Testing Environment
**Owner:** Frontend Developer
**Effort:** 4 hours
**Deliverables:**
- Create test HTML page simulating operator website
- Test modal overlay behavior
- Test iframe messaging
- Test on multiple browsers (Chrome, Safari, Firefox, Mobile Safari, Mobile Chrome)

**Test Page:**
```html
<!-- test-operator-site.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Operator Site - Moorea Diving</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .hero {
      background: #0066cc;
      color: white;
      padding: 60px 20px;
      text-align: center;
      margin-bottom: 40px;
    }
    .tour-card {
      border: 1px solid #ddd;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .book-button {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Moorea Diving Adventures</h1>
    <p>Discover the underwater paradise of French Polynesia</p>
  </div>

  <div class="tour-card">
    <h2>Whale Watching Tour</h2>
    <p>Experience the majesty of humpback whales in their natural habitat.</p>
    <p><strong>Price:</strong> 26,000 XPF per adult</p>

    <!-- VAI Embed Widget Integration -->
    <button
      class="book-button"
      data-vai-tour-id="whale-watching-abc123"
      data-vai-operator-id="moorea-diving"
    >
      Book This Tour
    </button>
  </div>

  <div class="tour-card">
    <h2>Snorkeling Adventure</h2>
    <p>Explore vibrant coral reefs and tropical fish.</p>
    <p><strong>Price:</strong> 18,000 XPF per adult</p>

    <button
      class="book-button"
      data-vai-tour-id="snorkeling-xyz789"
      data-vai-operator-id="moorea-diving"
    >
      Book This Tour
    </button>
  </div>

  <!-- Load VAI Embed Widget -->
  <script src="http://localhost:5173/button.js"></script>

  <!-- Test: Track when bookings complete -->
  <script>
    window.addEventListener('message', (event) => {
      if (event.data.type === 'VAI_BOOKING_COMPLETE') {
        console.log('Operator received booking confirmation:', event.data);
        alert(`Booking confirmed! Reference: ${event.data.bookingReference}`);
      }
    });
  </script>
</body>
</html>
```

#### Task 2.2: Beta Testing with 5 Operators
**Owner:** Kevin
**Effort:** 8 hours (includes setup, support, feedback collection)
**Selection Criteria:**
- Must have existing website
- Active on VAI platform (>5 bookings/month)
- Responsive to communication
- Diverse locations (Tahiti, Moorea, Bora Bora)

**Beta Testing Process:**
1. **Week 3:** Onboard 5 operators
   - Send integration instructions
   - Provide test tour IDs
   - Schedule follow-up call
2. **Week 4:** Collect feedback
   - Track widget performance (loads, conversions)
   - Identify technical issues
   - Iterate on UX based on feedback

**Feedback Survey:**
```markdown
# VAI Embed Widget - Beta Feedback

## Integration Experience
1. How difficult was it to add the widget to your site? (1-5 scale)
2. Did you need technical help? If yes, what was confusing?
3. How long did integration take?

## Performance
4. How many visitors clicked the widget?
5. How many bookings did you receive via the widget?
6. How does this compare to your normal website conversion?

## User Experience
7. What did tourists say about the booking experience?
8. Any complaints or confusion?
9. Would you recommend this to other operators?

## Feature Requests
10. What would make this more useful?
```

---

### Phase 3: Deployment & Documentation (Weeks 5-6)

#### Task 3.1: Production Deployment
**Owner:** Backend Developer
**Effort:** 6 hours
**Deliverables:**
- Deploy `vai-embed-widget` to `embed.vai.studio`
- Setup CDN (Cloudflare) for fast global delivery
- Enable gzip compression
- Setup monitoring (uptime, error tracking)

**Deployment Checklist:**
- [ ] Domain configured: `embed.vai.studio`
- [ ] SSL certificate active
- [ ] CDN caching enabled (cache `button.js` for 1 hour)
- [ ] Error tracking (Sentry) configured
- [ ] Uptime monitoring (UptimeRobot) active

#### Task 3.2: Operator Documentation
**Owner:** Kevin
**Effort:** 6 hours
**Location:** New section in Operator Dashboard

**Documentation Structure:**
```markdown
# How to Add VAI Booking to Your Website

## What You'll Get
- Bookings happen directly on your website (no redirection)
- Tourists stay on your domain throughout booking
- Same VAI payment processing (11% commission, 7-day payouts)
- Real-time availability synced with VAI calendar

## Requirements
✅ You must have a website
✅ Ability to edit your website's HTML (or ask your web developer)
✅ Active VAI Operator account

## Installation (2 Steps - 5 Minutes)

### Step 1: Add the VAI Script to Your Website
Copy this code and paste it **before the closing `</body>` tag** on every page where you want booking buttons:

```html
<script src="https://embed.vai.studio/button.js"></script>
```

### Step 2: Add Booking Buttons
For each tour you want to make bookable, add a button like this:

```html
<button
  data-vai-tour-id="YOUR_TOUR_ID_HERE"
  data-vai-operator-id="YOUR_OPERATOR_ID_HERE"
>
  Book This Tour
</button>
```

**How to find your Tour ID:**
1. Go to your VAI Operator Dashboard
2. Click on "Templates" tab
3. Find your tour and click "Copy Embed Code"
4. Your tour ID will be in the code snippet

**Your Operator ID:** `moorea-diving` (shown in your dashboard header)

### Example
```html
<button
  data-vai-tour-id="whale-watching-abc123"
  data-vai-operator-id="moorea-diving"
  style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;"
>
  Book Whale Watching Tour
</button>
```

## Customization
You can style the button however you like using CSS. The VAI script only requires the `data-vai-*` attributes.

## Need Help?
- 📧 Email: support@vai.studio
- 💬 WhatsApp: +689 XX XX XX XX
- 📚 Video Tutorial: [Watch on YouTube]

## FAQs
**Q: Will tourists leave my website?**
A: No! A modal overlay appears on your site. The URL stays `your-site.pf` throughout.

**Q: Do I still pay 11% commission?**
A: Yes, all bookings through VAI (marketplace or embed widget) have the same 11% commission.

**Q: Can I customize the look?**
A: You can style the button however you want. The booking modal uses VAI's design (consistent experience).

**Q: How do I track performance?**
A: Go to Dashboard → Analytics → "Embed Widget" tab to see clicks and conversions.
```

#### Task 3.3: Generate Embed Codes in Dashboard
**Owner:** Frontend Developer
**Effort:** 4 hours
**Location:** `operator-dashboard/src/pages/Templates`

**New Feature:**
Add "Get Embed Code" button to each template card.

**Implementation:**
```javascript
// operator-dashboard/src/pages/Templates/TemplateCard.jsx

const EmbedCodeButton = ({ template, operatorId }) => {
  const [showCode, setShowCode] = useState(false);

  const embedCode = `<button
  data-vai-tour-id="${template.id}"
  data-vai-operator-id="${operatorId}"
  style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
>
  Book ${template.tour_name}
</button>

<!-- Add this once before </body> if not already added -->
<script src="https://embed.vai.studio/button.js"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  return (
    <div>
      <button
        onClick={() => setShowCode(!showCode)}
        className="btn-secondary"
      >
        <CodeIcon /> Get Embed Code
      </button>

      {showCode && (
        <div className="embed-code-modal">
          <pre>{embedCode}</pre>
          <button onClick={copyToClipboard}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 5. Timeline & Milestones

### Gantt Chart (6-Week Timeline)

```
Week 1: Foundation
├─ Day 1-2: Create vai-embed-widget repo ✓
├─ Day 3-5: Build embed button script
└─ Day 6-7: Tourist App embed mode detection

Week 2: Foundation (continued)
├─ Day 8-10: Testing & bug fixes
├─ Day 11-12: Mobile optimization
└─ Day 13-14: Cross-browser testing

Week 3: Beta Testing
├─ Day 15-16: Onboard 5 beta operators
├─ Day 17-19: Monitor usage, collect feedback
└─ Day 20-21: Iterate based on feedback

Week 4: Beta Testing (continued)
├─ Day 22-24: Refinements & polish
├─ Day 25-26: Performance optimization
└─ Day 27-28: Security review

Week 5: Production Prep
├─ Day 29-30: Deploy to embed.vai.studio
├─ Day 31-32: Write operator documentation
└─ Day 33-35: Build "Get Embed Code" in dashboard

Week 6: Launch
├─ Day 36-37: Final testing
├─ Day 38-39: Launch announcement
└─ Day 40-42: Onboard first 20 operators
```

### Key Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| **M1: MVP Complete** | End Week 2 | Button script works, Tourist App detects embed mode |
| **M2: Beta Testing** | End Week 4 | 5 operators integrated, >10 bookings via embed |
| **M3: Production Launch** | End Week 6 | Live on embed.vai.studio, documentation complete |
| **M4: 50 Operators** | Month 3 | 50 operators using embed widget, >200 bookings/month |
| **M5: Validation** | Month 6 | Conversion rate >2%, <5 support tickets/week, zero cannibalization |

---

## 6. Success Metrics

### Primary Metrics (Must Achieve)

#### Metric 1: Adoption Rate
**Target:** 50 operators integrated by Month 3
**Measurement:** Count of operators with embed script active
**Data Source:** `embed_analytics` table (unique `operator_id` with events in last 30 days)

#### Metric 2: Conversion Rate
**Target:** >2% (widget views → bookings)
**Measurement:** `bookings_completed / widget_loads`
**Benchmark:** Compare to VAI Tickets marketplace conversion (currently ~2.8%)

#### Metric 3: Support Burden
**Target:** <5 support tickets per week
**Measurement:** Zendesk tickets tagged "embed-widget"
**Threshold:** If >10 tickets/week → pause rollout, fix issues

#### Metric 4: Zero Cannibalization
**Target:** VAI Tickets traffic stable or growing
**Measurement:** Compare monthly active users before/after embed launch
**Threshold:** If VAI Tickets MAU drops >10% → investigate

### Secondary Metrics (Nice to Have)

#### Metric 5: Time to First Booking
**Target:** <7 days from integration
**Measurement:** Time between operator adds script → first booking received

#### Metric 6: Operator Satisfaction
**Target:** NPS >50
**Measurement:** Monthly survey to operators using embed widget

#### Metric 7: GMV Contribution
**Target:** 10% of total GMV from embed channel by Month 6
**Measurement:** Sum of `booking.total_amount` where `booking.source = 'embed'`

---

## 7. Progress Log

### Template for Weekly Updates

```markdown
## Week X: [Date Range]

### Completed This Week
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Blockers & Issues
- Issue 1: [Description]
  - Status: [In Progress / Resolved / Escalated]
  - Owner: [Name]

### Metrics Update
- Operators integrated: X
- Bookings via embed: X
- Conversion rate: X%
- Support tickets: X

### Next Week Priorities
1. Priority 1
2. Priority 2
3. Priority 3

### Learnings & Insights
- Insight 1
- Insight 2
```

---

### Week 0: Planning Phase (October 8, 2025)

#### Completed This Week
- ✅ Strategic analysis completed (should we build this?)
- ✅ Technical architecture defined (how to build this?)
- ✅ MVP scope finalized: Modal Overlay + Monorepo + Anonymous Booking + Modular Analytics
- ✅ Project specification document created

#### Decisions Made
1. **Architecture:** Modal overlay (Pattern B) - reuses Tourist App in iframe
2. **Repository:** ✅ **Monorepo approach** - embed code lives in `tourist-app/src/embed/`
3. **Analytics:** ✅ **Modular design** - unified analytics system (not embed-specific table)
4. **Timeline:** 6-week development, 3-month validation period
5. **Priority:** Phase 2 (after Channel Manager MVP proves demand)

#### Next Steps
- [ ] Decision: Validate 6-week timeline with team capacity
- [ ] Task: Create `/tourist-app/src/embed/` directory structure
- [ ] Task: Configure Vite for multiple build outputs
- [ ] Task: Design unified analytics module (separate project)

#### Open Questions
1. When to start development? (Dependent on Channel Manager progress)
2. Who will be primary developer? (Need to assign resources)
3. Should we build unified analytics module first, or stub it for now?

---

## 8. Technical Decisions

### Decision 1: Monorepo Architecture ✅ CONFIRMED

**Decision:** Use **Option B - Monorepo Approach**

**Rationale:**
1. **Button script is lightweight** (~200-300 lines) - not worth separate repo overhead
2. **Tight coupling** with Tourist App (iframe loads Tourist App) - easier to keep in sync
3. **Simpler deployment** - single CI/CD pipeline, one source of truth
4. **Build flexibility** - Vite supports multiple entry points (can still output separate bundles)

**Implementation:**
```
tourist-app/
├── src/
│   ├── embed/                    # Embed module
│   │   ├── button/
│   │   │   ├── index.js          # Entry point (builds to button.js)
│   │   │   ├── modal.js
│   │   │   ├── iframe-handler.js
│   │   │   └── styles.css
│   │   └── EmbedModeLayout.jsx   # Tourist App embed UI
│   ├── App.jsx                   # Detects ?embed=true
│   └── lib/
│       └── analytics.js          # Shared analytics module
├── vite.config.js                # Main app build
├── vite.config.embed.js          # Embed script build
└── package.json                  # Single dependency management
```

**Build Outputs:**
- `npm run build` → `dist/` → Deployed to `app.vai.studio` (Tourist App)
- `npm run build:embed` → `dist-embed/button.js` → Deployed to `embed.vai.studio/button.js`

**Benefits:**
- ✅ Single repo, single deployment pipeline
- ✅ Shared dependencies (analytics, utilities)
- ✅ Easy to refactor (move code between embed/main app)
- ✅ Bundle size NOT impacted (separate builds)

**Trade-off Accepted:**
- ⚠️ Tourist App repo slightly more complex (but worth it for maintainability)

---

### Decision 2: Anonymous Booking vs. Optional Login

**Current Spec:** Anonymous booking (guest checkout)

**Implementation Details:**
- Tourist enters email/name in booking form (no account required)
- After booking, receives email: "Claim your booking" with magic link
- Clicking link creates account + auto-links booking via `customer_email`

**Alternative Considered:**
Embedded login flow (allow tourists to log in during booking)

**Why Anonymous is Better for MVP:**
1. Lower friction (tourists hate creating accounts mid-booking)
2. Already supported by Tourist App (no new code)
3. Mobile UX is cleaner (no keyboard popping up for password)

**Decision:** ✅ Confirmed - Use anonymous booking

---

### Decision 3: Modular Analytics System ✅ CONFIRMED

**Decision:** Design **unified, platform-wide analytics** (not embed-specific table)

**Rationale - Don't Think in Bubbles:**
Creating `embed_analytics` table is short-sighted. We need analytics for:
- Tourist App (page views, tour favorites, search queries)
- Operator Dashboard (template views, booking confirmations, revenue tracking)
- Embed Widget (widget loads, conversions)
- Future products (VAI Maps, VAI Skills, VAI Homes)

**Every product should not create its own analytics table** → fragmented data, impossible to analyze cross-product funnels.

**Unified Analytics Architecture:**

```sql
-- Single events table for ALL platform interactions
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What happened
  event_name TEXT NOT NULL,              -- 'embed.widget.loaded', 'tourist.tour.viewed', 'operator.booking.confirmed'
  event_category TEXT NOT NULL,          -- 'engagement', 'conversion', 'navigation'

  -- Who did it
  user_id UUID,                          -- Tourist or operator user ID (if authenticated)
  session_id UUID NOT NULL,              -- Anonymous session tracking
  user_type TEXT,                        -- 'tourist', 'operator', 'anonymous'

  -- Where did it happen
  source TEXT NOT NULL,                  -- 'tourist_app', 'operator_dashboard', 'embed', 'api'
  channel TEXT,                          -- 'organic', 'operator_website', 'social', 'direct'
  referrer TEXT,                         -- HTTP referrer
  page_url TEXT,                         -- Current page URL

  -- Context (JSONB for flexibility)
  properties JSONB,                      -- Event-specific data
  -- Example: { operator_id, tour_id, booking_id, amount, currency }

  -- Device/Browser
  user_agent TEXT,
  device_type TEXT,                      -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Privacy compliance
  anonymized BOOLEAN DEFAULT FALSE,      -- PII removed?
  retention_days INTEGER DEFAULT 365     -- Auto-delete after N days
);

-- Indexes for fast queries
CREATE INDEX idx_events_name_created ON events(event_name, created_at DESC);
CREATE INDEX idx_events_source_created ON events(source, created_at DESC);
CREATE INDEX idx_events_session ON events(session_id, created_at);
CREATE INDEX idx_events_user ON events(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX idx_events_properties ON events USING GIN(properties); -- JSONB search
```

**Shared Analytics Module:**

```javascript
// tourist-app/src/lib/analytics.js
// Shared by Tourist App, Operator Dashboard, Embed Widget

export const track = (eventName, properties = {}) => {
  const event = {
    event_name: eventName,
    event_category: inferCategory(eventName),
    session_id: getOrCreateSessionId(),
    user_id: getCurrentUserId(),
    user_type: getCurrentUserType(),
    source: getAppSource(), // 'tourist_app', 'operator_dashboard', 'embed'
    channel: getChannel(),
    referrer: document.referrer,
    page_url: window.location.href,
    properties: properties,
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    created_at: new Date().toISOString()
  };

  // Batch events (send every 5 events or every 10 seconds)
  addToBatch(event);
};

// Usage across all products:

// Tourist App
track('tourist.tour.viewed', { tour_id: 'abc-123', tour_type: 'Whale Watching' });
track('tourist.tour.favorited', { tour_id: 'abc-123' });
track('tourist.booking.completed', { booking_id: 'xyz-789', amount: 26000 });

// Operator Dashboard
track('operator.template.created', { template_id: 'def-456', tour_type: 'Snorkeling' });
track('operator.booking.confirmed', { booking_id: 'xyz-789' });

// Embed Widget
track('embed.widget.loaded', { operator_id: 'moorea-diving', tour_id: 'abc-123' });
track('embed.booking.completed', { booking_id: 'xyz-789', source_url: 'moorea-diving.pf' });
```

**Benefits:**
- ✅ **Cross-product analytics**: Track tourist journey from VAI Tickets → Embed Widget booking
- ✅ **Flexible schema**: JSONB `properties` adapts to any event type
- ✅ **Single source of truth**: All analytics in one table, easy to query
- ✅ **Future-proof**: New products just call `track()`, no new tables needed

**Implementation for Embed MVP:**
- Week 1-4: **Stub analytics** (console.log only, no database writes)
- Week 5-6: **Basic implementation** (write to `events` table, no dashboard)
- Post-MVP: **Full analytics module** (separate project, includes dashboards)

**Decision:** ✅ Embed widget uses unified analytics from Day 1 (even if stubbed initially)

---

### Decision 4: Cross-Origin Security

**Challenge:** iframe on `moorea-diving.pf` loading `app.vai.studio` - how to secure postMessage?

**Current Implementation:**
```javascript
// In button script (parent window)
window.addEventListener('message', (event) => {
  // TODO: Should we verify origin?
  if (event.origin !== 'https://app.vai.studio') return;

  if (event.data.type === 'VAI_BOOKING_COMPLETE') {
    // Handle booking completion
  }
});
```

**Security Concern:**
Malicious site could embed VAI iframe and intercept booking data.

**Mitigation:**
1. **Origin validation** (already planned): Only accept messages from `app.vai.studio`
2. **No sensitive data in postMessage**: Only send `bookingId` and `bookingReference` (not payment info)
3. **Operator domain whitelist** (future): Track which domains are authorized to embed

**Decision:** ✅ Origin validation sufficient for MVP. Whitelist in Phase 2.

---

## 9. Risks & Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|---------------------|-------|
| **Marketplace cannibalization** | Medium | High | Track VAI Tickets MAU closely; if drops >10%, investigate source attribution | Kevin |
| **Low operator adoption** | Medium | Medium | Pre-validate demand via survey before development | Kevin |
| **High support burden** | Medium | Medium | Comprehensive documentation, video tutorials, limit to 50 operators initially | Support Team |
| **Technical issues (iframe blocked)** | Low | Medium | Extensive browser testing, fallback to redirect if iframe fails | Frontend Dev |
| **Security vulnerability** | Low | High | Security audit before launch, origin validation, no PCI data in postMessage | Backend Dev |
| **Poor conversion rate** | Medium | Medium | A/B test button placement/design, optimize modal UX | Product Team |

### Detailed Mitigation Plans

#### Risk 1: Marketplace Cannibalization
**Scenario:** Tourists who would have discovered tours on VAI Tickets now book directly on operator sites → VAI Tickets traffic drops.

**Early Warning Signals:**
- VAI Tickets monthly active users (MAU) drops >5%
- Booking source shift: >30% of bookings come from embed vs. marketplace
- Tourist engagement drops (fewer favorited tours, less browsing)

**Mitigation Actions:**
1. **Preventive:**
   - Position embed as "direct booking for existing traffic" (not discovery replacement)
   - Operators keep VAI Tickets active (incentivize with "Premium Placement" for embed users)
   - Track source attribution: Did tourist find operator via VAI Tickets first, then book on operator site?

2. **Reactive:**
   - If cannibalization detected: Pause embed rollout
   - Survey tourists: "How did you find this operator?"
   - Adjust messaging: Emphasize VAI Tickets for discovery, embed for direct booking

**Success Indicator:**
- VAI Tickets MAU stable or growing
- Embed contributes *additional* GMV (not replacement)

---

#### Risk 2: Low Operator Adoption
**Scenario:** <50 operators integrate widget by Month 3 → not worth maintenance cost.

**Early Warning Signals:**
- Beta testing: <3 of 5 operators successfully integrate
- Week 6 launch: <10 operators sign up in first week
- Month 1: <20 operators active

**Mitigation Actions:**
1. **Preventive:**
   - **Pre-launch survey** (Week 0): "Do you have a website? Would you integrate VAI booking?"
   - Target: >100 operators express interest → proceed
   - Target: <50 operators interested → deprioritize

2. **Reactive:**
   - If adoption slow: Offer 1-on-1 integration support (white-glove service)
   - Create video tutorial (screen recording of integration process)
   - Partner with local web developers (refer operators to trusted developers)

**Success Indicator:**
- 50+ operators integrated by Month 3
- >10 new operators/month signing up

---

#### Risk 3: High Support Burden
**Scenario:** Operators struggle with integration → support team overwhelmed with tickets.

**Early Warning Signals:**
- Beta testing: >3 operators need help with integration
- Week 6: >10 support tickets in first week
- Month 1: >20 support tickets/week

**Mitigation Actions:**
1. **Preventive:**
   - **Self-service documentation** (comprehensive, with screenshots)
   - **Video tutorial** (5-minute walkthrough)
   - **"Copy-paste" embed code** in dashboard (zero manual work)
   - **Browser extension** (future): Auto-detects operator's website, suggests placement

2. **Reactive:**
   - If tickets high: Create FAQ based on common issues
   - Offer paid integration service (€50-100) - operator sends website access, VAI team adds script
   - Limit rollout to 50 operators until support stabilizes

**Success Indicator:**
- <5 support tickets/week
- >80% of operators integrate without help

---

#### Risk 4: Technical Issues (iframe Blocked)
**Scenario:** Some mobile browsers or corporate firewalls block iframes → booking flow breaks.

**Early Warning Signals:**
- Beta testing: Tourists report "button doesn't work"
- Error tracking: High rate of iframe load failures
- Conversion rate <1% (vs. expected >2%)

**Mitigation Actions:**
1. **Preventive:**
   - **Extensive browser testing** (Safari, Chrome, Firefox, Mobile Safari, Mobile Chrome, Samsung Internet)
   - **Fallback mechanism**: If iframe blocked, redirect to `app.vai.studio` (graceful degradation)

2. **Reactive:**
   - Monitor iframe load errors via Sentry
   - If iframe fails, show message: "Redirecting to secure booking page..."
   - Track which browsers have issues, optimize for those

**Success Indicator:**
- Iframe loads successfully >95% of the time
- Fallback redirect works seamlessly

---

## 10. Future Roadmap

### Phase 2: JavaScript SDK (Month 6-9)
**Trigger:** If MVP shows >100 operators adopted, conversion >2%, low support burden

**What Changes:**
- Build native JavaScript SDK (not iframe)
- Operators render VAI booking components directly on their site
- Better SEO (content indexed by Google)
- More customization (operator controls styling)

**Target Audience:**
- Advanced operators with developer resources
- DMCs and hotels building custom booking flows

**Revenue Model:**
- Free tier: Modal overlay (iframe)
- Premium tier: JavaScript SDK (€50/month)

---

### Phase 3: Headless API (Month 12-18)
**Trigger:** If SDK shows demand from enterprise customers (hotels, DMCs)

**What Changes:**
- Full REST API (no UI provided)
- Operators build 100% custom booking interface
- Webhooks for real-time updates
- OAuth authentication

**Target Audience:**
- Hotel chains (integrate into property management systems)
- Large DMCs (build custom itinerary builders)
- Travel platforms (white-label VAI booking)

**Revenue Model:**
- Enterprise tier: €200-500/month for API access

---

### Phase 4: White-Label Platform (Year 2+)
**Vision:** Tourism boards can deploy their own branded marketplace powered by VAI infrastructure.

**Example:**
- "Tahiti Tourism" launches `book.tahititourisme.com` (looks like their brand)
- Powered by VAI backend (availability, payments, operator tools)
- VAI becomes B2B SaaS platform (infrastructure provider)

**Revenue Model:**
- Platform licensing: €5,000-10,000/month per tourism board
- VAI handles: Technology, payments, operator onboarding
- Tourism board handles: Marketing, operator recruitment, governance

---

## 11. Modular Analytics Design (Separate Project)

### Overview
The unified analytics system is **NOT part of the embed widget project** - it's a standalone infrastructure module that all VAI products will use. This section outlines the design for future reference.

**Status:** Separate project (to be designed and built independently)

**Timeline:**
- Embed MVP (Weeks 1-6): **Stubbed** (console.log only)
- Analytics Module (Months 3-6): **Full implementation**

---

### Design Principles

#### 1. Product-Agnostic
Analytics module should know nothing about specific products. It just tracks events.

```javascript
// ❌ BAD: Product-specific logic in analytics
if (source === 'embed') {
  trackEmbedWidgetLoad();
} else if (source === 'tourist_app') {
  trackTouristPageView();
}

// ✅ GOOD: Generic event tracking
track(eventName, properties);
```

#### 2. Privacy-First
- No PII in event names (use `user_id` references, not emails/names)
- Auto-anonymize after retention period
- GDPR-compliant (users can request data deletion)

#### 3. Performance-Optimized
- **Batch events** (send every 5 events or 10 seconds, not on every action)
- **Async writes** (don't block UI)
- **Partitioned tables** (auto-partition `events` by month for fast queries)

---

### Database Schema (Extended)

```sql
-- Main events table (partitioned by month)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  session_id UUID NOT NULL,
  user_id UUID,
  user_type TEXT,
  source TEXT NOT NULL,
  channel TEXT,
  referrer TEXT,
  page_url TEXT,
  properties JSONB,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  anonymized BOOLEAN DEFAULT FALSE,
  retention_days INTEGER DEFAULT 365
) PARTITION BY RANGE (created_at);

-- Auto-create partitions for each month
CREATE TABLE events_2025_10 PARTITION OF events
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Aggregated metrics (pre-computed for dashboards)
CREATE TABLE metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,           -- 'embed.conversion_rate', 'tourist.bookings'
  metric_value NUMERIC,
  dimensions JSONB,                    -- { operator_id, tour_type, device_type }
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_name_date ON metrics_daily(metric_name, date DESC);
```

---

### Analytics Module API

```javascript
// tourist-app/src/lib/analytics/index.js

import { createClient } from '@supabase/supabase-js';

class VAIAnalytics {
  constructor() {
    this.batch = [];
    this.batchSize = 5;
    this.batchTimeout = 10000; // 10 seconds
    this.sessionId = this.getOrCreateSessionId();
  }

  // Main tracking function
  track(eventName, properties = {}) {
    const event = {
      event_name: eventName,
      event_category: this.inferCategory(eventName),
      session_id: this.sessionId,
      user_id: this.getCurrentUserId(),
      user_type: this.getCurrentUserType(),
      source: this.getSource(),
      channel: this.getChannel(),
      referrer: document.referrer,
      page_url: window.location.href,
      properties: properties,
      user_agent: navigator.userAgent,
      device_type: this.getDeviceType(),
      created_at: new Date().toISOString()
    };

    this.addToBatch(event);
  }

  // Batch management
  addToBatch(event) {
    this.batch.push(event);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduledFlush();
    }
  }

  scheduledFlush() {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, this.batchTimeout);
  }

  async flush() {
    if (this.batch.length === 0) return;

    const eventsToSend = [...this.batch];
    this.batch = [];

    try {
      await supabase.from('events').insert(eventsToSend);
    } catch (error) {
      console.error('Analytics error:', error);
      // Optionally: retry or send to error tracking
    }
  }

  // Helper functions
  inferCategory(eventName) {
    if (eventName.includes('booking')) return 'conversion';
    if (eventName.includes('view') || eventName.includes('loaded')) return 'engagement';
    if (eventName.includes('click')) return 'interaction';
    return 'other';
  }

  getSource() {
    // Detect which app is calling analytics
    if (window.location.hostname === 'app.vai.studio') return 'tourist_app';
    if (window.location.hostname === 'dashboard.vai.studio') return 'operator_dashboard';
    if (window.location.hostname.includes('embed')) return 'embed';
    return 'unknown';
  }

  getCurrentUserId() {
    // Check Supabase auth
    const session = supabase.auth.getSession();
    return session?.user?.id || null;
  }

  getCurrentUserType() {
    // Infer from URL or session
    if (this.getSource() === 'operator_dashboard') return 'operator';
    if (this.getSource() === 'tourist_app' && this.getCurrentUserId()) return 'tourist';
    return 'anonymous';
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('vai_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('vai_session_id', sessionId);
    }
    return sessionId;
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getChannel() {
    const utmSource = new URLSearchParams(window.location.search).get('utm_source');
    if (utmSource) return utmSource;

    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'organic_search';
    if (referrer.includes('facebook') || referrer.includes('instagram')) return 'social';
    return 'referral';
  }
}

// Export singleton
export const analytics = new VAIAnalytics();

// Convenience function
export const track = (eventName, properties) => {
  analytics.track(eventName, properties);
};
```

---

### Dashboard Queries (Examples)

```sql
-- Embed widget conversion funnel
SELECT
  COUNT(*) FILTER (WHERE event_name = 'embed.widget.loaded') AS widget_loads,
  COUNT(*) FILTER (WHERE event_name = 'embed.modal.opened') AS modal_opens,
  COUNT(*) FILTER (WHERE event_name = 'embed.booking.completed') AS bookings,
  (COUNT(*) FILTER (WHERE event_name = 'embed.booking.completed')::float /
   COUNT(*) FILTER (WHERE event_name = 'embed.widget.loaded')) * 100 AS conversion_rate
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND event_name LIKE 'embed.%';

-- Top performing operators (embed channel)
SELECT
  properties->>'operator_id' AS operator_id,
  COUNT(*) AS bookings,
  SUM((properties->>'amount')::integer) AS total_revenue
FROM events
WHERE event_name = 'embed.booking.completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY properties->>'operator_id'
ORDER BY bookings DESC
LIMIT 10;

-- Cross-product journey analysis
WITH tourist_sessions AS (
  SELECT
    session_id,
    MIN(created_at) AS first_event,
    MAX(created_at) AS last_event,
    ARRAY_AGG(event_name ORDER BY created_at) AS event_sequence,
    ARRAY_AGG(source ORDER BY created_at) AS source_sequence
  FROM events
  WHERE user_type = 'tourist'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY session_id
)
SELECT
  -- Did tourist discover on VAI Tickets, then book via embed?
  COUNT(*) FILTER (WHERE 'tourist_app' = ANY(source_sequence) AND 'embed' = ANY(source_sequence)) AS cross_channel_bookings,
  -- Pure VAI Tickets bookings
  COUNT(*) FILTER (WHERE 'tourist_app' = source_sequence[array_length(source_sequence, 1)]) AS vai_tickets_bookings,
  -- Pure embed bookings (direct to operator site)
  COUNT(*) FILTER (WHERE 'embed' = source_sequence[1]) AS direct_embed_bookings
FROM tourist_sessions
WHERE 'booking.completed' = ANY(event_sequence);
```

---

### Operator Dashboard Integration

```javascript
// operator-dashboard/src/pages/Analytics/EmbedPerformance.jsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const EmbedPerformance = ({ operatorId }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase.rpc('get_embed_metrics', {
        p_operator_id: operatorId,
        p_days: 30
      });

      setMetrics(data);
    };

    fetchMetrics();
  }, [operatorId]);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div>
      <h2>Embed Widget Performance (Last 30 Days)</h2>

      <div className="metrics-grid">
        <MetricCard
          title="Widget Loads"
          value={metrics.widget_loads}
          change="+12% vs. last month"
        />
        <MetricCard
          title="Bookings"
          value={metrics.bookings}
          change="+8% vs. last month"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversion_rate.toFixed(2)}%`}
          change="+0.3% vs. last month"
        />
        <MetricCard
          title="Revenue"
          value={`${metrics.total_revenue.toLocaleString()} XPF`}
          change="+15% vs. last month"
        />
      </div>

      <ConversionFunnel data={metrics.funnel} />
      <TopSourceUrls data={metrics.top_urls} />
    </div>
  );
};
```

---

### Implementation Roadmap (Analytics Module)

**Month 1-2: Planning & Design**
- [ ] Finalize schema (events, metrics tables)
- [ ] Design dashboard mockups
- [ ] Privacy audit (GDPR compliance)

**Month 3-4: Core Development**
- [ ] Create `events` table with partitioning
- [ ] Build analytics module (`src/lib/analytics`)
- [ ] Implement batching logic
- [ ] Write to database (basic)

**Month 5: Dashboards**
- [ ] Operator Dashboard: Embed performance page
- [ ] Admin Dashboard: Platform-wide metrics
- [ ] Pre-compute daily aggregations

**Month 6: Production & Optimization**
- [ ] Performance testing (10k events/min)
- [ ] Auto-anonymization cron job
- [ ] Data retention policy enforcement
- [ ] Launch to all products

---

## Appendices

### Appendix A: Code Repositories

| Repository | URL | Purpose | Owner |
|------------|-----|---------|-------|
| `tourist-app` | `/tourist-app` | Embed module + Tourist App | Frontend Team |
| `operator-dashboard` | `/operator-dashboard` | "Get Embed Code" feature | Frontend Team |
| Analytics Module | `/tourist-app/src/lib/analytics` | Unified analytics (shared) | Backend Team |

---

### Appendix B: Key Contacts

| Role | Name | Responsibility | Contact |
|------|------|----------------|---------|
| Project Owner | Kevin De Silva | Strategic decisions, beta testing | kevin@vai.studio |
| Frontend Developer | TBD | Button script, Tourist App changes | TBD |
| Backend Developer | TBD | Analytics, deployment | TBD |
| Support Lead | TBD | Operator onboarding, documentation | TBD |

---

### Appendix C: Reference Documents

1. [Business Plan - Digital Sovereignty Strategy](../../presentation/VAI/businessplan/en.json)
2. [Tourist App Master Specification](../VAI_TICKETS_MASTER_SPECIFICATION.md)
3. [Operator Dashboard Master Specification](../../../operator-dashboard/documentation/VAI_OPERATOR_DASHBOARD_MASTER_SPECIFICATION.md)
4. [Database Insights](../../database%20insights/08102025_database_insights_wrapped_up.md)

---

## Document Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| Oct 8, 2025 | 1.0 | Initial specification created | Kevin De Silva |
| Oct 8, 2025 | 1.1 | ✅ Confirmed monorepo architecture + modular analytics design | Kevin De Silva |

---

## Next Actions

### ✅ Decisions Confirmed
1. **Architecture:** Monorepo approach (embed code in `tourist-app/src/embed/`)
2. **Analytics:** Unified analytics system (not embed-specific table)
3. **MVP Scope:** Modal overlay + anonymous booking + stubbed analytics

### 📋 Ready to Start When:
1. **Channel Manager MVP validated** (embed is Phase 2)
2. **Team resources assigned** (frontend + backend developer)
3. **6-week timeline confirmed** with team capacity

### 🚀 Week 1 Kickoff Checklist:
- [ ] Create `/tourist-app/src/embed/` directory structure
- [ ] Configure `vite.config.embed.js` for separate build
- [ ] Stub analytics module (`src/lib/analytics/index.js` with console.log)
- [ ] Begin Task 1.2: Build embed button script

---

**Document Status:** ✅ Ready for implementation (pending resource allocation)
