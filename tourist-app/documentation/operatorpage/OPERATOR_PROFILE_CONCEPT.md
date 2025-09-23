# Operator Profile Pages - Concept & Implementation Plan

## 🎯 Vision

Create shareable, professional operator profile pages that serve as mini-websites for French Polynesian tour operators. This addresses the local challenge of operators lacking professional web presence while creating network effects for the platform.

## 🔗 URL Strategy

### Routing Structure
```
app.vai.studio/profile/{operator_slug}
```

**Examples:**
- `app.vai.studio/profile/moorea-adventures`
- `app.vai.studio/profile/tahiti-pearl-diving`

### Slug Generation Rules
1. **Source**: `company_name` from operators table
2. **Format**: Lowercase, spaces → hyphens, special chars removed
3. **Uniqueness**: Append `-{island}` or `-{id}` if duplicates exist
4. **SEO-Friendly**: Include location when beneficial

```javascript
// Example slug generation
"Moorea Adventures" → "moorea-adventures"
"Taha'a Tours" → "tahaa-tours"
"Ocean Safari (Bora Bora)" → "ocean-safari-bora-bora"
```

## 📊 Available Data (No Database Changes)

### From `operators` table:
✅ **Basic Information**
- `company_name` - Business name
- `contact_person` - Main contact
- `island` - Operating location
- `business_description` - About section
- `operator_logo` - Profile image

✅ **Trust & Credibility**
- `total_tours_completed` - Experience metric
- `average_rating` - Overall rating
- `whale_tour_certified` - Special certification
- `business_license` - Licensed status
- `insurance_certificate` - Insurance status

✅ **Contact Information**
- `phone` - Contact number
- `whatsapp_number` - WhatsApp contact
- `email` - Email (show/hide based on privacy)

### From `active_tours_with_operators` view:
✅ **Portfolio & Activities**
- All operator's tours/templates
- Tour types and specializations
- Price ranges
- Locations served
- Languages offered

## 🎨 Page Design Concept

### Hero Section
```
[Operator Logo/Company Initial]  [Moorea Adventures]
                                 Licensed Tour Operator • Moorea
                                 ⭐ 4.8 (127 tours completed)
                                 🏆 Whale Watching Certified

[WhatsApp Contact] [Call Now] [Share Profile]
```

### About Section
```
About Moorea Adventures
Our Story: {business_description}
📍 Based in: {island}
🎯 Specializing in: {tour_types from activities}
🗣️ Languages: {languages from activities}
```

### Trust Indicators
```
Why Choose Us
✅ Licensed & Insured
✅ {total_tours_completed} Tours Completed
✅ {average_rating}⭐ Customer Rating
{whale_tour_certified && "🐋 Whale Watching Certified"}
```

### Activities Portfolio
```
Our Experiences
[Grid of operator's activities/templates]
- Tour name, type, price range
- Availability status
- Quick book button
```

### Contact & Social Sharing
```
Get in Touch
📞 {phone}
💬 WhatsApp: {whatsapp_number}
📧 Email inquiry form

Share This Profile
[Facebook] [Instagram] [WhatsApp] [Copy Link]
```

## 🛠️ Technical Implementation

### 1. Data Layer
```javascript
// services/operatorService.js
export const operatorService = {
  async getOperatorBySlug(slug) {
    // Query operators table + related activities
    // Return operator profile data
  },

  async getOperatorActivities(operatorId) {
    // Get all templates/tours for operator
    // Include pricing, availability, ratings
  },

  generateSlug(companyName, island) {
    // Slug generation logic
  }
}
```

### 2. Component Structure
```
components/
├── operator/
│   ├── OperatorProfilePage.jsx     // Main profile page
│   ├── OperatorHero.jsx           // Hero section
│   ├── OperatorAbout.jsx          // About & trust
│   ├── OperatorActivities.jsx     // Activities grid
│   ├── OperatorContact.jsx        // Contact section
│   └── OperatorShare.jsx          // Social sharing
```

### 3. Routing Setup
```javascript
// In main router
{
  path: "/profile/:operatorSlug",
  element: <OperatorProfilePage />,
  loader: async ({ params }) => {
    return operatorService.getOperatorBySlug(params.operatorSlug)
  }
}
```

