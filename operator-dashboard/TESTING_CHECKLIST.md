# 🧪 VAI Activity Template Migration - Testing Checklist

**Purpose**: Comprehensive testing scenarios for each migration phase  
**Approach**: Test each phase independently before proceeding  
**Environment**: All tests must pass in staging before production deployment  

---

## 📋 Pre-Migration Testing

### Database Backup & Environment Setup
- [ ] **Complete database backup created**
- [ ] **Staging environment mirrors production exactly**  
- [ ] **Migration files are in git and reviewed**
- [ ] **Rollback scripts tested on copy of production data**
- [ ] **Supabase CLI configured for staging environment**

### Baseline Functionality Test
- [ ] **Tourist app can discover and book tours**
- [ ] **Operator dashboard receives bookings correctly**
- [ ] **Payment processing works end-to-end**
- [ ] **Real-time chat functions properly**
- [ ] **All existing tours display correctly**

---

## 🧪 Phase 1 Testing: Database Foundation

### Migration Execution
- [ ] **Migration script runs without errors**
- [ ] **All new tables created successfully**
- [ ] **All indexes created and active**
- [ ] **All constraints and checks working**
- [ ] **RLS policies applied correctly**

### Table Structure Validation
```sql
-- Activity Templates Table Tests
SELECT * FROM public.activity_templates LIMIT 1; -- Should return empty result
\d public.activity_templates; -- Verify structure

-- Tour Instances Table Tests  
SELECT * FROM public.activity_instances LIMIT 1; -- Should return empty result
\d public.activity_instances; -- Verify structure

-- Schedules Table Enhancement
\d public.schedules; -- Should show new template_id column
```

### Data Integrity Tests
- [ ] **Foreign key constraints work correctly**
- [ ] **Check constraints prevent invalid data**
- [ ] **Generated columns calculate correctly**
- [ ] **Triggers fire on insert/update**
- [ ] **Default values are applied**

### View Testing
```sql
-- Test views return expected structure
SELECT * FROM public.active_activity_templates_with_operators LIMIT 1;
SELECT * FROM public.active_activity_instances_with_details LIMIT 1;
```

### Function Testing
```sql
-- Test instance generation function exists
SELECT public.generate_activity_instances_from_schedule(NULL); -- Should handle gracefully
```

### Performance Testing
- [ ] **Query execution plans are reasonable**
- [ ] **Index usage verified for common queries**
- [ ] **No significant performance degradation on existing queries**

### Rollback Test (Critical!)
- [ ] **Execute rollback migration successfully**
- [ ] **All new tables/columns removed**
- [ ] **Existing system functions normally after rollback**
- [ ] **Re-run forward migration successfully**

---

## 🧪 Phase 2 Testing: Backend Services

### Service Creation Tests
```javascript
// activityTemplateService.js tests
- [ ] Create activity template with valid data
- [ ] Reject invalid template data (pricing, capacity, etc.)
- [ ] Update existing template
- [ ] Delete template
- [ ] List templates by operator
- [ ] Filter templates by status, island, type

// tourInstanceService.js tests  
- [ ] Generate instances from template + schedule
- [ ] Handle recurrence patterns correctly (daily, weekly, monthly)
- [ ] Apply exception dates properly
- [ ] Calculate booking deadlines correctly
- [ ] Update instance availability
- [ ] Handle capacity management

// Enhanced scheduleService.js tests
- [ ] Create schedule linked to template
- [ ] Generate preview of instances before saving
- [ ] Validate schedule conflicts
- [ ] Handle date range limits
- [ ] Process recurring patterns correctly
```

### Database Integration Tests
```javascript
// Test data flow: Template → Schedule → Instances → Bookings
- [ ] Create template successfully saves to database
- [ ] Schedule creation generates instances
- [ ] Instance availability updates correctly
- [ ] Foreign key relationships maintained
- [ ] Data validation catches edge cases
```

### Error Handling Tests
```javascript
// Edge cases that should be handled gracefully
- [ ] Invalid operator_id in template creation
- [ ] Schedule date range exceeding limits
- [ ] Instance generation for past dates
- [ ] Capacity conflicts in instance updates
- [ ] Database connection failures
```

### Performance & Concurrency Tests
- [ ] **Multiple operators creating templates simultaneously**
- [ ] **Large schedule generation (100+ instances)**
- [ ] **Bulk instance updates**  
- [ ] **Memory usage within acceptable limits**
- [ ] **Response times under 2 seconds for all operations**

---

## 🧪 Phase 3 Testing: Operator Dashboard Frontend

### Navigation & UI Tests
- [ ] **"Create Tab" renamed to "Activities Tab" correctly**
- [ ] **Navigation icons and labels updated**
- [ ] **Tab switching works smoothly**
- [ ] **Mobile responsive design maintained**

