## 🎨 WEBSITE STRUCTURE (Platform/Value-Based Navigation)

### **Design Philosophy**: Platform-Focused, Audience-Agnostic

The website structure is organized by **what the platform does and delivers** (not by audience). This allows operators, tourists, investors, government officials, and any stakeholder to find relevant information based on their interest in specific capabilities or values.

---

### **Proposed Tab-Based Navigation Structure**

```
┌─────────────────────────────────────────────────────────────────┐
│  HERO SECTION (Landing/Above-the-Fold)                         │
├─────────────────────────────────────────────────────────────────┤
│  Platform tagline: "Complete Tourism Management Platform"       │
│  Subtitle: "From Activity Discovery over Automated Payouts -   │
│             Empowering French Polynesian Tourism"               │
│  Key stats: 145+ Features | 8 Languages | 118 Islands |        │
│             Market-Ready, Pre-Launch                            │
│  Platform links: operator.vai.studio | app.vai.studio          │
│  Quick access: Register as Operator | Pre-Register as User │ Contact VAI │
│                                                                 │
│  ═══ VISUAL/MEDIA SPECIFICATIONS ═══                           │
│                                                                 │
│  [HERO BACKGROUND IMAGE]                                        │
│  ├─ Type: Hero background image (full viewport width)          │
│  ├─ Content: French Polynesian landscape (Moorea mountains,    │
│  │   turquoise lagoon) with subtle gradient overlay            │
│  ├─ Dimensions: 1920x1080px (responsive)                       │
│  ├─ Style: 50% opacity overlay, subtle parallax scroll effect  │
│  ├─ Position: Full-width background, content centered over it  │
│  └─ Placeholder: /assets/images/hero-fp-landscape.jpg          │
│                                                                 │
│  [PLATFORM LOGO]                                                │
│  ├─ Type: SVG logo with animation                              │
│  ├─ Content: VAI Studio logo                                   │
│  ├─ Animation: Fade-in on page load (0.8s ease-in-out)         │
│  ├─ Dimensions: 180px width                                    │
│  └─ Position: Centered above tagline                           │
│                                                                 │
│  [STATS COUNTER ANIMATION]                                      │
│  ├─ Type: CSS counter animation with professional icons        │
│  ├─ Icons: Use FontAwesome or Lucide icons                     │
│  │   ├─ 145+ Features: fa-puzzle-piece (professional icon)     │
│  │   ├─ 8 Languages: fa-globe (professional icon)              │
│  │   ├─ 118 Islands: fa-map-location-dot (professional icon)   │
│  │   └─ Market-Ready: fa-rocket (professional icon)            │
│  ├─ Animation: Count-up from 0 on viewport entry               │
│  ├─ Style: Large numbers (36px), icon above, label below       │
│  └─ Layout: 4-column grid, responsive to 2-column on mobile    │
│                                                                 │
│  [CTA BUTTONS]                                                  │
│  ├─ Style: Primary button (gradient), Secondary (outline)      │
│  ├─ Animation: Subtle hover lift (translateY -2px)              │
│  ├─ Icons: fa-user-plus, fa-rocket, fa-envelope                │
│  └─ Layout: Horizontal row, stack vertically on mobile         │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                    MAIN NAVIGATION TABS
═══════════════════════════════════════════════════════════════════

[TAB NAVIGATION BAR - VISUAL SPECIFICATIONS]
├─ Type: Horizontal sticky navigation bar
├─ Style: Clean tabs with active state indicator
├─ Active Tab: Bottom border accent (3px), subtle background highlight
├─ Hover Effect: Smooth color transition (0.3s ease)
├─ Icons: Professional FontAwesome icons beside each tab label
│  ├─ Tab 1: fa-house (Platform Overview)
│  ├─ Tab 2: fa-gears (Features & Capabilities)
│  ├─ Tab 3: fa-rotate (How It Works)
│  ├─ Tab 4: fa-lightbulb (Value Proposition)
│  ├─ Tab 5: fa-chart-line (Impact & Capabilities)
│  ├─ Tab 6: fa-code (Technical Architecture)
│  └─ Tab 7: fa-phone (Get Involved)
├─ Mobile: Hamburger menu → vertical drawer
└─ Scroll Behavior: Tab bar becomes sticky at top on scroll

┌─────────────────────────────────────────────────────────────────┐
│  TAB 1: 🏠 PLATFORM OVERVIEW                                   │
└─────────────────────────────────────────────────────────────────┘

WHAT: Three Interconnected Applications

[PLATFORM ECOSYSTEM DIAGRAM - VISUAL SPECIFICATIONS]
├─ Type: Interactive 3-card layout with connecting lines
├─ Animation: Cards fade in sequentially (stagger 0.2s each)
├─ Card Style: White background, subtle shadow, rounded corners
├─ Hover Effect: Card lifts (translateY -5px), shadow deepens
├─ Connection Lines: SVG animated dashed lines between cards
├─ Icons: Large professional icons at top of each card
│  ├─ VAI Operator: fa-briefcase (64px, accent color)
│  ├─ VAI Tickets: fa-ticket (64px, accent color)
│  └─ VAI Insights: fa-chart-mixed (64px, muted color)
└─ Layout: 3-column grid, stack vertically on tablet/mobile

├── VAI Operator (operator.vai.studio)
│   ├── Business management suite for tourism operators
│   ├── Complete activity, booking and channel management
│   ├── Automatic payment and payout system
│   ├── Template-based activity scheduling
│   ├── Customer communication hub
│   └── Real-time analytics dashboard
│
│   [SCREENSHOT: VAI Operator Dashboard]
│   ├─ Type: Annotated screenshot with callouts
│   ├─ Content: Operator dashboard showing booking calendar
│   ├─ Annotations: Arrow callouts highlighting key features
│   ├─ Dimensions: 1200x750px
│   ├─ Style: Browser mockup frame, subtle drop shadow
│   └─ Placeholder: /assets/screenshots/operator-dashboard.png
│
├── VAI Tickets (app.vai.studio)
│   ├── Easy-accessible Web App for tourists
│   ├── Mood-based activity discovery (6 emotional categories)
│   ├── 8+ -language booking interface
│   ├── Secure international payments (multiple currencies)
│   ├── Educational Learn Hub
│   └── Personal journey management
│
│   [SCREENSHOT: VAI Tickets Mobile View]
│   ├─ Type: Mobile phone mockup with screenshot
│   ├─ Content: Mood-based discovery interface
│   ├─ Dimensions: 375x812px (iPhone size)
│   ├─ Style: iPhone frame mockup, realistic shadows
│   └─ Placeholder: /assets/screenshots/tickets-mobile.png
│
└── VAI Insights (awaiting specifications)
    ├── Real-time tourism analytics
    ├── Revenue tracking across operators
    ├── Booking trend analysis
    ├── Pro-active notification system
    └── Public policy data feeds (anonymized)

    [ICON WITH "COMING SOON" BADGE]
    ├─ Type: Large icon with status badge overlay
    ├─ Icon: fa-chart-mixed (96px, muted gray)
    ├─ Badge: "Coming Soon" pill badge (top-right corner)
    └─ Style: Subtle opacity (60%), no hover effect

TECHNOLOGY FOUNDATION (Business-Friendly)

[TECH STACK VISUALIZATION - VISUAL SPECIFICATIONS]
├─ Type: Layered architecture diagram (business-friendly)
├─ Style: Clean horizontal layers with icons
├─ Animation: Layers slide in from left (stagger 0.15s each)
├─ Icons: Professional brand/tech icons
│  ├─ React 19: React logo icon (or fa-react)
│  ├─ i18next: fa-language
│  ├─ Supabase: Supabase logo icon
│  ├─ Stripe Connect: Stripe logo icon
│  └─ PWA: fa-mobile-screen-button
├─ Layout: 5 cards in horizontal scrollable row on mobile
└─ Tooltip: Hover shows business-friendly explanation

├── Stack Visualization
│   ├── React 19: Fast, smooth experience on any device
│   ├── i18next: Serve 8 languages automatically
│   ├── Supabase: Secure, scalable, real-time database
│   ├── Stripe Connect: Bank-level security, 25+ countries
│   └── PWA: Works offline, no app store needed
│
├── Infrastructure Highlights
│   ├── Serverless, auto-scaling (handles 10 or 10,000 bookings)
│   ├── Target 99.9%+ uptime (production-grade reliability)
│   ├── Cost-efficient (pay-per-use, no idle servers)
│   └── Developer-friendly (modern stack attracts talent)
│
│   [INFRASTRUCTURE ICONS WITH METRICS]
│   ├─ Type: 4-icon row with animated metrics below
│   ├─ Icons: fa-server, fa-arrow-up-right-dots, fa-dollar-sign, fa-code
│   ├─ Animation: Icons pulse on hover, metrics count up
│   ├─ Style: Icon (48px) above, metric below, connecting line
│   └─ Layout: 4-column grid, 2x2 on mobile
│
└── Security & Performance
    ├── PCI DSS Level 1 compliant (bank-level encryption)
    ├── <3 second load times (to keep user engaged)
    ├── Real-time updates (<500ms latency)
    └── Offline capable (PWA Service Worker)

    [SECURITY & PERFORMANCE BADGES]
    ├─ Type: Badge row with icons and checkmarks
    ├─ Icons: fa-shield-halved, fa-bolt, fa-satellite-dish, fa-wifi
    ├─ Style: Pill-shaped badges with icon + text
    ├─ Animation: Checkmark appears with subtle pop (scale)
    └─ Layout: Horizontal row, wrap on mobile

KEY STATISTICS

[KEY STATISTICS VISUAL CARDS]
├─ Type: 4 large statistic cards with icons and labels
├─ Card Style: Gradient background, white text, rounded corners
├─ Icons: Large icons (64px) at top of each card
│  ├─ 145+ Features: fa-puzzle-piece
│  ├─ 8 Languages: fa-globe
│  ├─ 118 Islands: fa-map-location-dot
│  └─ 25+ Payment Methods: fa-credit-card
├─ Animation: Count-up animation on viewport entry
├─ Hover Effect: Gentle scale (1.05), shadow deepens
└─ Layout: 4-column grid, 2x2 on tablet, stack on mobile

├── 145+ Features (86 operator + 59 tourist)
├── 8 Languages (EN, FR, ES, DE, IT, JA, ZH, Tahitian, +)
├── 118 Islands (complete French Polynesian coverage, potential to expand on infrastructure)
└── 25+ Payment Methods (international accessibility)


┌─────────────────────────────────────────────────────────────────┐
│  TAB 2: ⚙️ FEATURES & CAPABILITIES                              │
└─────────────────────────────────────────────────────────────────┘

INTERACTIVE FEATURE CATALOG (Searchable/Filterable)

[SEARCH & FILTER BAR - VISUAL SPECIFICATIONS]
├─ Type: Sticky filter bar with search input
├─ Search Input: Icon (fa-search) + placeholder text
├─ Filter Buttons: Pill-shaped toggle buttons
├─ Active Filter: Solid background color, white text
├─ Inactive Filter: Outline style, dark text
├─ Animation: Smooth color transition on toggle (0.2s)
├─ Clear Filters Button: Small "x" icon button (appears when active)
└─ Layout: Search full-width on mobile, filters wrap below
├── Filter by Function
│   ├── Discovery & Booking (24 features)
│   ├── Payment & Payouts (15 features)
│   ├── Communication & Notifications (11 features)
│   ├── Multi-Language & Accessibility (15 features)
│   ├── Analytics & Insights (9 features)
│   ├── Automation & Scheduling (14 features)
│   ├── Learn Hub & Education (9 features)
│   ├── Onboarding & Training (8 features)
│   └── Progressive Web App (8 features)
│
│   [FILTER CATEGORY ICONS]
│   ├─ Icons: Professional FontAwesome icons for each category
│   │  ├─ Discovery & Booking: fa-magnifying-glass-location
│   │  ├─ Payment & Payouts: fa-money-bill-transfer
│   │  ├─ Communication: fa-comments
│   │  ├─ Multi-Language: fa-language
│   │  ├─ Analytics: fa-chart-simple
│   │  ├─ Automation: fa-wand-magic-sparkles
│   │  ├─ Learn Hub: fa-graduation-cap
│   │  ├─ Onboarding: fa-person-chalkboard
│   │  └─ PWA: fa-mobile-screen
│   └─ Style: Icon (20px) beside category name in filter pills
│
├── Filter by Status
│   ├── ✅ Live & Ready (135 features)
│   ├── 🟡 In Development (10 features: Channel Manager integration)
│   └── ⏳ Planned (future enhancements)
│
│   [STATUS BADGES - VISUAL SPECIFICATIONS]
│   ├─ Type: Small pill badges beside feature names
│   ├─ ✅ Live: Green background, white checkmark icon
│   ├─ 🟡 In Dev: Yellow/amber background, wrench icon
│   ├─ ⏳ Planned: Gray background, clock icon
│   └─ Style: 16px height, 6px border-radius, icon + text
│
└── Filter by User Type (optional)
    ├── Operator-Facing (86 features)
    ├── Tourist-Facing (59 features)
    └── Admin/Analytics (platform management)

    [USER TYPE ICONS]
    ├─ Operator: fa-briefcase (accent color)
    ├─ Tourist: fa-person-hiking (accent color)
    └─ Admin: fa-gauge-high (muted color)

FEATURED CAPABILITIES (Expandable Cards)

[EXPANDABLE FEATURE CARDS - VISUAL SPECIFICATIONS]
├─ Type: Accordion-style expandable cards
├─ Card Header: Icon + title + expand arrow (fa-chevron-down)
├─ Collapsed State: White background, subtle border
├─ Expanded State: Light background, content slides down
├─ Animation: Smooth height transition (0.3s ease), arrow rotates
├─ Hover Effect: Subtle shadow increase
└─ Layout: Stack vertically, full-width

1. DISCOVERY & BOOKING SYSTEM

   [FEATURE CARD ICON: fa-magnifying-glass-location]

   ├── Mood-Based Discovery (Adventure, Relax, Culture, Ocean, (Romance, Family))
   ├── Traditional Browse/Explore with Advanced Filtering
   ├── Smart Filters (pre-configured search profiles)
   ├── Island Selector (potential for all 118 islands)
   ├── Real-Time Availability (e.g. "3 spots left" display)
   ├── Guest Checkout (no account required)
   ├── 5-Step Guided Booking Flow
   └── Multi-Currency Support (XPF, USD, EUR)

   [SCREENSHOT: Mood-Based Discovery Interface]
   ├─ Type: Interactive screenshot with mood buttons
   ├─ Content: 6 mood category cards (Adventure, Relax, etc.)
   ├─ Dimensions: 1000x600px
   ├─ Style: Browser or mobile frame mockup
   └─ Placeholder: /assets/screenshots/mood-discovery.png

   [ICON SET: Mood Categories]
   ├─ Type: 6 custom illustrated icons for mood categories
   ├─ Icons: Adventure (mountain), Relax (hammock), Culture (tiki),
   │   Ocean (wave), Romance (sunset), Family (group)
   ├─ Style: Consistent illustration style, 2-color palette
   └─ Size: 80px each, displayed in 3x2 grid

2. PAYMENT & PAYOUT SYSTEM

   [FEATURE CARD ICON: fa-money-bill-transfer]

   ├── Stripe Connect Integration (bank-level security)
   ├── Multiple Payment Methods (Cards, Apple Pay, Google Pay, Alipay, WeChat Pay - possible)
   ├── Authorization-then-Capture Flow (secure for both parties)
   ├── 11% Commission Rate (flexible, locked at confirmation)
   ├── 7 Days Automated Payouts (vs 30-60 day standard)
   ├── XPF-Native Operator Payouts (no currency risk)
   ├── Automated Revenue Distribution (89% operator, 11% platform)
   └── Refund Automation

   [PAYMENT FLOW DIAGRAM]
   ├─ Type: Horizontal step-by-step flow diagram
   ├─ Steps: 4 stages with connecting arrows
   │  1. Tourist Payment → 2. Authorization → 3. Capture → 4. Payout
   ├─ Icons: fa-user → fa-lock → fa-check-circle → fa-building-columns
   ├─ Animation: Steps highlight sequentially on scroll
   ├─ Style: Clean cards connected by animated arrows
   └─ Layout: Horizontal scroll on mobile

   [PAYMENT METHOD LOGOS]
   ├─ Type: Brand logo row
   ├─ Logos: Visa, Mastercard, Amex, Apple Pay, Google Pay, Stripe
   ├─ Style: Grayscale logos, hover to color
   ├─ Dimensions: 60px height each, proportional width
   └─ Layout: Horizontal centered row, wrap on mobile

3. COMMUNICATION PLATFORM

   [FEATURE CARD ICON: fa-comments]

   ├── Real-Time Chat (operator ↔ tourist)
   ├── Booking-Specific Conversation Threads
   ├── Special Requests Handling (dietary, accessibility)
   ├── WhatsApp/Email Fallback Integration
   ├── Cross-Device Notification Sync
   ├── Multi-Language Notifications
   └── Read Receipts

   [SCREENSHOT: Real-Time Chat Interface]
   ├─ Type: Split-screen chat mockup (operator + tourist view)
   ├─ Content: Chat conversation with message bubbles
   ├─ Dimensions: 1200x700px
   ├─ Annotations: Highlight real-time indicator, read receipts
   └─ Placeholder: /assets/screenshots/chat-interface.png

4. TEMPLATE & AUTOMATION SYSTEM

   [FEATURE CARD ICON: fa-wand-magic-sparkles]

   ├── Reusable Activity Templates
   ├── Template-to-Schedule Automation (create once, schedule many)
   ├── Recurring Patterns (daily, weekly, custom)
   ├── Exception Management (holidays, closures)
   ├── Auto-Generated Activity Instances
   └── Bulk Schedule Editing

   [TEMPLATE WORKFLOW DIAGRAM]
   ├─ Type: Visual workflow (template → schedule → instances)
   ├─ Steps: 3 stages with branching arrows
   ├─ Icons: fa-file-lines → fa-calendar-days → fa-clone
   ├─ Animation: Fade-in cascade on viewport entry
   └─ Style: Clean cards with connecting lines

5. MULTI-LANGUAGE ACCESSIBILITY

   [FEATURE CARD ICON: fa-language]

   ├── 8+ -Language Interface (EN, FR, ES, DE, IT, JA, ZH, Tahitian)
   ├── Persistent Language Selection
   ├── Real-Time UI Updates (no reload needed)
   ├── 55KB+ Translation Files per Language
   └── Cultural Respect (Tahitian language inclusion)

   [LANGUAGE FLAG ICONS]
   ├─ Type: Row of circular flag icons
   ├─ Flags: 8 language flags in a row
   ├─ Style: Circular flags (48px), subtle shadow
   ├─ Hover Effect: Gentle scale (1.1)
   └─ Layout: Horizontal row, wrap on mobile

6. LEARN HUB (Educational Content)

   [FEATURE CARD ICON: fa-graduation-cap]

   ├── Island Guides (Tahiti, Bora Bora, Moorea, Huahine, 118 islands)
   ├── Cultural Education (Dance, Legends, Mythology)
   ├── Sustainable Tourism Tips
   ├── Travel Tips (Respectful Tourism, Packing)
   ├── YouTube Video Integration
   ├── Bilingual Content (EN/FR expanding to 8)
   └── "New" and "Popular" Content Badges

   [SCREENSHOT: Learn Hub Content Grid]
   ├─ Type: Content card grid screenshot
   ├─ Content: Educational articles with thumbnail images
   ├─ Dimensions: 1000x600px
   ├─ Highlight: "New" and "Popular" badges visible
   └─ Placeholder: /assets/screenshots/learn-hub.png

7. PROGRESSIVE WEB APP (PWA)

   [FEATURE CARD ICON: fa-mobile-screen]

   ├── Installable on Any Device (iOS, Android, Desktop)
   ├── Offline Mode (Service Worker caching)
   ├── Works Without Internet (access bookings anywhere)
   ├── Fast Loading (<3s Largest Contentful Paint)
   ├── App Shortcuts
   ├── Standalone Window Mode
   └── No App Store Needed (save fees, reduce friction)

   [PWA INSTALLATION ILLUSTRATION]
   ├─ Type: 3-step visual guide (web → install prompt → app icon)
   ├─ Icons: fa-browser → fa-download → fa-mobile-screen-button
   ├─ Style: Clean illustration, 3 panels with arrows
   └─ Animation: Step-by-step highlight on scroll


┌─────────────────────────────────────────────────────────────────┐
│  TAB 3: 🔄 HOW IT WORKS                                       │
└─────────────────────────────────────────────────────────────────┘

CORE WORKFLOWS (Visual Step-by-Step Diagrams)

[WORKFLOW SECTION - VISUAL SPECIFICATIONS]
├─ Type: Expandable workflow cards (similar to Tab 2 feature cards)
├─ Card Style: Each workflow is a collapsible section
├─ Step Visualization: Numbered step indicators (1, 2, 3...)
├─ Icons: Professional FontAwesome icons for each step
├─ Animation: Steps fade in sequentially when expanded
├─ Progress Line: Vertical connecting line between steps
└─ Mobile: Steps stack vertically with connecting dots

1. OPERATOR ONBOARDING WORKFLOW (10 steps)

   [WORKFLOW ICON: fa-user-plus]

   [STEP-BY-STEP VISUALIZATION]
   ├─ Type: Vertical timeline with numbered circles
   ├─ Step Numbers: Circular badges (36px) with connecting line
   ├─ Icons Per Step:
   │  1. fa-mouse-pointer  6. fa-id-card
   │  2. fa-file-pen       7. fa-credit-card
   │  3. fa-hourglass      8. fa-file-lines
   │  4. fa-envelope       9. fa-calendar-check
   │  5. fa-right-to-bracket  10. fa-circle-check
   ├─ Animation: Each step highlights on scroll (sequential)
   └─ Style: Alternating left-right layout (desktop), stack (mobile)

   1. Visit vai.studio → Click "Become Operator"
   2. Registration form → Submit business info
   3. Pending approval screen → Admin reviews
   4. Approval granted → Welcome email + credentials
   5. First login → Onboarding tour starts
   6. Complete profile → Business details
   7. "Connect" Payment account → Payment setup (Stripe or Routable)
   8. Create first template → Activity definition
   9. Publish first schedule → Availability
   10. Operator active → Ready for bookings

2. TEMPLATE-TO-SCHEDULE WORKFLOW (4 steps)

   [WORKFLOW ICON: fa-wand-magic-sparkles]

   [BRANCHING DIAGRAM VISUALIZATION]
   ├─ Type: Horizontal flow with branching paths
   ├─ Main Flow: 4 stages with arrows (left to right)
   ├─ Icons: fa-file-lines → fa-calendar-days → fa-gears → fa-list
   ├─ Branching: Step 4 branches to "Modify template" and "Customize"
   ├─ Animation: Flow animates left-to-right on scroll
   └─ Style: Cards with animated connecting arrows

   1. Create Template: Define activity (name, pricing, capacity, images, rules)
   2. Create Schedule: Select template, set recurrence, define date range & time slots
   3. System Automation: Activity instances auto-generated, availability synced with other channels (e.g. GetYourGuide), bookings enabled
   4. Ongoing Management: Modify template → affects future, pause/resume, add exceptions
   5. Customize individual activities: Modify individual activity instances for special discounts, timings and more

   [SCREENSHOT: Template Creation Interface]
   ├─ Type: Form interface screenshot
   ├─ Content: Template creation form with fields
   ├─ Dimensions: 1000x650px
   ├─ Style: Browser frame mockup
   └─ Placeholder: /assets/screenshots/template-creation.png

3. BOOKING LIFECYCLE WORKFLOW (10 steps)

   [WORKFLOW ICON: fa-clipboard-check]

   [CIRCULAR LIFECYCLE DIAGRAM]
   ├─ Type: Circular flow diagram (booking lifecycle loop)
   ├─ Steps: 10 nodes arranged in circle
   ├─ Icons: Different icon for each stage
   ├─ Decision Point: Step 5 highlights branching (confirm/decline)
   ├─ Animation: Progress indicator travels around circle
   └─ Style: Clean circular path with step labels outside

   1. Tourist books activity on VAI Tickets
   2. Payment authorized (funds held, not captured)
   3. Operator receives notification in dashboard
   4. Operator reviews booking details
   5. Decision: CONFIRM | DECLINE | NO RESPONSE (24h deadline)
   6. If confirmed: payment captured, commission locked at 11%
   7. Activity date arrives
   8. Operator marks activity completed
   9. 7 days dispute protection period
   10. Automated payout: Operator 89%, VI Platform 11%

4. PAYMENT PROCESSING WORKFLOW (12 steps)

   [WORKFLOW ICON: fa-money-bill-transfer]

   [DETAILED FLOW DIAGRAM]
   ├─ Type: Swimlane diagram (3 lanes: Tourist, System, Operator)
   ├─ Lanes: Horizontal sections showing actor responsibilities
   ├─ Icons: Actor-specific icons for each step
   ├─ Connectors: Arrows showing data flow between lanes
   ├─ Animation: Steps highlight in sequence on scroll
   └─ Style: Professional swimlane with colored backgrounds

   1. Tourist enters payment details (via Stripe Connect)
   2. Stripe creates PaymentIntent (authorization only)
   3. Funds held on tourist's card (not captured)
   4. Operator confirms booking in dashboard
   5. System calls Edge Function: "capture-payment"
   6. Payment captured from tourist
   7. Funds transferred to VAI platform account
   8. Activity completion marked by operator
   9. 7 days wait period (dispute protection)
   10. System calls Edge Function: process-activity-payouts
   11. Payout provider transfers revenue in preferred currency (incl. XPF) to operator (89%)
   12. VAI Platform retains commission (11%)

5. REAL-TIME CHAT WORKFLOW (10 steps)

   [WORKFLOW ICON: fa-comments]

   [INTERACTIVE MESSAGING DIAGRAM]
   ├─ Type: Two-column flow (operator side | tourist side)
   ├─ WebSocket Visual: Animated bidirectional connection line
   ├─ Icons: Message bubbles with directional arrows
   ├─ Animation: Message "sends" across central connection
   └─ Style: Split-screen layout with real-time indicator

   1. Tourist or operator opens booking detail modal
   2. Chat modal loads conversation history
   3. Real-time subscription established (WebSocket)
   4. User types message
   5. Message sent and stored in database
   6. Real-time update triggers on other device
   7. Message appears instantly for both parties
   8. Read receipts updated
   9. Notification sent if recipient offline
   10. WhatsApp/Email fallback available if preferred

6. TOURIST JOURNEY WORKFLOW (5 phases, 27 steps)

   [WORKFLOW ICON: fa-person-hiking]

   [5-PHASE JOURNEY MAP]
   ├─ Type: Horizontal timeline with 5 major phases
   ├─ Phase Cards: Large cards with expandable step lists
   ├─ Icons Per Phase:
   │  PHASE 1: fa-magnifying-glass (Discovery)
   │  PHASE 2: fa-calendar-check (Booking)
   │  PHASE 3: fa-clipboard-list (Preparation)
   │  PHASE 4: fa-map-location-dot (During Trip)
   │  PHASE 5: fa-star (Post-Activity)
   ├─ Animation: Phases slide in from left (stagger)
   ├─ Progress Bar: Shows journey progression across phases
   └─ Mobile: Vertical accordion, one phase at a time

   PHASE 1: DISCOVERY (Pre-Trip)
   1. Visit app.vai.studio (or install Web-App (PWA))
   2. Select preferred language
   3. Choose discovery method:
      a. Island & mood-based: "I feel adventurous" → personalized recommendations
      b. Browse: Filter by island, dates, activity type, budget
   4. View activity details (description, pricing, operator info, availability)
   5. Save favorites for later consideration

   PHASE 2: BOOKING
   1. Select activity and click "Book Now"
   2. Choose date and available time slot
   3. Enter participant count (auto price calculation)
   4. Provide contact information (email, phone)
   5. Select currency (XPF, USD, EUR) for transparency and pay securely
   6. Receive instant confirmation with booking reference
   7. Add activity to personal calendar

   PHASE 3: PRE-ACTIVITY PREPARATION
   1. View booking in "Journey tab" (personal dashboard)
   2. See countdown to next activity
   3. Review preparation checklist
   4. Message operator with special requests
   5. Get directions to meeting point
   6. Receive operator confirmation notification

   PHASE 4: DURING TRIP
   1. Access booking details offline (PWA)
   2. Follow directions to meeting point
   3. Communicate with operator if needed
   4. Enjoy authentic local experience

   PHASE 5: POST-ACTIVITY
   1. View completed booking in history
   2. See total bookings and spending statistics
   3. Leave review (planned feature)
   4. Discover more activities for next visit
   5. Share experiences on social media

   [SCREENSHOT: Tourist Journey Dashboard]
   ├─ Type: Mobile mockup showing "Journey" tab
   ├─ Content: Upcoming activities with countdown timers
   ├─ Dimensions: 375x812px (iPhone size)
   ├─ Style: Phone frame mockup with screen
   └─ Placeholder: /assets/screenshots/tourist-journey.png

INTEGRATION ECOSYSTEM

[INTEGRATION ECOSYSTEM DIAGRAM - VISUAL SPECIFICATIONS]
├─ Type: Hub-and-spoke diagram (VAI Platform at center)
├─ Center: VAI Platform logo/icon (large)
├─ Spokes: Connecting lines to integration logos
├─ Status Badges: ✅ Live, 🟡 In Dev, ⏳ Planned beside each
├─ Logos: Brand logos for each integration partner
├─ Animation: Spokes draw from center outward on scroll
└─ Layout: Circular arrangement on desktop, list on mobile

Current Integrations ✅
├── Stripe Connect: Payment income processing
├── Routable: Fast payout in XPF
├── Supabase: Database, auth, real-time, storage
├── n8n: Workflow automation, booking notifications
├── WhatsApp Business/Email: Chat fallback
└── Web Share API: Native sharing on mobile

[INTEGRATION LOGOS - Current]
├─ Type: Brand logo cards with status badges
├─ Logos: Stripe, Routable, Supabase, n8n, WhatsApp
├─ Badge: Green ✅ "Live" badge (top-right corner)
├─ Style: White background cards, grayscale logos
├─ Hover Effect: Logo animates to full color
└─ Layout: 3-column grid, responsive

In Development 🟡
├── GetYourGuide API: Channel Manager integration
├── Viator API: Channel Manager integration
└── Expedia API: Channel Manager integration

[INTEGRATION LOGOS - In Development]
├─ Type: Brand logo cards with amber badges
├─ Logos: GetYourGuide, Viator, Expedia
├─ Badge: Amber 🟡 "In Dev" badge
├─ Style: Subtle dotted border (indicates in-progress)
└─ Layout: 3-column grid

Planned ⏳
├── Google Maps API: Location-based discovery
├── Enhanced n8n: Further automation
└── (Features on request/demand - please contact VAI)

[INTEGRATION LOGOS - Planned]
├─ Type: Icon placeholders with gray badges
├─ Icons: Google Maps icon, enhanced n8n icon
├─ Badge: Gray ⏳ "Planned" badge
├─ Style: Lower opacity (50%), dashed border
└─ Layout: Row of cards

[CTA BUTTON]
│ Request-Button │
├─ Type: Secondary CTA button
├─ Icon: fa-paper-plane
├─ Style: Outline button style
└─ Link: vai.studio/contact/


┌─────────────────────────────────────────────────────────────────┐
│  TAB 4: 💡 VALUE PROPOSITION                                  │
└─────────────────────────────────────────────────────────────────┘

PROBLEMS SOLVED (Organized by Problem Type, but mark target Audience if applicable!)

[PROBLEM-SOLUTION CARDS - VISUAL SPECIFICATIONS]
├─ Type: Problem category cards (4 categories)
├─ Card Header: Icon + category name + problem count
├─ Expandable: Click to reveal problem-solution pairs
├─ Icons Per Category:
│  ├─ Financial: fa-coins
│  ├─ Operational: fa-gears
│  ├─ Digital Visibility: fa-globe
│  └─ Tourist Experience: fa-person-hiking
├─ Layout: 2x2 grid on desktop, stack on mobile
├─ Animation: Cards slide up on viewport entry (stagger)
└─ Problem-Solution Format: Red "X" problem → Green "✓" solution

FINANCIAL PROBLEMS → SOLUTIONS
├── High OTA Commissions (20-30%)
│   → 11% Fair Commission (locked at confirmation)
│   → 10-20% more revenue per booking for operators
│
├── Delayed Payments (30-60 days)
│   → 7 days Automated Payouts
│   → Faster access to working capital
│
├── Currency Conversion Losses
│   → XPF-Native Operator Payouts (via third-party partner)
│   → Tourists pay in preferred currency (USD, EUR or other)
│
├── Unpredictable Rate Changes
│   → Commission Rate Locking (at booking confirmation)
│   → Transparent, predictable revenue split
│
├── Upfront Software Costs
│   → Zero-Cost Entry (commission-only model)
│   → Eliminates 200K-1M XPF barrier for booking/reservation system
│
└── High Website Development Costs
    → Free Auto-Generated Booking Pages
    → Professional online presence at zero cost

OPERATIONAL PROBLEMS → SOLUTIONS
├── Double-Booking Chaos
│   → Real-Time Availability Sync
│   → Target: up to 0% double-bookings (vs 15-20% typical)
│
├── Repetitive Activity Creation
│   → Template-First Architecture
│   → 90% time savings (create once, schedule unlimited)
│
├── Manual Booking Coordination
│   → Centralized Dashboard
│   → All bookings in one place (vs scattered channels)
│
├── Time-Consuming Scheduling
│   → Automated Instance Generation & Duplication-Mode
│   → Recurring patterns replace manual repetition
│
└── Scattered Communications
    → Unified Chat System
    → All conversations in one platform

DIGITAL VISIBILITY PROBLEMS → SOLUTIONS
├── No Professional Website
│   → Auto-Generated Booking Pages
│   → Instant Google-discoverable presence
│
├── Language Barriers
│   → 8-Language Support (including Tahitian)
│   → Reach indefinite international visitors
│
├── No SEO Knowledge
│   → Auto-Optimized Listings
│   → Meta tags, structured data, sitemap handled automatically
│
├── Cannot Compete with OTA Ad Budgets
│   → Equal Marketplace Visibility incl. Channel Manager
│   → Mood-based algorithm (not pay-to-rank)
│
└── Mobile-Only Operations
    → Responsive Design
    → Full functionality on any device

TOURIST EXPERIENCE PROBLEMS → SOLUTIONS
├── Keyword Search Fatigue
│   → Island & Mood-Based Discovery
│   → Find activities by feeling (Adventure, Relax, Culture, Ocean, Romance, Family)
│
├── Hidden Payment Fees
│   → Transparent Pricing
│   → Real-time price calculation, no surprises
│
├── Generic Mass Tourism
│   → Authentic Local Experiences (local business independent of size) 
│   → Direct booking with verified Polynesian operators (normally not accessible)
│
├── Complex Booking Process
│   → 5-Step Simple Guided Wizard
│   → Target high completion rate 
│
├── No Offline Access
│   → Progressive Web App
│   → Basic function works without internet (flights, remote islands)
│
├── Limited Payment Options
│   → Multiple Payment Methods
│   → Cards, Apple Pay, Google Pay, and more
│
├── Impersonal Service
│   → Direct Operator Communication
│   → Real-time chat, special requests, relationship building
│
└── Tourist Concentration in Bora Bora
    → Tourism Dispersal Algorithm
    → Equal visibility for all islands

PLATFORM DIFFERENTIATORS (VAI vs Global OTAs)

[COMPARISON TABLE - VISUAL SPECIFICATIONS]
├─ Type: Side-by-side comparison table
├─ Columns: Feature | VAI Platform | Global OTAs
├─ Header Style: Sticky header on scroll
│  ├─ VAI Column: Accent color background, white text
│  ├─ OTA Column: Neutral gray background
├─ Row Highlighting:
│  ├─ VAI Advantages: Subtle green background tint
│  ├─ Icons: fa-check (green) for VAI wins
│  ├─ Icons: fa-xmark (red) for OTA disadvantages
├─ Mobile View: Card-based comparison (swipe between)
├─ Animation: Rows fade in on scroll (sequential)
└─ Style: Clean borders, alternating row backgrounds

| Feature                   | VAI Platform                                     | Global OTAs (Viator, GetYourGuide, Expedia)   |
|---------------------------|--------------------------------------------------|------------------------------------------------|
| Discovery Method          | Mood-based (Adventure, Relax, Culture, etc.)     | Keyword search only                            |
| Commission Rate           | 11% (flexible, locked at confirmation)           | 20-30% (often higher with add-ons)             |
| Payout Speed              | 7 days post-activity                           | 30-60 days standard                            |
| Currency                  | Operators receive XPF (local)                    | USD/EUR (currency conversion risk)             |
| Platform Focus            | French Polynesia Expertise (all islands)              | Global (generic, no local expertise)           |
| Language Support          | 8 languages including Tahitian                   | multiple languages (no Tahitian)                    |
| Operator Empowerment      | Zero costs, free tools, channel manager          | Monthly fees, expensive integrations           |
| Tourism Dispersal         | Equal visibility all islands                 | Concentrated on high-commission tours          |
| Cultural Authenticity     | Tahitian language, local operators, Learn Hub    | Transactional only, low cultural content        |
| Small Operator Access     | Template system, no-cost visibilty tools                | Complex CMS, high learning curve               |
| Direct Communication      | Real-time chat built-in                          | Limited/no direct contact                      |
| Offline Access            | PWA (works offline)                              | Online-only (requires internet)                |
| Data Sovereignty          | Government access to anonymized data             | Data owned by foreign corporation              |
| Social Impact             | 5% fund for local environmental/cultural projects      | No local social responsibility commitment      |
| Account Requirement       | Optional (guest checkout available)              | Account required for booking                   |

[TABLE VISUAL ENHANCEMENTS]
├─ Icons in cells: Small icons beside key differentiators
│  ├─ Commission: fa-percentage
│  ├─ Payout: fa-clock
│  ├─ Currency: fa-money-bill-wave
│  ├─ Language: fa-language
│  ├─ Chat: fa-comments
│  └─ Offline: fa-wifi-slash
├─ Highlight Animation: Hover row to highlight
└─ Export Button: "Download Comparison PDF" (bottom)

VAI'S COMPETITIVE MOAT (Unique Advantages)

[COMPETITIVE MOAT VISUALIZATION]
├─ Type: Shield/moat diagram with 7 defensive layers
├─ Center: VAI Platform logo
├─ Layers: 7 concentric circles/shields (each = 1 advantage)
├─ Icons Per Advantage:
│  1. fa-flag (Local Legitimacy)
│  2. fa-layer-group (Template-First)
│  3. fa-heart (Mood-Based Discovery)
│  4. fa-network-wired (Channel Manager)
│  5. fa-hand-holding-heart (Cultural Preservation)
│  6. fa-map (Tourism Dispersal)
│  7. fa-bullhorn (Zero-Cost Marketing)
├─ Animation: Layers appear outward from center (stagger)
└─ Mobile: Numbered list with icons, no circular diagram

1. Local Legitimacy: Built in French Polynesia, for French Polynesia-first, with deep institutional relationships
2. Template-First Architecture: Premium easy-understandable Airbnb-style system (reusable templates → automated scheduling)
3. Mood-Based Discovery: Emotional search algorithm vs transactional keyword search
4. Channel Manager Integration: VAI as B2B hub (operators manage all channels from one dashboard) instead of competition
5. Cultural Preservation: Tahitian language support demonstrates commitment beyond profit
6. Tourism Dispersal Algorithm: Promotes outer islands for sustainable tourism (not profit-maximizing)
7. Zero-Cost Marketing Channel: Operators get free website and shareable booking pages (high value for small businesses with authentic experiences)


┌─────────────────────────────────────────────────────────────────┐
│  TAB 5: 📊 IMPACT & CAPABILITIES                              │
└─────────────────────────────────────────────────────────────────┘

PLATFORM CAPABILITIES DESIGNED TO DELIVER IMPACT
(Market-Ready, Pre-Launch - Validated Through Testing)

[CAPABILITY METRICS - VISUAL SPECIFICATIONS]
├─ Type: Metric cards organized by stakeholder category
├─ Card Style: White background, colored left border (category)
├─ Metric Display: Large number + unit + comparison
├─ Icons: Category-specific FontAwesome icons
├─ Progress Bars: Visual comparison (VAI vs industry)
├─ Animation: Count-up animation on viewport entry
└─ Layout: Cards grid, full-width on mobile

1. OPERATOR SUCCESS CAPABILITIES

   [SECTION ICON: fa-briefcase]

Economic Empowerment

[METRIC CARDS - Economic]
├─ Type: Side-by-side comparison cards
├─ Card Elements:
│  ├─ Icon: fa-percentage (Commission)
│  ├─ Big Number: "11%" vs "20-30%"
│  ├─ Progress Bar: Visual comparison (11% vs 30%)
│  ├─ Target: "+10-20% revenue" (green badge)
├─ Animation: Progress bar fills from left (0.8s ease)
└─ Layout: 4-card grid (2x2), stack on mobile

├── Fair Commission Model: 11% vs 20-30% standard
│   → Target: 10-20% increase in revenue per booking
│
│   [METRIC VISUAL: Commission Comparison]
│   ├─ Icon: fa-percentage
│   ├─ Bar Chart: 11% (green) vs 30% (red)
│   └─ Badge: "+10-20% revenue" (green)
│
├── Fast Payout System: 7 days vs 30-60 days
│   → Target: 85% reduction in cash flow cycle
│
│   [METRIC VISUAL: Payout Speed]
│   ├─ Icon: fa-clock-rotate-left
│   ├─ Timeline: 7 days marker vs 30-60d marker
│   └─ Badge: "-85% cash flow cycle" (green)
│
├── Zero-Cost Entry: No upfront fees
│   → Eliminates 200K-1M XPF barrier
│
│   [METRIC VISUAL: Cost Barrier]
│   ├─ Icon: fa-dollar-sign with fa-slash
│   ├─ Crossed-out price: "0 XPF" vs "200K-1M XPF"
│   └─ Badge: "Barrier eliminated" (green)
│
└── Template Efficiency: Reusable templates
    → Target: 90% reduction in setup time

    [METRIC VISUAL: Time Savings]
    ├─ Icon: fa-wand-magic-sparkles
    ├─ Clock icon: 90% reduction indicator
    └─ Badge: "-90% setup time" (green)

Operational Excellence
├── Real-Time Availability Sync
│   → Target: 0% double-bookings (vs 15-20% typical)
├── Automated Workflows: 24h confirmation deadline
│   → Target: Faster confirmation process
├── Automated Payment Processing
│   → Eliminates manual errors and reconciliation
├── Centralized Communication Hub
│   → All bookings in one dashboard
└── Dynamic Pricing Tools
    → Optimize occupancy and revenue

Digital Presence
├── Instant Online Visibility
│   → Professional web presence at zero cost
├── Global Market Access: 8-language support
│   → 300,000+ annual visitors addressable
├── International Payment: 25+ countries
│   → Capture international bookings
└── SEO Optimization
    → Immediate Google discoverability

2. TOURIST EXPERIENCE CAPABILITIES

Discovery Experience
├── Mood-Based Discovery System
│   → Reduce search fatigue, increase engagement
│   → Target: 40%+ outer island bookings (vs 15% industry)
├── Educational Content Integration
│   → Transform booking into meaningful trip planning
│   → Target: Longer session times vs transactional OTAs
└── Favorites System
    → Support discovery process

Booking Experience
├── Frictionless Guest Checkout
│   → Target: 80-85% completion rate (vs 60% industry)
├── Multi-Currency Flexibility
│   → Serve international tourists without barriers
├── Mobile-First PWA
│   → 75%+ travel bookings occur on mobile
└── 5-Step Guided Wizard
    → Minimize complexity, maximize conversions

Communication & Support
├── Direct Operator Messaging
│   → Target: Faster response times (vs 24h+ OTA)
├── Special Requests Handling
│   → Personalize experiences (dietary, accessibility)
└── Booking-Specific Conversations
    → Maintain context, improve service quality

Educational Engagement
├── Learn Hub Content Library
│   → Increase cultural awareness, responsible tourism
├── Multi-Format Education
│   → Serve diverse learning preferences
└── Pre-Booking Cultural Preparation
    → Transform tourists into informed visitors

PWA Technical Capabilities
├── Offline Functionality
│   → Target: 15-20% offline usage scenarios
├── Installation Without App Store
│   → Higher usage/installation rate
├── Fast Loading Performance
│   → <3s load (meet industry standards)
└── Cross-Device Synchronization
    → Seamless multi-device experience

3. PLATFORM PERFORMANCE CAPABILITIES

Technical Reliability
├── Infrastructure Design: Serverless architecture
│   → Target: 99.9%+ uptime (production-grade)
├── Performance Optimization
│   → Target: <3s load times (meet industry standards)
├── Real-Time Communication: WebSocket
│   → <800ms notification delivery
└── Payment Processing Security: Stripe PCI Level 1
    → Target: 98%+ payment success rate

Platform Design for Adoption
├── Template-First Architecture
│   → Target: Operators use templates
├── Communication Integration
│   → Target: Relevant bookings include chat 
├── Multi-Language Accessibility
│   → Serve tourists in native language
└── Mobile-Optimized Interface
    → Operator use mobile usage for essential tasks

4. ECOSYSTEM TRANSFORMATION CAPABILITIES

For French Polynesia
├── Revenue Repatriation: 10-20% more stays local
│   → Reduced economic leakage to foreign OTAs
├── Digital Formalization: 4,500+ operators accessible
│   → Brings local small businesses into digital economy
├── Tourism & Operator Data: Government/Tourism Leaders data access
│   → Evidence-based policy making
├── Island Dispersal: Mood-based algorithm
│   → Higher outer island reach
├── Employment: 2,000+ entrepreneurs enabled
│   → Platform empowers local competition
└── Tax Revenue: Local platform = local taxes
    → VAI and Operator pay FP taxes (vs global OTAs paying outside)

For Sustainable Tourism
├── 5% Social Impact Fund
│   → 2.88M+ XPF annually at target scale
├── Professionalization: Free analytics & training
│   → Included at no additional cost
├── Entrepreneur Empowerment
│   → Local operators compete with global OTAs
├── Community Building
│   → VAI-organised awareness workshops and training
├── Cultural Preservation
│   → Tahitian language, Learn Hub education
├── Communication Channel
│   → Direct line to tourism institutions
└── Overtourism Reduction
    → Dispersal algorithm (Bora Bora relief)

TARGET BENCHMARKS VS INDUSTRY STANDARDS

[BENCHMARK TABLE - VISUAL SPECIFICATIONS]
├─ Type: Three-column comparison table
├─ Columns: Metric | VAI Target | Industry Standard
├─ Categories: 3 sections (Operator, Tourist, Platform)
├─ Category Headers: Colored background headers with icons
├─ Visual Elements:
│  ├─ Progress Bars: Show VAI vs Industry visually
│  ├─ Icons: Metric-specific icons in first column
│  ├─ Color Coding: Green (better), Red (worse), Gray (equal)
│  ├─ Arrows: ↑ improvement, ↓ reduction indicators
├─ Animation: Bars fill on scroll, numbers count up
├─ Mobile: Stack columns, one metric per card
└─ Style: Clean table with subtle borders, alternating rows

Operator Success Metrics

[CATEGORY HEADER: Operator Success]
├─ Icon: fa-briefcase
├─ Background: Accent color (light)
└─ Expand/Collapse: Click to show/hide metrics

├── Revenue Per Booking: 10-20% increase (lower commission)
│   [BAR: VAI 110-120% vs Industry 100%] ↑
├── Cash Flow Cycle: 85% reduction (7 days vs 30-60 days)
│   [BAR: VAI 15% vs Industry 100%] ↓
├── Setup Time: 90% reduction (template system)
│   [BAR: VAI 10% vs Industry 100%] ↓
├── Double-Booking Rate: Target 0% (vs 15-20% typical)
│   [BAR: VAI 0% vs Industry 15-20%] ↓
└── Response Efficiency: 95% faster (automated vs manual)
    [BAR: VAI 5% vs Industry 100%] ↓

Tourist Experience Metrics

[CATEGORY HEADER: Tourist Experience]
├─ Icon: fa-person-hiking
├─ Background: Accent color (light)
└─ Expand/Collapse: Click to show/hide

├── Booking Completion: Improved towards 60% industry standard - simplified flow, guest checkout
│   [BAR: VAI Target 80%+ vs Industry 60%] ↑
├── Return Visitor Rate: Increase rate for returning visitors within 6 months (vs <20% OTAs) - PWA, content, spontanity
│   [BAR: VAI Target 30%+ vs Industry <20%] ↑
├── Customer Satisfaction: Increased satisfaction (vs 3.8 OTA average) - direct communication, authenticity
│   [BAR: VAI Target 4.5+ vs Industry 3.8] ↑
└── Tourism Dispersal: Outer islands promotion - mood algorithm, equal visibility, offline mode
    [BAR: VAI Target 40%+ vs Industry 15%] ↑

Platform Performance Metrics

[CATEGORY HEADER: Platform Performance]
├─ Icon: fa-gauge-high
├─ Background: Accent color (light)
└─ Expand/Collapse: Click to show/hide

├── Page Load Speed: <3s (vs 5-10s industry standard)
│   [BAR: VAI <3s vs Industry 5-10s] ↓
├── Real-Time Latency: <800ms (instant notification feel)
│   [BAR: VAI <800ms vs Industry 2-5s] ↓
├── Payment Success: Target 98%+ (Stripe reliability)
│   [BAR: VAI 98%+ vs Industry 90-95%] ↑
├── Platform Availability: Target 99.9%+ (serverless infrastructure)
│   [BAR: VAI 99.9%+ vs Industry 95-98%] ↑
├── Mobile Usage: Target 70%+ operator sessions (responsive design)
│   [BAR: VAI 70%+ vs Industry 40-50%] ↑
└── Template Adoption: Target 90%+ operators (intuitive workflow)
    [BAR: VAI 90%+ vs Industry N/A] ✓


┌─────────────────────────────────────────────────────────────────┐
│  TAB 6: 🔧 TECHNICAL ARCHITECTURE (Optional Deep Dive)        │
└─────────────────────────────────────────────────────────────────┘

EXPANDABLE/COLLAPSIBLE SECTION (for technical stakeholders)

[TECHNICAL DEEP DIVE - VISUAL SPECIFICATIONS]
├─ Type: Expandable accordion sections
├─ Initial State: Collapsed with "Show Technical Details" button
├─ Button Style: Secondary style with fa-code icon
├─ Expanded State: All sections visible with code snippets
├─ Warning Banner: "Technical content ahead - designed for developers"
├─ Icons: Code/tech-specific FontAwesome icons throughout
└─ Syntax Highlighting: Code blocks with syntax colors

Component Architecture (90+ Components Total)

[COMPONENT TREE DIAGRAM]
├─ Type: Interactive tree/hierarchy diagram
├─ Root Nodes: Operator Dashboard | Tourist App | Shared
├─ Expandable: Click to reveal component children
├─ Icons: fa-sitemap for hierarchy visualization
├─ Color Coding: Different colors per application
├─ Hover: Show component file path and line count
└─ Mobile: Simplified list view with indentation
├── Operator Dashboard: 45+ React components
├── Tourist App: 45+ React components
├── Shared Components: Navigation, Language, Theme
├── Chart Components: Bar, Line, Pie visualization
└── Feature Components: Booking, Template, Schedule, Payment, Chat

Service Layer (15+ Services)
├── paymentService.js: Payment processing, capture, refunds, payouts
├── chatService.js: Real-time messaging, conversation management
├── notificationService.js: Cross-device notifications with i18n
├── templateService.js: Template CRUD operations
├── scheduleService.js: Schedule management, activity instance generation
├── stripeConnectService.js: Stripe account creation/verification
├── operatorRegistration.js: Onboarding workflow
├── bookingValidationService.js: Business rule validation
└── onboardingStateManager.js: Onboarding progress tracking

Database Schema (10+ Tables)
├── operators: Operator business profiles
├── tours: Unified template + instance system
├── bookings: Customer reservations
├── schedules: Recurring availability patterns
├── notifications: Cross-device notification sync
├── booking_conversations: Real-time chat
├── tourist_users: Customer profiles
└── Database Views: operator_booking_summary, schedule_details, pending_bookings_for_workflow

Edge Functions (12 Serverless Endpoints - Deno Runtime)
├── create-payment-intent: Tourist booking authorization
├── capture-payment: Operator confirmation charge
├── refund-payment: Cancellation processing
├── create-connect-account: Operator Stripe account
├── create-account-link: Onboarding URL generation
├── check-connect-status: Account verification
├── mark-tour-completed: Completion tracking
├── process-tour-payouts: Automated transfers
└── get-payment-status: Payment info retrieval

Technology Stack Detailed

[TECH STACK LAYERS DIAGRAM]
├─ Type: Layered architecture visualization
├─ Layers (bottom to top):
│  1. Infrastructure (Serverless, Supabase)
│  2. Backend (PostgreSQL, Edge Functions, Auth)
│  3. API Layer (REST, Realtime, Storage)
│  4. Frontend (React 19, Vite, Tailwind)
│  5. Features (Components, Services, State)
│  6. User Interface (Operator/Tourist Apps)
├─ Icons: Stack-specific brand logos and icons
├─ Animation: Layers slide in from bottom (sequential)
├─ Hover: Show version numbers and key features
└─ Style: Horizontal bars with labels, clean modern look

├── Frontend: React 19, Vite 4, Tailwind CSS 3, i18next 25, Zustand 4, Framer Motion 10
├── Backend: Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
├── Payments: Stripe Connect, @stripe/stripe-js 7
├── Automation: n8n webhooks, serverless Edge Functions
├── PWA: vite-plugin-pwa, Workbox Service Worker
└── Infrastructure: Serverless, auto-scaling, 99.9%+ uptime SLA

[PACKAGE.JSON VISUAL]
├─ Type: Code block with syntax highlighting
├─ Content: Key dependencies with version numbers
├─ Style: Dark theme code editor appearance
├─ Copy Button: "Copy dependencies" (top-right)
└─ Expandable: Show/hide full package.json


┌─────────────────────────────────────────────────────────────────┐
│  TAB 7: 📞 GET INVOLVED                                       │
└─────────────────────────────────────────────────────────────────┘

PRE-REGISTRATION & CONTACT

[CTA SECTION - VISUAL SPECIFICATIONS]
├─ Type: Large call-to-action cards
├─ Layout: 2-column grid (3 rows), stack on mobile
├─ Card Style: Gradient backgrounds, white text, large icons
├─ Hover Effect: Lift animation (translateY -5px), glow effect
├─ Button Style: Prominent CTA button in each card
└─ Icons: Large (64px) professional FontAwesome icons

├── Pre-Register as Operator

│   [CTA CARD - Operator]
│   ├─ Icon: fa-briefcase (64px, white)
│   ├─ Gradient: Accent gradient background
│   ├─ Title: "Join as Operator" (large, bold)
│   ├─ Benefits: Bullet list with checkmarks
│   ├─ CTA Button: "Pre-Register Now" (white button, accent text)
│   │   Icon: fa-user-plus
│   │   Link: operator.vai.studio/trackingcode
│   └─ Hover: Card lifts, button glows

│   ├── Fill out operator interest form >> │ Button to operator.vai.studio/"trackingcode" │
│   ├── Get early access to platform (before public launch)
│   ├── Benefit from launch promotions
│   └── Receive onboarding support
│
├── Pre-Register as Tourist (Early User)

│   [CTA CARD - Tourist]
│   ├─ Icon: fa-person-hiking (64px, white)
│   ├─ Gradient: Secondary gradient background
│   ├─ Title: "Early User Access" (large, bold)
│   ├─ Benefits: Bullet list with checkmarks
│   ├─ CTA Button: "Sign Up for Early Access" (white button)
│   │   Icon: fa-rocket
│   └─ Hover: Card lifts, button glows

│   ├── Sign up for early access to VAI Tickets
│   ├── Register before official launch
│   └── Get informed once VAI platform goes live
│
├── Investor Inquiry >> │ Button to vai.studio/contact/ │

│   [CTA CARD - Investor]
│   ├─ Icon: fa-chart-line (64px, white)
│   ├─ Gradient: Professional gradient background
│   ├─ Title: "Investment Opportunities" (large, bold)
│   ├─ Benefits: Bullet list with checkmarks
│   ├─ CTA Button: "Request Investment Deck" (white button)
│   │   Icon: fa-file-contract
│   │   Link: vai.studio/contact/
│   └─ Hover: Card lifts, button glows

│   ├── Request investment deck
│   ├── Schedule meeting with founder
│   ├── Access detailed financials
│   └── Discuss partnership opportunities
│
├── Partnership Opportunities >> │ Button to vai.studio/contact/ │

│   [CTA CARD - Partnership]
│   ├─ Icon: fa-handshake (64px, white)
│   ├─ Gradient: Accent gradient background
│   ├─ Title: "Partner With VAI" (large, bold)
│   ├─ Partnership Types: Bullet list
│   ├─ CTA Button: "Explore Partnerships" (white button)
│   │   Icon: fa-handshake-simple
│   │   Link: vai.studio/contact/
│   └─ Hover: Card lifts, button glows

│   ├── Tourism board collaboration
│   ├── Hotel/resort integration
│   ├── DMC/inbound operator partnership
│   └── Technology partnership
│
└── Government/Institutional Contact >> │ Button to vai.studio/contact/ │

    [CTA CARD - Government]
    ├─ Icon: fa-building-columns (64px, white)
    ├─ Gradient: Professional gradient background
    ├─ Title: "Government & Institutions" (large, bold)
    ├─ Contact Types: Bullet list
    ├─ CTA Button: "Contact VAI" (white button)
    │   Icon: fa-envelope
    │   Link: vai.studio/contact/
    └─ Hover: Card lifts, button glows

    ├── Data access inquiries (VAI Insights)
    ├── Policy alignment discussions
    ├── Public-private partnership
    └── Tourism development collaboration

FOUNDER CONTACT

[FOUNDER PROFILE CARD - VISUAL SPECIFICATIONS]
├─ Type: Profile card with photo and contact details
├─ Layout: Horizontal card (photo left, details right)
├─ Photo: Professional headshot (circular, 150px)
├─ Icons: Professional FontAwesome icons for each link
│  ├─ Email: fa-envelope
│  ├─ LinkedIn: fa-linkedin (brand icon)
│  ├─ Career: fa-file-user
│  └─ Website: fa-globe
├─ Style: Clean card with subtle shadow
├─ Hover: Links underline, icons pulse
└─ Mobile: Stack vertically (photo top, details below)

├── Kevin De Silva
├── Founder & Engineer
├── Based in: Moorea, French Polynesia

│   [PROFILE PHOTO PLACEHOLDER]
│   ├─ Type: Circular profile photo
│   ├─ Dimensions: 150x150px (circular crop)
│   ├─ Border: Subtle accent color border (3px)
│   ├─ Style: Professional headshot
│   └─ Placeholder: /assets/images/founder-kevin.jpg

├── Email: hello@kevindesilva.de
│   [ICON: fa-envelope | Link with hover underline]
├── LinkedIn: https://www.linkedin.com/in/kevin-desilva/
│   [ICON: fa-linkedin | Link with hover underline]
├── Career Path: https://kevindesilva.de/curriculum_vitae_fr/
│   [ICON: fa-file-user | Link with hover underline]
└── VAI Studio Website: vai.studio
    [ICON: fa-globe | Link with hover underline]

SOCIAL LINKS

[SOCIAL MEDIA BAR - VISUAL SPECIFICATIONS]
├─ Type: Horizontal icon row with brand colors
├─ Icons: Large circular social media icons (48px)
│  ├─ Facebook: fa-facebook (Facebook blue)
│  ├─ TikTok: fa-tiktok (TikTok black/pink)
│  └─ Instagram: fa-instagram (Instagram gradient)
├─ Hover Effect: Icon bounces, background glows
├─ Style: Circular buttons with subtle shadows
└─ Layout: Centered horizontal row, stack on small mobile

├── Follow Us on Facebook
│   [ICON: fa-facebook | Circular button, Facebook blue]
├── Follow Us on TikTok
│   [ICON: fa-tiktok | Circular button, TikTok styling]
└── Follow Us on Instagram
    [ICON: fa-instagram | Circular button, Instagram gradient]

```

