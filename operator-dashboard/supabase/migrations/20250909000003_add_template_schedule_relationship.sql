-- Migration: CLEAN BREAK - Template-First Schedule System Only
-- Purpose: Eliminate legacy tour scheduling, support only template-based schedules
-- Strategy: Clean break approach - no backward compatibility with direct tour scheduling
-- Created: 2025-01-09

-- 1. Add template_id field to schedules table to explicitly track template relationships
ALTER TABLE schedules 
ADD COLUMN template_id UUID REFERENCES tours(id) ON DELETE CASCADE;

-- 2. CRITICAL FIX: Remove NOT NULL constraint from tour_id (clean break approach)
ALTER TABLE schedules ALTER COLUMN tour_id DROP NOT NULL;

-- 3. Create index for performance
CREATE INDEX idx_schedules_template_id ON schedules(template_id);

-- 4. Update existing template-based schedules to populate the new template_id field
-- (Currently template ID is stored in tour_id field, which is confusing)
UPDATE schedules 
SET template_id = tour_id 
WHERE tour_id IN (
  SELECT id FROM tours WHERE is_template = true
);

-- 5. Add a schedule_type enum - CLEAN BREAK: Only template_based allowed
CREATE TYPE schedule_type AS ENUM ('template_based');

-- 6. Add schedule_type column - all schedules must be template-based
ALTER TABLE schedules 
ADD COLUMN schedule_type schedule_type DEFAULT 'template_based';

-- 7. CLEAN BREAK: Delete all non-template schedules (legacy schedules are not supported)
-- First, delete related bookings to avoid foreign key violations
DELETE FROM bookings 
WHERE schedule_id IN (
  SELECT s.id 
  FROM schedules s 
  LEFT JOIN tours t ON s.tour_id = t.id 
  WHERE t.is_template = false OR t.is_template IS NULL
);

-- Then delete legacy schedules
DELETE FROM schedules 
WHERE tour_id IN (
  SELECT id FROM tours WHERE is_template = false
) OR tour_id NOT IN (
  SELECT id FROM tours WHERE is_template = true
);

-- Update remaining schedules to be template_based
UPDATE schedules 
SET schedule_type = 'template_based';

-- 8. Create view for template-based schedule data access (CLEAN BREAK)
CREATE OR REPLACE VIEW schedule_details AS
SELECT 
  s.id,
  s.operator_id,
  s.schedule_type,
  s.recurrence_type,
  s.days_of_week,
  s.start_time,
  s.start_date,
  s.end_date,
  s.exceptions,
  s.created_at,
  s.updated_at,
  -- Template information (only source of truth)
  t.id as template_id,
  t.tour_name as template_name,
  t.tour_type as template_type,
  t.max_capacity as template_capacity,
  t.discount_price_adult as template_price,
  t.auto_close_hours,
  t.location as template_location,
  t.status as template_status
FROM schedules s
INNER JOIN tours t ON s.template_id = t.id AND t.is_template = true;

-- 9. Add helpful comments
COMMENT ON COLUMN schedules.template_id IS 'References the template used for this schedule (TEMPLATE-FIRST ONLY)';
COMMENT ON COLUMN schedules.schedule_type IS 'Always template_based - legacy schedule types eliminated';
COMMENT ON VIEW schedule_details IS 'Template-based schedule view - provides clean access to schedule + template data';

-- 10. Update RLS policies to include new fields
DROP POLICY IF EXISTS "Operators can manage their schedules" ON schedules;
CREATE POLICY "Operators can manage their schedules" ON schedules
  FOR ALL USING (operator_id = auth.uid()::uuid);

-- 11. Create function to validate template-based schedule consistency (CLEAN BREAK)
CREATE OR REPLACE FUNCTION validate_schedule_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- CLEAN BREAK: All schedules must be template-based
  IF NEW.schedule_type != 'template_based' THEN
    RAISE EXCEPTION 'Only template_based schedules are supported';
  END IF;
  
  -- Template-based schedules must have a template_id
  IF NEW.template_id IS NULL THEN
    RAISE EXCEPTION 'Template-based schedules must have a template_id';
  END IF;
  
  -- tour_id must be NULL for template-based schedules (clean separation)
  IF NEW.tour_id IS NOT NULL THEN
    RAISE EXCEPTION 'Template-based schedules cannot have a tour_id - use template_id only';
  END IF;
  
  -- Ensure referenced template exists and is active
  PERFORM 1 FROM tours 
  WHERE id = NEW.template_id 
    AND is_template = true 
    AND status = 'active'
    AND operator_id = NEW.operator_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced template does not exist, is not active, or does not belong to operator';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to enforce consistency
