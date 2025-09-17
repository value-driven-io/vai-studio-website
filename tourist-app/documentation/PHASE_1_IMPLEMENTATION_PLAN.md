# Phase 1 Implementation Plan - Template-First Discovery

**📅 Implementation Date**: September 15, 2025
**🎯 Goal**: Transform tourist-app from instance-based to template-first discovery
**📊 Duration**: 2-3 weeks
**🏝️ Priority**: High - Foundation for all future enhancements

---

## 🎯 **PHASE 1 OBJECTIVES**

### **Primary Goal**
Transform the tourist-app from showing 1000+ individual tour instances to showing 50 discoverable templates with smart availability hints.

### **Success Criteria**
- ✅ **Reduced Cognitive Load**: Users see templates, not overwhelming instance lists
- ✅ **Maintained Functionality**: All existing booking flows work perfectly
- ✅ **Enhanced Information**: Better pricing, availability, and operator data
- ✅ **Mobile Optimized**: Improved mobile discovery experience

### **Key Deliverables**
1. **Template Discovery Service** - New API endpoints for template-based data
2. **Enhanced TourCard Component** - Template-aware tour cards with rich information
3. **Smart Availability Display** - "From" pricing and availability hints
4. **Backward Compatibility** - Existing direct tour links continue working

---

## 🔧 **TECHNICAL IMPLEMENTATION STEPS**

### **Step 1: Create Template Discovery Service** (Week 1)

**File**: `src/services/templateDiscoveryService.js`

```javascript
// Template Discovery Service
import { supabase } from './supabase'

export const templateDiscoveryService = {
  // Get unique templates with aggregated schedule info
  getTemplateDiscovery: async (filters = {}) => {
    try {
      let query = supabase
        .rpc('get_template_discovery', {
          filter_island: filters.island || null,
          filter_tour_type: filters.tourType || null,
          filter_min_price: filters.priceRange?.min || null,
          filter_max_price: filters.priceRange?.max || null,
          limit_results: filters.limit || 50
        })

      const { data, error } = await query

      if (error) throw error

      return data.map(template => ({
        ...template,
        // Enhanced display fields
        availability_hint: this.getAvailabilityHint(template),
        urgency_level: this.getUrgencyLevel(template.next_available_date),
        price_display: this.getPriceDisplay(template)
      }))

    } catch (error) {
      console.error('Error in getTemplateDiscovery:', error)
      throw error
    }
  },

  // Get schedule overview for specific template
  getTemplateScheduleOverview: async (templateId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .rpc('get_template_schedule_overview', {
          template_id: templateId,
          start_date: startDate,
          end_date: endDate
        })

      if (error) throw error
      return data

    } catch (error) {
      console.error('Error in getTemplateScheduleOverview:', error)
      throw error
    }
  },

  // Helper functions
  getAvailabilityHint: (template) => {
    if (template.schedule_count > 3) return "Multiple times per week"
    if (template.schedule_count > 1) return "Several times per week"
    if (template.recurrence_patterns?.includes('daily')) return "Daily"
    if (template.recurrence_patterns?.includes('weekly')) return "Weekly"
    return "Limited schedule"
  },

  getUrgencyLevel: (nextAvailableDate) => {
    if (!nextAvailableDate) return null

    const hoursUntil = (new Date(nextAvailableDate) - new Date()) / (1000 * 60 * 60)

    if (hoursUntil <= 24) return { level: 'today', text: 'Available today', color: 'green' }
    if (hoursUntil <= 48) return { level: 'tomorrow', text: 'Available tomorrow', color: 'blue' }
    if (hoursUntil <= 168) return { level: 'week', text: 'This week', color: 'gray' }
    return { level: 'later', text: 'Next week', color: 'gray' }
  },

  getPriceDisplay: (template) => {
    const hasPromo = template.min_promo_price && template.min_promo_price < template.price_from

    return {
      from_price: template.price_from,
      promo_price: hasPromo ? template.min_promo_price : null,
      has_promotion: hasPromo,
      display_text: hasPromo
        ? `From ${template.min_promo_price} XPF`
        : `From ${template.price_from} XPF`
    }
  }
}
```