---

## 🎨 COMPREHENSIVE VISUAL DESIGN SYSTEM

### **Color Palette & Brand Guidelines**

[PRIMARY COLORS]
├─ Accent Color: Turquoise/Teal (French Polynesian lagoon-inspired)
│  ├─ Primary: #00B4D8 (main accent)
│  ├─ Light: #90E0EF (backgrounds, hover states)
│  └─ Dark: #0077B6 (headers, emphasis)
├─ Secondary Color: Coral/Sunset
│  ├─ Primary: #FF6B6B (CTAs, important highlights)
│  └─ Light: #FFB4B4 (subtle accents)
└─ Neutral Palette:
    ├─ White: #FFFFFF (backgrounds)
    ├─ Light Gray: #F8F9FA (section backgrounds)
    ├─ Medium Gray: #6C757D (secondary text)
    ├─ Dark Gray: #212529 (primary text)
    └─ Black: #000000 (headers, high contrast)

[STATUS COLORS]
├─ Success/Live: #28A745 (green - "Live & Ready" ✅)
├─ Warning/In Dev: #FFC107 (amber - "In Development" 🟡)
├─ Info/Planned: #6C757D (gray - "Planned" ⏳)
└─ Error/Problem: #DC3545 (red - problem indicators)

### **Typography System**

