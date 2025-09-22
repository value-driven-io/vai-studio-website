-- ================================
## -- 1. DATABASE OVERVIEW
-- ================================
SELECT '=== DATABASE OVERVIEW ===' as section;

-- Database size and basic info
SELECT
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;
    
>>>>

| database_name | current_user | postgres_version                                                                   |
| ------------- | ------------ | ---------------------------------------------------------------------------------- |
| postgres      | postgres     | PostgreSQL 17.4 on aarch64-unknown-linux-gnu, compiled by gcc (GCC) 13.2.0, 64-bit |


//////


-- ================================
## -- 2. ALL TABLES AND VIEWS
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

>>>>>

[
  {
    "schemaname": "public",
    "name": "audit_logs",
    "type": "table",
    "size": "32 kB"
  },
  {
    "schemaname": "public",
    "name": "booking_conversations",
    "type": "table",
    "size": "64 kB"
  },
  {
    "schemaname": "public",
    "name": "bookings",
    "type": "table",
    "size": "272 kB"
  },
  {
    "schemaname": "public",
    "name": "notifications",
    "type": "table",
    "size": "224 kB"
  },
  {
    "schemaname": "public",
    "name": "operators",
    "type": "table",
    "size": "232 kB"
  },
  {
    "schemaname": "public",
    "name": "qr_scans",
    "type": "table",
    "size": "48 kB"
  },
  {
    "schemaname": "public",
    "name": "reviews",
    "type": "table",
    "size": "16 kB"
  },
  {
    "schemaname": "public",
    "name": "schedules",
    "type": "table",
    "size": "128 kB"
  },
  {
    "schemaname": "public",
    "name": "tourist_users",
    "type": "table",
    "size": "96 kB"
  },
  {
    "schemaname": "public",
    "name": "tours",
    "type": "table",
    "size": "480 kB"
  },
  {
    "schemaname": "public",
    "name": "vai_studio_clients",
    "type": "table",
    "size": "272 kB"
  },
  {
    "schemaname": "public",
    "name": "waitlist",
    "type": "table",
    "size": "48 kB"
  },
  {
    "schemaname": "public",
    "name": "active_tours_with_operators",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "activity_templates_view",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "last_minute_activities_view",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "notification_analytics",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "operator_booking_summary",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "operator_schedule_summary",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "pending_bookings_for_workflow",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "schedule_availability",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "schedule_details",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "scheduled_activities_view",
    "type": "view",
    "size": "N/A"
  },
  {
    "schemaname": "public",
    "name": "tour_management_dashboard",
    "type": "view",
    "size": "N/A"
  }
]

-- ================================
## -- 3. ALL FUNCTIONS (RPC ENDPOINTS)
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


>>>>

