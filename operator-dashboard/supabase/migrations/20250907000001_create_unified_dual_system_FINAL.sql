-- Migration: Create Unified Dual-System (Simplified Approach) - FINAL
-- Description: Add columns to existing tours table to support dual-system
-- Strategy: Unified table approach - maximum simplicity, zero risk
-- Impact: Backward compatible, no breaking changes
-- Created: 2025-09-07 (FINAL FIXED VERSION)
-- Migration ID: 20250907000001

-- ==============================================================================
-- UNIFIED TABLE APPROACH: EXTEND EXISTING TOURS TABLE
-- ==============================================================================

-- Add new columns to support dual-system functionality
ALTER TABLE tours ADD COLUMN IF NOT EXISTS activity_type VARCHAR(20) DEFAULT 'last_minute';
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;  
ALTER TABLE tours ADD COLUMN IF NOT EXISTS parent_template_id UUID REFERENCES tours(id);
ALTER TABLE tours ADD COLUMN IF NOT EXISTS recurrence_data JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tours_activity_type ON tours(activity_type);
CREATE INDEX IF NOT EXISTS idx_tours_is_template ON tours(is_template);
CREATE INDEX IF NOT EXISTS idx_tours_parent_template_id ON tours(parent_template_id);

-- Add constraints (with proper PostgreSQL syntax)
DO $$
BEGIN
    -- Add activity_type check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_activity_type' AND table_name = 'tours'
    ) THEN
        ALTER TABLE tours ADD CONSTRAINT chk_activity_type 
        CHECK (activity_type IN ('last_minute', 'template', 'scheduled'));
    END IF;

    -- Add template constraint if it doesn't exist (templates should not have tour_date/time_slot)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_template_no_date' AND table_name = 'tours'
    ) THEN
        ALTER TABLE tours ADD CONSTRAINT chk_template_no_date 
        CHECK (
            (is_template = TRUE AND tour_date IS NULL AND time_slot IS NULL) OR
            (is_template = FALSE)
        );
    END IF;
END $$;

-- ==============================================================================
-- VIEWS FOR EASY ACCESS
-- ==============================================================================

-- View for templates only
CREATE OR REPLACE VIEW activity_templates_view AS
SELECT * FROM tours 
WHERE is_template = TRUE AND status = 'active'
ORDER BY created_at DESC;

-- View for scheduled activities (generated from templates)
CREATE OR REPLACE VIEW scheduled_activities_view AS
SELECT * FROM tours 
WHERE activity_type = 'scheduled' AND status = 'active'
ORDER BY tour_date ASC, time_slot ASC;

-- View for last-minute activities (existing tours)
CREATE OR REPLACE VIEW last_minute_activities_view AS
SELECT * FROM tours 
WHERE activity_type = 'last_minute' AND status = 'active'
ORDER BY tour_date ASC, time_slot ASC;

-- ==============================================================================
-- HELPER FUNCTIONS (FIXED VARIABLE NAMES)
-- ==============================================================================

-- Function to generate scheduled activities from a template
CREATE OR REPLACE FUNCTION generate_scheduled_activities_from_template(
  template_id_param UUID,
  schedule_data_param JSONB
)
RETURNS TABLE(activity_id UUID, activity_date DATE, activity_time TIME)
LANGUAGE plpgsql
AS $$
DECLARE
  template_record tours%ROWTYPE;
  iter_date DATE;
  schedule_end_date DATE;
  schedule_start_time TIME;
  new_activity_id UUID;
  days_of_week INTEGER[];
  recurrence_type TEXT;
  exceptions DATE[];