[FONT HIERARCHY]
├─ Headings: Sans-serif (system fonts or custom)
│  ├─ H1: 48px / 3rem (Hero titles)
│  ├─ H2: 36px / 2.25rem (Tab titles, section headers)
│  ├─ H3: 28px / 1.75rem (Subsections)
│  ├─ H4: 24px / 1.5rem (Card titles)
│  └─ H5: 20px / 1.25rem (Small headers)
├─ Body Text: Sans-serif
│  ├─ Large: 18px / 1.125rem (feature descriptions)
│  ├─ Regular: 16px / 1rem (standard content)
│  └─ Small: 14px / 0.875rem (captions, metadata)
└─ Code/Technical: Monospace
    └─ 14px / 0.875rem (code blocks, technical content)

[FONT WEIGHTS]
├─ Bold: 700 (headers, emphasis)
├─ Semi-bold: 600 (subheaders, labels)
├─ Regular: 400 (body text)
└─ Light: 300 (large display text, if needed)

### **Icon System - FontAwesome Professional Icons**

[ICON CATEGORIES & SIZES]
├─ Hero Icons: 64-96px (major visual elements)
├─ Feature Icons: 48px (feature cards, capabilities)
├─ Navigation Icons: 20-24px (tab icons, buttons)
├─ Inline Icons: 16-18px (text inline, status badges)
└─ Micro Icons: 12-14px (table cells, small indicators)

