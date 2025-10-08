# GetYourGuide Integration - Next Steps (October 1, 2025)

## 🎯 Summary of Today's Session

### What We Discovered:
The **400 error from the self-testing tool** was caused by a **product ID mapping issue**:
- VAI Studio uses UUIDs for tours
- GetYourGuide expects human-readable product IDs
- No mapping existed between the two systems

### What We Created:

1. **✅ Product Mapping Document**: `VAI_TO_GYG_PRODUCT_MAPPING.md`
   - Defined 4 active product mappings
   - Documented all conversion formulas (timezone, price, product type)
   - Created complete testing checklist

2. **✅ Database Migration**: `20251001000001_add_getyourguide_product_tracking.sql`
   - Adds `gyg_product_id`, `gyg_option_id`, `gyg_sync_status`, `gyg_last_sync` columns
   - Pre-populates product IDs for 4 active templates
   - Creates helper function `get_gyg_product_id_for_tour()`
   - Creates monitoring view `gyg_product_sync_status`

3. **✅ Updated Implementation Guide**: `CHANNEL_MANAGER_IMPLEMENTATION_GUIDE.md`
   - Added diagnostic session notes
   - Documented root cause analysis
   - Outlined next 4 phases to completion

---

## 📋 Your Action Items

### **STEP 1: Apply Database Migration** ⏳

Navigate to **Supabase Dashboard** → SQL Editor and run:

```bash
# File location:
tourist-app/supabase/migrations/20251001000001_add_getyourguide_product_tracking.sql
```

**What this does**:
- Adds 4 new columns to `tours` table
- Sets up product ID mappings for your 4 active templates:
  - `VAI_WHALE_WATCHING_MOOREA_001` → "Dance with the Whales"
  - `VAI_DIVING_TAHITI_001` → "Dive with the Turtles"
  - `VAI_COOKING_TAHITI_001` → "Traditional Cooking Workshop"
  - `VAI_LAGOON_TOUR_MOOREA_001` → "Sunset Lagoon Tour"

**Verification Query**:
```sql
-- Check that product IDs were assigned
SELECT * FROM gyg_product_sync_status;
```

**Expected Result**: 4 templates with `gyg_sync_status = 'pending'`

---

### **STEP 2: Update n8n Workflows** ⏳

The n8n availability sync workflow needs to be updated to use the new product ID mapping.

**Files to update**:
1. `n8n-workflows/GetYourGuide Integration/GetYourGuide-Availability-Sync.json`

**Changes needed**:
1. **Add Product ID Lookup Node** (before sending to GYG API):
   ```javascript
   // Get GYG product ID from template
   const tourId = $('Webhook').item.json.tour_id;
   const supabaseUrl = $env.SUPABASE_URL;
   const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY;

   // Query: SELECT get_gyg_product_id_for_tour($1)
   // This returns the GYG product ID for any tour (template or instance)
   ```

2. **Add Timezone Conversion**:
   ```javascript
   function toGygDateTime(tourDate, timeSlot) {
     return `${tourDate}T${timeSlot}:00-10:00`;
   }
   ```

3. **Add Price Conversion** (when ready for pricing sync):
   ```javascript
   function xpfToUsdCents(xpfPrice) {
     return Math.round((xpfPrice / 100) * 100);  // XPF → USD → cents
   }
   ```

**Testing after update**:
```sql
-- Trigger availability sync by updating a tour
UPDATE tours
SET available_spots = available_spots - 1
WHERE id = '11467963-8274-4f65-8d73-082eace391ee';  -- "Dance with the Whales" instance

-- Check n8n logs - should now use product ID "VAI_WHALE_WATCHING_MOOREA_001"
```

---

### **STEP 3: Retry Self-Testing Tool** ⏳

Once database and n8n are updated, retry the GetYourGuide self-testing tool:

**Go to**: https://integrator.getyourguide.com
**Login**: VAIStudioLLC / b2b8bcb83ada0e139228b361d891eb3d

**Form Values**:

