-- Migration: Fix Critical Tour Customization Bugs
-- Description: Fix array handling and data copying issues
-- Created: 2025-09-09
-- Migration ID: 20250909000003

-- ==============================================================================
-- FIX #1: CORRECT TOUR CUSTOMIZATION FUNCTION
-- ==============================================================================

-- Fixed version of apply_tour_customization function
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
  field_name TEXT;
  field_value TEXT;
  update_sql TEXT;
  set_clauses TEXT[] := '{}';
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
          set_clauses := set_clauses || ('discount_price_adult = ' || field_value);
        END IF;
      WHEN 'discount_price_child' THEN
        IF field_value = '' OR field_value IS NULL THEN
          set_clauses := set_clauses || 'discount_price_child = NULL';
        ELSIF field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('discount_price_child = ' || field_value);
        END IF;
      WHEN 'max_capacity' THEN
        IF field_value IS NOT NULL AND field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('max_capacity = ' || field_value);
          set_clauses := set_clauses || ('available_spots = ' || field_value);
        END IF;
      WHEN 'meeting_point' THEN
        set_clauses := set_clauses || ('meeting_point = ' || quote_literal(field_value));
      WHEN 'special_notes' THEN
        set_clauses := set_clauses || ('special_notes = ' || quote_literal(field_value));
      WHEN 'instance_note' THEN
        set_clauses := set_clauses || ('instance_note = ' || quote_literal(field_value));
      WHEN 'promo_discount_percent' THEN
        IF field_value = '' OR field_value IS NULL THEN
          set_clauses := set_clauses || 'promo_discount_percent = NULL';
        ELSIF field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('promo_discount_percent = ' || field_value);
        END IF;
      WHEN 'promo_discount_value' THEN
        IF field_value = '' OR field_value IS NULL THEN
          set_clauses := set_clauses || 'promo_discount_value = NULL';
        ELSIF field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('promo_discount_value = ' || field_value);
        END IF;
      WHEN 'status' THEN
        IF field_value IN ('active', 'sold_out', 'cancelled', 'completed') THEN
          set_clauses := set_clauses || ('status = ' || quote_literal(field_value));
        END IF;
      ELSE
        -- Ignore unknown fields
        CONTINUE;
    END CASE;
  END LOOP;
  
  -- Build and execute update if we have clauses
  IF array_length(set_clauses, 1) > 0 THEN
    -- Build UPDATE statement
    update_sql := 'UPDATE public.tours SET ' || array_to_string(set_clauses, ', ');
    
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

-- ==============================================================================
-- FIX #2: CORRECT BULK UPDATE FUNCTION
-- ==============================================================================

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
  set_clauses TEXT[] := '{}';
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
    
    -- Build update clauses safely
    set_clauses := '{}';
    
    FOR field_name IN SELECT jsonb_object_keys(updates)
    LOOP
      CASE field_name
        WHEN 'discount_price_adult' THEN
          set_clauses := set_clauses || ('discount_price_adult = ' || (updates->>field_name));
        WHEN 'discount_price_child' THEN
          IF (updates->>field_name) = '' OR (updates->>field_name) IS NULL THEN
            set_clauses := set_clauses || 'discount_price_child = NULL';
          ELSE
            set_clauses := set_clauses || ('discount_price_child = ' || (updates->>field_name));
          END IF;
        WHEN 'max_capacity' THEN
          set_clauses := set_clauses || ('max_capacity = ' || (updates->>field_name));
          set_clauses := set_clauses || ('available_spots = ' || (updates->>field_name));
        WHEN 'meeting_point' THEN
          set_clauses := set_clauses || ('meeting_point = ' || quote_literal(updates->>field_name));
        WHEN 'special_notes' THEN
          set_clauses := set_clauses || ('special_notes = ' || quote_literal(updates->>field_name));
        ELSE
          CONTINUE;
      END CASE;
    END LOOP;
    
    -- Execute update if we have clauses
    IF array_length(set_clauses, 1) > 0 THEN
      update_sql := 'UPDATE public.tours SET ' || array_to_string(set_clauses, ', ');
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

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Critical bug fixes applied successfully';
  RAISE NOTICE 'Fixed: apply_tour_customization function array handling';
  RAISE NOTICE 'Fixed: bulk_update_scheduled_tours function array handling';
END $$;