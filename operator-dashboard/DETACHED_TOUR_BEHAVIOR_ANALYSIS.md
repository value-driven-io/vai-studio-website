# Detached Tour Behavior Analysis

## Current Detached Tour Logic

### What Happens When You Detach a Tour:
1. **Tour Status**: `is_detached = true` 
2. **Schedule Link**: `parent_schedule_id` remains set (NOT NULL)
3. **Visibility**: Tour disappears from calendar view (filtered out)
4. **Database Record**: Tour remains in database with all data intact

### Critical Issue: Schedule Update Duplicates 🚨

**Problem**: When you update a schedule that includes a date with a detached tour, it creates duplicate tours.

**Example Scenario**:
- **Original Schedule**: Sep 15-20, 09:00
- **Action**: Customize Sep 17 tour (price change) → becomes customized
- **Action**: Detach Sep 17 tour → `is_detached = true`
- **Action**: Update schedule to Sep 15-25, 10:00
- **RESULT**: 
  - Tour 1: Sep 17, 09:00 (detached, customized, old time)
  - Tour 2: Sep 17, 10:00 (new, from schedule update) ← **DUPLICATE!**

### Root Cause Analysis

**Current Schedule Update Logic**:
```javascript
// From scheduleService.js:255-259
newDates.forEach(date => {
  if (!existingDatesMap.has(date)) {  // Only checks existing tours
    datesToAdd.push(date)             // Doesn't check detached tours!
  }
})
```

**Problem**: `existingDatesMap` only includes tours where `is_detached = false` or `NULL`. Detached tours are filtered out, so their dates appear "available" for new tour creation.

## Recommended Fix

### Option 1: Include Detached Tours in Date Check
```javascript
// Update schedule logic to check ALL tours (including detached)
const { data: allTours } = await supabase
  .from('tours')
  .select('tour_date, is_detached')
  .eq('parent_schedule_id', scheduleId)
  
const allDatesMap = new Map()
allTours.forEach(tour => {
  allDatesMap.set(tour.tour_date, true) // Include detached tours
})

newDates.forEach(date => {
  if (!allDatesMap.has(date)) {
    datesToAdd.push(date)
  }
})
```

### Option 2: Smart Detached Tour Handling
```javascript
// When updating schedule:
// 1. Check for detached tours on new schedule dates
// 2. Give user choice:
//    - "Reattach detached tour to schedule" 
//    - "Keep detached tour separate" (no new tour created)
//    - "Delete detached tour and create new one"
```

### Option 3: Detached Tour Exclusion
```javascript
// Prevent schedule updates from creating tours on detached dates
const { data: detachedDates } = await supabase
  .from('tours')
  .select('tour_date')
  .eq('parent_schedule_id', scheduleId)
  .eq('is_detached', true)

const excludedDates = new Set(detachedDates.map(t => t.tour_date))
const filteredNewDates = newDates.filter(date => !excludedDates.has(date))
```

## Business Logic Questions

1. **Should detached tours block new schedule dates?** 
   - Pro: Prevents duplicates
   - Con: Limits schedule flexibility

2. **Should users be notified about detached date conflicts?**
   - Pro: User awareness and control
   - Con: More complex UI

3. **What happens to detached tours during schedule deletion?**
   - Current: Detached tours remain (orphaned)
   - Alternative: Delete detached tours with schedule

## Current State Issues

1. **Hidden from Calendar**: Detached tours invisible but still exist
2. **No Management UI**: No way to view/manage detached tours
3. **Duplicate Creation**: Schedule updates create duplicate tours
4. **Orphaned Tours**: No clear cleanup process

## ✅ SOLUTION IMPLEMENTED (September 14, 2025)

### **Database Migration**: `20250914000002_fix_detached_tour_architecture.sql`

**Architecture Change**:
- **Before**: `parent_schedule_id` remains set for detached tours (confusing)
- **After**: `parent_schedule_id = NULL` for detached tours (clean separation)
- **Audit Trail**: New `detached_from_schedule_id` tracks origin

**Application Updates**:
```javascript
// Schedule updates now only affect attached tours
.eq('parent_schedule_id', scheduleId)
.is('is_detached', false) // Only attached tours

// Detached conflict detection
.rpc('get_schedule_date_conflicts', { schedule_id_param, new_dates })
```

### **Result**: 
✅ **No more duplicates** - detached dates excluded from schedule updates  
✅ **Clear ownership** - NULL parent_schedule_id = independent tour  
✅ **Conflict detection** - warns when schedule dates have detached tours  
✅ **Audit trail** - preserves historical relationship  

### **Business Logic**:
1. **Detach Tour**: Sets `parent_schedule_id = NULL`, tracks origin in `detached_from_schedule_id`
2. **Schedule Updates**: Only modify tours with `parent_schedule_id IS NOT NULL`
3. **Display Logic**: Override-first priority system everywhere
4. **Conflict Prevention**: Check for detached tours before creating new ones

## Recommendations

**✅ Immediate Fix**: COMPLETED - Schedule logic excludes detached dates

**Long-term**: 
- Add "Detached Tours" management page
- Implement reattachment functionality  
- Add user warnings for detached date conflicts in UI