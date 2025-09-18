-- SAFE Migration: Add operator_logo field to existing views
-- Date: 2025-09-17
-- Purpose: Add ONLY the operator_logo field to existing views without changing anything else

-- Update active_tours_with_operators view to include operator_logo
-- Using the EXACT current definition + only adding operator_logo field
DROP VIEW IF EXISTS active_tours_with_operators;

CREATE VIEW active_tours_with_operators AS
SELECT t.id,
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
    COALESCE((t.overrides ->> 'discount_price_adult'::text)::integer, t.discount_price_adult) AS effective_discount_price_adult,
    COALESCE((t.overrides ->> 'discount_price_child'::text)::integer, t.discount_price_child) AS effective_discount_price_child,
    COALESCE((t.overrides ->> 'max_capacity'::text)::integer, t.max_capacity) AS effective_max_capacity,
    COALESCE((t.overrides ->> 'available_spots'::text)::integer, t.available_spots) AS effective_available_spots,
    COALESCE(t.overrides ->> 'meeting_point'::text, t.meeting_point::text) AS effective_meeting_point,
        CASE
            WHEN t.promo_discount_percent IS NOT NULL OR t.promo_discount_value IS NOT NULL THEN true
            ELSE false
        END AS has_promotional_pricing,
        CASE
            WHEN t.promo_discount_percent IS NOT NULL THEN round((t.discount_price_adult * t.promo_discount_percent)::numeric / 100.0)
            WHEN t.promo_discount_value IS NOT NULL THEN t.promo_discount_value::numeric
            ELSE 0::numeric
        END AS promotional_discount_amount,
        CASE
            WHEN t.promo_discount_percent IS NOT NULL THEN t.discount_price_adult::numeric - round((t.discount_price_adult * t.promo_discount_percent)::numeric / 100.0)
            WHEN t.promo_discount_value IS NOT NULL THEN GREATEST(0, t.discount_price_adult - t.promo_discount_value)::numeric
            ELSE COALESCE((t.overrides ->> 'discount_price_adult'::text)::integer, t.discount_price_adult)::numeric
        END AS final_price_adult,
    template.tour_name AS template_name,
    template.tour_type AS template_type,
    template.description AS template_description,
    template.id AS template_id,
    s.recurrence_type,
    s.days_of_week AS schedule_days,
    s.start_time AS schedule_start_time,
    s.start_date AS schedule_start_date,
    s.end_date AS schedule_end_date,
    s.is_paused AS schedule_paused,
    s.schedule_type,
    o.company_name,
    o.contact_person,
    o.email AS operator_email,
    o.phone AS operator_phone,
    o.whatsapp_number AS operator_whatsapp_number,
    o.island AS operator_island,
    o.address AS operator_address,
    o.business_license,
    o.insurance_certificate,
    o.whale_tour_certified,
    o.status AS operator_status,
    o.commission_rate,
    o.average_rating AS operator_average_rating,
    o.total_tours_completed AS operator_total_tours_completed,
    o.business_description AS operator_bio,
    o.preferred_language AS operator_language,
    o.operator_logo  -- *** ONLY NEW FIELD ADDED ***
   FROM tours t
     LEFT JOIN tours template ON t.parent_template_id = template.id AND template.is_template = true
     LEFT JOIN schedules s ON t.parent_schedule_id = s.id
     LEFT JOIN operators o ON t.operator_id = o.id
  WHERE t.is_template = false AND (t.status::text = ANY (ARRAY['active'::character varying, 'sold_out'::character varying]::text[])) AND (s.is_paused = false OR s.is_paused IS NULL OR t.is_detached = true) AND o.status::text = 'active'::text
  ORDER BY t.tour_date, t.time_slot;