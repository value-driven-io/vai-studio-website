# 🎯 IMPLEMENTATION REQUIREMENTS & STANDARDS
**Critical Guidelines for Booking System Implementation**

---

## 🌍 INTERNATIONALIZATION (i18n) REQUIREMENTS

### **Smart i18n System Integration**
**Location:** `src/locales/en.json` and `src/locales/fr.json`

**CRITICAL:** All new text must use translation keys, never hardcoded strings.

#### **Existing Pattern Analysis:**
```javascript
// ✅ CORRECT - Use existing pattern
const { t } = useTranslation()

// Component text
<h2>{t('booking.confirmationTitle')}</h2>
<p>{t('booking.processingMessage')}</p>

// Error messages
throw new Error(t('booking.errors.insufficientSpots'))

// Status displays
{t('booking.status.confirmed')}
```

#### **New Translation Keys Required:**
```json
// en.json additions needed
{
  "booking": {
    "atomic": {
      "creating": "Creating secure booking...",
      "success": "Booking created successfully",
      "failed": "Booking creation failed"
    },
    "availability": {
      "restored": "Availability restored",
      "checking": "Checking availability...",
      "insufficient": "Not enough spots available"
    },
    "template": {
      "instanceOf": "Part of: {{templateName}}",
      "recurringSchedule": "Recurring Schedule",
      "customized": "Customized Experience"
    },
    "errors": {
      "tourNotFound": "Tour not available for booking",
      "tourInactive": "Tour not currently active",
      "insufficientCapacity": "Not enough spots available"
    }
  },
  "journey": {
    "template": {
      "baseTemplate": "Based on template",
      "scheduledActivity": "Scheduled Activity",
      "customizedFromTemplate": "Customized from {{templateName}}"
    }
  }
}
```

#### **Implementation Pattern:**
```javascript
// ✅ REQUIRED for all new components
import { useTranslation } from 'react-i18next'

export const EnhancedBookingService = () => {
  const { t } = useTranslation()

  // Use translation keys for all user-facing text
  const errorMessage = t('booking.errors.insufficientCapacity', {
    requested: participants,
    available: availableSpots
  })

  return t('booking.atomic.creating')
}
```

---

## 🎨 DESIGN SYSTEM & THEMING REQUIREMENTS

### **Tailwind + CSS Custom Properties Approach**
**Location:** `src/styles/index.css` (lines 8-40 show theme system)

#### **Existing Theme System Evidence:**
```css
/* Current theme approach uses CSS custom properties */
:root {
  --color-surface-primary: #334155;      /* replaces bg-slate-700 */
  --color-text-primary: #f8fafc;         /* main text */
  --color-interactive-primary: #2563eb;  /* replaces bg-blue-600 */
}
```

#### **REQUIRED: Use Existing Design Tokens**
```javascript
// ✅ CORRECT - Use design system classes
<div className="bg-ui-surface-primary text-ui-text-primary border-ui-border-primary">
  <button className="bg-interactive-primary hover:bg-interactive-primary-hover">
    {t('common.bookNow')}
  </button>
</div>

// ❌ WRONG - Don't create new color utilities
<div className="bg-gray-800 text-white border-gray-600">
```

#### **Modal/Component Styling Pattern:**
```javascript
// Follow existing modal patterns
<div className="fixed inset-0 bg-ui-surface-overlay/50 flex items-center justify-center z-50">
  <div className="bg-ui-surface-elevated rounded-lg border border-ui-border-primary">
    {/* Content */}
  </div>
</div>
```

---

## 📊 CODE EVIDENCE REQUIREMENTS

### **MANDATORY: Evidence-Based Development**

#### **Database Changes - Verify First:**
```sql
-- REQUIRED before any database function deployment
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'update_tour_spots';
-- Must exist before using in atomic function

SELECT column_name FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name = 'schedule_id';
-- Must exist before populating
```

#### **Component Changes - Check Current Implementation:**
```bash
# REQUIRED before any component changes
grep -n "bookingService.createBooking" src/components/booking/BookingPage.jsx
# Verify current usage pattern

grep -r "BookingModal" src/ --exclude-dir=node_modules
# Verify all usage locations before replacement
```

#### **Service Integration - Validate Current Patterns:**
```javascript
// REQUIRED: Follow existing service patterns
// Check current implementation in src/services/supabase.js:17-123
const existingPattern = await supabase
  .from('bookings')
  .insert([bookingPayload])
  .select('id, booking_reference')
  .single()

// Enhance, don't replace
const enhancedPattern = await supabase.rpc('create_booking_atomic', {
  booking_data: bookingPayload,
  tour_id: tourId
})
```

---

## 🚫 ANTI-OVER-ENGINEERING PRINCIPLES

### **Keep It Simple - Industry Standards**

#### **✅ DO - Follow Existing Patterns:**
```javascript
// Simple, clear, maintainable
export const enhancedBookingService = {
  async createBooking(bookingData) {
    const result = await supabase.rpc('create_booking_atomic', {
      booking_data: bookingData,
      tour_id: bookingData.tour_id
    })

    if (!result.data?.success) {
      throw new Error(result.data?.error || t('booking.errors.unknown'))
    }

    return result.data
  }
}
```