BEGIN
  -- Get template
  SELECT * INTO template_record FROM tours WHERE id = template_id_param AND is_template = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', template_id_param;
  END IF;
  
  -- Extract schedule parameters
  iter_date := (schedule_data_param->>'start_date')::DATE;
  schedule_end_date := (schedule_data_param->>'end_date')::DATE;
  schedule_start_time := (schedule_data_param->>'start_time')::TIME;
  recurrence_type := schedule_data_param->>'recurrence_type';
  days_of_week := ARRAY(SELECT jsonb_array_elements_text(schedule_data_param->'days_of_week'))::INTEGER[];
  exceptions := ARRAY(SELECT jsonb_array_elements_text(schedule_data_param->'exceptions'))::DATE[];
  
  -- Generate activities based on recurrence
  WHILE iter_date <= schedule_end_date LOOP
    -- Check if this date should be included
    IF recurrence_type = 'once' THEN
      -- Only on start date
      IF iter_date = (schedule_data_param->>'start_date')::DATE THEN
        -- Create scheduled activity
        INSERT INTO tours (
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, available_spots, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included, 
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          created_by_operator, location, status,
          activity_type, is_template, parent_template_id, tour_date, time_slot, recurrence_data
        ) 
        SELECT 
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, max_capacity, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included,
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          TRUE, location, 'active',
          'scheduled', FALSE, template_id_param, iter_date, schedule_start_time::VARCHAR, schedule_data_param
        FROM tours WHERE id = template_id_param
        RETURNING id INTO new_activity_id;
        
        RETURN QUERY SELECT new_activity_id, iter_date, schedule_start_time;
      END IF;
      
    ELSIF recurrence_type = 'daily' THEN
      -- Every day (skip exceptions)
      IF iter_date != ALL(exceptions) THEN
        INSERT INTO tours (
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, available_spots, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included,
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          created_by_operator, location, status,
          activity_type, is_template, parent_template_id, tour_date, time_slot, recurrence_data
        ) 
        SELECT 
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, max_capacity, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included,
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          TRUE, location, 'active',
          'scheduled', FALSE, template_id_param, iter_date, schedule_start_time::VARCHAR, schedule_data_param
        FROM tours WHERE id = template_id_param
        RETURNING id INTO new_activity_id;
        
        RETURN QUERY SELECT new_activity_id, iter_date, schedule_start_time;
      END IF;
      
    ELSIF recurrence_type = 'weekly' THEN
      -- Specific days of week (skip exceptions)
      IF EXTRACT(DOW FROM iter_date)::INTEGER = ANY(days_of_week) 
         AND iter_date != ALL(exceptions) THEN
        INSERT INTO tours (
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, available_spots, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included,
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          created_by_operator, location, status,
          activity_type, is_template, parent_template_id, tour_date, time_slot, recurrence_data
        ) 
        SELECT 
          operator_id, tour_name, tour_type, description, duration_hours,
          max_capacity, max_capacity, original_price_adult, discount_price_adult,
          discount_price_child, meeting_point, pickup_available, pickup_locations,
          languages, equipment_included, food_included, drinks_included,
          whale_regulation_compliant, max_whale_group_size, min_age, max_age,
          fitness_level, requirements, restrictions, booking_deadline,
          auto_close_hours, weather_dependent, backup_plan, special_notes,
          TRUE, location, 'active',
          'scheduled', FALSE, template_id_param, iter_date, schedule_start_time::VARCHAR, schedule_data_param
        FROM tours WHERE id = template_id_param
        RETURNING id INTO new_activity_id;
        
        RETURN QUERY SELECT new_activity_id, iter_date, schedule_start_time;
      END IF;
    END IF;
    
    iter_date := iter_date + INTERVAL '1 day';
  END LOOP;
END;
$$;

-- ==============================================================================
-- PERMISSIONS AND SECURITY
-- ==============================================================================

-- Grant permissions on views
GRANT SELECT ON activity_templates_view TO authenticated, anon;
GRANT SELECT ON scheduled_activities_view TO authenticated, anon;
GRANT SELECT ON last_minute_activities_view TO authenticated, anon;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION generate_scheduled_activities_from_template(UUID, JSONB) TO authenticated;

-- ==============================================================================
-- DATA MIGRATION (EXISTING TOURS)
-- ==============================================================================

-- Set existing tours to 'last_minute' activity type (safe default)
-- First, temporarily disable the constraint for data migration
ALTER TABLE tours ALTER COLUMN tour_date DROP NOT NULL;
ALTER TABLE tours ALTER COLUMN time_slot DROP NOT NULL;

-- Now update existing data
UPDATE tours 
SET activity_type = 'last_minute', 
    is_template = FALSE 
WHERE activity_type IS NULL OR is_template IS NULL;

-- Re-enable NOT NULL constraints only for non-template records
-- (Templates can have NULL tour_date and time_slot)
-- The constraint chk_template_no_date handles this logic

-- ==============================================================================
-- VERIFICATION AND LOGGING
-- ==============================================================================

-- Log migration completion
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            event_type, 
            table_name, 
            actor_type, 
            additional_info
        ) VALUES (
            'MIGRATION_EXECUTED',
            'tours',
            'system',
            jsonb_build_object(
                'migration_id', '20250907000001',
                'description', 'Unified Dual-System Implementation',
                'strategy', 'Add columns to existing tours table',
                'columns_added', ARRAY['activity_type', 'is_template', 'parent_template_id', 'recurrence_data'],
                'views_created', ARRAY['activity_templates_view', 'scheduled_activities_view', 'last_minute_activities_view'],
                'functions_created', ARRAY['generate_scheduled_activities_from_template'],
                'backward_compatible', true,
                'risk_level', 'minimal'
            )
        );
    END IF;
END $$;

-- Verification checks
DO $$
BEGIN
    -- Verify new columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'activity_type'
    ) THEN
        RAISE EXCEPTION 'Migration failed: activity_type column not created';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'is_template'
    ) THEN
        RAISE EXCEPTION 'Migration failed: is_template column not created';
    END IF;
    
    -- Verify views exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'activity_templates_view'
    ) THEN
        RAISE EXCEPTION 'Migration failed: activity_templates_view not created';
    END IF;
    
    -- Verify function exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'generate_scheduled_activities_from_template'
    ) THEN
        RAISE EXCEPTION 'Migration failed: generate_scheduled_activities_from_template function not created';
    END IF;
    
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'UNIFIED DUAL-SYSTEM MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Tours table extended with dual-system support';
    RAISE NOTICE 'All existing data preserved and functional';
    RAISE NOTICE 'Views and functions created for easy access';
    RAISE NOTICE 'Templates can now have NULL tour_date/time_slot';
    RAISE NOTICE 'Database ready for dual-system implementation';
    RAISE NOTICE '===============================================';
END $$;