### Activity Template Creation
```javascript
// Template creation form tests
- [ ] Form validation prevents invalid data
- [ ] All template fields save correctly
- [ ] Photo/video uploads work (if implemented)
- [ ] Island/location dropdowns populated
- [ ] Pricing calculations display correctly
- [ ] Success message shown on creation
- [ ] Template appears in activities list
```

### Schedule Management
```javascript
// Schedule creation with templates
- [ ] Template dropdown populated with operator's templates
- [ ] Recurrence pattern options work
- [ ] Day-of-week selection functions
- [ ] Date range picker validates inputs
- [ ] Exception dates can be added/removed
- [ ] Preview shows correct generated instances
- [ ] Schedule saves and appears in list
```

### Calendar View (New Feature)
```javascript
// Monthly calendar implementation
- [ ] Calendar displays current month correctly
- [ ] Navigation between months works
- [ ] Generated instances appear on correct dates
- [ ] Color coding by activity type
- [ ] Click handlers for instance details
- [ ] Responsive on mobile devices
- [ ] Performance with 100+ instances
```

### Integration Tests
- [ ] **Template creation → schedule creation → instance generation flow**
- [ ] **Schedule editing updates instances correctly**
- [ ] **Template changes propagate to future instances**
- [ ] **Calendar view updates in real-time**

### Browser Compatibility Tests
- [ ] **Chrome (latest)**
- [ ] **Safari (latest)**
- [ ] **Firefox (latest)**
- [ ] **Mobile Safari (iOS)**
- [ ] **Mobile Chrome (Android)**

---

## 🧪 Phase 4 Testing: Tourist App Integration

### Backend Service Updates
```javascript
// tourService.js modifications
- [ ] Query activity_instances instead of tours
- [ ] Filter active instances correctly
- [ ] Apply date/time filters properly
- [ ] Price range filtering works
- [ ] Search functionality maintained
- [ ] Performance equivalent or better
```

### Frontend Component Updates
```javascript
// Tourist app component tests
- [ ] TourCard displays instance data correctly
- [ ] TourDetailModal shows proper instance details
- [ ] Booking flow uses instance_id correctly
- [ ] Availability counts are accurate
- [ ] Date/time display is correct
```

### Booking Flow Tests (CRITICAL!)
```javascript
// End-to-end booking scenarios
- [ ] Tourist can discover available instances
- [ ] Booking creation uses correct instance_id
- [ ] Operator receives booking notification
- [ ] Instance availability decrements correctly
- [ ] Payment processing works with new structure
- [ ] Booking confirmation emails send properly
- [ ] Real-time chat activates correctly
```

### Data Consistency Tests
```javascript
// Cross-platform synchronization
- [ ] Instance booking in tourist app updates operator dashboard
- [ ] Operator actions reflect in tourist app
- [ ] Real-time updates work across platforms
- [ ] WebSocket subscriptions function properly
- [ ] Badge counters update correctly
```

### Mobile App Testing
- [ ] **iOS tourist app functions correctly**
- [ ] **Android tourist app functions correctly**
- [ ] **Progressive Web App features work**
- [ ] **Offline functionality maintained**

### Load Testing
- [ ] **Multiple simultaneous bookings on same instance**
- [ ] **High tourist traffic scenarios**
- [ ] **Database performance under load**
- [ ] **Real-time features scale appropriately**

---

## 🧪 Phase 5 Testing: Data Migration & Switchover

### Pre-Migration Data Validation
```sql
-- Count existing data before migration
SELECT COUNT(*) FROM public.tours;
SELECT COUNT(*) FROM public.bookings; 
SELECT COUNT(*) FROM public.schedules;
```

### Migration Script Tests
```javascript
// Data transformation validation
- [ ] All tours converted to activity_templates correctly
- [ ] Template data integrity maintained
- [ ] Existing schedules link to new templates
- [ ] Historical bookings reference correct instances
- [ ] No data loss during migration
- [ ] Foreign key relationships preserved
```

### Post-Migration Validation
```sql
-- Verify migration success
SELECT COUNT(*) FROM public.activity_templates; -- Should match tours count
SELECT COUNT(*) FROM public.activity_instances; -- Should reflect generated instances
SELECT COUNT(*) FROM public.bookings WHERE instance_id IS NOT NULL; -- All bookings updated
```

### System Switchover Tests
```javascript
// Production deployment validation
- [ ] Tourist app discovery works with new data structure
- [ ] Operator dashboard displays migrated data correctly
- [ ] All existing bookings still function
- [ ] Payment processing uninterrupted
- [ ] Real-time features work properly
- [ ] Performance meets or exceeds baseline
```

### Rollback Capability Test
- [ ] **Rollback script available and tested**
- [ ] **Traffic can be switched back to old system if needed**
- [ ] **Data exists in both old and new formats during transition**

---

