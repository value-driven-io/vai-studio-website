-- ALTERNATIVE FIX: More Robust NULL Handling for Tour Customization
-- This approach uses a different strategy for handling NULL values

DROP FUNCTION IF EXISTS public.apply_tour_customization(UUID, JSONB, TEXT[]);

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
  update_clauses TEXT[] := '{}';
  final_sql TEXT;
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
  
  -- Process each customization field individually using direct UPDATE statements
  -- This avoids array concatenation issues
  
  FOR field_name, field_value IN SELECT * FROM jsonb_each_text(customizations)
  LOOP
    CASE field_name
      WHEN 'discount_price_adult' THEN
        IF field_value IS NOT NULL AND field_value != '' AND field_value ~ '^\d+$' THEN
          EXECUTE 'UPDATE public.tours SET discount_price_adult = $1 WHERE id = $2' 
            USING field_value::INTEGER, tour_id_param;
        END IF;
        
      WHEN 'discount_price_child' THEN
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' THEN
          EXECUTE 'UPDATE public.tours SET discount_price_child = NULL WHERE id = $1' 
            USING tour_id_param;
        ELSIF field_value ~ '^\d+$' THEN
          EXECUTE 'UPDATE public.tours SET discount_price_child = $1 WHERE id = $2' 
            USING field_value::INTEGER, tour_id_param;
        END IF;
        
      WHEN 'max_capacity' THEN
        IF field_value IS NOT NULL AND field_value != '' AND field_value ~ '^\d+$' THEN
          EXECUTE 'UPDATE public.tours SET max_capacity = $1, available_spots = $1 WHERE id = $2' 
            USING field_value::INTEGER, tour_id_param;
        END IF;
        
      WHEN 'meeting_point' THEN
        IF field_value IS NOT NULL AND field_value != '' THEN
          EXECUTE 'UPDATE public.tours SET meeting_point = $1 WHERE id = $2' 
            USING field_value, tour_id_param;
        END IF;
        
      WHEN 'special_notes' THEN
        IF field_value IS NOT NULL THEN
          EXECUTE 'UPDATE public.tours SET special_notes = $1 WHERE id = $2' 
            USING field_value, tour_id_param;
        END IF;
        
      WHEN 'instance_note' THEN
        IF field_value IS NOT NULL THEN
          EXECUTE 'UPDATE public.tours SET instance_note = $1 WHERE id = $2' 
            USING field_value, tour_id_param;
        END IF;
        
      WHEN 'promo_discount_percent' THEN
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' OR field_value = '0' THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_percent = NULL WHERE id = $1' 
            USING tour_id_param;
        ELSIF field_value ~ '^\d+$' AND field_value::INTEGER BETWEEN 1 AND 100 THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_percent = $1 WHERE id = $2' 
            USING field_value::INTEGER, tour_id_param;
        END IF;
        
      WHEN 'promo_discount_value' THEN
        -- FIX: Direct execution instead of array building
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' OR field_value = '0' THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_value = NULL WHERE id = $1' 
            USING tour_id_param;
        ELSIF field_value ~ '^\d+$' AND field_value::INTEGER > 0 THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_value = $1 WHERE id = $2' 
            USING field_value::INTEGER, tour_id_param;
        END IF;
        
      WHEN 'status' THEN
        IF field_value IN ('active', 'sold_out', 'cancelled', 'completed') THEN
          EXECUTE 'UPDATE public.tours SET status = $1 WHERE id = $2' 
            USING field_value, tour_id_param;
        END IF;
        
      ELSE
        -- Ignore unknown fields
        CONTINUE;
    END CASE;
  END LOOP;
  
  -- Update customization metadata
  UPDATE public.tours SET
    is_customized = TRUE,
    customization_timestamp = NOW(),
    overrides = COALESCE(overrides, '{}'::JSONB) || customizations,
    frozen_fields = COALESCE(frozen_fields_param, '{}')
  WHERE id = tour_id_param;
  
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
    RAISE NOTICE 'Error in apply_tour_customization: %', SQLERRM;
    RETURN QUERY SELECT FALSE, NULL::JSONB, ('Error applying customization: ' || SQLERRM)::TEXT;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.apply_tour_customization(UUID, JSONB, TEXT[]) TO authenticated;

-- Test the function
SELECT 'Alternative fix applied - using direct EXECUTE statements instead of array building' as status;