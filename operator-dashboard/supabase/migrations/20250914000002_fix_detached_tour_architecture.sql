-- Fix Detached Tour Architecture - Prevent Schedule Update Duplicates
-- This migration addresses the critical issue where schedule updates create duplicate tours
-- when detached tours exist for the same dates.

-- PROBLEM: Detached tours still have parent_schedule_id set, causing schedule updates
-- to ignore their dates and create duplicates.

-- SOLUTION: Clean separation - detached tours have parent_schedule_id = NULL
-- and track their origin via detached_from_schedule_id for audit purposes.

-- Step 1: Add tracking column for detached tour origins
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS detached_from_schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL;

-- Step 2: Add comment explaining the detached architecture
COMMENT ON COLUMN tours.detached_from_schedule_id IS 'Original schedule ID when tour was detached (for audit trail)';
COMMENT ON COLUMN tours.is_detached IS 'True when tour is detached from its schedule and operates independently';
COMMENT ON COLUMN tours.parent_schedule_id IS 'Current schedule relationship - NULL for detached tours';

-- Step 3: Migrate existing detached tours to new architecture
-- Move detached tours to have NULL parent_schedule_id and track origin
UPDATE tours 
SET 
  detached_from_schedule_id = parent_schedule_id,
  parent_schedule_id = NULL
WHERE is_detached = true AND parent_schedule_id IS NOT NULL;

-- Step 4: Update the detach_tour_from_schedule function to use new architecture
CREATE OR REPLACE FUNCTION detach_tour_from_schedule(
  tour_id_param UUID,
  detach_reason TEXT DEFAULT 'Manual detachment'
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  tour_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  tour_record RECORD;
BEGIN
  -- Get tour details
  SELECT id, parent_schedule_id, is_detached 
  INTO tour_record
  FROM tours 
  WHERE id = tour_id_param;
  
  -- Check if tour exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Tour not found'::TEXT, tour_id_param;
    RETURN;
  END IF;
  
  -- Check if already detached
  IF tour_record.is_detached = true THEN
    RETURN QUERY SELECT false, 'Tour is already detached'::TEXT, tour_id_param;
    RETURN;
  END IF;
  
  -- Check if tour has a schedule relationship
  IF tour_record.parent_schedule_id IS NULL THEN
    RETURN QUERY SELECT false, 'Tour has no schedule relationship to detach from'::TEXT, tour_id_param;
    RETURN;
  END IF;
  
  -- Detach the tour using new architecture
  UPDATE tours 
  SET 
    detached_from_schedule_id = parent_schedule_id,  -- Track origin
    parent_schedule_id = NULL,                        -- Clean separation
    is_detached = true,
    overrides = COALESCE(overrides, '{}'::JSONB) || jsonb_build_object(
      'detach_reason', detach_reason,
      'detached_at', NOW()::TEXT
    ),
    updated_at = NOW()
  WHERE id = tour_id_param;
  
  RETURN QUERY SELECT true, 'Tour detached successfully'::TEXT, tour_id_param;
END $$;

-- Step 5: Create helper function to check for date conflicts during schedule updates
CREATE OR REPLACE FUNCTION get_schedule_date_conflicts(
  schedule_id_param UUID,
  new_dates DATE[]
)
RETURNS TABLE(
  conflicted_date DATE,
  detached_tour_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tour_date::DATE as conflicted_date,
    COUNT(*)::INTEGER as detached_tour_count
  FROM tours t
  WHERE t.detached_from_schedule_id = schedule_id_param
    AND t.is_detached = true
    AND t.parent_schedule_id IS NULL
    AND t.tour_date::DATE = ANY(new_dates)
  GROUP BY t.tour_date::DATE;
END $$;

-- Step 6: Create index for performance on detached tour queries
CREATE INDEX IF NOT EXISTS idx_tours_detached_from_schedule 
ON tours(detached_from_schedule_id) 
WHERE is_detached = true AND parent_schedule_id IS NULL;

-- Step 7: Create index for schedule update queries (only attached tours)
CREATE INDEX IF NOT EXISTS idx_tours_attached_to_schedule 
ON tours(parent_schedule_id) 
WHERE parent_schedule_id IS NOT NULL AND is_detached = false;

-- Step 8: Verification and testing
DO $$
DECLARE
  test_count INTEGER;
  detached_count INTEGER;
  attached_count INTEGER;
BEGIN
  -- Count tours by attachment status
  SELECT COUNT(*) INTO detached_count 
  FROM tours 
  WHERE is_detached = true AND parent_schedule_id IS NULL;
  
  SELECT COUNT(*) INTO attached_count 
  FROM tours 
  WHERE parent_schedule_id IS NOT NULL AND (is_detached = false OR is_detached IS NULL);
  
  -- Verify no tours are in invalid state (detached but still have parent_schedule_id)
  SELECT COUNT(*) INTO test_count 
  FROM tours 
  WHERE is_detached = true AND parent_schedule_id IS NOT NULL;
  
  IF test_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % tours still have invalid detached state', test_count;
  END IF;
  
  RAISE NOTICE 'Detached tour architecture migration completed successfully';
  RAISE NOTICE 'Detached tours (parent_schedule_id = NULL): %', detached_count;
  RAISE NOTICE 'Attached tours (parent_schedule_id IS NOT NULL): %', attached_count;
  RAISE NOTICE 'Invalid states: % (should be 0)', test_count;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Detached tour architecture migration failed: %', SQLERRM;
END $$;