**Required Database Function** (SQL):
```sql
-- Database function for template discovery
CREATE OR REPLACE FUNCTION get_template_discovery(
  filter_island TEXT DEFAULT NULL,
  filter_tour_type TEXT DEFAULT NULL,
  filter_min_price INTEGER DEFAULT NULL,
  filter_max_price INTEGER DEFAULT NULL,
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  template_id UUID,
  template_name VARCHAR,
  template_type VARCHAR,
  template_description TEXT,
  operator_id UUID,
  company_name VARCHAR,
  operator_island VARCHAR,
  average_rating NUMERIC,
  total_tours_completed INTEGER,
  price_from INTEGER,
  min_promo_price INTEGER,
  next_available_date DATE,
  next_available_time VARCHAR,
  schedule_count INTEGER,
  total_available_spots INTEGER,
  recurrence_patterns TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (template.id)
    template.id as template_id,
    template.tour_name as template_name,
    template.tour_type as template_type,
    template.description as template_description,
    template.operator_id,
    o.company_name,
    o.island as operator_island,
    o.average_rating,
    o.total_tours_completed,

    -- Pricing aggregation
    MIN(t.final_price_adult) as price_from,
    MIN(CASE WHEN t.has_promotional_pricing THEN t.final_price_adult END) as min_promo_price,

    -- Next availability
    MIN(t.tour_date) FILTER (WHERE t.tour_date >= CURRENT_DATE) as next_available_date,
    (array_agg(t.time_slot ORDER BY t.tour_date, t.time_slot))[1] as next_available_time,

    -- Schedule information
    COUNT(DISTINCT s.id)::INTEGER as schedule_count,
    SUM(t.available_spots)::INTEGER as total_available_spots,
    array_agg(DISTINCT s.recurrence_type) as recurrence_patterns

  FROM tours template
  JOIN tours t ON t.parent_template_id = template.id
  LEFT JOIN schedules s ON t.parent_schedule_id = s.id
  JOIN operators o ON template.operator_id = o.id

  WHERE template.is_template = true
    AND t.is_template = false
    AND t.status = 'active'
    AND t.tour_date >= CURRENT_DATE
    AND t.available_spots > 0
    AND (s.is_paused = false OR s.is_paused IS NULL OR t.is_detached = true)
    AND o.status = 'active'
    AND (filter_island IS NULL OR o.island = filter_island)
    AND (filter_tour_type IS NULL OR template.tour_type = filter_tour_type)
    AND (filter_min_price IS NULL OR MIN(t.final_price_adult) >= filter_min_price)
    AND (filter_max_price IS NULL OR MIN(t.final_price_adult) <= filter_max_price)

  GROUP BY template.id, template.tour_name, template.tour_type, template.description,
           template.operator_id, o.company_name, o.island, o.average_rating, o.total_tours_completed

  ORDER BY next_available_date ASC, o.average_rating DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;
```

### **Step 2: Enhanced TourCard Component** (Week 1)

**File**: `src/components/shared/EnhancedTourCard.jsx`

