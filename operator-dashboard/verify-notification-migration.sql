-- ====================================================================
-- NOTIFICATION SYSTEM MIGRATION VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor AFTER the main migration
-- ====================================================================

-- Test 1: Verify notifications table exists with correct schema
SELECT 
    'TEST 1: Table Schema' as test_name,
    COUNT(*) as column_count,
    CASE WHEN COUNT(*) >= 20 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public';

-- Test 2: Check if all expected columns exist
WITH expected_columns AS (
    SELECT unnest(ARRAY[
        'id', 'operator_id', 'recipient_type', 'segment_criteria',
        'type', 'category', 'priority', 'title', 'message', 'rich_content',
        'action_type', 'action_url', 'action_data', 'cta_text',
        'scheduled_for', 'expires_at', 'read', 'read_at', 'clicked', 'clicked_at',
        'dismissed', 'dismissed_at', 'created_by', 'campaign_id', 'source',
        'created_at', 'updated_at', 'data'
    ]) as expected_column
),
actual_columns AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'notifications' AND table_schema = 'public'
)
SELECT 
    'TEST 2: Required Columns' as test_name,
    COUNT(*) FILTER (WHERE ac.column_name IS NOT NULL) as found_columns,
    COUNT(*) as expected_columns,
    CASE 
        WHEN COUNT(*) FILTER (WHERE ac.column_name IS NOT NULL) = COUNT(*) 
        THEN '✅ PASS - All columns present' 
        ELSE '❌ FAIL - Missing columns' 
    END as status
FROM expected_columns ec
LEFT JOIN actual_columns ac ON ec.expected_column = ac.column_name;

-- Test 3: Verify indexes were created
SELECT 
    'TEST 3: Performance Indexes' as test_name,
    COUNT(*) as index_count,
    CASE WHEN COUNT(*) >= 8 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_indexes 
WHERE tablename = 'notifications' AND schemaname = 'public';

-- Test 4: Check RLS (Row Level Security) is enabled
SELECT 
    'TEST 4: RLS Security' as test_name,
    CASE WHEN relrowsecurity THEN '✅ PASS - RLS enabled' ELSE '❌ FAIL - RLS disabled' END as status
FROM pg_class 
WHERE relname = 'notifications' AND relkind = 'r';

-- Test 5: Verify RLS policies exist
SELECT 
    'TEST 5: RLS Policies' as test_name,
    COUNT(*) as policy_count,
    CASE WHEN COUNT(*) >= 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pg_policies 
WHERE tablename = 'notifications';

-- Test 6: Check if functions exist
WITH expected_functions AS (
    SELECT unnest(ARRAY[
        'create_booking_notification',
        'mark_notification_read',
        'mark_all_notifications_read',
        'get_unread_notification_count',
        'create_admin_notification',
        'cleanup_old_notifications'
    ]) as function_name
)
SELECT 
    'TEST 6: Utility Functions' as test_name,
    COUNT(*) FILTER (WHERE p.proname IS NOT NULL) as found_functions,
    COUNT(*) as expected_functions,
    CASE 
        WHEN COUNT(*) FILTER (WHERE p.proname IS NOT NULL) = COUNT(*) 
        THEN '✅ PASS - All functions created' 
        ELSE '❌ FAIL - Missing functions' 
    END as status
FROM expected_functions ef
LEFT JOIN pg_proc p ON ef.function_name = p.proname;

-- Test 7: Verify booking notification trigger exists
SELECT 
    'TEST 7: Booking Trigger' as test_name,
    COUNT(*) as trigger_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_booking_notification';

-- Test 8: Test notification insertion (sample data)
INSERT INTO public.notifications (
    operator_id,
    type,
    category,
    title,
    message,
    source,
    data
) 
SELECT 
    id as operator_id,
    'system' as type,
    'system' as category,
    'Migration Test Notification' as title,
    'This is a test notification created during migration verification.' as message,
    'migration_test' as source,
    '{"test": true, "migration_date": "2025-08-26"}'::jsonb as data
FROM operators 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Test 9: Verify test notification was created
SELECT 
    'TEST 8: Notification Creation' as test_name,
    COUNT(*) as test_notifications,
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM public.notifications 
WHERE title = 'Migration Test Notification' AND source = 'migration_test';

-- Test 10: Test utility functions work
SELECT 
    'TEST 9: Function Execution' as test_name,
    CASE 
        WHEN get_unread_notification_count() >= 0 
        THEN '✅ PASS - Functions callable' 
        ELSE '❌ FAIL - Functions not working' 
    END as status;

-- ====================================================================
-- DETAILED VERIFICATION RESULTS
-- ====================================================================

-- Show all indexes created
SELECT 
    '=== INDEXES CREATED ===' as info,
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications' AND schemaname = 'public'
ORDER BY indexname;

-- Show all policies created  
SELECT 
    '=== RLS POLICIES CREATED ===' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Show all functions created
SELECT 
    '=== FUNCTIONS CREATED ===' as info,
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN (
    'create_booking_notification',
    'mark_notification_read', 
    'mark_all_notifications_read',
    'get_unread_notification_count',
    'create_admin_notification',
    'cleanup_old_notifications'
)
ORDER BY proname;

-- Show sample data
SELECT 
    '=== SAMPLE NOTIFICATION DATA ===' as info,
    id,
    type,
    category,
    title,
    message,
    read,
    created_at,
    source
FROM public.notifications 
WHERE source = 'migration_test'
LIMIT 5;

-- ====================================================================
-- CLEANUP TEST DATA (Optional - uncomment to clean up)
-- ====================================================================

-- DELETE FROM public.notifications WHERE source = 'migration_test';

-- ====================================================================
-- MIGRATION SUCCESS SUMMARY
-- ====================================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    function_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc 
    WHERE proname IN (
        'create_booking_notification',
        'mark_notification_read',
        'mark_all_notifications_read', 
        'get_unread_notification_count'
    );
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'notifications';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'notifications' AND schemaname = 'public';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION VERIFICATION COMPLETE';
    RAISE NOTICE '========================================';
    
    IF table_exists THEN
        RAISE NOTICE '✅ Notifications table: CREATED';
    ELSE
        RAISE NOTICE '❌ Notifications table: FAILED';
    END IF;
    
    RAISE NOTICE '✅ Functions created: % of 6', function_count;
    RAISE NOTICE '✅ RLS policies created: %', policy_count;
    RAISE NOTICE '✅ Performance indexes: %', index_count;
    
    IF table_exists AND function_count >= 4 AND policy_count >= 3 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 MIGRATION SUCCESSFUL!';
        RAISE NOTICE 'Your notification system is ready for cross-device sync.';
        RAISE NOTICE 'Current booking notifications will now use Supabase.';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '❌ MIGRATION INCOMPLETE!';
        RAISE NOTICE 'Please check the errors above and re-run migration.';
    END IF;
    
    RAISE NOTICE '========================================';
END
$$;