#### **❌ DON'T - Over-Architect:**
```javascript
// ❌ Avoid complex abstractions
class BookingServiceFactory {
  createAtomicBookingStrategy() {
    return new AtomicBookingProcessor(
      new ValidationPipeline(),
      new ErrorHandlerChain()
    )
  }
}
```

#### **✅ DO - Use Direct Database Operations:**
```javascript
// Simple and effective
const tourContext = await supabase
  .from('active_tours_with_operators')
  .select(this.BOOKING_TOUR_FIELDS)
  .eq('id', tourId)
  .single()
```

#### **❌ DON'T - Create Unnecessary Layers:**
```javascript
// ❌ Avoid over-abstraction
await this.tourRepository
  .withIncludes(['operator', 'template', 'schedule'])
  .findByIdWithBookingContext(tourId)
```

---

## 🏆 INDUSTRY BEST PRACTICES

### **Tourism/Booking Platform Standards**

#### **Airbnb/Booking.com Patterns:**
```javascript
// ✅ Atomic booking with immediate feedback
const bookingResult = await createBookingAtomic(bookingData)

// ✅ Clear error handling with user-friendly messages
if (bookingResult.error_code === 'INSUFFICIENT_CAPACITY') {
  throw new Error(t('booking.errors.soldOut', {
    available: bookingResult.available
  }))
}

// ✅ Immediate availability updates
await updateAvailability(tourId, -participants)
```

#### **GetYourGuide/Viator Patterns:**
```javascript
// ✅ Template-based activity system
const displayName = tourData?.tour_name || tourData?.template_name
const isCustomized = tourData?.is_customized
const recurringSchedule = booking.schedule_id

// ✅ Comprehensive booking context
{templateName && (
  <span className="text-ui-text-secondary text-xs">
    {t('journey.template.instanceOf', { templateName })}
  </span>
)}
```

#### **Far Harbour/Premium Experience Patterns:**
```javascript
// ✅ Enhanced price transparency
const pricing = {
  adultPrice: tourContext.effective_discount_price_adult,
  childPrice: tourContext.effective_discount_price_child,
  commission: commissionAmount,
  finalPrice: totalAmount
}

// ✅ Operator context preservation
const operatorInfo = {
  name: tourContext.company_name,
  whatsapp: tourContext.operator_whatsapp_number,
  rating: tourContext.operator_average_rating
}
```

---

## 🎯 EXPERT RECOMMENDATIONS

### **Additional Critical Requirements:**

#### **1. Performance Standards**
```javascript
// REQUIRED: Optimize database queries
const BOOKING_TOUR_FIELDS = `
  id, operator_id, schedule_id, parent_template_id,
  effective_discount_price_adult, tour_name, company_name
` // Only select needed fields

// REQUIRED: Use enhanced views instead of joins
.from('active_tours_with_operators') // Not basic tours table
```

#### **2. Error Handling Standards**
```javascript
// REQUIRED: Comprehensive error context
catch (error) {
  console.error('Booking creation error:', {
    tourId: bookingData.tour_id,
    participants: bookingData.num_adults + bookingData.num_children,
    error: error.message,
    timestamp: new Date().toISOString()
  })

  throw new Error(t('booking.errors.creationFailed'))
}
```

#### **3. Accessibility Requirements**
```javascript
// REQUIRED: Screen reader support
<button
  aria-label={t('booking.createBooking')}
  aria-describedby="booking-help-text"
>
  {t('common.bookNow')}
</button>

<div id="booking-help-text" className="sr-only">
  {t('booking.help.securePayment')}
</div>
```

#### **4. Mobile-First Responsive Design**
```javascript
// REQUIRED: Mobile-optimized layouts
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
```

#### **5. Loading States & Feedback**
```javascript
// REQUIRED: Immediate user feedback
const [loading, setLoading] = useState(false)

{loading && (
  <div className="flex items-center gap-2">
    <Spinner className="w-4 h-4" />
    {t('booking.atomic.creating')}
  </div>
)}
```

---

## ✅ IMPLEMENTATION COMPLIANCE CHECKLIST

**Before marking any phase complete:**

### **i18n Compliance:**
- [ ] All user-facing text uses translation keys
- [ ] New keys added to both en.json and fr.json
- [ ] Error messages are translatable
- [ ] Dynamic content uses interpolation correctly

### **Design System Compliance:**
- [ ] Uses existing CSS custom properties
- [ ] Follows Tailwind utility classes
- [ ] Maintains consistent spacing/typography
- [ ] Respects existing component patterns

### **Code Evidence Compliance:**
- [ ] Database state validated before changes
- [ ] Current implementation patterns analyzed
- [ ] Existing service patterns followed
- [ ] Integration points verified

### **Simplicity Compliance:**
- [ ] No unnecessary abstractions
- [ ] Direct database operations used
- [ ] Clear, readable code
- [ ] Industry-standard patterns followed

### **Best Practices Compliance:**
- [ ] Performance optimized
- [ ] Comprehensive error handling
- [ ] Accessibility considerations
- [ ] Mobile-responsive design
- [ ] Loading states implemented

---

**🎯 IMPLEMENTATION STANDARD: INDUSTRY-GRADE SIMPLICITY**
**🌍 LOCALIZATION: COMPLETE FRENCH/ENGLISH SUPPORT**
**🎨 DESIGN: CONSISTENT THEME SYSTEM INTEGRATION**
**📊 EVIDENCE: DATABASE AND CODE VALIDATION REQUIRED**