```jsx
import React from 'react'
import { Calendar, Clock, Users, MapPin, Star, ArrowRight } from 'lucide-react'
import { formatPrice, formatDate } from '../../utils/currency'

const EnhancedTourCard = ({
  template,
  onViewAvailability,
  onAddToFavorites,
  isTemplate = true // New prop to distinguish template vs instance cards
}) => {

  if (isTemplate) {
    return <TemplateCard
      template={template}
      onViewAvailability={onViewAvailability}
      onAddToFavorites={onAddToFavorites}
    />
  }

  // Fallback to instance card for backward compatibility
  return <InstanceCard tour={template} />
}

const TemplateCard = ({ template, onViewAvailability, onAddToFavorites }) => {
  const {
    template_name,
    template_description,
    company_name,
    operator_island,
    average_rating,
    price_display,
    availability_hint,
    urgency_level,
    total_available_spots
  } = template

  return (
    <div className="bg-ui-surface-secondary rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border border-ui-border-primary">

      {/* Hero Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-lagoon-blue to-coral-warm relative">
        <div className="absolute inset-0 bg-black/20" />

        {/* Promotional Badge */}
        {price_display.has_promotion && (
          <div className="absolute top-3 left-3 bg-coral-warm text-white px-2 py-1 rounded-md text-sm font-medium">
            🏷️ Special Deal
          </div>
        )}

        {/* Urgency Indicator */}
        {urgency_level && urgency_level.level === 'today' && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            ⚡ {urgency_level.text}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => onAddToFavorites(template.template_id)}
          className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart className="w-5 h-5 text-coral-warm" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">

        {/* Title & Operator */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-ui-text-primary mb-1 line-clamp-2">
            {template_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-ui-text-secondary">
            <span>{company_name}</span>
            {average_rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{average_rating}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-ui-text-secondary mb-3">
          <MapPin className="w-4 h-4" />
          <span>{operator_island}</span>
        </div>

        {/* Availability Hint */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-ui-text-secondary mb-1">
            <Calendar className="w-4 h-4" />
            <span>{availability_hint}</span>
          </div>

          {urgency_level && (
            <div className="text-sm font-medium" style={{ color: urgency_level.color }}>
              Next available: {urgency_level.text}
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-ui-text-secondary mb-4">
          <Users className="w-4 h-4" />
          <span>{total_available_spots} spots available across all dates</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {price_display.has_promotion ? (
              <div>
                <span className="text-lg font-bold text-coral-warm">
                  {formatPrice(price_display.promo_price)}
                </span>
                <span className="text-sm text-ui-text-disabled line-through ml-2">
                  {formatPrice(price_display.from_price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-ui-text-primary">
                {price_display.display_text}
              </span>
            )}
            <div className="text-sm text-ui-text-secondary">per adult</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onViewAvailability(template.template_id)}
          className="w-full bg-interactive-primary hover:bg-interactive-primary-hover text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>View Availability</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Backward compatibility - existing instance card
const InstanceCard = ({ tour }) => {
  // Existing TourCard implementation for non-template tours
  return (
    <div className="bg-ui-surface-secondary rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-2">{tour.tour_name}</h3>
      <p className="text-sm text-ui-text-secondary mb-4">{tour.description}</p>
      {/* ... existing instance card implementation ... */}
    </div>
  )
}

export default EnhancedTourCard
```

### **Step 3: Update Discovery Tab** (Week 2)

**File**: `src/components/discovery/DiscoverTab.jsx` (Enhanced)

```jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { templateDiscoveryService } from '../../services/templateDiscoveryService'
import EnhancedTourCard from '../shared/EnhancedTourCard'
import TemplateScheduleModal from '../shared/TemplateScheduleModal'

const DiscoverTab = () => {
  const { t } = useTranslation()
  const [displayMode, setDisplayMode] = useState('template') // 'template' or 'instance'
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [filters, setFilters] = useState({
    island: 'all',
    tourType: 'all',
    priceRange: null
  })

  // Load templates on mount and filter change
  useEffect(() => {
    loadTemplates()
  }, [filters])

  const loadTemplates = async () => {
    try {
      setLoading(true)

      if (displayMode === 'template') {
        const data = await templateDiscoveryService.getTemplateDiscovery(filters)
        setTemplates(data)
      } else {
        // Fallback to existing instance-based loading
        const { discoverTours } = await import('../../hooks/useTours')
        const data = await discoverTours(filters)
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error loading tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAvailability = (templateId) => {
    const template = templates.find(t => t.template_id === templateId)
    setSelectedTemplate(template)
    setShowScheduleModal(true)
  }

  const handleAddToFavorites = (templateId) => {
    // Implement favorites logic
    console.log('Add to favorites:', templateId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Header with Display Mode Toggle */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ui-text-primary mb-4">
          {t('discover.title', 'Discover French Polynesian Adventures')}
        </h1>

        {/* Display Mode Switch */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex bg-ui-surface-tertiary rounded-lg p-1">
            <button
              onClick={() => setDisplayMode('template')}
              className={`px-4 py-2 rounded-md transition-colors ${
                displayMode === 'template'
                  ? 'bg-interactive-primary text-white'
                  : 'text-ui-text-secondary hover:text-ui-text-primary'
              }`}
            >
              Browse Experiences
            </button>
            <button
              onClick={() => setDisplayMode('instance')}
              className={`px-4 py-2 rounded-md transition-colors ${
                displayMode === 'instance'
                  ? 'bg-interactive-primary text-white'
                  : 'text-ui-text-secondary hover:text-ui-text-primary'
              }`}
            >
              Specific Dates
            </button>
          </div>

          <div className="text-sm text-ui-text-secondary">
            {displayMode === 'template'
              ? `${templates.length} experience types available`
              : `${templates.length} specific tours available`
            }
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        {/* Filter components - existing implementation */}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-ui-surface-secondary rounded-xl h-96 animate-pulse" />
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <EnhancedTourCard
              key={displayMode === 'template' ? template.template_id : template.id}
              template={template}
              isTemplate={displayMode === 'template'}
              onViewAvailability={handleViewAvailability}
              onAddToFavorites={handleAddToFavorites}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-ui-text-primary mb-2">
            No experiences found
          </h3>
          <p className="text-ui-text-secondary">
            Try adjusting your filters or check back later for new adventures.
          </p>
        </div>
      )}

      {/* Template Schedule Modal */}
      {showScheduleModal && selectedTemplate && (
        <TemplateScheduleModal
          template={selectedTemplate}
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  )
}

export default DiscoverTab
```

### **Step 4: Template Schedule Modal** (Week 2)

