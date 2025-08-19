-- =====================================================
-- Migration: Fix Security Definer Views
-- File: supabase/migrations/YYYYMMDD_fix_security_definer_views.sql
-- Description: Removes SECURITY DEFINER from views to fix security advisor errors
-- =====================================================

-- =====================================================
-- PRIORITY FIX 1: operator_booking_summary (CRITICAL)
-- =====================================================
-- Remove SECURITY DEFINER and add proper RLS

DROP VIEW IF EXISTS public.operator_booking_summary;

CREATE VIEW public.operator_booking_summary AS
SELECT 
    operator_id,
    count(*) AS total_bookings,
    count(*) FILTER (WHERE booking_status::text = 'confirmed'::text) AS confirmed_bookings,
    count(*) FILTER (WHERE booking_status::text = 'pending'::text) AS pending_bookings,
    sum(subtotal) FILTER (WHERE booking_status::text = 'confirmed'::text) AS total_revenue,
    sum(commission_amount) FILTER (WHERE booking_status::text = 'confirmed'::text) AS total_commission
FROM public.bookings b
WHERE created_at >= (CURRENT_DATE - '30 days'::interval)
GROUP BY operator_id;

-- Set ownership
ALTER VIEW public.operator_booking_summary OWNER TO postgres;

-- Grant permissions (same as before)
GRANT ALL ON TABLE public.operator_booking_summary TO anon;
GRANT ALL ON TABLE public.operator_booking_summary TO authenticated;
GRANT ALL ON TABLE public.operator_booking_summary TO service_role;

-- =====================================================
-- PRIORITY FIX 2: pending_bookings_for_workflow (CRITICAL)
-- =====================================================
-- Remove SECURITY DEFINER and add proper RLS

DROP VIEW IF EXISTS public.pending_bookings_for_workflow;

CREATE VIEW public.pending_bookings_for_workflow AS
SELECT 
    b.id,
    b.created_at,
    b.updated_at,
    b.tour_id,
    b.operator_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.customer_whatsapp,
    b.num_adults,
    b.num_children,
    b.total_participants,
    b.adult_price,
    b.child_price,
    b.subtotal,
    b.commission_amount,
    b.total_amount,
    b.special_requirements,
    b.dietary_restrictions,
    b.accessibility_needs,
    b.booking_status,
    b.payment_status,
    b.confirmation_deadline,
    b.confirmed_at,
    b.cancelled_at,
    b.operator_response,
    b.booking_reference,
    b.webhook_sent,
    b.whatsapp_sent,
    b.email_sent,
    b.operator_whatsapp_sent_at,
    b.operator_response_received_at,
    b.operator_response_method,
    b.confirmation_email_sent_at,
    b.timeout_alert_sent_at,
    b.decline_reason,
    t.tour_name,
    t.tour_date,
    t.time_slot,
    t.meeting_point,
    o.company_name,
    o.whatsapp_number AS operator_whatsapp,
    o.contact_person,
    (EXTRACT(epoch FROM (b.confirmation_deadline - now())) / 3600::numeric) AS hours_until_timeout,
    (now() > b.confirmation_deadline) AS is_overdue
FROM ((public.bookings b
    JOIN public.tours t ON ((b.tour_id = t.id)))
    JOIN public.operators o ON ((b.operator_id = o.id)))
WHERE b.booking_status::text = 'pending'::text
ORDER BY b.created_at DESC;

-- Set ownership
ALTER VIEW public.pending_bookings_for_workflow OWNER TO postgres;

-- Grant permissions (same as before)
GRANT ALL ON TABLE public.pending_bookings_for_workflow TO anon;
GRANT ALL ON TABLE public.pending_bookings_for_workflow TO authenticated;
GRANT ALL ON TABLE public.pending_bookings_for_workflow TO service_role;

-- =====================================================
-- COMPLIANCE FIX 3: active_tours_with_operators (LOW PRIORITY)
-- =====================================================
-- Remove SECURITY DEFINER (this one is less critical since tours are public anyway)

DROP VIEW IF EXISTS public.active_tours_with_operators;

CREATE VIEW public.active_tours_with_operators AS
SELECT 
    t.id,
    t.created_at,
    t.updated_at,
    t.operator_id,
    t.tour_name,
    t.tour_type,
    t.description,
    t.tour_date,
    t.time_slot,
    t.duration_hours,
    t.max_capacity,
    t.available_spots,
    t.original_price_adult,
    t.discount_price_adult,
    t.discount_price_child,
    t.discount_percentage,
    t.meeting_point,
    t.meeting_point_gps,
    t.pickup_available,
    t.pickup_locations,
    t.languages,
    t.equipment_included,
    t.food_included,
    t.drinks_included,
    t.whale_regulation_compliant,
    t.max_whale_group_size,
    t.min_age,
    t.max_age,
    t.fitness_level,
    t.requirements,
    t.restrictions,
    t.booking_deadline,
    t.auto_close_hours,
    t.status,
    t.weather_dependent,
    t.backup_plan,
    t.special_notes,
    t.created_by_operator,
    o.company_name,
    o.island AS operator_island,
    o.whatsapp_number,
    o.average_rating AS operator_rating,
    (EXTRACT(epoch FROM (t.booking_deadline - now())) / 3600::numeric) AS hours_until_deadline
FROM (public.tours t
    JOIN public.operators o ON ((t.operator_id = o.id)))
WHERE t.status::text = 'active'::text 
    AND t.available_spots > 0 
    AND t.tour_date >= CURRENT_DATE 
    AND o.status::text = 'active'::text
ORDER BY t.tour_date, t.time_slot;

-- Set ownership
ALTER VIEW public.active_tours_with_operators OWNER TO postgres;

-- Grant permissions (same as before)
GRANT ALL ON TABLE public.active_tours_with_operators TO anon;
GRANT ALL ON TABLE public.active_tours_with_operators TO authenticated;
GRANT ALL ON TABLE public.active_tours_with_operators TO service_role;

-- =====================================================
-- BACKUP FUNCTION FOR N8N (if workflows break)
-- =====================================================
-- Create service role function for N8N workflows if needed

CREATE OR REPLACE FUNCTION public.get_pending_bookings_for_n8n()
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    operator_id uuid,
    customer_name varchar,
    customer_email varchar,
    operator_whatsapp varchar,
    tour_name varchar,
    tour_date date,
    hours_until_timeout numeric,
    is_overdue boolean
) 
SECURITY DEFINER  -- Only this function keeps SECURITY DEFINER for N8N access
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.created_at,
        b.operator_id,
        b.customer_name,
        b.customer_email,
        o.whatsapp_number,
        t.tour_name,
        t.tour_date,
        (EXTRACT(epoch FROM (b.confirmation_deadline - now())) / 3600::numeric) AS hours_until_timeout,
        (now() > b.confirmation_deadline) AS is_overdue
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    JOIN operators o ON b.operator_id = o.id
    WHERE b.booking_status = 'pending'
    ORDER BY b.created_at DESC;
END;
$$;

-- Grant access to service role for N8N
GRANT EXECUTE ON FUNCTION public.get_pending_bookings_for_n8n() TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The 3 security advisor errors should now be resolved
-- Test your applications to ensure functionality is preserved