[
  {
    "function_name": "apply_tour_customization",
    "arguments": "tour_id_param uuid, customizations jsonb, frozen_fields_param text[] DEFAULT NULL::text[]",
    "return_type": "TABLE(success boolean, tour_data jsonb, message text)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "auto_populate_schedule_relationship",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "auto_set_customization_timestamp",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "bulk_pause_schedules",
    "arguments": "schedule_ids uuid[], user_id uuid DEFAULT auth.uid()",
    "return_type": "TABLE(schedule_id uuid, success boolean, error_message text)",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "bulk_resume_schedules",
    "arguments": "schedule_ids uuid[], user_id uuid DEFAULT auth.uid()",
    "return_type": "TABLE(schedule_id uuid, success boolean, error_message text)",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "bulk_update_scheduled_tours",
    "arguments": "schedule_id_param uuid, updates jsonb, respect_customizations boolean DEFAULT true",
    "return_type": "TABLE(tours_updated integer, tours_skipped integer, message text)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "cleanup_old_notifications",
    "arguments": "retention_days integer DEFAULT 90, max_per_operator integer DEFAULT 100",
    "return_type": "integer",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "create_admin_notification",
    "arguments": "p_recipient_type character varying DEFAULT 'all'::character varying, p_segment_criteria jsonb DEFAULT NULL::jsonb, p_type character varying DEFAULT 'system'::character varying, p_category character varying DEFAULT 'system'::character varying, p_title text DEFAULT ''::text, p_message text DEFAULT ''::text, p_rich_content jsonb DEFAULT NULL::jsonb, p_action_type character varying DEFAULT 'dismiss_only'::character varying, p_action_url text DEFAULT NULL::text, p_cta_text character varying DEFAULT NULL::character varying, p_campaign_id character varying DEFAULT NULL::character varying, p_priority integer DEFAULT 0, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone",
    "return_type": "uuid",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "create_booking_atomic",
    "arguments": "booking_data jsonb, tour_id uuid",
    "return_type": "jsonb",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "create_booking_notification",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "create_multilingual_admin_notification",
    "arguments": "p_recipient_type character varying DEFAULT 'all'::character varying, p_title_i18n jsonb DEFAULT '{}'::jsonb, p_message_i18n jsonb DEFAULT '{}'::jsonb, p_type character varying DEFAULT 'system'::character varying, p_category character varying DEFAULT 'system'::character varying, p_priority integer DEFAULT 0",
    "return_type": "uuid",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "detach_tour_from_schedule",
    "arguments": "tour_id_param uuid, detach_reason text DEFAULT 'Manual detachment'::text",
    "return_type": "TABLE(success boolean, message text, tour_id uuid)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "generate_scheduled_activities_from_template",
    "arguments": "template_id_param uuid, schedule_data_param jsonb",
    "return_type": "TABLE(activity_id uuid, activity_date date, activity_time time without time zone)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_localized_notification_content",
    "arguments": "notification_row notifications, user_language text DEFAULT 'en'::text",
    "return_type": "TABLE(localized_title text, localized_message text)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_pending_bookings_for_n8n",
    "arguments": "",
    "return_type": "TABLE(id uuid, created_at timestamp with time zone, operator_id uuid, customer_name character varying, customer_email character varying, operator_whatsapp character varying, tour_name character varying, tour_date date, hours_until_timeout numeric, is_overdue boolean)",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_schedule_date_conflicts",
    "arguments": "schedule_id_param uuid, new_dates date[]",
    "return_type": "TABLE(conflicted_date date, detached_tour_count integer)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_schedule_dependencies",
    "arguments": "schedule_id_param uuid",
    "return_type": "TABLE(dependency_type text, dependency_count integer, dependency_details jsonb)",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_schedule_relationships",
    "arguments": "schedule_id_param uuid",
    "return_type": "TABLE(schedule_type text, template_id uuid, template_data jsonb, legacy_tour_id uuid, legacy_tour_data jsonb)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_template_discovery",
    "arguments": "filter_island text DEFAULT NULL::text, filter_tour_type text DEFAULT NULL::text, filter_min_price integer DEFAULT NULL::integer, filter_max_price integer DEFAULT NULL::integer, limit_results integer DEFAULT 50",
    "return_type": "TABLE(template_id uuid, template_name character varying, template_type character varying, template_description text, operator_id uuid, company_name character varying, operator_island character varying, operator_bio text, average_rating numeric, total_tours_completed integer, price_from integer, min_promo_price integer, has_promotional_pricing boolean, next_available_date date, next_available_time character varying, schedule_count integer, total_available_spots integer, recurrence_patterns text[], languages character varying[], duration_hours numeric, equipment_included boolean, food_included boolean, drinks_included boolean, whale_regulation_compliant boolean, fitness_level character varying, pickup_available boolean, weather_dependent boolean)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_template_schedule_overview",
    "arguments": "template_id uuid, start_date date, end_date date",
    "return_type": "TABLE(tour_id uuid, tour_date date, time_slot character varying, duration_hours numeric, available_spots integer, max_capacity integer, effective_price_adult integer, final_price_adult integer, has_promotional_pricing boolean, promotional_discount_amount integer, meeting_point character varying, is_customized boolean, instance_note text, booking_deadline timestamp with time zone, weather_dependent boolean, current_bookings integer, popularity_status character varying)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_template_statistics",
    "arguments": "filter_template_id uuid DEFAULT NULL::uuid",
    "return_type": "TABLE(template_id uuid, template_name character varying, total_instances integer, active_instances integer, total_bookings integer, total_revenue bigint, average_rating numeric, most_popular_time character varying, next_available_date date, availability_percentage numeric)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "get_unread_notification_count",
    "arguments": "",
    "return_type": "integer",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "handle_new_user",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "handle_vai_studio_clients_updated_at",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "is_schedule_available",
    "arguments": "schedule_record schedules, check_date date DEFAULT CURRENT_DATE",
    "return_type": "boolean",
    "is_security_definer": false,
    "volatility": "s",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "link_existing_bookings_to_user",
    "arguments": "user_email text, user_uuid uuid",
    "return_type": "integer",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "mark_all_notifications_read",
    "arguments": "",
    "return_type": "integer",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "mark_notification_clicked",
    "arguments": "notification_id uuid",
    "return_type": "boolean",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "mark_notification_read",
    "arguments": "notification_id uuid",
    "return_type": "boolean",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "pause_schedule",
    "arguments": "schedule_id uuid, user_id uuid DEFAULT auth.uid()",
    "return_type": "boolean",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "restore_tour_availability",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "resume_schedule",
    "arguments": "schedule_id uuid, user_id uuid DEFAULT auth.uid()",
    "return_type": "boolean",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "safe_schedule_tour_update",
    "arguments": "schedule_id_param uuid, operator_id_param uuid, template_data jsonb, schedule_data jsonb",
    "return_type": "TABLE(success boolean, message text, tours_created integer)",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "test_rpc_connection",
    "arguments": "",
    "return_type": "TABLE(message text, test_timestamp timestamp without time zone)",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "trigger_booking_webhook",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": true,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "update_notification_updated_at",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "update_operators_updated_at",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "update_tour_instance_spots",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "update_tour_spots",
    "arguments": "tour_id uuid, spots_change integer",
    "return_type": "json",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "update_updated_at_column",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  },
  {
    "function_name": "validate_schedule_consistency",
    "arguments": "",
    "return_type": "trigger",
    "is_security_definer": false,
    "volatility": "v",
    "permissions": "=X/postgres, postgres=X/postgres, anon=X/postgres, authenticated=X/postgres, service_role=X/postgres"
  }
]


