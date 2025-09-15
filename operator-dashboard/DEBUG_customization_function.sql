-- Debug: Check if the customization function was properly updated

-- 1. Check if function exists and get its definition
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'apply_tour_customization';

-- 2. Test the function with problematic data
-- Let's simulate the exact call that's failing
SELECT * FROM apply_tour_customization(
  '80e9336d-5fa9-4577-bbff-104f2b2c359c'::UUID,
  '{"discount_price_adult": "12000", "promo_discount_value": null}'::JSONB,
  NULL::TEXT[]
);

-- 3. Alternative test with string null
SELECT * FROM apply_tour_customization(
  '80e9336d-5fa9-4577-bbff-104f2b2c359c'::UUID, 
  '{"discount_price_adult": "12000", "promo_discount_value": "null"}'::JSONB,
  NULL::TEXT[]
);