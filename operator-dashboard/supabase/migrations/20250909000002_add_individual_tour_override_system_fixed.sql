-- Migration: Add Individual Tour Override System (FIXED VERSION)
-- Description: Enable individual tour instance management with override capabilities
-- Strategy: Extend existing tours table with override fields while preserving bulk operations
-- Impact: Backward compatible - all existing functionality preserved
-- Created: 2025-09-09 (FIXED)
-- Migration ID: 20250909000002

-- ==============================================================================
-- PHASE 4A: ADD INDIVIDUAL TOUR OVERRIDE COLUMNS
-- ==============================================================================

-- Add new columns for individual tour override system
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS parent_schedule_id UUID;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS is_customized BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS frozen_fields TEXT[] DEFAULT '{}';
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS overrides JSONB DEFAULT '{}';
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS is_detached BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS promo_discount_percent INTEGER;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS promo_discount_value INTEGER;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS instance_note TEXT;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS customization_timestamp TIMESTAMP WITH TIME ZONE;

-- Add foreign key constraint for parent_schedule_id (using DO block to handle IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tours_parent_schedule_id_fkey' 
        AND table_name = 'tours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.tours 
        ADD CONSTRAINT tours_parent_schedule_id_fkey 
        FOREIGN KEY (parent_schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==============================================================================
-- PHASE 4B: ADD PERFORMANCE INDEXES
-- ==============================================================================

-- Indexes for individual tour management queries
CREATE INDEX IF NOT EXISTS idx_tours_parent_schedule_id ON public.tours(parent_schedule_id);
CREATE INDEX IF NOT EXISTS idx_tours_is_customized ON public.tours(is_customized) WHERE is_customized = TRUE;
CREATE INDEX IF NOT EXISTS idx_tours_is_detached ON public.tours(is_detached) WHERE is_detached = TRUE;
CREATE INDEX IF NOT EXISTS idx_tours_customization_timestamp ON public.tours(customization_timestamp) WHERE customization_timestamp IS NOT NULL;

-- Composite indexes for efficient tour management queries
CREATE INDEX IF NOT EXISTS idx_tours_schedule_customization ON public.tours(parent_schedule_id, is_customized, tour_date);
CREATE INDEX IF NOT EXISTS idx_tours_template_scheduled ON public.tours(parent_template_id, activity_type, tour_date) WHERE activity_type = 'scheduled';

-- ==============================================================================
-- PHASE 4C: ADD CHECK CONSTRAINTS (with proper IF NOT EXISTS handling)
-- ==============================================================================

-- Ensure promo discounts are reasonable
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_promo_discount_percent' 
        AND table_name = 'tours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.tours 
        ADD CONSTRAINT chk_promo_discount_percent 
        CHECK (promo_discount_percent IS NULL OR (promo_discount_percent >= 0 AND promo_discount_percent <= 100));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_promo_discount_value' 
        AND table_name = 'tours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.tours 
        ADD CONSTRAINT chk_promo_discount_value 
        CHECK (promo_discount_value IS NULL OR promo_discount_value >= 0);
    END IF;
END $$;

-- Ensure customization timestamp is set when tour is customized
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_customization_timestamp' 
        AND table_name = 'tours'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.tours 
        ADD CONSTRAINT chk_customization_timestamp 
        CHECK (
          (is_customized = FALSE AND customization_timestamp IS NULL) OR
          (is_customized = TRUE AND customization_timestamp IS NOT NULL)
        );
    END IF;
END $$;

-- ==============================================================================
-- PHASE 4D: ENHANCED FUNCTIONS FOR INDIVIDUAL TOUR MANAGEMENT
-- ==============================================================================

-- Function: Apply individual tour customization
CREATE OR REPLACE FUNCTION public.apply_tour_customization(
  tour_id_param UUID,
  customizations JSONB,
  frozen_fields_param TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  tour_data JSONB,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  tour_record tours%ROWTYPE;
  update_fields TEXT[] := '{}';
  update_values TEXT[] := '{}';
  update_sql TEXT;
  field_name TEXT;
  field_value TEXT;
BEGIN
  -- Get the tour record
  SELECT * INTO tour_record FROM public.tours WHERE id = tour_id_param;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::JSONB, 'Tour not found'::TEXT;
    RETURN;
  END IF;
  
  -- Prevent customization of templates
  IF tour_record.is_template = TRUE THEN
    RETURN QUERY SELECT FALSE, NULL::JSONB, 'Cannot customize template tours'::TEXT;
    RETURN;
  END IF;
  
  -- Process customizations safely
  FOR field_name, field_value IN SELECT * FROM jsonb_each_text(customizations)
  LOOP
    CASE field_name
      WHEN 'discount_price_adult' THEN
        IF field_value IS NOT NULL AND field_value ~ '^\d+$' THEN
          update_fields := update_fields || 'discount_price_adult';
          update_values := update_values || field_value;
        END IF;
      WHEN 'discount_price_child' THEN
        update_fields := update_fields || 'discount_price_child';
        IF field_value = '' OR field_value IS NULL THEN
          update_values := update_values || 'NULL';
        ELSIF field_value ~ '^\d+$' THEN
          update_values := update_values || field_value;
        END IF;
      WHEN 'max_capacity' THEN
        IF field_value IS NOT NULL AND field_value ~ '^\d+$' THEN
          update_fields := update_fields || ARRAY['max_capacity', 'available_spots'];
          update_values := update_values || ARRAY[field_value, field_value];
        END IF;
      WHEN 'meeting_point' THEN
        update_fields := update_fields || 'meeting_point';
        update_values := update_values || quote_literal(field_value);
      WHEN 'special_notes' THEN
        update_fields := update_fields || 'special_notes';
        update_values := update_values || quote_literal(field_value);
      WHEN 'instance_note' THEN
        update_fields := update_fields || 'instance_note';
        update_values := update_values || quote_literal(field_value);
      WHEN 'promo_discount_percent' THEN
        update_fields := update_fields || 'promo_discount_percent';
        IF field_value = '' OR field_value IS NULL THEN
          update_values := update_values || 'NULL';
        ELSIF field_value ~ '^\d+$' THEN
          update_values := update_values || field_value;
        END IF;
      WHEN 'promo_discount_value' THEN
        update_fields := update_fields || 'promo_discount_value';
        IF field_value = '' OR field_value IS NULL THEN
          update_values := update_values || 'NULL';
        ELSIF field_value ~ '^\d+$' THEN
          update_values := update_values || field_value;
        END IF;
      WHEN 'status' THEN
        IF field_value IN ('active', 'sold_out', 'cancelled', 'completed') THEN
          update_fields := update_fields || 'status';
          update_values := update_values || quote_literal(field_value);
        END IF;
      ELSE
        -- Ignore unknown fields
        CONTINUE;
    END CASE;
  END LOOP;
  
  -- Build and execute update if we have fields to update
  IF array_length(update_fields, 1) > 0 THEN
    -- Build SET clause
    update_sql := 'UPDATE public.tours SET ';
    FOR i IN 1..array_length(update_fields, 1) LOOP
      IF i > 1 THEN
        update_sql := update_sql || ', ';
      END IF;
      update_sql := update_sql || update_fields[i] || ' = ' || update_values[i];
    END LOOP;
    
    -- Add customization metadata
    update_sql := update_sql || 
      ', is_customized = TRUE' ||
      ', customization_timestamp = NOW()' ||
      ', overrides = overrides || ' || quote_literal(customizations::TEXT) || '::JSONB';
      
    -- Add frozen fields if provided
    IF frozen_fields_param IS NOT NULL THEN
      update_sql := update_sql || ', frozen_fields = ' || quote_literal(frozen_fields_param);
    END IF;
    
    -- Add WHERE clause
    update_sql := update_sql || ' WHERE id = ' || quote_literal(tour_id_param::TEXT) || '::UUID';
    
    -- Execute the update
    EXECUTE update_sql;
  ELSE
    -- Just mark as customized if no fields to update
    UPDATE public.tours SET
      is_customized = TRUE,
      customization_timestamp = NOW(),
      overrides = overrides || customizations
    WHERE id = tour_id_param;
  END IF;
  
  -- Return success with updated tour data
  RETURN QUERY 
  SELECT 
    TRUE,
    to_jsonb(t.*),
    'Tour customization applied successfully'::TEXT
  FROM public.tours t 
  WHERE t.id = tour_id_param;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, NULL::JSONB, ('Error applying customization: ' || SQLERRM)::TEXT;
END;
$$;

-- Function: Bulk update tours with override protection
CREATE OR REPLACE FUNCTION public.bulk_update_scheduled_tours(
  schedule_id_param UUID,
  updates JSONB,
  respect_customizations BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  tours_updated INTEGER,
  tours_skipped INTEGER,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER := 0;
  skipped_count INTEGER := 0;
  tour_rec RECORD;
  field_name TEXT;
  should_skip BOOLEAN;
  update_sql TEXT;
  update_fields TEXT[] := '{}';
  update_values TEXT[] := '{}';
BEGIN
  -- Iterate through all scheduled tours for this schedule
  FOR tour_rec IN 
    SELECT * FROM public.tours 
    WHERE parent_schedule_id = schedule_id_param 
      AND activity_type = 'scheduled'
      AND is_template = FALSE
  LOOP
    should_skip := FALSE;
    
    -- Check if tour is customized and should be protected
    IF respect_customizations AND tour_rec.is_customized THEN
      -- Check each field to see if it's frozen
      FOR field_name IN SELECT jsonb_object_keys(updates)
      LOOP
        IF field_name = ANY(tour_rec.frozen_fields) THEN
          should_skip := TRUE;
          EXIT;
        END IF;
      END LOOP;
      
      IF should_skip THEN
        skipped_count := skipped_count + 1;
        CONTINUE;
      END IF;
    END IF;
    
    -- Build update arrays safely
    update_fields := '{}';
    update_values := '{}';
    
    FOR field_name IN SELECT jsonb_object_keys(updates)
    LOOP
      CASE field_name
        WHEN 'discount_price_adult' THEN
          update_fields := update_fields || 'discount_price_adult';
          update_values := update_values || (updates->>field_name);
        WHEN 'discount_price_child' THEN
          update_fields := update_fields || 'discount_price_child';
          IF (updates->>field_name) = '' OR (updates->>field_name) IS NULL THEN
            update_values := update_values || 'NULL';
          ELSE
            update_values := update_values || (updates->>field_name);
          END IF;
        WHEN 'max_capacity' THEN
          update_fields := update_fields || ARRAY['max_capacity', 'available_spots'];
          update_values := update_values || ARRAY[updates->>field_name, updates->>field_name];
        WHEN 'meeting_point' THEN
          update_fields := update_fields || 'meeting_point';
          update_values := update_values || quote_literal(updates->>field_name);
        WHEN 'special_notes' THEN
          update_fields := update_fields || 'special_notes';
          update_values := update_values || quote_literal(updates->>field_name);
        ELSE
          CONTINUE;
      END CASE;
    END LOOP;
    
    -- Execute update if we have fields
    IF array_length(update_fields, 1) > 0 THEN
      -- Build SET clause
      update_sql := 'UPDATE public.tours SET ';
      FOR i IN 1..array_length(update_fields, 1) LOOP
        IF i > 1 THEN
          update_sql := update_sql || ', ';
        END IF;
        update_sql := update_sql || update_fields[i] || ' = ' || update_values[i];
      END LOOP;
      
      update_sql := update_sql || ', updated_at = NOW()';
      update_sql := update_sql || ' WHERE id = ' || quote_literal(tour_rec.id::TEXT) || '::UUID';
      
      -- Execute the update
      EXECUTE update_sql;
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT 
    updated_count,
    skipped_count,
    format('Updated %s tours, skipped %s customized tours', updated_count, skipped_count);
    
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT 0, 0, ('Error in bulk update: ' || SQLERRM)::TEXT;
END;
$$;

-- Function: Detach tour from schedule (make completely independent)
CREATE OR REPLACE FUNCTION public.detach_tour_from_schedule(
  tour_id_param UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  tour_record tours%ROWTYPE;
BEGIN
  -- Get the tour record
  SELECT * INTO tour_record FROM public.tours WHERE id = tour_id_param;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Tour not found'::TEXT;
    RETURN;
  END IF;
  
  -- Prevent detaching templates
  IF tour_record.is_template = TRUE THEN
    RETURN QUERY SELECT FALSE, 'Cannot detach template tours'::TEXT;
    RETURN;
  END IF;
  
  -- Detach the tour
  UPDATE public.tours SET
    is_detached = TRUE,
    is_customized = TRUE,
    customization_timestamp = NOW(),
    parent_schedule_id = NULL,
    activity_type = 'last_minute', -- Convert to independent tour
    overrides = overrides || jsonb_build_object('detached_at', NOW(), 'reason', 'Manual detachment'),
    updated_at = NOW()
  WHERE id = tour_id_param;
  
  RETURN QUERY SELECT TRUE, 'Tour successfully detached from schedule'::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, ('Error detaching tour: ' || SQLERRM)::TEXT;
END;
$$;

-- ==============================================================================
-- PHASE 4E: ENHANCED VIEWS
-- ==============================================================================

-- View: Individual Tour Management Dashboard
CREATE OR REPLACE VIEW public.tour_management_dashboard AS
SELECT 
  t.id,
  t.tour_name,
  t.tour_type,
  t.tour_date,
  t.time_slot,
  t.activity_type,
  t.status,
  t.max_capacity,
  t.available_spots,
  t.discount_price_adult,
  t.discount_price_child,
  t.original_price_adult,
  
  -- Customization status
  t.is_customized,
  t.is_detached,
  t.frozen_fields,
  t.customization_timestamp,
  t.instance_note,
  
  -- Promotional pricing
  t.promo_discount_percent,
  t.promo_discount_value,
  CASE 
    WHEN t.promo_discount_percent IS NOT NULL THEN 
      t.original_price_adult - (t.original_price_adult * t.promo_discount_percent / 100)
    WHEN t.promo_discount_value IS NOT NULL THEN 
      t.original_price_adult - t.promo_discount_value
    ELSE t.discount_price_adult
  END AS effective_price_adult,
  
  -- Template and schedule relationships
  t.parent_template_id,
  t.parent_schedule_id,
  template.tour_name as template_name,
  s.recurrence_type,
  s.start_date as schedule_start_date,
  s.end_date as schedule_end_date,
  
  -- Operator information
  t.operator_id,
  o.company_name,
  
  -- Override summary
  CASE 
    WHEN t.is_detached THEN 'Detached'
    WHEN t.is_customized THEN 'Customized'
    WHEN t.activity_type = 'template' THEN 'Template'
    WHEN t.activity_type = 'scheduled' THEN 'Scheduled'
    ELSE 'Last Minute'
  END as management_status,
  
  -- Customization summary
  CASE 
    WHEN array_length(t.frozen_fields, 1) > 0 THEN 
      'Frozen: ' || array_to_string(t.frozen_fields, ', ')
    ELSE NULL
  END as frozen_fields_summary

FROM public.tours t
LEFT JOIN public.tours template ON t.parent_template_id = template.id
LEFT JOIN public.schedules s ON t.parent_schedule_id = s.id
LEFT JOIN public.operators o ON t.operator_id = o.id
WHERE t.is_template = FALSE -- Exclude templates from management view
ORDER BY t.tour_date DESC, t.time_slot ASC;

-- ==============================================================================
-- PHASE 4F: UPDATE EXISTING SCHEDULED TOURS
-- ==============================================================================

-- Populate parent_schedule_id for existing scheduled tours
UPDATE public.tours SET parent_schedule_id = (
  SELECT s.id 
  FROM public.schedules s 
  WHERE s.tour_id = tours.parent_template_id
  LIMIT 1
)
WHERE activity_type = 'scheduled' 
  AND parent_template_id IS NOT NULL 
  AND parent_schedule_id IS NULL;

-- ==============================================================================
-- PHASE 4G: GRANTS AND PERMISSIONS
-- ==============================================================================

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION public.apply_tour_customization(UUID, JSONB, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_update_scheduled_tours(UUID, JSONB, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.detach_tour_from_schedule(UUID) TO authenticated;

-- Grant permissions for new view
GRANT SELECT ON public.tour_management_dashboard TO authenticated, anon;

-- ==============================================================================
-- PHASE 4H: TRIGGERS FOR AUTOMATIC PROCESSING
-- ==============================================================================

-- Trigger: Auto-populate parent_schedule_id when scheduled tours are created
CREATE OR REPLACE FUNCTION public.auto_populate_schedule_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a scheduled tour being created, try to find its parent schedule
  IF NEW.activity_type = 'scheduled' AND NEW.parent_template_id IS NOT NULL AND NEW.parent_schedule_id IS NULL THEN
    SELECT s.id INTO NEW.parent_schedule_id
    FROM public.schedules s 
    WHERE s.tour_id = NEW.parent_template_id
    ORDER BY s.created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_populate_schedule_relationship_trigger ON public.tours;
CREATE TRIGGER auto_populate_schedule_relationship_trigger
  BEFORE INSERT ON public.tours
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_populate_schedule_relationship();

-- Trigger: Auto-set customization timestamp
CREATE OR REPLACE FUNCTION public.auto_set_customization_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- If tour is being marked as customized, set timestamp
  IF NEW.is_customized = TRUE AND (OLD.is_customized IS NULL OR OLD.is_customized = FALSE) THEN
    NEW.customization_timestamp = NOW();
  END IF;
  
  -- If tour is being un-customized, clear timestamp
  IF NEW.is_customized = FALSE AND OLD.is_customized = TRUE THEN
    NEW.customization_timestamp = NULL;
    NEW.frozen_fields = '{}';
    NEW.overrides = '{}';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_set_customization_timestamp_trigger ON public.tours;
CREATE TRIGGER auto_set_customization_timestamp_trigger
  BEFORE UPDATE ON public.tours
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_set_customization_timestamp();

-- ==============================================================================
-- MIGRATION VERIFICATION AND LOGGING
-- ==============================================================================

-- Verification checks
DO $$
DECLARE
  override_columns_count INTEGER;
  scheduled_tours_count INTEGER;
  tours_with_schedule_id INTEGER;
BEGIN
  -- Check that all new columns were added
  SELECT COUNT(*) INTO override_columns_count
  FROM information_schema.columns 
  WHERE table_name = 'tours' 
    AND table_schema = 'public'
    AND column_name IN ('parent_schedule_id', 'is_customized', 'frozen_fields', 'overrides', 'is_detached', 'promo_discount_percent', 'promo_discount_value', 'instance_note', 'customization_timestamp');
  
  IF override_columns_count != 9 THEN
    RAISE EXCEPTION 'Migration failed: Expected 9 new columns, found %', override_columns_count;
  END IF;
  
  -- Check that scheduled tours have parent_schedule_id populated
  SELECT COUNT(*) INTO scheduled_tours_count FROM public.tours WHERE activity_type = 'scheduled';
  SELECT COUNT(*) INTO tours_with_schedule_id FROM public.tours WHERE activity_type = 'scheduled' AND parent_schedule_id IS NOT NULL;
  
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'INDIVIDUAL TOUR OVERRIDE SYSTEM MIGRATION COMPLETED';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'New override columns added: %', override_columns_count;
  RAISE NOTICE 'Scheduled tours found: %', scheduled_tours_count;
  RAISE NOTICE 'Tours with schedule relationship: %', tours_with_schedule_id;
  RAISE NOTICE 'New functions created: 3 (apply_tour_customization, bulk_update_scheduled_tours, detach_tour_from_schedule)';
  RAISE NOTICE 'New view created: tour_management_dashboard';
  RAISE NOTICE 'New triggers created: 2 (auto relationship & timestamp)';
  RAISE NOTICE 'Database ready for individual tour management';
  RAISE NOTICE '===============================================';
END $$;

COMMENT ON TABLE public.tours IS 
'Tours table with individual tour override system. Supports templates, scheduled tours, and individual customizations with override protection.';

COMMENT ON COLUMN public.tours.parent_schedule_id IS 
'Links scheduled tours to their generating schedule for bulk update coordination.';

COMMENT ON COLUMN public.tours.is_customized IS 
'Indicates if tour has been individually customized. Protects from bulk updates.';

COMMENT ON COLUMN public.tours.frozen_fields IS 
'Array of field names that should not be updated by bulk operations.';

COMMENT ON COLUMN public.tours.overrides IS 
'JSONB storage for individual tour customizations and change history.';

COMMENT ON COLUMN public.tours.is_detached IS 
'Indicates if tour has been completely detached from its schedule/template.';

COMMENT ON VIEW public.tour_management_dashboard IS 
'Comprehensive view for individual tour management with customization status and effective pricing.';