[ICON USAGE RULES]
├─ Use solid icons (fa-solid) for most UI elements
├─ Use regular icons (fa-regular) for outlined/light style
├─ Use brand icons (fa-brands) for social media, tech logos
├─ Never use emoji characters - always professional icons
└─ Maintain consistent icon weight across similar elements

### **Animation & Interaction Guidelines**

[ANIMATION TIMING]
├─ Micro-interactions: 0.15-0.2s (button hovers, icon changes)
├─ Standard transitions: 0.3s (card expansions, tab switches)
├─ Page elements: 0.5-0.8s (scroll-triggered animations)
└─ Complex sequences: 1-1.5s (multi-step workflows, counters)

[ANIMATION TYPES]
├─ Fade In: Opacity 0 → 1 (viewport entry)
├─ Slide In: translateX/Y + fade (sequential reveals)
├─ Scale: scale(0.95) → scale(1) (hover effects)
├─ Lift: translateY(0) → translateY(-5px) (card hovers)
├─ Count Up: 0 → target number (statistics)
├─ Progress Fill: width 0% → 100% (bar charts)
└─ Stagger: Sequential delay (0.1-0.2s) for list items

[EASING FUNCTIONS]
├─ Standard: ease-in-out (most transitions)
├─ Smooth: cubic-bezier(0.4, 0, 0.2, 1) (material design)
├─ Bounce: elastic/spring (playful interactions)
└─ Sharp: ease-out (exit animations)

