# Deployment Instructions - October 7, 2025
## Fix: get_gyg_product_id_for_tour() Scope Bug

---

## 🎯 WHAT YOU NEED TO DO

Follow these steps **in order**. Each step is simple and takes 1-2 minutes.

---

## STEP 1: Deploy Database Migration ⏳

### 1.1 Open Supabase SQL Editor

**Go to**: https://supabase.com/dashboard/project/wewwhxhtpqjqhxfxbzyz/editor

### 1.2 Copy the Migration File

**File location**: `tourist-app/supabase/migrations/20251007000001_fix_get_gyg_product_id_scope_bug.sql`

**Action**:
1. Open the file
2. Copy the **entire contents** (including comments)
3. Paste into Supabase SQL Editor

### 1.3 Run the Migration

1. Click **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
2. Wait for completion (should take ~2 seconds)
3. **Look for** these messages in the output:
   - ✅ `NOTICE: ✅ TEST 1 PASSED: Template returns correct product ID`
   - ✅ `NOTICE: ✅ TEST 2 PASSED: Instance returns parent template product ID`
   - ✅ `NOTICE: ✅ TEST 3 RESULTS: X of Y active future tours can be synced`

### 1.4 Expected Output

```
CREATE FUNCTION
GRANT
GRANT
GRANT
NOTICE:  ✅ TEST 1 PASSED: Template returns correct product ID
NOTICE:  ✅ TEST 2 PASSED: Instance returns parent template product ID
NOTICE:  ✅ TEST 3 RESULTS: 8 of 8 active future tours can be synced to GetYourGuide
COMMENT
```

**If you see this** → ✅ Migration successful!

---

## STEP 2: Verify the Fix ⏳

### 2.1 Test the Function Manually

**In Supabase SQL Editor**, run this query:

```sql
-- Test with the tour instance we've been using
SELECT get_gyg_product_id_for_tour('3bdadc28-beb3-49a5-a0fb-59ef89dfee2a'::UUID) as result;
```

### 2.2 Expected Result

```json
[
  {
    "result": "VAI_DIVING_TAHITI_001"
  }
]
```

**Before the fix**: `result: null` ❌
**After the fix**: `result: "VAI_DIVING_TAHITI_001"` ✅

### 2.3 Check All Tours

Run this to see how many tours can now be synced:

```sql
SELECT
    COUNT(*) FILTER (WHERE get_gyg_product_id_for_tour(id) IS NOT NULL) as can_sync,
    COUNT(*) FILTER (WHERE get_gyg_product_id_for_tour(id) IS NULL) as cannot_sync,
    COUNT(*) as total
FROM tours
WHERE status = 'active'
  AND tour_date >= CURRENT_DATE;
```

**Expected**:
- `can_sync`: 8 (or more if you have more active tours)
- `cannot_sync`: 0
- `total`: 8

**If can_sync > 0 and cannot_sync = 0** → ✅ Database fix complete!

---

## STEP 3: Fix n8n Workflow ⏳

Now the database works, but n8n still needs a small adjustment.

### 3.1 Open n8n Workflow

**Go to**: https://n8n-stable-latest.onrender.com

**Open workflow**: "GetYourGuide - Availability Sync (Database Lookup)"

### 3.2 Edit "Lookup GYG Product ID" Node

1. **Click** on the "Lookup GYG Product ID" node
2. **Scroll down** to "Body" section
3. **Find** "Body Content Type" dropdown
4. **Select**: **"JSON"**
5. **Toggle Expression Mode ON** (click the `=` icon or `fx` button next to the JSON field)
6. **Clear** any existing text
7. **Paste exactly this**:

```javascript
={
  "tour_id": $json.tour_id
}
```

**IMPORTANT**: Make sure:
- Expression mode is ON (you should see `=` at the start)
- No quotes around the whole thing
- No `{{ }}` needed in expression mode

### 3.3 Save the Node

1. Click **"Execute Node"** to test it
2. Should see output like: `"VAI_DIVING_TAHITI_001"`
3. Click **"Save"** to save the node

### 3.4 Save the Workflow

1. Click **"Save"** button in top right
2. **Activate** the workflow (toggle ON)

---

## STEP 4: Test End-to-End ⏳

### 4.1 Trigger the Workflow

**In Supabase SQL Editor**, run:

```sql
-- Update a tour to trigger the n8n workflow
UPDATE tours
SET available_spots = available_spots - 1
WHERE id = '3bdadc28-beb3-49a5-a0fb-59ef89dfee2a'
  AND available_spots > 0;
```

