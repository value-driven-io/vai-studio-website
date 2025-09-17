# VAI Tickets Tourist App - Template-First Architecture Framework

## 🎯 Project Vision
Transform VAI Tickets from instance-based to template-first architecture with Airbnb/Viator-style discovery experience. Create sophisticated dual-path user journey for French Polynesia activities.

## 🏗️ Core Architecture

### Template-First Hierarchy
```
Activity Template (concept/offering)
├── Schedule (recurring pattern)
└── Activity Instances (specific date/time slots)
    └── Bookings (customer reservations)
```

### Database Views & Usage
- **`activity_templates_view`**: Discovery results (template cards)
- **`active_tours_with_operators`**: Calendar availability (instances)
- **`scheduled_activities_view`**: Schedule patterns
- **`schedule_availability`**: Availability overview
- **`tour_management_dashboard`**: Operator management

## 🚀 User Experience Design

### Dual-Path Entry Strategy
**Path Selection → Branch into specialized flows**

#### 1. Inspiration Seekers (Browse Mode)
```
Dual Path → Location → Mood → Filter → TEMPLATES → Template Detail → Calendar → Instance → Booking
```
- **Target**: Leisure planners, first-time visitors
- **Flow**: Guided discovery with personalization
- **UI**: Glass aesthetic, refined interactions

#### 2. Opportunity Hunters (Quick Mode)
```
Dual Path → Direct to ExploreTab (advanced search/filters)
```
- **Target**: Locals, repeat visitors, deal hunters
- **Flow**: Direct access to comprehensive search
- **UI**: Efficient, filter-heavy interface

### Navigation Philosophy
- **Discover Tab**: Always resets to dual-path (industry standard)
- **Back Navigation**: Smart context buttons (not breadcrumbs)
- **Deep Linking**: Support direct template/calendar access

## 🎨 Design System

### Aesthetic Direction
- **Base**: Glass morphism with fine borders
- **Vibe**: Sophisticated Polynesian (Airbnb-quality)
- **Colors**: Tailwind CSS variables only (theme-aware)
- **Responsiveness**: Mobile-first design

### Component Strategy
- **Reuse Existing**: TourCard, ExploreTab, BookingModal
- **New Components**: TemplateCard, CalendarView, TemplateDetail
- **Enhancement**: Glass-effect dual-path selector

## 📊 Data Flow Architecture

### Discovery Flow
```sql
-- Step 1: Get Templates for Discovery
SELECT DISTINCT
  template_id,
  tour_name,
  tour_type,
  operator_name,
  location,
  min_price,
  rating
FROM activity_templates_view
WHERE is_template = true
  AND status = 'active'
  AND location = :island
  AND tour_type = :mood
```

### Template Detail Flow
```sql
-- Step 2: Get Template Details + Availability
SELECT
  template.*,
  COUNT(instances.id) as availability_count,
  MIN(instances.effective_price_adult) as price_from
FROM activity_templates_view template
LEFT JOIN active_tours_with_operators instances
  ON template.id = instances.parent_template_id
WHERE template.id = :template_id
  AND instances.tour_date >= CURRENT_DATE
```

### Calendar Flow
```sql
-- Step 3: Get Calendar Instances
SELECT
  tour_date,
  time_slot,
  available_spots,
  max_capacity,
  effective_price_adult,
  has_promotional_pricing
FROM active_tours_with_operators
WHERE parent_template_id = :template_id
  AND tour_date BETWEEN :start_date AND :end_date
  AND available_spots > 0
ORDER BY tour_date, time_slot
```

## 🛠️ Technical Implementation

### File Structure
```
src/
├── components/
│   ├── discovery/
│   │   ├── DiscoverTab.jsx (dual-path entry)
│   │   ├── DualPathStep.jsx (path selector)
│   │   ├── TemplateResults.jsx (template cards)
│   │   └── TemplateDetail.jsx (template info + calendar)
│   ├── calendar/
│   │   ├── CalendarView.jsx (Viator-style calendar)
│   │   └── InstanceSelector.jsx (time/people selection)
│   └── shared/
│       ├── TemplateCard.jsx (template display)
│       └── BackButton.jsx (smart navigation)
├── services/
│   ├── templateService.js (template queries)
│   └── calendarService.js (availability queries)
└── stores/
    └── templateStore.js (template state management)
```

### Translation Structure
```json
{
  "discovery": {
    "dualPath": {
      "title": "How would you like to explore?",
      "inspirationSeekers": { "title": "...", "cta": "..." },
      "opportunityHunters": { "title": "...", "cta": "..." }
    },
    "templates": {
      "resultsTitle": "Activities in {location}",
      "viewCalendar": "View Availability",
      "fromPrice": "from {price}"
    }
  },
  "calendar": {
    "selectDate": "Select date",
    "selectTime": "Choose time",
    "spotsAvailable": "{count} spots available"
  }
}
```

## 🔄 Implementation Phases

