-- Add analytics fields to schedule_availability view
-- This provides real-time analytics for schedule cards (instances, customizations, bookings)

-- Drop the existing view first
DROP VIEW IF EXISTS schedule_availability;

-- Create enhanced view with analytics calculations
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
  t.auto_close_hours as template_auto_close_hours,
  -- Analytics calculations
  COALESCE(analytics.total_instances, 0) as total_instances,
  COALESCE(analytics.customized_instances, 0) as customized_instances,
  COALESCE(analytics.total_bookings, 0) as total_bookings,
  COALESCE(analytics.revenue, 0) as revenue
FROM schedules s
LEFT JOIN operators o ON s.paused_by = o.id
LEFT JOIN tours t ON s.template_id = t.id AND t.is_template = true
LEFT JOIN (
  -- Analytics subquery - calculates real-time stats for each schedule
  SELECT 
    parent_schedule_id,
    COUNT(*) as total_instances,
    COUNT(CASE WHEN is_customized = true THEN 1 END) as customized_instances,
    COALESCE(SUM(bookings_count), 0) as total_bookings,
    COALESCE(SUM(tour_revenue), 0) as revenue
  FROM (
    SELECT 
      tours.parent_schedule_id,
      tours.is_customized,
      COUNT(bookings.id) as bookings_count,
      SUM(CASE 
        WHEN bookings.booking_status IN ('confirmed', 'completed') 
        THEN COALESCE(bookings.total_amount, 0) 
        ELSE 0 
      END) as tour_revenue
    FROM tours
    LEFT JOIN bookings ON tours.id = bookings.tour_id
    WHERE tours.activity_type = 'scheduled' 
      AND tours.parent_schedule_id IS NOT NULL
    GROUP BY tours.parent_schedule_id, tours.id, tours.is_customized
  ) tour_stats
  GROUP BY parent_schedule_id
) analytics ON s.id = analytics.parent_schedule_id;

-- Add comment for the enhanced view
COMMENT ON VIEW schedule_availability IS 'Enhanced schedule view with pause status, template data, and real-time analytics';

-- Create index on parent_schedule_id for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tours_parent_schedule_id ON tours(parent_schedule_id) 
WHERE parent_schedule_id IS NOT NULL;

-- Verify the view works and test analytics
DO $$
DECLARE
  test_record RECORD;
BEGIN
  -- Test that we can select from the view with analytics
  SELECT total_instances, customized_instances, total_bookings 
  INTO test_record
  FROM schedule_availability 
  LIMIT 1;
  
  RAISE NOTICE 'Schedule availability view with analytics updated successfully';
  RAISE NOTICE 'Sample analytics: instances=%, customized=%, bookings=%', 
    test_record.total_instances, test_record.customized_instances, test_record.total_bookings;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create schedule_availability view with analytics: %', SQLERRM;
END $$;