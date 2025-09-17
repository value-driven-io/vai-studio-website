-- =====================================================
-- MIGRATION: Enhanced Tours View for Template System
-- File: 20250915000001_enhance_tours_view_for_template_system.sql
-- Purpose: Update active_tours_with_operators view to support new template/schedule/instance model
-- Date: September 15, 2025
-- =====================================================

-- DROP existing view to recreate with enhancements
DROP VIEW IF EXISTS active_tours_with_operators;

-- CREATE enhanced view with template/schedule awareness and override support
CREATE VIEW active_tours_with_operators AS
SELECT
  -- Core tour fields
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
  t.location,
  t.activity_type,
  t.is_template,
  t.parent_template_id,
  t.parent_schedule_id,
  t.is_customized,
  t.frozen_fields,
  t.overrides,
  t.is_detached,
  t.promo_discount_percent,
  t.promo_discount_value,
  t.instance_note,
  t.customization_timestamp,
  t.max_age_child,
  t.discount_percentage_child,
  t.detached_from_schedule_id,

  -- ENHANCED: Override-aware pricing (show instance override or template/tour default)
  COALESCE(
    (t.overrides->>'discount_price_adult')::integer,
    t.discount_price_adult
  ) as effective_discount_price_adult,

  COALESCE(
    (t.overrides->>'discount_price_child')::integer,
    t.discount_price_child
  ) as effective_discount_price_child,

  -- ENHANCED: Override-aware capacity
  COALESCE(
    (t.overrides->>'max_capacity')::integer,
    t.max_capacity
  ) as effective_max_capacity,

  COALESCE(
    (t.overrides->>'available_spots')::integer,
    t.available_spots
  ) as effective_available_spots,

  -- ENHANCED: Override-aware meeting point
  COALESCE(
    t.overrides->>'meeting_point',
    t.meeting_point
  ) as effective_meeting_point,

  -- ENHANCED: Promotional pricing indicators
  CASE
    WHEN t.promo_discount_percent IS NOT NULL OR t.promo_discount_value IS NOT NULL
    THEN true
    ELSE false
  END as has_promotional_pricing,

  -- ENHANCED: Calculate effective promotional discount
  CASE
    WHEN t.promo_discount_percent IS NOT NULL
    THEN ROUND((t.discount_price_adult * t.promo_discount_percent / 100.0))
    WHEN t.promo_discount_value IS NOT NULL
    THEN t.promo_discount_value
    ELSE 0
  END as promotional_discount_amount,

  -- ENHANCED: Final price after promotional discount
  CASE
    WHEN t.promo_discount_percent IS NOT NULL
    THEN t.discount_price_adult - ROUND((t.discount_price_adult * t.promo_discount_percent / 100.0))
    WHEN t.promo_discount_value IS NOT NULL
    THEN GREATEST(0, t.discount_price_adult - t.promo_discount_value)
    ELSE COALESCE((t.overrides->>'discount_price_adult')::integer, t.discount_price_adult)
  END as final_price_adult,

  -- ENHANCED: Template information (for "similar tours" and grouping)
  template.tour_name as template_name,
  template.tour_type as template_type,
  template.description as template_description,
  template.id as template_id,

  -- ENHANCED: Schedule information (for recurring tour context)
  s.recurrence_type,
  s.days_of_week as schedule_days,
  s.start_time as schedule_start_time,
  s.start_date as schedule_start_date,
  s.end_date as schedule_end_date,
  s.is_paused as schedule_paused,
  s.schedule_type,

  -- EXISTING: Operator information (preserved for compatibility)
  o.company_name,
  o.contact_person,
  o.email as operator_email,
  o.phone as operator_phone,
  o.whatsapp_number as operator_whatsapp_number,
  o.island as operator_island,
  o.address as operator_address,
  o.business_license,
  o.insurance_certificate,
  o.whale_tour_certified,
  o.status as operator_status,
  o.commission_rate,
  o.average_rating as operator_average_rating,
  o.total_tours_completed as operator_total_tours_completed,
  o.business_description as operator_bio,
  o.preferred_language as operator_language

