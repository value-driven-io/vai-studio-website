-- Update schedule_availability view to include template data without column conflicts
-- This fixes the "column specified more than once" error

-- Drop the existing view first
DROP VIEW IF EXISTS schedule_availability;

-- Create updated view with proper column aliasing to avoid conflicts
CREATE OR REPLACE VIEW schedule_availability AS
SELECT 
  s.*,  -- All schedule columns including existing template_id
  is_schedule_available(s) as is_available,
  CASE 
    WHEN s.is_paused = true THEN 'paused'
    WHEN CURRENT_DATE < s.start_date THEN 'upcoming'
    WHEN CURRENT_DATE > s.end_date THEN 'expired'
    ELSE 'active'
  END as availability_status,
  o.email as paused_by_email,
  -- Template data from tours table (with aliases to avoid conflicts)
  t.tour_name as template_name,
  t.tour_type as template_type,
  t.max_capacity as template_capacity,
  t.discount_price_adult as template_price,
  t.status as template_status,
  t.location as template_location,
  t.auto_close_hours as template_auto_close_hours
FROM schedules s
LEFT JOIN operators o ON s.paused_by = o.id
LEFT JOIN tours t ON s.template_id = t.id AND t.is_template = true;

-- Add comment for the updated view
COMMENT ON VIEW schedule_availability IS 'Enhanced schedule view with pause status and template data - fixed column conflicts';

-- Verify the view works by testing column access
-- This will help catch any remaining issues
DO $$
BEGIN
  -- Test that we can select from the view without errors
  PERFORM 1 FROM schedule_availability LIMIT 1;
  RAISE NOTICE 'Schedule availability view updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create schedule_availability view: %', SQLERRM;
END $$;