////

-- ================================
## -- 4. CRITICAL BOOKING FUNCTION STATUS
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


>>>>


[
  {
    "function_name": "create_booking_atomic",
    "arguments": "booking_data jsonb, tour_id uuid",
    "return_type": "jsonb",
    "source_code_length": 3579,
    "source_preview": "\nDECLARE\n    tour_record RECORD;\n    booking_id UUID;\n    participants INTEGER;\n    result JSONB;\nBEGIN\n    -- Extract participant count\n    participants := (booking_data->>'num_adults')::INTEGER +\n  ..."
  }
]

/////

-- ================================
## -- 5. TOURS TABLE STATUS
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


>>>

[
  {
    "source": "TOURS TABLE",
    "id": "72baa47d-7d10-463d-bf0f-7e9d4e727034",
    "tour_name": "Traditional Cooking Workshop",
    "status": "active",
    "available_spots": 6,
    "max_capacity": 8,
    "operator_id": "c78f7f64-cab8-4f48-9427-de87e12ec2b9"
  },
  {
    "source": "ACTIVE_TOURS_VIEW",
    "id": "72baa47d-7d10-463d-bf0f-7e9d4e727034",
    "tour_name": "Traditional Cooking Workshop",
    "status": "active",
    "available_spots": 6,
    "max_capacity": 8,
    "operator_id": "c78f7f64-cab8-4f48-9427-de87e12ec2b9"
  }
]


////

-- ================================
## -- 6. BOOKINGS TABLE STATUS
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

>>>

| section                                   |
| ----------------------------------------- |
| === RECENT BOOKINGS FOR SPECIFIC TOUR === |


////

