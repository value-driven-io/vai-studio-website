-- HOTFIX: Update status validation in apply_tour_customization function
-- Adds missing 'paused' and 'hidden' status options to SQL function validation

-- PROBLEM: The apply_tour_customization function only accepts old status values
-- SOLUTION: Update the status validation to match database constraint

-- First drop the existing function to avoid signature conflicts
DROP FUNCTION IF EXISTS public.apply_tour_customization(UUID, JSONB, TEXT[]);

-- Recreate with the correct signature and updated status validation
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
  field_name TEXT;
  field_value TEXT;
  updated_tour JSONB;
BEGIN
  -- Validate tour exists and is a scheduled activity
  IF NOT EXISTS (
    SELECT 1 FROM public.tours
    WHERE id = tour_id_param
    AND activity_type = 'scheduled'
    AND is_template = FALSE
  ) THEN
    RETURN QUERY SELECT FALSE, '{}'::JSONB, 'Tour not found or not a scheduled activity'::TEXT;
    RETURN;
  END IF;

  -- Process each customization field using the proven PHASE1_ALTERNATIVE_FIX logic
  FOR field_name, field_value IN
    SELECT * FROM jsonb_each_text(customizations)
  LOOP
    CASE field_name
      WHEN 'original_price_adult' THEN
        IF field_value ~ '^\d+$' AND field_value::INTEGER > 0 THEN
          EXECUTE 'UPDATE public.tours SET original_price_adult = $1 WHERE id = $2'
            USING field_value::INTEGER, tour_id_param;
        END IF;

      WHEN 'discount_price_adult' THEN
        IF field_value ~ '^\d+$' AND field_value::INTEGER > 0 THEN
          EXECUTE 'UPDATE public.tours SET discount_price_adult = $1 WHERE id = $2'
            USING field_value::INTEGER, tour_id_param;
        END IF;

      WHEN 'discount_price_child' THEN
        IF field_value IS NOT NULL AND field_value != '' AND field_value ~ '^\d+$' THEN
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
        IF field_value = '' OR field_value IS NULL OR field_value = 'null' OR field_value = '0' THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_value = NULL WHERE id = $1'
            USING tour_id_param;
        ELSIF field_value ~ '^\d+$' AND field_value::INTEGER > 0 THEN
          EXECUTE 'UPDATE public.tours SET promo_discount_value = $1 WHERE id = $2'
            USING field_value::INTEGER, tour_id_param;
        END IF;

      WHEN 'status' THEN
        -- HOTFIX: Updated to include 'paused' and 'hidden' status options
        IF field_value IN ('active', 'sold_out', 'cancelled', 'completed', 'paused', 'hidden') THEN
          EXECUTE 'UPDATE public.tours SET status = $1 WHERE id = $2'
            USING field_value, tour_id_param;
        END IF;

      ELSE
        -- Ignore unknown fields
        CONTINUE;
    END CASE;
  END LOOP;

  -- Update customization metadata
  EXECUTE 'UPDATE public.tours SET
    is_customized = TRUE,
    frozen_fields = $1,
    overrides = $2,
    customization_timestamp = NOW(),
    updated_at = NOW()
    WHERE id = $3'
  USING frozen_fields_param, customizations, tour_id_param;

  -- Get updated tour data
  SELECT to_jsonb(t.*) INTO updated_tour
  FROM public.tours t
  WHERE t.id = tour_id_param;

  RETURN QUERY SELECT TRUE, updated_tour, 'Tour customization applied successfully'::TEXT;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.apply_tour_customization(UUID, JSONB, TEXT[]) TO authenticated;

-- Verification message
DO $$
BEGIN
  RAISE NOTICE 'HOTFIX APPLIED: Status validation in apply_tour_customization now includes paused and hidden options';
  RAISE NOTICE 'Valid status values: active, sold_out, cancelled, completed, paused, hidden';
END $$;