### 4.2 Check n8n Execution

1. **Go to n8n**: https://n8n-stable-latest.onrender.com
2. **Click** "Executions" in the sidebar
3. **Find** the latest execution
4. **Click** to open it

### 4.3 Expected Results

**You should see**:

1. ✅ "Availability Change Webhook" - Received webhook
2. ✅ "Check if Availability Changed" - Passed
3. ✅ "Extract Tour Data" - tour_id extracted
4. ✅ **"Lookup GYG Product ID"** - Returns `"VAI_DIVING_TAHITI_001"` ✅✅✅
5. ✅ "Has Product ID & Should Notify?" - Passed (true)
6. ✅ "Format GYG Payload" - Created payload
7. ✅ "Notify GetYourGuide" - **Response: 202 ACCEPTED** ✅✅✅
8. ✅ "Respond Success" - Success message

**If all nodes show green checkmarks** → 🎉 **COMPLETE SUCCESS!**

---

## STEP 5: Document Completion ⏳

### 5.1 Update Migration Log

**File**: `operator-dashboard/documentation/Channel Manager/GetYourGuide/MIGRATION_DEPLOYMENT_LOG.md`

**Find the section** (near the bottom):
```
- [ ] **ACTION REQUIRED**: Deploy migration to staging
- [ ] **ACTION REQUIRED**: Run verification tests
- [ ] **ACTION REQUIRED**: Test n8n workflow
```

**Change to**:
```
- [x] **COMPLETED**: Deploy migration to staging ✅
- [x] **COMPLETED**: Run verification tests ✅
- [x] **COMPLETED**: Test n8n workflow ✅
```

**Add at the very bottom**:
```
---

*Bug fix deployed: October 7, 2025*
*Deployed by: [Your Name]*
*Verification status: ✅ All tests passed*
*n8n workflow status: ✅ Fully functional*
*Ready for: Production deployment*
```

---

## ✅ COMPLETION CHECKLIST

- [x] Step 1: Database migration deployed ✅
- [x] Step 2: Function returns product IDs (not NULL) ✅
- [x] Step 3: n8n node configured with expression mode ✅
- [x] Step 4: End-to-end test successful (GetYourGuide accepted update) ✅
- [x] Step 5: Documentation updated ✅

**All boxes checked** → 🎉 **Channel Manager is FULLY OPERATIONAL!**

---

## 🎊 DEPLOYMENT COMPLETED - October 8, 2025

**Deployment Results**:
- ✅ Database migration deployed successfully
- ✅ Function test: Returns `VAI_DIVING_TAHITI_001` for tour instances
- ✅ n8n workflow configured and tested
- ✅ GetYourGuide response: `"1 availabilities accepted for update."`
- ✅ Test tour: `3bdadc28-beb3-49a5-a0fb-59ef89dfee2a` (Dive with the Turtles)

**Deployed to**: Staging environment
**Next step**: Production migration (Supabase production database)
**Status**: Ready for production deployment

---

## 🚨 TROUBLESHOOTING

### Problem: Migration fails with "function already exists"

**Solution**: The function already exists but with the bug. Run this first:
```sql
DROP FUNCTION IF EXISTS get_gyg_product_id_for_tour(UUID);
```
Then run the migration again.

---

### Problem: n8n still shows 404 error

**Check**:
1. Is "Body Content Type" set to **"JSON"**?
2. Is **Expression mode ON** (see the `=` icon)?
3. Is the body exactly: `={ "tour_id": $json.tour_id }`
4. Did you **save** the node AND the workflow?

---

### Problem: GetYourGuide returns 400 error

**This is normal** if:
- Product ID not registered with GetYourGuide yet
- Sandbox mode requires pre-registration

**Check the product ID** is being sent correctly by looking at the "Format GYG Payload" node output.

---

## 📞 NEED HELP?

If something doesn't work:

1. **Check the exact error message** in n8n execution
2. **Copy the error** and share it
3. **Check Supabase logs**: https://supabase.com/dashboard/project/wewwhxhtpqjqhxfxbzyz/logs/postgres-logs
4. **Take a screenshot** of the failing n8n node

---

## 🎯 WHAT'S NEXT?

Once this is working:

1. **Product Catalog Sync**: Create workflow to register tours with GetYourGuide
2. **Production Deployment**: Switch from sandbox to production API
3. **Operator Onboarding**: Enable for all operators
4. **Monitoring Setup**: Track sync status and errors

---

*Prepared: October 7, 2025*
*Estimated time: 15-20 minutes*
*Difficulty: ⭐⭐ Easy (just follow steps)*