-- ================================
## -- 7. OPERATORS TABLE STATUS
-- ================================
SELECT '=== OPERATORS TABLE STATUS ===' as section;

-- Check specific operator
SELECT
    id, company_name, status, commission_rate
FROM operators
WHERE id = 'c78f7f64-cab8-4f48-9427-de87e12ec2b9';

>>>

[
  {
    "id": "c78f7f64-cab8-4f48-9427-de87e12ec2b9",
    "company_name": "Moorea Adventures",
    "status": "active",
    "commission_rate": "11.00"
  }
]

////

-- ================================
## -- 8. ACTIVE TRIGGERS
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

>>>

| trigger_name                                | table_name         | function_name                        | status  |
| ------------------------------------------- | ------------------ | ------------------------------------ | ------- |
| booking_webhook_trigger                     | bookings           | trigger_booking_webhook              | enabled |
| restore_availability_trigger                | bookings           | restore_tour_availability            | enabled |
| trigger_create_booking_notification         | bookings           | create_booking_notification          | enabled |
| update_bookings_updated_at                  | bookings           | update_updated_at_column             | enabled |
| enforce_bucket_name_length_trigger          | buckets            | enforce_bucket_name_length           | enabled |
| trigger_update_notification_updated_at      | notifications      | update_notification_updated_at       | enabled |
| objects_delete_delete_prefix                | objects            | delete_prefix_hierarchy_trigger      | enabled |
| objects_insert_create_prefix                | objects            | objects_insert_prefix_trigger        | enabled |
| objects_update_create_prefix                | objects            | objects_update_prefix_trigger        | enabled |
| update_objects_updated_at                   | objects            | update_updated_at_column             | enabled |
| update_operators_updated_at                 | operators          | update_operators_updated_at          | enabled |
| prefixes_create_hierarchy                   | prefixes           | prefixes_insert_trigger              | enabled |
| prefixes_delete_hierarchy                   | prefixes           | delete_prefix_hierarchy_trigger      | enabled |
| validate_schedule_consistency_trigger       | schedules          | validate_schedule_consistency        | enabled |
| tr_check_filters                            | subscription       | subscription_check_filters           | enabled |
| update_tourist_users_updated_at             | tourist_users      | update_updated_at_column             | enabled |
| auto_populate_schedule_relationship_trigger | tours              | auto_populate_schedule_relationship  | enabled |
| auto_set_customization_timestamp_trigger    | tours              | auto_set_customization_timestamp     | enabled |
| update_tours_updated_at                     | tours              | update_updated_at_column             | enabled |
| vai_studio_clients_updated_at               | vai_studio_clients | handle_vai_studio_clients_updated_at | enabled |



/////

-- ================================
## -- 9. ROW LEVEL SECURITY STATUS
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


>>>

[
  {
    "schemaname": "public",
    "tablename": "audit_logs",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "booking_conversations",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "bookings",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "notifications",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "operators",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "qr_scans",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "reviews",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "schedules",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "tourist_users",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "tours",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "vai_studio_clients",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  },
  {
    "schemaname": "public",
    "tablename": "waitlist",
    "rls_enabled": true,
    "rls_status": "ENABLED"
  }
]

/////

[
  {
    "database": "postgres",
    "user": "authenticator",
    "client_addr": "::1",
    "state": "idle",
    "connection_count": 4
  },
  {
    "database": "postgres",
    "user": "supabase_admin",
    "client_addr": "::1",
    "state": "idle",
    "connection_count": 2
  },
  {
    "database": "postgres",
    "user": "supabase_admin",
    "client_addr": null,
    "state": null,
    "connection_count": 2
  },
  {
    "database": "postgres",
    "user": "postgres",
    "client_addr": "2600:1f1c:778:2c00:3820:1d4e:6ac:46bc",
    "state": "active",
    "connection_count": 1
  }
]

-- ================================
## -- 10. DATABASE CONNECTIONS
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


>>>