### **Responsive Breakpoints**

[DEVICE BREAKPOINTS]
├─ Mobile: 320px - 767px
│  ├─ Navigation: Hamburger menu
│  ├─ Grids: Stack to single column
│  └─ Tables: Card-based or horizontal scroll
├─ Tablet: 768px - 1023px
│  ├─ Navigation: Condensed horizontal tabs
│  ├─ Grids: 2-column layouts
│  └─ Tables: Simplified columns
└─ Desktop: 1024px+
    ├─ Navigation: Full horizontal tab bar
    ├─ Grids: 3-4 column layouts
    └─ Tables: Full table display

### **Component Specifications**

[BUTTONS]
├─ Primary: Gradient background, white text, 44px height
├─ Secondary: Outline style, colored border/text, 40px height
├─ Icon Buttons: Circular, 40px diameter, icon centered
├─ Hover: translateY(-2px), shadow increase, 0.2s ease
└─ Icons: 16-20px beside text, or standalone

[CARDS]
├─ Background: White with subtle shadow
├─ Border Radius: 8-12px (rounded corners)
├─ Padding: 24px (desktop), 16px (mobile)
├─ Shadow: 0 2px 8px rgba(0,0,0,0.1)
├─ Hover: Shadow increases, subtle lift (translateY -5px)
└─ Border: Optional colored left border (4px) for categories