### 4. SEO & Meta Tags
```javascript
// Dynamic meta tags for each operator
<Helmet>
  <title>{company_name} - Professional Tours in {island} | VAI Studio</title>
  <meta name="description" content={`Book authentic experiences with ${company_name}, a licensed tour operator in ${island}. ${total_tours_completed} tours completed with ${average_rating}⭐ rating.`} />

  {/* OpenGraph for social sharing */}
  <meta property="og:title" content={`${company_name} - Tours in ${island}`} />
  <meta property="og:description" content={business_description} />
  <meta property="og:image" content={operator_logo || '/images/default-operator.png'} />
  <meta property="og:url" content={`https://app.vai.studio/profile/${slug}`} />

  {/* WhatsApp/social sharing */}
  <meta property="og:type" content="business.business" />
  <meta property="business:contact_data:locality" content={island} />
</Helmet>
```

## 🔗 Integration Points

### From TemplateDetailPage
```javascript
// In operator info section (lines 368-391)
const handleOperatorClick = () => {
  // Generate slug from operator data
  const slug = generateSlug(templateDetails.operator_name || templateDetails.company_name)
  // Navigate to profile page
  navigate(`/profile/${slug}`)
}

// Make operator name clickable
<button
  onClick={handleOperatorClick}
  className="font-medium text-ui-text-primary hover:text-interactive-primary"
>
  {templateDetails.operator_name || templateDetails.company_name}
</button>
```

### Shared URL Benefits
```
Operators can share:
📱 Social Media: "Check out our profile: app.vai.studio/profile/moorea-adventures"
🌐 Website: Direct link to professional profile
📧 Email Signatures: Professional booking link
💬 WhatsApp: Easy sharing with potential customers
```

## 📱 Mobile-First Considerations

### Performance
- Lazy load activity images
- Optimize operator logos
- Fast initial paint with skeleton

### UX
- Large touch targets for contact buttons
- WhatsApp deep linking for mobile
- One-tap calling on mobile
- Swipeable activity gallery
- use react-icons, no emojis
- using i18n feature (already implemented and provide English and French translation)
- never show "empty" fields (if data is missing in database, hide field since this might give the operator a bad image)

### Responsive Layout
```
Mobile (< 768px):
- Stacked single column
- Prominent contact buttons
- Collapsible sections

Desktop (> 768px):
- Two-column layout
- Sidebar with sticky contact
- Grid view for activities
```

## 🌟 Competitive Advantages

### For Operators
1. **Free Professional Website** - No need for separate web development
2. **SEO Optimized** - Better Google visibility than social media alone
3. **Shareable URL** - Professional link for marketing
4. **Trust Building** - Verification badges and statistics
5. **Direct Bookings** - Integrated with VAI platform

### For Platform
1. **Operator Acquisition** - Strong value proposition
2. **SEO Traffic** - Operator profiles drive organic traffic
3. **Network Effects** - Operators share → more visibility
4. **Differentiation** - Unique feature vs competitors
5. **Local Market Fit** - Solves real French Polynesia problem

## 📈 Success Metrics

### For Operators
- Profile page views
- Contact button clicks
- Activity bookings from profile
- Social shares of profile URL

### For Platform
- Organic traffic from operator profiles
- New operator sign-ups mentioning "free website"
- Improved operator retention
- Cross-pollination between operator portfolios

## 🆕 New Operator Considerations ("Cold Start" Problem)

### Challenge
New operators joining the platform will have:
- `total_tours_completed = 0`
- `average_rating = 0.00` or `null`
- Potentially limited `business_description`
- No customer reviews or testimonials

### Solutions & Strategies

#### 1. Alternative Trust Indicators
```javascript
// Fallback trust signals for new operators
const getTrustIndicators = (operator) => {
  const indicators = []

  // Always show licensing
  if (operator.business_license) indicators.push("Licensed Operator")
  if (operator.insurance_certificate) indicators.push("Insured")
  if (operator.whale_tour_certified) indicators.push("Whale Watching Certified")

  // For new operators, emphasize other qualities
  if (operator.total_tours_completed === 0) {
    indicators.push("New to Platform")
    indicators.push("Local Expert") // if island is provided
  }

  return indicators
}
```

#### 2. Conditional Display Logic
```javascript
// Hide empty/zero fields to maintain professional appearance
const shouldShowStat = (value, type) => {
  switch (type) {
    case 'tours_completed':
      return value > 0 // Only show if operator has completed tours
    case 'rating':
      return value > 0 // Only show if operator has ratings
    case 'description':
      return value && value.trim().length > 20 // Only show substantial descriptions
    default:
      return !!value // Show if exists and truthy
  }
}
```

#### 3. New Operator Messaging
```
Instead of: "⭐ 0.0 (0 tours completed)"
Show: "🌟 New Local Expert • Licensed Operator"