| Field | Value |
|---|---|
| **Valid product ID** | `VAI_WHALE_WATCHING_MOOREA_001` |
| **Time available** | ✅ At fixed starting times (Time point) |
| **Price setup** | Price per individual |
| **Configure** | Availability only (for now) |
| **Product timezone** | Pacific/Tahiti (GMT-10) |
| **Dates available FROM** | 2025-09-26 |
| **Dates available TO** | 2025-10-10 |

**Click**: "Test your integration"

**Expected Result**: ✅ All tests pass with status "Completed"

If you still get 400:
- Check n8n logs for the exact request GetYourGuide sent
- Verify product ID in database matches what you entered
- Confirm timezone format is correct (`2025-09-27T07:00:00-10:00`)

---

### **STEP 4: Product Catalog Sync** ⏳

After self-testing passes, you need to **register your products** with GetYourGuide:

**API Endpoint**: `POST /1/products` (not yet implemented)

**What this does**:
- Sends your 4 tour templates to GetYourGuide
- GetYourGuide creates product listings
- Returns `gygOptionId` for each product
- Updates `gyg_option_id` and `gyg_sync_status = 'synced'` in database

**n8n Workflow Needed**: `GetYourGuide-Product-Catalog-Sync.json`

This will be the next major implementation task.

---

## 🧪 Testing Checklist

### Phase 1: Database ✅
- [x] Migration created: `20251001000001_add_getyourguide_product_tracking.sql`
- [ ] Migration applied to staging database
- [ ] Verification query shows 4 products with status 'pending'
- [ ] Helper function `get_gyg_product_id_for_tour()` works

### Phase 2: n8n Workflows ⏳
- [ ] Product ID lookup added to availability sync
- [ ] Timezone conversion tested
- [ ] Availability update uses GYG product IDs
- [ ] n8n logs show correct product IDs in requests

### Phase 3: Self-Testing Tool ⏳
- [ ] Form filled with correct product ID
- [ ] All tests return "Completed" status
- [ ] No 400 errors
- [ ] Webhook logs show successful processing

### Phase 4: Product Catalog Sync ⏳
- [ ] Product registration workflow created
- [ ] All 4 templates synced to GetYourGuide
- [ ] `gygOptionId` populated in database
- [ ] Sync status updated to 'synced'

---

## 📚 Reference Documents

All documentation is in: `operator-dashboard/documentation/Channel Manager/GetYourGuide/`

| File | Purpose |
|---|---|
| `CHANNEL_MANAGER_IMPLEMENTATION_GUIDE.md` | **Master documentation** - full project history and status |
| `VAI_TO_GYG_PRODUCT_MAPPING.md` | **Product mapping** - conversion formulas and mappings |
| `NEXT_STEPS_OCTOBER_1_2025.md` | **This file** - immediate action items |
| `supplier_api_gyg_endpoints.yaml` | API specification for GetYourGuide |

Database migration:
- `tourist-app/supabase/migrations/20251001000001_add_getyourguide_product_tracking.sql`

n8n workflows:
- `n8n-workflows/GetYourGuide Integration/GetYourGuide-Availability-Sync.json`
- `n8n-workflows/GetYourGuide Integration/GetYourGuide-Integration-Complete.json`

---

## 🎯 Definition of Done

**Self-testing tool is complete when**:
1. ✅ Database has product ID mappings
2. ✅ n8n workflows use correct product IDs
3. ✅ All self-testing tool tests show "Completed"
4. ✅ Availability sync works with GYG product IDs

**Product catalog sync is complete when**:
1. All 4 templates registered with GetYourGuide
2. `gygOptionId` populated for each template
3. Products visible in GetYourGuide marketplace (sandbox)
4. Real-time availability updates working

---

## ❓ Questions or Issues?

**If database migration fails**:
- Check that columns don't already exist
- Verify UUIDs match your actual template IDs
- Look for constraint violations

**If n8n workflow update is unclear**:
- I can create the updated JSON file for you
- Let me know which nodes need modification
- We can test incrementally

**If self-testing tool still returns 400**:
- Share the exact error message
- Check n8n execution logs
- Verify product ID format exactly matches

---

**Session completed**: October 1, 2025
**Next session**: Apply migration → Update n8n → Retry self-testing tool
