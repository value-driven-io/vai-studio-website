-- 🔍 COMPREHENSIVE SUPABASE DATABASE HEALTH CHECK
-- Run this in Supabase SQL Editor for complete database overview
-- Timestamp: 2025-09-21 16:45:00 UTC

-- ================================
-- 1. DATABASE OVERVIEW
-- ================================
SELECT '=== DATABASE OVERVIEW ===' as section;

-- Database size and basic info
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;

-- ================================
-- 2. ALL TABLES AND VIEWS
-- ================================
SELECT '=== ALL TABLES AND VIEWS ===' as section;

SELECT
    schemaname,
    tablename as name,
    'table' as type,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
    schemaname,
    viewname as name,
    'view' as type,
    'N/A' as size
FROM pg_views
WHERE schemaname = 'public'
ORDER BY type, name;

-- ================================
-- 3. ALL FUNCTIONS (RPC ENDPOINTS)
-- ================================
SELECT '=== ALL FUNCTIONS (RPC ENDPOINTS) ===' as section;

SELECT
    proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    prosecdef as is_security_definer,
    provolatile as volatility,
    CASE
        WHEN proacl IS NULL THEN 'public'
        ELSE array_to_string(proacl, ', ')
    END as permissions
FROM pg_proc p
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- ================================
-- 4. CRITICAL BOOKING FUNCTION STATUS
-- ================================
SELECT '=== CRITICAL BOOKING FUNCTION STATUS ===' as section;

-- Check create_booking_atomic function specifically
SELECT
    proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    length(prosrc) as source_code_length,
    left(prosrc, 200) || '...' as source_preview
FROM pg_proc p
WHERE proname = 'create_booking_atomic';

-- ================================
-- 5. TOURS TABLE STATUS
-- ================================
SELECT '=== TOURS TABLE STATUS ===' as section;

-- Tours table row counts by status
SELECT
    status,
    is_template,
    activity_type,
    COUNT(*) as count
FROM tours
GROUP BY status, is_template, activity_type
ORDER BY status, is_template, activity_type;

-- Check specific tour from error
SELECT '=== SPECIFIC TOUR CHECK ===' as section;
SELECT
    'TOURS TABLE' as source,
    id, tour_name, status, available_spots, max_capacity, operator_id
FROM tours
WHERE id = '72baa47d-7d10-463d-bf0f-7e9d4e727034'
UNION ALL
SELECT
    'ACTIVE_TOURS_VIEW' as source,
    id, tour_name, status, effective_available_spots, effective_max_capacity, operator_id
FROM active_tours_with_operators
WHERE id = '72baa47d-7d10-463d-bf0f-7e9d4e727034';

-- ================================
-- 6. BOOKINGS TABLE STATUS
-- ================================
SELECT '=== BOOKINGS TABLE STATUS ===' as section;

-- Bookings counts by status
SELECT
    booking_status,
    payment_status,
    COUNT(*) as count,
    SUM(total_participants) as total_participants
FROM bookings
GROUP BY booking_status, payment_status
ORDER BY booking_status, payment_status;

-- Recent bookings for the specific tour
SELECT '=== RECENT BOOKINGS FOR SPECIFIC TOUR ===' as section;
SELECT
    id, booking_reference, booking_status, payment_status,
    num_adults, num_children, created_at
FROM bookings
WHERE tour_id = '72baa47d-7d10-463d-bf0f-7e9d4e727034'
ORDER BY created_at DESC
LIMIT 5;

-- ================================
-- 7. OPERATORS TABLE STATUS
-- ================================
SELECT '=== OPERATORS TABLE STATUS ===' as section;

-- Check specific operator
SELECT
    id, company_name, status, commission_rate
FROM operators
WHERE id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9';

-- ================================
-- 8. ACTIVE TRIGGERS
-- ================================
SELECT '=== ACTIVE TRIGGERS ===' as section;

SELECT
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    CASE t.tgenabled
        WHEN 'O' THEN 'enabled'
        WHEN 'D' THEN 'disabled'
        ELSE 'unknown'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname NOT LIKE 'RI_%'  -- Exclude foreign key triggers
ORDER BY c.relname, t.tgname;

-- ================================
-- 9. ROW LEVEL SECURITY STATUS
-- ================================
SELECT '=== ROW LEVEL SECURITY STATUS ===' as section;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================
-- 10. DATABASE CONNECTIONS
-- ================================
SELECT '=== ACTIVE CONNECTIONS ===' as section;

SELECT
    datname as database,
    usename as user,
    client_addr,
    state,
    COUNT(*) as connection_count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY datname, usename, client_addr, state
ORDER BY connection_count DESC;

-- ================================
-- 11. RECENT ERRORS/ACTIVITY
-- ================================
SELECT '=== RECENT DATABASE ACTIVITY ===' as section;

-- Check for any constraint violations or errors in recent activity
SELECT
    schemaname,
    relname as table_name,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates
FROM pg_stat_user_tables
WHERE n_tup_ins > 0 OR n_tup_upd > 0 OR n_tup_del > 0
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;

-- ================================
-- INVESTIGATION SUMMARY
-- ================================
SELECT '=== HEALTH CHECK COMPLETE ===' as section;
SELECT
    'Run completed at: ' || NOW() as timestamp,
    'Check all sections above for issues' as note;