[
  {
    "database": "postgres",
    "user": "authenticator",
    "client_addr": "::1",
    "state": "idle",
    "connection_count": 4
  },
  {
    "database": "postgres",
    "user": "supabase_admin",
    "client_addr": "::1",
    "state": "idle",
    "connection_count": 2
  },
  {
    "database": "postgres",
    "user": "supabase_admin",
    "client_addr": null,
    "state": null,
    "connection_count": 2
  },
  {
    "database": "postgres",
    "user": "postgres",
    "client_addr": "2600:1f1c:778:2c00:3820:1d4e:6ac:46bc",
    "state": "active",
    "connection_count": 1
  }
]


////



-- ================================
## -- 11. RECENT ERRORS/ACTIVITY
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

>>>>

[
  {
    "schemaname": "auth",
    "table_name": "refresh_tokens",
    "inserts": 1348,
    "updates": 1019,
    "deletes": 1058,
    "hot_updates": 0
  },
  {
    "schemaname": "auth",
    "table_name": "audit_log_entries",
    "inserts": 2668,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "auth",
    "table_name": "users",
    "inserts": 80,
    "updates": 1765,
    "deletes": 77,
    "hot_updates": 1732
  },
  {
    "schemaname": "auth",
    "table_name": "sessions",
    "inserts": 329,
    "updates": 1062,
    "deletes": 380,
    "hot_updates": 1061
  },
  {
    "schemaname": "public",
    "table_name": "tours",
    "inserts": 239,
    "updates": 410,
    "deletes": 287,
    "hot_updates": 124
  },
  {
    "schemaname": "public",
    "table_name": "operators",
    "inserts": 28,
    "updates": 722,
    "deletes": 19,
    "hot_updates": 679
  },
  {
    "schemaname": "auth",
    "table_name": "mfa_amr_claims",
    "inserts": 329,
    "updates": 0,
    "deletes": 297,
    "hot_updates": 0
  },
  {
    "schemaname": "public",
    "table_name": "bookings",
    "inserts": 46,
    "updates": 126,
    "deletes": 35,
    "hot_updates": 32
  },
  {
    "schemaname": "public",
    "table_name": "tourist_users",
    "inserts": 83,
    "updates": 22,
    "deletes": 89,
    "hot_updates": 22
  },
  {
    "schemaname": "auth",
    "table_name": "identities",
    "inserts": 80,
    "updates": 4,
    "deletes": 77,
    "hot_updates": 4
  },
  {
    "schemaname": "public",
    "table_name": "schedules",
    "inserts": 54,
    "updates": 40,
    "deletes": 51,
    "hot_updates": 32
  },
  {
    "schemaname": "net",
    "table_name": "http_request_queue",
    "inserts": 95,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "supabase_migrations",
    "table_name": "schema_migrations",
    "inserts": 41,
    "updates": 0,
    "deletes": 31,
    "hot_updates": 0
  },
  {
    "schemaname": "realtime",
    "table_name": "schema_migrations",
    "inserts": 63,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "public",
    "table_name": "vai_studio_clients",
    "inserts": 2,
    "updates": 58,
    "deletes": 1,
    "hot_updates": 53
  },
  {
    "schemaname": "auth",
    "table_name": "schema_migrations",
    "inserts": 56,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "public",
    "table_name": "notifications",
    "inserts": 19,
    "updates": 17,
    "deletes": 5,
    "hot_updates": 8
  },
  {
    "schemaname": "storage",
    "table_name": "migrations",
    "inserts": 39,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "auth",
    "table_name": "one_time_tokens",
    "inserts": 18,
    "updates": 0,
    "deletes": 18,
    "hot_updates": 0
  },
  {
    "schemaname": "public",
    "table_name": "booking_conversations",
    "inserts": 11,
    "updates": 10,
    "deletes": 11,
    "hot_updates": 3
  },
  {
    "schemaname": "public",
    "table_name": "audit_logs",
    "inserts": 4,
    "updates": 0,
    "deletes": 0,
    "hot_updates": 0
  },
  {
    "schemaname": "public",
    "table_name": "waitlist",
    "inserts": 2,
    "updates": 0,
    "deletes": 2,
    "hot_updates": 0
  }
]