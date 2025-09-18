-- Migration: Add operator information (including logo) to activity_templates_view
-- Date: 2025-09-17
-- Purpose: Enable template discovery to show operator logos and company info

-- Update activity_templates_view to include operator information
-- Using the exact current template fields + adding operator JOIN and fields
DROP VIEW IF EXISTS activity_templates_view;

CREATE VIEW activity_templates_view AS
SELECT
    -- All existing template fields (unchanged)
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
    t.location,
    t.activity_type,
    t.is_template,
    t.parent_template_id,
    t.recurrence_data,
    t.template_cover_image,

    -- Add operator information (NEW)
    o.company_name,
    o.operator_logo,
    o.average_rating AS operator_average_rating,
    o.total_tours_completed AS operator_total_tours_completed

FROM tours t
LEFT JOIN operators o ON t.operator_id = o.id
WHERE t.is_template = true;