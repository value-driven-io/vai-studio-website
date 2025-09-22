# 🚀 PRODUCTION DEPLOYMENT COMMANDS

## ⚠️ CRITICAL: Execute these SQL commands on production to fix booking system

### 📋 DEPLOYMENT ORDER (Execute in this exact sequence)

**1. First Deploy: Schema Fix**
```bash
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250921000001_fix_booking_atomic_schema.sql
```

**2. Second Deploy: Security Fix**
```bash
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250921000002_fix_booking_rls_security.sql
```

**3. Third Deploy: Audit Logs Fix (CRITICAL FOR OPERATOR DASHBOARD)**
```bash
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250922000001_fix_audit_logs_rls_policies.sql
```

### 🔍 VERIFICATION COMMANDS

**After deployment, run these SQL queries directly in your database console:**

```sql
-- 1. Verify function exists and has correct signature
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_name = 'create_booking_atomic';
```

```sql
-- 2. Verify function security mode (should show 'true' for is_security_definer)
SELECT p.proname as function_name, p.prosecdef as is_security_definer
FROM pg_proc p
WHERE p.proname = 'create_booking_atomic';
```

```sql
-- 3. Verify RLS policies are active (should show multiple policies)
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('tours', 'bookings', 'tourist_users')
ORDER BY tablename, policyname;
```

```sql
-- 4. Quick function test (should return success: true)
SELECT create_booking_atomic(
  '{"customer_name": "Test User", "customer_email": "test@example.com", "num_adults": 1, "num_children": 0, "adult_price": 1000, "subtotal": 890, "commission_amount": 110, "booking_reference": "TEST-VERIFY"}'::jsonb,
  (SELECT id FROM tours WHERE status = 'active' LIMIT 1)
) as test_result;
```

```sql
-- 5. Verify audit_logs policies are active (should show 4 policies)
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'audit_logs'
ORDER BY policyname;
```

**Expected Results:**
- Query 1: Should return `create_booking_atomic` function
- Query 2: Should show `is_security_definer = true`
- Query 3: Should show multiple RLS policies for tours, bookings tables
- Query 4: Should return `{"success": true, ...}` or specific error if no active tours
- Query 5: Should show 3 audit_logs policies (authenticated_users_can_insert, users_can_read_own, admin_full_access)

### 🧪 FUNCTIONAL TESTING

**Run automated test suite to verify booking system works:**
```bash
# Test booking functionality end-to-end
node automated_booking_test.js
```

**Expected result:**
```
🎉 ALL TESTS PASSED! Booking system is working correctly.
```

### 📊 WHAT THESE FIXES DO

**emergency_schema_fix.sql:**
- Fixes `create_booking_atomic` function to use correct `tours` table schema
- Eliminates "Tour not found" errors
- Maintains atomic booking behavior with proper locking

**rls_security_fix.sql:**
- Makes function `SECURITY DEFINER` to bypass RLS restrictions
- Adds granular RLS policies for proper data access control
- Maintains security while allowing function to work

### 🔧 ROLLBACK PROCEDURE (If needed)

**If deployment fails, immediately run:**
```bash
psql $PRODUCTION_DATABASE_URL -f emergency_rollback.sql
```

### ✅ SUCCESS INDICATORS

After deployment, you should see:
- ✅ Booking flow completes without "Tour not found" errors
- ✅ Stripe payments process successfully
- ✅ Tourist user creation works (no 406 errors)
- ✅ Atomic booking behavior prevents overselling
- ✅ Performance under 500ms for booking creation

### 🚨 CRITICAL NOTES

1. **Deploy during low traffic window** - These are database schema changes
2. **Test on staging first** - Verify both SQL files work in staging environment
3. **Monitor immediately** - Watch for any booking errors post-deployment
4. **Have rollback ready** - emergency_rollback.sql is prepared if needed

---

**Deployment Status: ⏳ READY FOR PRODUCTION**