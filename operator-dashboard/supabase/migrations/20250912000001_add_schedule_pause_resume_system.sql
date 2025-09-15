-- Add pause/resume system to schedules table
-- This enables operators to temporarily make schedules unavailable for booking
-- while preserving all existing data and bookings

-- Add pause/resume fields to schedules table
ALTER TABLE schedules ADD COLUMN is_paused BOOLEAN DEFAULT false;
ALTER TABLE schedules ADD COLUMN paused_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE schedules ADD COLUMN paused_by UUID REFERENCES operators(id) NULL;

-- Add index for performance on pause queries
CREATE INDEX idx_schedules_is_paused ON schedules(is_paused);

-- Add index for audit queries (who paused when)
CREATE INDEX idx_schedules_paused_by ON schedules(paused_by) WHERE paused_by IS NOT NULL;

-- Update RLS policies to include pause field access
-- Allow operators to view and modify pause status of their own schedules
DROP POLICY IF EXISTS "Operators can view their own schedules" ON schedules;
CREATE POLICY "Operators can view their own schedules" ON schedules
  FOR SELECT USING (operator_id = auth.uid());

DROP POLICY IF EXISTS "Operators can update their own schedules" ON schedules;
CREATE POLICY "Operators can update their own schedules" ON schedules
  FOR UPDATE USING (operator_id = auth.uid());

-- Create helper function to check if a schedule is effectively available
-- A schedule is available if it's not paused AND within its date range
CREATE OR REPLACE FUNCTION is_schedule_available(
  schedule_record schedules,
  check_date DATE DEFAULT CURRENT_DATE
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if paused
  IF schedule_record.is_paused = true THEN
    RETURN false;
  END IF;
  
  -- Check if within date range
  IF check_date < schedule_record.start_date OR 
     check_date > schedule_record.end_date THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to pause a schedule
CREATE OR REPLACE FUNCTION pause_schedule(
  schedule_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
  schedule_exists BOOLEAN;
BEGIN
  -- Check if schedule exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM schedules 
    WHERE id = schedule_id 
    AND operator_id = user_id
  ) INTO schedule_exists;
  
  IF NOT schedule_exists THEN
    RAISE EXCEPTION 'Schedule not found or access denied';
  END IF;
  
  -- Update schedule to paused state
  UPDATE schedules 
  SET 
    is_paused = true,
    paused_at = NOW(),
    paused_by = user_id
  WHERE id = schedule_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to resume a schedule
CREATE OR REPLACE FUNCTION resume_schedule(
  schedule_id UUID,
  user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
  schedule_exists BOOLEAN;
BEGIN
  -- Check if schedule exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM schedules 
    WHERE id = schedule_id 
    AND operator_id = user_id
  ) INTO schedule_exists;
  
  IF NOT schedule_exists THEN
    RAISE EXCEPTION 'Schedule not found or access denied';
  END IF;
  
  -- Update schedule to active state
  UPDATE schedules 
  SET 
    is_paused = false,
    paused_at = NULL,
    paused_by = NULL
  WHERE id = schedule_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for bulk pause operations
CREATE OR REPLACE FUNCTION bulk_pause_schedules(
  schedule_ids UUID[],
  user_id UUID DEFAULT auth.uid()
) RETURNS TABLE(
  schedule_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  sid UUID;
BEGIN
  FOREACH sid IN ARRAY schedule_ids LOOP
    BEGIN
      SELECT pause_schedule(sid, user_id) INTO success;
      schedule_id := sid;
      error_message := NULL;
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      schedule_id := sid;
      success := false;
      error_message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for bulk resume operations
CREATE OR REPLACE FUNCTION bulk_resume_schedules(
  schedule_ids UUID[],
  user_id UUID DEFAULT auth.uid()
) RETURNS TABLE(
  schedule_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  sid UUID;
BEGIN
  FOREACH sid IN ARRAY schedule_ids LOOP
    BEGIN
      SELECT resume_schedule(sid, user_id) INTO success;
      schedule_id := sid;
      error_message := NULL;
      RETURN NEXT;
    EXCEPTION WHEN OTHERS THEN
      schedule_id := sid;
      success := false;
      error_message := SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for schedule availability status with template data
CREATE OR REPLACE VIEW schedule_availability AS
SELECT 
  s.*,
  is_schedule_available(s) as is_available,
  CASE 
    WHEN s.is_paused = true THEN 'paused'
    WHEN CURRENT_DATE < s.start_date THEN 'upcoming'
    WHEN CURRENT_DATE > s.end_date THEN 'expired'
    ELSE 'active'
  END as availability_status,
  o.email as paused_by_email,
  -- Template data from tours table
  t.id as template_id,
  t.tour_name as template_name,
  t.tour_type as template_type,
  t.max_capacity as template_capacity,
  t.discount_price_adult as template_price,
  t.status as template_status,
  t.location as template_location,
  t.auto_close_hours
FROM schedules s
LEFT JOIN operators o ON s.paused_by = o.id
LEFT JOIN tours t ON s.template_id = t.id AND t.is_template = true;

-- Add comments for documentation
COMMENT ON COLUMN schedules.is_paused IS 'Indicates if this schedule is temporarily paused by the operator';
COMMENT ON COLUMN schedules.paused_at IS 'Timestamp when the schedule was paused';
COMMENT ON COLUMN schedules.paused_by IS 'User ID who paused this schedule';
COMMENT ON FUNCTION is_schedule_available IS 'Checks if a schedule is available for booking on a given date';
COMMENT ON FUNCTION pause_schedule IS 'Pauses a schedule, making it unavailable for new bookings';
COMMENT ON FUNCTION resume_schedule IS 'Resumes a paused schedule, making it available for bookings again';
COMMENT ON VIEW schedule_availability IS 'Provides enhanced schedule data with availability status';