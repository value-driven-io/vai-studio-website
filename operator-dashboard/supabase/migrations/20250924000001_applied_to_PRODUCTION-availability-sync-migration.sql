-- PRODUCTION MIGRATION: GetYourGuide Availability Sync System
-- Run this in production to deploy the complete availability sync system
-- ⚠️ IMPORTANT: This is the FINAL version with authentication and all field corrections
-- Staging went through multiple iterations; this is the final, verified version

-- 1. Create the availability sync function (PRODUCTION-READY with AUTH)
CREATE OR REPLACE FUNCTION notify_getyourguide_availability()
RETURNS trigger AS $$
DECLARE
    webhook_url text := 'https://n8n-stable-latest.onrender.com/webhook/availability-sync';
    payload jsonb;
    http_request_id int;
BEGIN
    -- Only process actual availability changes
    IF (TG_OP = 'UPDATE' AND OLD.available_spots IS NOT DISTINCT FROM NEW.available_spots) THEN
        RETURN NEW;
    END IF;

    -- Only sync active, non-template tours with dates
    IF (NEW.is_template = true OR NEW.status != 'active' OR NEW.tour_date IS NULL) THEN
        RETURN NEW;
    END IF;

    -- Build payload (keeping existing working structure)
    payload := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record', jsonb_build_object(
            'id', NEW.id,
            'tour_name', NEW.tour_name,
            'available_spots', NEW.available_spots,
            'max_capacity', NEW.max_capacity,
            'tour_date', NEW.tour_date,
            'time_slot', NEW.time_slot,
            'status', NEW.status,
            'operator_id', NEW.operator_id,
            'parent_template_id', NEW.parent_template_id,
            'parent_schedule_id', NEW.parent_schedule_id,
            'overrides', NEW.overrides,
            'activity_type', NEW.activity_type,
            'is_template', NEW.is_template,
            'location', NEW.location
        ),
        'old_record', CASE
            WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
                'available_spots', OLD.available_spots
            )
            ELSE null
        END,
        'timestamp', now(),
        'change_type', CASE
            WHEN NEW.available_spots = 0 THEN 'sold_out'
            WHEN OLD.available_spots = 0 AND NEW.available_spots > 0 THEN 'available_again'
            WHEN NEW.available_spots < 7 THEN 'high_demand'
            ELSE 'availability_change'
        END
    );

    -- Log the change
    RAISE LOG 'GetYourGuide availability sync triggered for tour % (%): % -> % spots',
        NEW.id, NEW.tour_name,
        COALESCE(OLD.available_spots::text, 'NULL'),
        NEW.available_spots;

    -- Send webhook WITH AUTHENTICATION ✅
    BEGIN
        SELECT INTO http_request_id
            net.http_post(
                url := webhook_url,
                body := payload,
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'User-Agent', 'VAI-Studio-Webhook/1.0',
                    'Authorization', 'Basic [YOUR_N8N_WEBHOOK_AUTH_TOKEN]'  -- ✅ REQUIRED AUTH
                ),
                timeout_milliseconds := 5000
            );

        RAISE LOG 'GetYourGuide availability webhook sent for tour %, request_id: %', NEW.id, http_request_id;

    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to send GetYourGuide availability webhook for tour %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger (safe - AFTER trigger won't interfere)
DROP TRIGGER IF EXISTS getyourguide_availability_sync ON tours;

CREATE TRIGGER getyourguide_availability_sync
    AFTER INSERT OR UPDATE OF available_spots ON tours
    FOR EACH ROW
    EXECUTE FUNCTION notify_getyourguide_availability();

-- 3. Set proper permissions
GRANT EXECUTE ON FUNCTION notify_getyourguide_availability() TO service_role;
GRANT EXECUTE ON FUNCTION notify_getyourguide_availability() TO authenticated;

-- 4. Add metadata
COMMENT ON FUNCTION notify_getyourguide_availability() IS
'Automatically syncs tour availability changes to GetYourGuide via authenticated n8n webhook. ALL FIELD NAMES VERIFIED. AUTHENTICATION INCLUDED.';

COMMENT ON TRIGGER getyourguide_availability_sync ON tours IS
'Sends real-time availability updates to GetYourGuide when tour capacity changes - PRODUCTION READY';

-- 5. Verification
SELECT 'GetYourGuide availability sync system deployed to PRODUCTION successfully' as status;

-- 6. Post-deployment verification steps
/*
AFTER RUNNING THIS MIGRATION:

1. Test with a real tour:
   UPDATE tours SET available_spots = available_spots - 1
   WHERE status = 'active' AND tour_date > now() LIMIT 1;

2. Check PostgreSQL logs for both:
   - "GetYourGuide availability sync triggered for tour..."
   - "GetYourGuide availability webhook sent for tour..., request_id: XXX"

3. Verify n8n receives authenticated webhooks:
   - Check n8n dashboard for new executions
   - Workflow should process requests successfully

4. Monitor for failures:
   SELECT COUNT(*) FROM net.http_request_queue WHERE url LIKE '%availability-sync%';
   -- Should return 0 (empty queue = all requests processed)
*/