**File**: `src/components/shared/TemplateScheduleModal.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { templateDiscoveryService } from '../../services/templateDiscoveryService'
import { formatPrice, formatDate, formatTime } from '../../utils/currency'

const TemplateScheduleModal = ({ template, isOpen, onClose }) => {
  const [scheduleData, setScheduleData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && template) {
      loadScheduleData()
    }
  }, [isOpen, template])

  const loadScheduleData = async () => {
    try {
      setLoading(true)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2) // 2 months ahead

      const data = await templateDiscoveryService.getTemplateScheduleOverview(
        template.template_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      setScheduleData(data)
    } catch (error) {
      console.error('Error loading schedule data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    // Here you would typically open the booking modal or navigate to booking
    console.log('Selected date:', date)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-ui-surface-primary rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ui-border-primary">
          <div>
            <h2 className="text-xl font-bold text-ui-text-primary">
              {template.template_name}
            </h2>
            <p className="text-ui-text-secondary">
              {template.company_name} • {template.operator_island}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-ui-surface-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-ui-surface-tertiary rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-interactive-primary text-white'
                    : 'text-ui-text-secondary'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-interactive-primary text-white'
                    : 'text-ui-text-secondary'
                }`}
              >
                <Clock className="w-4 h-4 inline-block mr-2" />
                List View
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interactive-primary" />
            </div>
          ) : (
            <>
              {viewMode === 'calendar' ? (
                <CalendarView
                  scheduleData={scheduleData}
                  onDateSelect={handleDateSelect}
                />
              ) : (
                <ListView
                  scheduleData={scheduleData}
                  onDateSelect={handleDateSelect}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const CalendarView = ({ scheduleData, onDateSelect }) => {
  // Calendar implementation
  return (
    <div className="bg-ui-surface-secondary rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Select a Date</h3>
      {/* Calendar grid implementation */}
      <div className="grid grid-cols-7 gap-2">
        {/* Calendar implementation */}
      </div>
    </div>
  )
}

const ListView = ({ scheduleData, onDateSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Available Times</h3>
      {scheduleData?.map(instance => (
        <div
          key={instance.id}
          className="bg-ui-surface-secondary rounded-lg p-4 cursor-pointer hover:bg-ui-surface-tertiary transition-colors"
          onClick={() => onDateSelect(instance)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">
                {formatDate(instance.tour_date)} at {formatTime(instance.time_slot)}
              </div>
              <div className="text-sm text-ui-text-secondary">
                {instance.available_spots} of {instance.max_capacity} spots available
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{formatPrice(instance.final_price_adult)}</div>
              <div className="text-sm text-ui-text-secondary">per adult</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TemplateScheduleModal
```

---

## 📊 **IMPLEMENTATION TIMELINE**

### **Week 1: Foundation**
- **Day 1-2**: Create `templateDiscoveryService.js` and database function
- **Day 3-4**: Build `EnhancedTourCard` component
- **Day 5**: Test template discovery API and card rendering

### **Week 2: Integration**
- **Day 1-2**: Update `DiscoverTab` with template/instance toggle
- **Day 3-4**: Build `TemplateScheduleModal` component
- **Day 5**: Integration testing and bug fixes

### **Week 3: Polish & Testing**
- **Day 1-2**: Mobile optimization and responsive design
- **Day 3-4**: Performance optimization and caching
- **Day 5**: User testing and final adjustments

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- `templateDiscoveryService` API methods
- `EnhancedTourCard` component rendering
- Price display logic and promotional pricing

### **Integration Tests**
- Template discovery → schedule overview → booking flow
- Filter application and result updates
- Modal opening and closing behaviors

### **User Experience Tests**
- Mobile responsiveness on different screen sizes
- Touch interactions and gesture support
- Loading states and error handling

### **Performance Tests**
- Database query performance with large datasets
- Component rendering performance with many templates
- Modal loading times and smooth animations

---

## 📱 **MOBILE OPTIMIZATION**

### **Responsive Design**
- **Template cards**: Stack vertically on mobile, larger touch targets
- **Filters**: Collapsible filter panel for mobile
- **Modal**: Full-screen modal on mobile devices
- **Calendar**: Touch-optimized date selection

### **Performance Considerations**
- **Lazy loading**: Load templates as user scrolls
- **Image optimization**: Compressed hero images for mobile
- **Caching**: Cache template data to reduce API calls
- **Smooth animations**: 60fps transitions and interactions

---

## 🎯 **SUCCESS METRICS**

### **User Experience Metrics**
- **Discovery Time**: Time to find desired experience type
- **Conversion Rate**: Template view → schedule view → booking
- **Mobile Engagement**: Mobile vs desktop usage patterns
- **User Satisfaction**: Feedback on new vs old interface

### **Technical Metrics**
- **Page Load Time**: Template discovery page performance
- **API Response Time**: Template discovery API speed
- **Error Rate**: Failed template loads or modal errors
- **Mobile Performance**: Touch response times and smoothness

### **Business Metrics**
- **Template Popularity**: Most viewed and booked templates
- **Operator Performance**: Templates driving most revenue
- **Booking Patterns**: Peak times and popular combinations
- **Revenue Impact**: Overall booking value changes

---

## 🚀 **READY TO START?**

This implementation plan provides a clear roadmap for transforming the tourist-app into a template-first discovery platform. The approach:

- ✅ **Maintains backward compatibility** - existing functionality preserved
- ✅ **Progressive enhancement** - new features built on top of existing system
- ✅ **Mobile-first design** - optimized for French Polynesian mobile users
- ✅ **Industry standards** - follows Airbnb/Viator best practices

**Next Step**: Start with the `templateDiscoveryService.js` and database function creation. This provides the foundation for all subsequent components.

Ready to begin implementation! 🏝️