FROM tours t
  -- LEFT JOIN to template (for instances that have parent templates)
  LEFT JOIN tours template ON t.parent_template_id = template.id AND template.is_template = true

  -- LEFT JOIN to schedules (for instances that belong to schedules)
  LEFT JOIN schedules s ON t.parent_schedule_id = s.id

  -- LEFT JOIN to operators (all tours have operators)
  LEFT JOIN operators o ON t.operator_id = o.id

WHERE
  -- Only show tour instances (not templates)
  t.is_template = false

  -- Only show active tours
  AND t.status IN ('active', 'sold_out')  -- Include sold_out for display but filtering will handle availability

  -- Exclude tours from paused schedules (unless they're detached)
  AND (s.is_paused = false OR s.is_paused IS NULL OR t.is_detached = true)

  -- Only show tours from active operators
  AND o.status = 'active'

ORDER BY t.tour_date ASC, t.time_slot ASC;

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

-- Optimize queries on the new effective pricing fields
CREATE INDEX IF NOT EXISTS idx_tours_effective_pricing
ON tours USING btree (
  COALESCE((overrides->>'discount_price_adult')::integer, discount_price_adult)
)
WHERE is_template = false AND status = 'active';

-- Optimize promotional pricing queries
CREATE INDEX IF NOT EXISTS idx_tours_promotional_pricing
ON tours USING btree (promo_discount_percent, promo_discount_value)
WHERE is_template = false
  AND status = 'active'
  AND (promo_discount_percent IS NOT NULL OR promo_discount_value IS NOT NULL);

-- Optimize template relationship queries
CREATE INDEX IF NOT EXISTS idx_tours_template_relationship
ON tours USING btree (parent_template_id, activity_type)
WHERE is_template = false AND parent_template_id IS NOT NULL;

-- Optimize schedule relationship queries
CREATE INDEX IF NOT EXISTS idx_tours_schedule_active
ON tours USING btree (parent_schedule_id, tour_date)
WHERE is_template = false AND status = 'active';

-- =====================================================
-- COMPATIBILITY VERIFICATION
-- =====================================================

-- Verify the view works correctly
-- This should return all active tour instances with enhanced data
-- SELECT COUNT(*) FROM active_tours_with_operators;

-- Test override-aware pricing
-- SELECT tour_name, discount_price_adult, effective_discount_price_adult, has_promotional_pricing
-- FROM active_tours_with_operators
-- WHERE is_customized = true OR has_promotional_pricing = true
-- LIMIT 5;

-- Test template relationships
-- SELECT tour_name, template_name, template_type, recurrence_type
-- FROM active_tours_with_operators
-- WHERE template_name IS NOT NULL
-- LIMIT 5;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================

/*
WHAT THIS MIGRATION DOES:

1. ENHANCED VIEW STRUCTURE:
   - Adds override-aware pricing fields (effective_discount_price_adult, etc.)
   - Includes promotional pricing indicators and calculations
   - Provides template and schedule relationship data
   - Maintains all existing fields for backward compatibility

2. PROMOTIONAL PRICING SUPPORT:
   - has_promotional_pricing: Boolean flag for tours with promo discounts
   - promotional_discount_amount: Calculated discount value
   - final_price_adult: Final price after promotional discounts

3. TEMPLATE AWARENESS:
   - template_name, template_type, template_description: From parent template
   - Enables "similar tours" functionality and template-based grouping

4. SCHEDULE INTEGRATION:
   - recurrence_type, schedule_days: Shows if tour is part of recurring schedule
   - schedule_paused: Excludes tours from paused schedules (unless detached)

5. PERFORMANCE OPTIMIZATION:
   - Added strategic indexes on new calculated fields
   - Optimized for common query patterns (pricing, promotional, templates)

BACKWARD COMPATIBILITY:
- All existing fields preserved with same names and types
- tourist-app services will continue to work without changes
- New fields are additive and optional

TESTING RECOMMENDATIONS:
1. Run SELECT COUNT(*) to verify view creation
2. Test pricing calculations with promotional tours
3. Verify template relationships work correctly
4. Check performance with realistic data load

DEPLOYMENT STEPS:
1. Save this file as supabase/migrations/20250915000001_enhance_tours_view_for_template_system.sql
2. Run SQL commands manually in Supabase dashboard
3. Test with existing tourist-app queries
4. Monitor performance and adjust indexes if needed
*/