Instead of: Empty trust section
Show: "✅ Licensed & Insured
      🏝️ Local Island Expert
      🌟 Fresh Perspective"
```

#### 4. Activity Portfolio Emphasis
- For new operators, emphasize their planned activities/templates
- Show "Coming Soon" badges on scheduled activities
- Highlight unique offerings or specializations

## 🏗️ Modular Architecture for Future Expansion

### Component Structure (Extensible)
```
components/operator/
├── OperatorProfilePage.jsx         // Main coordinator
├── sections/
│   ├── OperatorHero.jsx           // Hero with basic info
│   ├── OperatorTrust.jsx          // Trust indicators (extensible)
│   ├── OperatorAbout.jsx          // About & story
│   ├── OperatorStats.jsx          // Statistics (tours, ratings, etc.)
│   ├── OperatorServices.jsx       // Current activities
│   ├── OperatorContact.jsx        // Contact methods
│   └── OperatorShare.jsx          // Social sharing
├── widgets/                       // Reusable widgets
│   ├── TrustBadge.jsx
│   ├── StatCard.jsx
│   ├── ContactButton.jsx
│   └── ActivityCard.jsx
└── hooks/
    ├── useOperatorData.jsx        // Data fetching
    └── useOperatorDisplay.jsx     // Display logic
```

### Field Mapping System (Future-Proof)
```javascript
// config/operatorFields.js
export const OPERATOR_FIELD_CONFIG = {
  // Current fields
  basic: ['company_name', 'contact_person', 'island', 'business_description'],
  trust: ['total_tours_completed', 'average_rating', 'whale_tour_certified'],
  contact: ['phone', 'whatsapp_number'],
  visual: ['operator_logo'],

  // Future expandable fields
  social: [], // Future: instagram, facebook, website
  certifications: [], // Future: diving_certified, first_aid_certified
  specialties: [], // Future: photography, guide_languages, boat_type
  operational: [], // Future: years_experience, team_size, boat_capacity
}

// Display rules for each field
export const DISPLAY_RULES = {
  total_tours_completed: (value) => value > 0,
  average_rating: (value) => value > 0,
  business_description: (value) => value?.trim().length > 20,
  // Future fields will be added here
}
```

### Section Visibility System
```javascript
// hooks/useOperatorDisplay.jsx
export const useOperatorDisplay = (operatorData) => {
  const visibleSections = useMemo(() => {
    const sections = {
      hero: true, // Always show
      trust: hasTrustIndicators(operatorData),
      stats: hasValidStats(operatorData),
      about: !!operatorData.business_description?.trim(),
      activities: operatorData.activities?.length > 0,
      contact: hasContactMethods(operatorData),
      // Future sections will be evaluated here
    }

    return sections
  }, [operatorData])

  return { visibleSections, shouldShow: (section) => visibleSections[section] }
}
```

### Future Field Integration Example
```javascript
// When new fields are added to database:
// 1. Add to OPERATOR_FIELD_CONFIG
// 2. Add display rule to DISPLAY_RULES
// 3. Update relevant section component
// 4. Add i18n translations

// Example: Adding social media fields
const futureSocialFields = {
  instagram_handle: (value) => value?.trim().length > 0,
  facebook_page: (value) => value?.startsWith('http'),
  website_url: (value) => isValidUrl(value),
}
```

## 🔒 Privacy & Security

### Public Information
✅ Company name, description, location
✅ Business credentials & certifications
✅ Activity portfolio & ratings
✅ Contact methods (phone, WhatsApp)

### Protected Information
❌ Email address
❌ Commission rates
❌ Internal operator notes
❌ Financial information
❌ Detailed personal data

## 🎨 Empty State Handling Strategy

### Never Show Empty Fields
```javascript
// Bad: Shows unprofessional empty state
<div>Tours Completed: 0</div>
<div>Rating: No ratings yet</div>

// Good: Hide or provide alternative
{operator.total_tours_completed > 0 && (
  <div>Tours Completed: {operator.total_tours_completed}</div>
)}

{operator.average_rating > 0 ? (
  <div>Rating: ⭐ {operator.average_rating}</div>
) : (
  <div>New Local Expert</div>
)}
```

### Progressive Enhancement
- Start with minimal viable profile
- Add sections as data becomes available
- Graceful degradation for missing data
- Always maintain professional appearance

This concept provides operators with a professional web presence while driving more traffic and bookings to the VAI platform - a true win-win solution for the French Polynesian tourism market.