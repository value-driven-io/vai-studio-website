-- PHASE 1 CRITICAL FIXES: Tour Customization & Schedule Update Bugs
-- Fixes two critical issues found during testing

-- ==============================================================================
-- FIX #1: Promo Discount NULL Handling in Customization
-- ==============================================================================

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
        IF field_value IS NOT NULL AND field_value != '' AND field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('discount_price_adult = ' || field_value);
        END IF;
      WHEN 'discount_price_child' THEN
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' THEN
          set_clauses := set_clauses || 'discount_price_child = NULL';
        ELSIF field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('discount_price_child = ' || field_value);
        END IF;
      WHEN 'max_capacity' THEN
        IF field_value IS NOT NULL AND field_value != '' AND field_value ~ '^\d+$' THEN
          set_clauses := set_clauses || ('max_capacity = ' || field_value);
          set_clauses := set_clauses || ('available_spots = ' || field_value);
        END IF;
      WHEN 'meeting_point' THEN
        IF field_value IS NOT NULL AND field_value != '' THEN
          set_clauses := set_clauses || ('meeting_point = ' || quote_literal(field_value));
        END IF;
      WHEN 'special_notes' THEN
        IF field_value IS NOT NULL THEN
          set_clauses := set_clauses || ('special_notes = ' || quote_literal(field_value));
        END IF;
      WHEN 'instance_note' THEN
        IF field_value IS NOT NULL THEN
          set_clauses := set_clauses || ('instance_note = ' || quote_literal(field_value));
        END IF;
      WHEN 'promo_discount_percent' THEN
        -- FIX: Better NULL handling for promo discount percent
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' OR field_value = '0' THEN
          set_clauses := set_clauses || 'promo_discount_percent = NULL';
        ELSIF field_value ~ '^\d+$' AND field_value::INTEGER BETWEEN 1 AND 100 THEN
          set_clauses := set_clauses || ('promo_discount_percent = ' || field_value);
        END IF;
      WHEN 'promo_discount_value' THEN
        -- FIX: Better NULL handling for promo discount value  
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' OR field_value = '0' THEN
          set_clauses := set_clauses || 'promo_discount_value = NULL';
        ELSIF field_value ~ '^\d+$' AND field_value::INTEGER > 0 THEN
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
      ', overrides = COALESCE(overrides, ''{}''::JSONB) || ' || quote_literal(customizations::TEXT) || '::JSONB';
      
    -- Handle frozen fields array properly
    IF frozen_fields_param IS NOT NULL AND array_length(frozen_fields_param, 1) > 0 THEN
      update_sql := update_sql || ', frozen_fields = ARRAY[' || 
        array_to_string(
          ARRAY(SELECT quote_literal(unnest) FROM unnest(frozen_fields_param) unnest), 
          ','
        ) || ']::TEXT[]';
    ELSE
      update_sql := update_sql || ', frozen_fields = ''{}''::"text"[]';
    END IF;
    
    -- Add WHERE clause  
    update_sql := update_sql || ' WHERE id = ' || quote_literal(tour_id_param::TEXT) || '::UUID';
    
    -- Log the SQL for debugging
    RAISE NOTICE 'Executing customization SQL: %', update_sql;
    
    -- Execute the update
    EXECUTE update_sql;
  ELSE
    -- Just mark as customized if no fields to update
    UPDATE public.tours SET
      is_customized = TRUE,
      customization_timestamp = NOW(),
      overrides = COALESCE(overrides, '{}'::JSONB) || customizations,
      frozen_fields = COALESCE(frozen_fields_param, '{}')
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
    -- Better error reporting
    RAISE NOTICE 'Error in apply_tour_customization: %, SQL: %', SQLERRM, COALESCE(update_sql, 'No SQL built');
    RETURN QUERY SELECT FALSE, NULL::JSONB, ('Error applying customization: ' || SQLERRM)::TEXT;
END;
$$;

-- ==============================================================================
-- FIX #2: Schedule Update UUID Handling
-- ==============================================================================

-- Create a helper function to safely get schedule relationships
CREATE OR REPLACE FUNCTION public.get_schedule_relationships(schedule_id_param UUID)
RETURNS TABLE(
  schedule_type TEXT,
  template_id UUID,
  template_data JSONB,
  legacy_tour_id UUID,
  legacy_tour_data JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schedule_type::TEXT,
    s.template_id,
    CASE 
      WHEN t.id IS NOT NULL THEN to_jsonb(t.*)
      ELSE NULL::JSONB
    END as template_data,
    s.tour_id as legacy_tour_id,
    CASE 
      WHEN lt.id IS NOT NULL THEN to_jsonb(lt.*)
      ELSE NULL::JSONB  
    END as legacy_tour_data
  FROM schedules s
  LEFT JOIN tours t ON s.template_id = t.id AND t.is_template = true
  LEFT JOIN tours lt ON s.tour_id = lt.id AND lt.is_template = false
  WHERE s.id = schedule_id_param;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.apply_tour_customization(UUID, JSONB, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_schedule_relationships(UUID) TO authenticated;

-- Test query to verify fixes
SELECT 'Critical fixes applied - ready for testing' as status;