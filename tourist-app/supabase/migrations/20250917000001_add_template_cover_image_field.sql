-- Migration: Add template_cover_image field to tours table
-- Date: 2025-09-17
-- Purpose: Add cover image support for activity templates

-- Add template_cover_image field to tours table (safe: nullable field, no defaults)
ALTER TABLE tours
ADD COLUMN template_cover_image TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tours.template_cover_image IS 'Supabase Storage path/URL to cover image for activity templates. Uploaded by operators, displayed in tourist app. Format: bucket-name/path/image.jpg or full Storage URL.';

-- Update activity_templates_view to include the new field
CREATE OR REPLACE VIEW activity_templates_view AS
SELECT
  id,
  created_at,
  updated_at,
  operator_id,
  tour_name,
  tour_type,
  description,
  tour_date,
  time_slot,
  duration_hours,
  max_capacity,
  available_spots,
  original_price_adult,
  discount_price_adult,
  discount_price_child,
  discount_percentage,
  meeting_point,
  meeting_point_gps,
  pickup_available,
  pickup_locations,
  languages,
  equipment_included,
  food_included,
  drinks_included,
  whale_regulation_compliant,
  max_whale_group_size,
  min_age,
  max_age,
  fitness_level,
  requirements,
  restrictions,
  booking_deadline,
  auto_close_hours,
  status,
  weather_dependent,
  backup_plan,
  special_notes,
  created_by_operator,
  location,
  activity_type,
  is_template,
  parent_template_id,
  recurrence_data,
  template_cover_image
FROM tours
WHERE is_template = true;

-- Ensure RLS policies include the new field (inherit from tours table RLS)
-- No additional RLS policies needed as the field inherits from tours table policies