### Phase 1: Template-First Foundation ⚡ **COMPLETED**
- [x] Dual-path entry screen
- [x] Fix results to show templates (not instances)
- [x] Template service with activity_templates_view queries
- [x] Template discovery flow working end-to-end
- [x] Performance optimization (removed heavy enrichment)
- [x] Fixed infinite loop with useCallback
- [ ] Create TemplateCard component
- [ ] Template detail page structure

### Phase 2: Calendar Integration 📅 **COMPLETED**
- [x] Viator-style calendar component
- [x] Instance selection flow
- [x] Template detail page with rich information
- [x] Date/time picker with availability display
- [x] Price display per instance
- [x] Smart template → calendar → booking flow

### Phase 3: Navigation & Polish ✨
- [ ] Smart back navigation
- [ ] Discover tab reset behavior
- [ ] Glass aesthetic refinement
- [ ] Mobile optimization

### Phase 4: Advanced Features 🚀
- [ ] Template favoriting
- [ ] Calendar filters
- [ ] Availability notifications
- [ ] Social sharing

## 🎯 Success Metrics

### User Experience
- **Path Clarity**: Users understand dual-path immediately
- **Discovery Efficiency**: Find templates quickly via guided flow
- **Booking Conversion**: Template → Calendar → Booking flow works smoothly
- **Mobile Experience**: Seamless on all devices

### Technical Performance
- **Query Efficiency**: Fast template loading
- **Calendar Performance**: Smooth month navigation
- **State Management**: Clean component communication
- **Theme Integration**: Perfect dark/light mode support

## 🔧 Development Guidelines

### Code Standards
- **No hardcoded colors**: Use Tailwind CSS variables only
- **Mobile-first**: All components responsive from start
- **Reuse components**: Prefer enhancing existing over creating new
- **i18n first**: All text through translation keys
- **Glass aesthetic**: Consistent with app's refined style

### Quality Gates
- **Template queries**: Must be efficient and cached
- **Calendar UX**: Must feel as smooth as Airbnb
- **Navigation flow**: No dead ends or confusion
- **Accessibility**: Proper focus management and screen reader support

## 🚨 Critical Success Factors

1. **Template Architecture**: Results MUST show templates, not instances
2. **Calendar UX**: Must match modern booking site standards
3. **Navigation Logic**: Discover tab reset pattern must be intuitive
4. **Performance**: Template loading and calendar scrolling must be fast
5. **Mobile Experience**: Primary development target

## 🔄 Rollback Strategy
- Keep existing components functional during transition
- Feature flags for new vs old discovery flow
- Database views ensure backward compatibility
- Gradual migration path for users

## 📈 Implementation Progress

### ✅ **Completed (Phase 1 & 2)**
- **Dual-Path Entry System**: Users choose between "Inspiration Seekers" (guided) vs "Opportunity Hunters" (direct search)
- **Template-First Architecture**: Discovery results now show activity templates instead of individual instances
- **Database Integration**: `templateService.js` queries `activity_templates_view` efficiently
- **Performance Optimization**: Eliminated infinite loops and heavy enrichment queries
- **Calendar Integration**: Viator-style calendar with date/time selection and pricing
- **Template Detail Pages**: Rich template information with availability overview
- **Smart Navigation**: Template → Calendar → Instance → Booking flow
- **UI/UX Flow**: Dual Path → Location → Mood → Filters → **Templates** → **Calendar** → **Booking**
- **Backward Compatibility**: Templates work with existing TourCard component using enriched data structure

### 🔧 **Technical Achievements**
- **Fixed Infinite Loop**: Used `useCallback` to prevent function recreation
- **Optimized Queries**: Simplified template enrichment to avoid N+1 performance issues
- **Client-Side Filtering**: Mood-to-tour-type filtering done after template fetch for flexibility
- **Error Handling**: Proper loading states and error management
- **Calendar Component**: Industry-standard Viator-style calendar with month navigation
- **Instance Management**: Efficient grouping and display of activity instances by date
- **Smart Routing**: Template detection and automatic routing to detail vs direct booking
- **i18n Integration**: Full translation support for all new calendar/template components
- **Modular Design**: Reusable components following Tailwind CSS patterns

### 📊 **Current State**
- **Templates Loading**: ✅ Working - Shows 2+ templates for Moorea/Ocean combination
- **Calendar Integration**: ✅ Working - Template clicks open detailed calendar view
- **Instance Selection**: ✅ Working - Users can select specific dates and times
- **Booking Flow**: ✅ Working - Calendar selections lead to existing booking modal
- **User Experience**: Smooth end-to-end template → calendar → booking journey
- **Database Structure**: Templates properly structured with availability management

### 🎯 **Next Priorities**
1. **Template Enrichment**: Add real operator info and availability counts from instances
2. **Navigation Polish**: Discover tab reset behavior and breadcrumbs
3. **Performance**: Optimize instance queries for calendar views
4. **Mobile Optimization**: Ensure calendar works perfectly on mobile devices

---

**Last Updated**: 2025-09-17
**Current Phase**: Phase 1 & 2 Complete → Moving to Phase 3 (Polish & Optimization)
**Next Milestone**: Template enrichment and navigation polish