[TABLES]
├─ Header: Sticky on scroll, colored background
├─ Rows: Alternating backgrounds (#FFFFFF, #F8F9FA)
├─ Borders: Subtle borders (1px, #E9ECEF)
├─ Hover: Row highlight (#F0F0F0)
├─ Icons: 16px inline with text
└─ Mobile: Transform to cards or horizontal scroll

[BADGES]
├─ Status Badges: Pill-shaped, 20px height
│  ├─ Live ✅: Green background, white text
│  ├─ In Dev 🟡: Amber background, dark text
│  └─ Planned ⏳: Gray background, white text
├─ Metric Badges: Small rectangular, 24px height
│  └─ Achievement indicators (green), targets (blue)
└─ Corner Badges: Absolute positioned (top-right)

[PROGRESS BARS]
├─ Height: 8-12px
├─ Background: Light gray (#E9ECEF)
├─ Fill: Gradient or solid accent color
├─ Border Radius: 4px (fully rounded ends)
├─ Animation: Fill from left, 0.8s ease-in-out
└─ Labels: Above or inline with percentage

### **Image & Media Specifications**

[SCREENSHOT STANDARDS]
├─ Browser Mockups: 1200x750px (16:10 ratio)
├─ Mobile Mockups: 375x812px (iPhone ratio)
├─ Tablet Mockups: 768x1024px (iPad ratio)
├─ Frame Style: Realistic device frames or browser chrome
├─ Shadows: Subtle drop shadows for depth
└─ Format: PNG with transparency, or JPG with white background

[PHOTO REQUIREMENTS]
├─ Hero Background: 1920x1080px (Full HD)
├─ Profile Photos: 500x500px minimum (circular crop)
├─ Thumbnail Images: 400x300px (4:3 ratio)
├─ Format: JPG (photos), PNG (screenshots/graphics)
├─ Compression: Optimized for web (<500KB per image)
└─ Alt Text: Always include descriptive alt attributes

[LOGO USAGE]
├─ Brand Logos: SVG format preferred (scalable)
├─ Partner Logos: Grayscale default, color on hover
├─ Icon Logos: 60-80px height in grids
└─ Spacing: Adequate whitespace around logos

### **Accessibility Standards**

[COLOR CONTRAST]
├─ Text on Background: Minimum 4.5:1 ratio (WCAG AA)
├─ Large Text (18px+): Minimum 3:1 ratio
├─ Interactive Elements: Clear focus states
└─ Avoid color-only information (add icons/text)

[KEYBOARD NAVIGATION]
├─ Tab Order: Logical sequential navigation
├─ Focus Indicators: Visible outline (2px accent color)
├─ Skip Links: "Skip to main content" option
└─ ARIA Labels: Proper semantic HTML + ARIA attributes

[SCREEN READER SUPPORT]
├─ Alt Text: Descriptive for all images
├─ ARIA Labels: For icon-only buttons
├─ Semantic HTML: Proper heading hierarchy
└─ Live Regions: For dynamic content updates

---

### **Content Flow Philosophy (Within Each Tab)**

Each tab follows a **mini WHAT → HOW → WHY → IMPACT** structure where relevant:

**Example - "Features & Capabilities" Tab:**
- **WHAT**: Feature category overview (e.g., "Discovery & Booking System")
- **HOW**: Feature list with descriptions and usage
- **WHY**: Problems this solves (linked to Tab 4)
- **IMPACT**: Capabilities this enables (linked to Tab 5)

- **IMAGE/SCREENSHOT**: Intelligent placed placeholder for Screenshot/Image/Video with short description and placeholder-URL for easy copy-paste replacement

---

### **Interactive Elements & UX Considerations**

**Search & Filter Functionality**
- Global search across all tabs
- Feature catalog filterable by: Function, Status (✅🟡⏳), User Type
- Problem-solution search
- Workflow diagram search

**Visual Design**
- Tab navigation (horizontal top nav)
- Sticky header with platform logo + quick links
- Feature cards with expand/collapse
- Workflow diagrams with step-by-step progression
- Comparison tables (VAI vs OTA) with visual highlighting
- Status badges (✅ Live, 🟡 In Dev, ⏳ Planned)
- Platform/value-based color coding

**Mobile Responsiveness**
- Tabs collapse to hamburger menu on mobile
- Feature cards stack vertically
- Tables become scrollable/stackable
- Workflow diagrams become vertical flow
- All interactive elements touch-optimized (44px+ tap targets)

**Accessibility**
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)
- Alt text for all images
- Semantic HTML

---

### **Implementation Files - HYBRID APPROACH**

```
presentation/VAI/
├── style.css                    ✅ SHARED - Base styles (reused)
│   ├── Typography system (Cormorant Garamond, Poppins)
│   ├── Color palette (CSS variables)
│   ├── Header/footer structure
│   ├── Language switcher styles
│   ├── Mobile responsive utilities
│   └── Base animations & transitions
│
├── script.js                    ✅ SHARED - Core functionality (reused)
│   ├── JSON loading architecture
│   ├── Language switching logic
│   ├── GSAP animation initialization
│   ├── Mobile menu toggle
│   ├── Smooth scroll utilities
│   └── Markdown-to-HTML converter
│
├── businessplan/
│   ├── businessplan.html        (Existing business plan site)
│   ├── en.json
│   └── fr.json
│
└── platform/                    🆕 NEW FOLDER
    ├── index.html               🆕 NEW - Platform website
    │   ├── References: ../style.css (SHARED base)
    │   ├── References: ./platform.css (PLATFORM-specific)
    │   ├── References: ../script.js (SHARED logic)
    │   └── References: ./platform.js (PLATFORM-specific)
    │
    ├── platform.css             🆕 NEW - Platform-specific styles
    │   ├── Tab navigation system (7 tabs)
    │   ├── Feature card accordion styles
    │   ├── Search & filter bar styles
    │   ├── Status badges (✅ 🟡 ⏳)
    │   ├── Workflow diagram layouts
    │   ├── Comparison table highlighting
    │   ├── Metric cards & progress bars
    │   ├── Benchmark visualization styles
    │   ├── CTA card gradients
    │   └── Platform-specific animations
    │
    ├── platform.js              🆕 NEW - Platform-specific functionality
    │   ├── Tab switching logic
    │   ├── Feature catalog filter/search
    │   ├── Expandable card interactions
    │   ├── Workflow diagram animations
    │   ├── Scroll-triggered counters
    │   ├── Progress bar fill animations
    │   └── Smooth scroll within tabs
    │
    ├── en.json                  🆕 NEW - Platform content (English)
    │   └── (Optional: fr.json for French translation)
```

---

## **HYBRID APPROACH RATIONALE**

### **Why Reuse (SHARED files):**
1. **Brand Consistency**: Both sites feel like "VAI family"
2. **Code Efficiency**: No duplication of language switching (100+ lines)
3. **Maintenance**: Update brand colors once, affects all VAI sites
4. **Performance**: Shared CSS/JS cached across both sites

### **Why Separate (PLATFORM-specific files):**
1. **Unique UI Patterns**: Tabs, filters, accordions not in business plan
2. **Complex Interactions**: Workflow diagrams, comparison tables
3. **Different Content Structure**: 7 tabs vs business plan sections
4. **Clean Code**: Platform logic isolated, easier to debug

### **CSS Cascade Strategy:**
```css
/* style.css (SHARED) */
:root {
    --accent-glow: #d013bd;
    --font-heading: 'Cormorant Garamond', serif;
    --font-body: 'Poppins', sans-serif;
}

/* platform.css (PLATFORM-SPECIFIC) */
.tab-navigation { /* New component */ }
.feature-card { /* New component */ }
.comparison-table { /* New component */ }
```

### **JavaScript Module Pattern:**
```javascript
// script.js (SHARED) - loads first
async function loadLanguage(lang) { /* ... */ }
function initAnimations() { /* GSAP setup */ }

// platform.js (PLATFORM-SPECIFIC) - extends functionality
function initTabNavigation() { /* Tab switching */ }
function initFeatureFilters() { /* Filter logic */ }
```

---

## **IMPLEMENTATION ROADMAP**

### **Phase 3A: Create Base Structure** ✅ Ready to Start
1. Create `platform/` folder
2. Create `platform/index.html` (hybrid architecture)
3. Link to SHARED resources (../style.css, ../script.js)
4. Add platform-specific resource placeholders

### **Phase 3B: Build Platform-Specific Styles**
1. Create `platform/platform.css`
   - Tab navigation system
   - Feature cards & accordions
   - Status badges
   - Workflow diagrams
   - Comparison tables
   - Metric visualizations
   - CTA gradient cards

### **Phase 3C: Build Platform-Specific Scripts**
1. Create `platform/platform.js`
   - Tab switching functionality
   - Feature filter/search
   - Expandable card interactions
   - Scroll-triggered animations
   - Counter animations
   - Progress bar fills

### **Phase 3D: Build Content JSON**
1. Create `platform/en.json`
   - Convert NEW_WEBSITE_STRUCTURE.md content
   - Organize by 7 tabs
   - Include all visual specifications
   - Add image placeholders

### **Phase 3E: Testing & Refinement**
1. Test language switching (inherited from script.js)
2. Test mobile responsiveness
3. Test all interactive elements
4. Verify GSAP animations
5. Cross-browser testing

---

**Design Rationale**:
1. **Platform/Value-Based**: Organization by function (not audience) allows any stakeholder to find what they need
2. **Tab Navigation**: Reduces cognitive load, clear information hierarchy, familiar UX pattern
3. **Searchable/Filterable**: 145+ features need discoverability tools
4. **Capability-Focused**: Pre-launch status requires framing as "designed to enable" vs claiming achieved metrics
5. **Expandable Depth**: Technical architecture optional for non-technical stakeholders
6. **Clear CTAs**: Pre-registration for both operators and tourists prominently featured