## 🧪 Cross-Platform Integration Tests

### VAI Tickets ↔ VAI Operator Sync
```javascript
// Two-way data synchronization
- [ ] Tourist booking creates correct operator notification
- [ ] Operator booking confirmation updates tourist app
- [ ] Instance availability sync across platforms
- [ ] Real-time chat works between platforms
- [ ] Payment status synchronizes correctly
```

### Channel Manager Preparation Tests
```javascript
// Future OTA integration readiness
- [ ] Activity templates have all required fields
- [ ] Instance generation scales to 1000+ instances
- [ ] Availability management handles external bookings
- [ ] Pricing structure supports channel-specific rates
- [ ] External ID fields function correctly
```

---

## 🧪 Performance & Security Testing

### Security Validation
- [ ] **Row Level Security enforced correctly**
- [ ] **Operators can only access their own data**
- [ ] **Tourist app has appropriate read access**
- [ ] **No sensitive data exposed in public views**
- [ ] **SQL injection attempts blocked**

### Performance Benchmarks
```javascript
// Key performance metrics
- [ ] Template creation: < 1 second
- [ ] Schedule generation (30 days): < 3 seconds
- [ ] Calendar view load (month): < 2 seconds
- [ ] Tourist app discovery: < 2 seconds
- [ ] Booking creation: < 1 second
- [ ] Database queries optimized with proper indexes
```

### Stress Testing
- [ ] **100 concurrent operators creating templates**
- [ ] **1000+ instances displayed smoothly**
- [ ] **Tourist app handles peak traffic**
- [ ] **Real-time features scale under load**
- [ ] **Database performance stable under stress**

---

## 🧪 User Acceptance Testing

### Operator Experience Testing
```javascript
// Real operator workflows
- [ ] Operator can create activity template easily
- [ ] Schedule creation is intuitive
- [ ] Calendar view improves workflow
- [ ] Booking management works as expected
- [ ] Mobile experience is satisfactory
```

### Tourist Experience Testing  
```javascript
// Real tourist workflows
- [ ] Activity discovery feels natural
- [ ] Booking process is smooth
- [ ] Instance details are clear
- [ ] Mobile experience is excellent
- [ ] Performance is snappy
```

---

## 🧪 Final Go/No-Go Criteria

### Must-Pass Requirements
- [ ] **Zero data loss during migration**
- [ ] **All existing bookings preserved and functional**
- [ ] **Payment processing works flawlessly**
- [ ] **Tourist booking success rate >= baseline**
- [ ] **Operator dashboard fully functional**
- [ ] **Real-time features work properly**
- [ ] **Mobile experience maintained**
- [ ] **Performance meets or exceeds baseline**
- [ ] **Rollback capability verified**

### Quality Gates
- [ ] **All automated tests pass**
- [ ] **Manual testing scenarios complete**
- [ ] **User acceptance testing positive**
- [ ] **Security validation passed**
- [ ] **Performance benchmarks met**
- [ ] **Documentation updated**

---

## 📊 Testing Status Dashboard

### Phase 1: Database Foundation
**Status**: ⏳ Not Started  
**Critical Tests**: 0/12 passed  
**Performance Tests**: 0/4 passed  
**Rollback Test**: ❌ Not tested  

### Phase 2: Backend Services  
**Status**: ⏳ Not Started  
**Service Tests**: 0/15 passed  
**Integration Tests**: 0/8 passed  
**Performance Tests**: 0/5 passed  

### Phase 3: Operator Dashboard
**Status**: ⏳ Not Started  
**UI Tests**: 0/12 passed  
**Calendar Tests**: 0/7 passed  
**Browser Tests**: 0/5 passed  

### Phase 4: Tourist App
**Status**: ⏳ Not Started  
**Component Tests**: 0/8 passed  
**Booking Tests**: 0/7 passed  
**Mobile Tests**: 0/4 passed  

### Phase 5: Data Migration
**Status**: ⏳ Not Started  
**Migration Tests**: 0/6 passed  
**Validation Tests**: 0/8 passed  

**Overall Migration Status**: 🔴 **NOT READY FOR PRODUCTION**

---

*Testing Lead*: [Assigned Team Member]  
*Last Updated*: [Current Date]  
*Environment*: Staging  
*Next Review*: [Schedule regular reviews]

---

## 📚 Testing Resources

### Tools & Environment
- Supabase CLI for database testing
- Jest/Vitest for JavaScript testing  
- Playwright for end-to-end testing
- Browser dev tools for performance
- Real devices for mobile testing

### Test Data Sets
- Sample activity templates
- Various schedule patterns
- Edge case scenarios
- Load testing data
- Real operator/tourist flows

### Documentation References
- `MIGRATION_ROADMAP.md` - Overall migration plan
- `Process Flows.md` - Current system workflows
- Database migration files in `supabase/migrations/`