DROP TRIGGER IF EXISTS validate_schedule_consistency_trigger ON schedules;
CREATE TRIGGER validate_schedule_consistency_trigger
  BEFORE INSERT OR UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_consistency();

-- 13. Create helper function to get schedule with dependencies
CREATE OR REPLACE FUNCTION get_schedule_dependencies(schedule_id_param UUID)
RETURNS TABLE(
  dependency_type TEXT,
  dependency_count INTEGER,
  dependency_details JSONB
) AS $$
BEGIN
  -- Get scheduled tours created from this schedule
  RETURN QUERY
  SELECT 
    'scheduled_tours'::TEXT,
    COUNT(*)::INTEGER,
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', id,
        'tour_name', tour_name,
        'tour_date', tour_date,
        'status', status,
        'bookings_count', COALESCE(
          (SELECT COUNT(*) FROM bookings WHERE tour_id = tours.id), 0
        )
      )
    )
  FROM tours 
  WHERE parent_schedule_id = schedule_id_param;
  
  -- Get bookings for scheduled tours from this schedule
  RETURN QUERY
  SELECT 
    'active_bookings'::TEXT,
    COUNT(*)::INTEGER,
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', b.id,
        'tour_name', t.tour_name,
        'tour_date', t.tour_date,
        'booking_status', b.booking_status,
        'customer_email', b.customer_email
      )
    )
  FROM bookings b
  JOIN tours t ON b.tour_id = t.id
  WHERE t.parent_schedule_id = schedule_id_param
    AND b.booking_status IN ('pending', 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Add useful indexes for performance
CREATE INDEX idx_tours_parent_schedule_template ON tours(parent_schedule_id, parent_template_id) 
  WHERE activity_type = 'scheduled';

CREATE INDEX idx_schedule_details_lookup ON schedules(operator_id, schedule_type, template_id);

-- 15. Update tours table to ensure parent_schedule_id is properly set
-- This ensures all generated tours have proper relationship tracking
UPDATE tours 
SET parent_schedule_id = (
  SELECT s.id 
  FROM schedules s 
  WHERE s.template_id = tours.parent_template_id 
    AND s.operator_id = tours.operator_id
  LIMIT 1
)
WHERE activity_type = 'scheduled' 
  AND parent_schedule_id IS NULL 
  AND parent_template_id IS NOT NULL;

-- 16. Create summary view for template-based schedules dashboard (CLEAN BREAK)
CREATE OR REPLACE VIEW operator_schedule_summary AS
SELECT 
  s.operator_id,
  s.schedule_type,
  COUNT(*) as schedule_count,
  COUNT(CASE WHEN t.status = 'active' THEN 1 END) as active_templates,
  SUM(COALESCE(tour_stats.total_tours, 0)) as total_generated_tours,
  SUM(COALESCE(tour_stats.active_tours, 0)) as active_generated_tours,
  SUM(COALESCE(booking_stats.total_bookings, 0)) as total_bookings
FROM schedules s
INNER JOIN tours t ON s.template_id = t.id AND t.is_template = true
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) as total_tours,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tours
  FROM tours tours_sub 
  WHERE tours_sub.parent_schedule_id = s.id
    AND tours_sub.activity_type = 'scheduled'
) tour_stats ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) as total_bookings
  FROM bookings b
  JOIN tours tours_sub ON b.tour_id = tours_sub.id
  WHERE tours_sub.parent_schedule_id = s.id
    AND tours_sub.activity_type = 'scheduled'
) booking_stats ON true
WHERE s.schedule_type = 'template_based'
GROUP BY s.operator_id, s.schedule_type;

COMMENT ON VIEW operator_schedule_summary IS 'Template-based schedule statistics - clean break from legacy tour scheduling';