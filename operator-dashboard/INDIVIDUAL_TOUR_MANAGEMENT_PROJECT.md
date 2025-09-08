# 🎯 VAI Individual Tour Management Enhancement Project

**📅 Project Start**: 2025-09-08  
**🎯 Objective**: Enable individual tour instance management while preserving bulk schedule functionality  
**📋 Status**: **PLANNING PHASE**  
**🏗️ Current Phase**: Architecture Decision & Implementation Planning  

---

## 📊 **PROJECT OVERVIEW**

### **Problem Statement**
The VAI operator dashboard successfully implements bulk schedule management (Template → Schedule → Tours), but lacks individual tour control. Operators need granular management capabilities for specific tour instances without losing the efficiency of bulk operations.

### **Business Requirements**
- **Individual Pricing**: Apply discounts/premiums to specific tour instances
- **Custom Notes**: Add instance-specific information (e.g., "Humpback season peak")
- **Selective Cancellation**: Cancel individual tours without affecting entire schedule
- **Status Management**: Mark individual tours as sold out, special events, etc.
- **Bulk Preservation**: Maintain existing efficient bulk schedule operations

---

## 🏗️ **CURRENT ARCHITECTURE STATUS**

### **✅ Implemented Foundation (Phase 1-3)**
- **Database Schema**: Unified `tours` table with activity types
- **Template System**: Activity template creation and management
- **Schedule System**: Recurrence-based tour generation
- **Service Layer**: Core services for templates and schedules
- **UI Components**: Template creation, schedule management, calendar view

### **🎯 Target Architecture (Phase 4)**
Enhanced individual tour management with override capabilities.

---

## 📋 **DATABASE SCHEMA ANALYSIS**

### **Current Tours Table Structure**
```sql
-- Core fields (working)
id, operator_id, tour_name, tour_type, description
tour_date, time_slot, duration_hours
max_capacity, available_spots
original_price_adult, discount_price_adult, discount_price_child
status, meeting_point, location

-- Activity type system (working)
activity_type: 'last_minute' | 'template' | 'scheduled'
is_template: boolean
parent_template_id: uuid (references tours.id)
recurrence_data: jsonb

-- Constraints
chk_activity_type, chk_template_no_date, tours_status_check
```

### **Schedules Table Structure**
```sql
-- Schedule management (working)
id, tour_id (template), operator_id
recurrence_type, days_of_week[], start_time
start_date, end_date, exceptions[]
```

### **🎯 PROPOSED ENHANCEMENTS**

Based on AI consultant analysis, we need to add individual tour override capabilities:

```sql
-- New columns to add to tours table:
ALTER TABLE tours ADD COLUMN parent_schedule_id UUID REFERENCES schedules(id);
ALTER TABLE tours ADD COLUMN is_customized BOOLEAN DEFAULT FALSE;
ALTER TABLE tours ADD COLUMN frozen_fields TEXT[];
ALTER TABLE tours ADD COLUMN overrides JSONB DEFAULT '{}';
ALTER TABLE tours ADD COLUMN is_detached BOOLEAN DEFAULT FALSE;
ALTER TABLE tours ADD COLUMN promo_discount_percent INTEGER;
ALTER TABLE tours ADD COLUMN promo_discount_value INTEGER;
ALTER TABLE tours ADD COLUMN instance_note TEXT;
```

---

## 🔄 **PROPOSED USER FLOW**

### **Enhanced Operator Workflow**

1. **Template Creation** ✅ (Working)
   - Create reusable activity template
   - Set base pricing, capacity, description

2. **Schedule Creation** ✅ (Working)  
   - Define recurrence pattern
   - Auto-generate tour instances

3. **🆕 Individual Tour Management** (To Implement)
   - View generated tour instances in calendar/list
   - Click individual tour to customize:
     - Override pricing (discount/premium)
     - Add custom notes
     - Modify capacity
     - Change status
   - System marks tour as `is_customized = true`
   - Frozen fields prevent bulk updates to customized tours

4. **🆕 Bulk Update Preservation** (To Implement)
   - Template/schedule changes propagate to non-customized tours
   - Customized tours remain protected
   - Option to "detach" tours completely from schedule

### **Tourist Flow** (Unchanged)
- Browse available tours (all activity types)
- Book specific tour instance
- Existing booking system continues to work

---

## 🛠️ **IMPLEMENTATION ROADMAP**

### **Phase 4A: Database Schema Enhancement**
- [ ] Design individual tour override schema
- [ ] Create migration script for new columns
- [ ] Add appropriate indexes
- [ ] Update constraints and triggers
- [ ] Test backward compatibility

### **Phase 4B: Service Layer Enhancement**
- [ ] Extend `scheduleService.js` for individual tour management
- [ ] Create tour override functions
- [ ] Implement bulk update with override protection
- [ ] Add individual tour customization methods
- [ ] Update tour generation logic

### **Phase 4C: UI Component Enhancement**
- [ ] Create individual tour management modal/panel
- [ ] Enhance calendar view with tour customization
- [ ] Add tour override indicators
- [ ] Implement bulk vs individual operation toggles
- [ ] Add confirmation dialogs for sensitive operations

### **Phase 4D: Testing & Refinement**
- [ ] Test override system functionality
- [ ] Verify bulk operations still work
- [ ] Test edge cases (detached tours, frozen fields)
- [ ] Performance testing with large datasets
- [ ] User acceptance testing

---

## 🎯 **CURRENT ACTION ITEMS**

### **🔥 IMMEDIATE (This Session)**
1. **Architecture Decision**: Confirm override system approach
2. **Database Design**: Finalize new column specifications
3. **Migration Planning**: Design safe deployment strategy

### **📋 NEXT STEPS**
1. **Schema Implementation**: Create and test database migration
2. **Service Enhancement**: Extend scheduleService with override capabilities
3. **UI Design**: Create individual tour management interface
4. **Integration Testing**: Ensure all systems work together

---

## 🧠 **KEY INSIGHTS & CONSIDERATIONS**

### **✅ Strengths of Current System**
- Unified table approach working well
- Clean template → schedule → tours flow
- Efficient bulk operations
- Good performance with proper indexing

### **🎯 Critical Success Factors**
- **Backward Compatibility**: Existing tours/schedules must continue working
- **Performance**: Individual overrides shouldn't slow bulk operations
- **User Experience**: Clear distinction between bulk and individual actions
- **Data Integrity**: Override system must maintain referential integrity

### **⚠️ Risk Mitigation**
- **Schema Changes**: Test thoroughly in staging environment
- **Data Migration**: Ensure zero downtime deployment
- **Performance Impact**: Monitor query performance with new columns
- **User Training**: Clear documentation for new features

---

## 📊 **TECHNICAL SPECIFICATIONS**

### **Override System Logic**
```javascript
// Pseudo-code for tour update logic
function updateTour(tourId, updates, options = {}) {
  const tour = getTour(tourId);
  
  if (tour.is_customized && !options.forceOverride) {
    // Protected tour - only allow explicit overrides
    return applyOverrides(tour, updates);
  }
  
  if (updates.fromBulkOperation) {
    // Check frozen fields
    const allowedUpdates = filterFrozenFields(updates, tour.frozen_fields);
    return updateTour(tourId, allowedUpdates);
  }
  
  // Regular update - mark as customized if individual change
  const updatedTour = {...tour, ...updates};
  if (!updates.fromBulkOperation) {
    updatedTour.is_customized = true;
    updatedTour.frozen_fields = Object.keys(updates);
  }
  
  return saveTour(updatedTour);
}
```

### **Database Query Patterns**
```sql
-- Get customizable tour instances for calendar
SELECT * FROM tours 
WHERE parent_template_id = ? 
  AND activity_type = 'scheduled'
  AND tour_date >= CURRENT_DATE
ORDER BY tour_date, time_slot;

-- Bulk update non-customized tours
UPDATE tours 
SET price_adult = ?, updated_at = NOW()
WHERE parent_schedule_id = ?
  AND (is_customized = FALSE OR 'price_adult' != ALL(frozen_fields));
```

---

## 📈 **SUCCESS METRICS**

### **Functional Metrics**
- [ ] Individual tour customization working
- [ ] Bulk operations preserved and protected
- [ ] Zero breaking changes to existing functionality
- [ ] Performance maintained or improved

### **Business Metrics**
- [ ] Operator adoption of individual tour management
- [ ] Increased booking conversion (due to better pricing flexibility)
- [ ] Reduced operator support requests
- [ ] Positive operator feedback on new features

---

## 🔄 **ITERATION LOG**

### **Session 1 (2025-09-08)**
- **Completed**: Comprehensive system analysis and status assessment
- **Identified**: Core architecture challenge and user requirements
- **Documented**: Current working system and proposed enhancements
- **Next**: Architecture decision and implementation planning

### **Upcoming Sessions**
- **Session 2**: Database schema design and migration planning
- **Session 3**: Service layer enhancement implementation
- **Session 4**: UI component development and integration
- **Session 5**: Testing, refinement, and deployment

---

## 📞 **STAKEHOLDER COMMUNICATION**

### **Key Messages**
- Current system foundation is solid and working well
- Enhancement will add individual control without breaking bulk operations
- Implementation follows proven architectural patterns
- Deployment will be staged and carefully tested

### **Risk Communication**
- Schema changes require careful testing and staged deployment
- User training will be needed for new individual tour features
- Performance monitoring during rollout is essential

---

## 📚 **REFERENCES**

- [SCHEDULE_SYSTEM_ANALYSIS_AND_CHALLENGES.md](./SCHEDULE_SYSTEM_ANALYSIS_AND_CHALLENGES.md) - Original analysis
- [IMPLEMENTATION_SUCCESS_REPORT.md](./IMPLEMENTATION_SUCCESS_REPORT.md) - Phase 1-3 completion
- Database migration files in `/supabase/migrations/`
- Service implementations in `/src/services/`

---

**📝 Document Status**: Living document - updated each session  
**🔄 Last Updated**: 2025-09-08  
**👥 Contributors**: AI Consultant, Development Team  
**📋 Review Schedule**: Updated each development session