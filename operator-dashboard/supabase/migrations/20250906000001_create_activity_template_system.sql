-- Migration: Create Activity Template System (Phase 1)
-- Description: Implement template-based activities with instance generation
-- Strategy: Add new tables alongside existing system (gradual migration)
-- Impact: No breaking changes to existing tours/bookings system
-- Created: 2025-09-06
-- Migration ID: 20250906000001

-- ==============================================================================
-- PHASE 1: CREATE ACTIVITY TEMPLATES TABLE
-- ==============================================================================

-- Activity Templates: Reusable activity definitions (no specific dates/times)
CREATE TABLE IF NOT EXISTS public.activity_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic Information
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    activity_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Duration & Capacity 
    duration_hours NUMERIC(3,1),
    max_capacity INTEGER NOT NULL DEFAULT 1,
    min_capacity INTEGER DEFAULT 1,
    
    -- Pricing (in XPF - Pacific Franc)
    original_price_adult INTEGER NOT NULL,
    discount_price_adult INTEGER NOT NULL,
    discount_price_child INTEGER,
    
    -- Location & Logistics
    island_location VARCHAR(50) NOT NULL,
    meeting_point TEXT,
    special_requirements TEXT,
    equipment_provided TEXT,
    
    -- Media & Marketing
    photos JSONB DEFAULT '[]'::jsonb,
    video_links JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Business Logic
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    is_featured BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Booking Configuration
    advance_booking_hours INTEGER DEFAULT 24,
    cancellation_policy TEXT,
    
    -- Channel Manager Preparation
    channel_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT activity_templates_pricing_check CHECK (discount_price_adult <= original_price_adult),
    CONSTRAINT activity_templates_capacity_check CHECK (min_capacity <= max_capacity),
    CONSTRAINT activity_templates_island_check CHECK (
        island_location IN (
            'Tahiti', 'Moorea', 'Bora Bora', 'Huahine', 'Raiatea', 
            'Taha''a', 'Maupiti', 'Tikehau', 'Rangiroa', 'Fakarava', 
            'Nuku Hiva', 'Other'
        )
    )
);

-- Activity Templates Indexes for Performance
CREATE INDEX idx_activity_templates_operator_id ON public.activity_templates(operator_id);
CREATE INDEX idx_activity_templates_status ON public.activity_templates(status);
CREATE INDEX idx_activity_templates_island ON public.activity_templates(island_location);
CREATE INDEX idx_activity_templates_type ON public.activity_templates(activity_type);
CREATE INDEX idx_activity_templates_featured ON public.activity_templates(is_featured) WHERE is_featured = TRUE;

-- ==============================================================================
-- PHASE 2: CREATE ACTIVITY INSTANCES TABLE
-- ==============================================================================

-- Activity Instances: Generated from schedules, represent bookable time slots
CREATE TABLE IF NOT EXISTS public.activity_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relationships
    template_id UUID NOT NULL REFERENCES public.activity_templates(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    
    -- Instance-specific Information  
    instance_date DATE NOT NULL,
    instance_time TIME NOT NULL,
    
    -- Availability Management
    max_capacity INTEGER NOT NULL,
    available_spots INTEGER NOT NULL,
    booked_spots INTEGER DEFAULT 0,
    
    -- Instance Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'full')),
    
    -- Booking Window
    booking_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Override Capabilities (can override template settings per instance)
    override_price_adult INTEGER,
    override_price_child INTEGER,
    override_meeting_point TEXT,
    override_special_requirements TEXT,
    
    -- Weather & Conditions
    weather_dependent BOOLEAN DEFAULT FALSE,
    weather_status VARCHAR(20) DEFAULT 'unknown' CHECK (weather_status IN ('good', 'poor', 'cancelled', 'unknown')),
    
    -- Channel Manager Integration
    external_ids JSONB DEFAULT '{}'::jsonb, -- For storing channel-specific IDs
    channel_sync_status JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT activity_instances_capacity_check CHECK (available_spots <= max_capacity),
    CONSTRAINT activity_instances_booked_check CHECK (booked_spots >= 0 AND booked_spots <= max_capacity),
    CONSTRAINT activity_instances_spots_check CHECK (available_spots = max_capacity - booked_spots),
    CONSTRAINT activity_instances_future_date CHECK (instance_date >= CURRENT_DATE)
);

-- Activity Instances Indexes for Performance
CREATE INDEX idx_activity_instances_template_id ON public.activity_instances(template_id);
CREATE INDEX idx_activity_instances_schedule_id ON public.activity_instances(schedule_id);
CREATE INDEX idx_activity_instances_operator_id ON public.activity_instances(operator_id);
CREATE INDEX idx_activity_instances_date ON public.activity_instances(instance_date);
CREATE INDEX idx_activity_instances_date_time ON public.activity_instances(instance_date, instance_time);
CREATE INDEX idx_activity_instances_status ON public.activity_instances(status);
CREATE INDEX idx_activity_instances_available ON public.activity_instances(available_spots) WHERE available_spots > 0;

-- Composite indexes for common queries
CREATE INDEX idx_activity_instances_active_available ON public.activity_instances(status, instance_date, available_spots) 
    WHERE status = 'active' AND available_spots > 0;

-- ==============================================================================
-- PHASE 3: UPDATE SCHEDULES TABLE RELATIONSHIPS
-- ==============================================================================

-- Add template_id to schedules table (gradual migration approach)
ALTER TABLE public.schedules 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.activity_templates(id) ON DELETE CASCADE;

-- Add index for new relationship
CREATE INDEX IF NOT EXISTS idx_schedules_template_id ON public.schedules(template_id);

-- ==============================================================================
-- PHASE 4: CREATE ENHANCED VIEWS
-- ==============================================================================

-- View: Active Activity Templates with Operator Info
CREATE OR REPLACE VIEW public.active_activity_templates_with_operators AS
SELECT 
    at.*,
    -- Calculate discount percentage in view
    CASE 
        WHEN at.original_price_adult > 0 THEN 
            ROUND(((at.original_price_adult - at.discount_price_adult)::NUMERIC / at.original_price_adult::NUMERIC) * 100)
        ELSE 0
    END as discount_percentage,
    o.company_name,
    o.email,
    o.whatsapp_number,
    o.island as operator_island,
    o.status as operator_status,
    -- Calculate upcoming instances count
    (
        SELECT COUNT(*) 
        FROM public.activity_instances ti 
        WHERE ti.template_id = at.id 
        AND ti.status = 'active' 
        AND ti.instance_date >= CURRENT_DATE
    ) as upcoming_instances_count,
    -- Calculate total capacity for next 30 days
    (
        SELECT COALESCE(SUM(ti.available_spots), 0)
        FROM public.activity_instances ti 
        WHERE ti.template_id = at.id 
        AND ti.status = 'active' 
        AND ti.instance_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
    ) as available_capacity_30_days
FROM public.activity_templates at
JOIN public.operators o ON at.operator_id = o.id
WHERE at.status = 'active' 
AND o.status = 'active';

-- View: Active Tour Instances with Template and Operator Info (Tourist App)
CREATE OR REPLACE VIEW public.active_activity_instances_with_details AS
SELECT 
    ti.id,
    ti.template_id,
    ti.schedule_id,
    ti.operator_id,
    ti.instance_date as tour_date,
    ti.instance_time as time_slot,
    (ti.instance_date || ' ' || ti.instance_time)::TIMESTAMP as instance_datetime,
    ti.max_capacity,
    ti.available_spots,
    ti.booked_spots,
    ti.status as instance_status,
    ti.booking_deadline,
    ti.weather_status,
    
    -- Template Information
    at.activity_name as tour_name,
    at.activity_type as tour_type,
    at.description,
    at.duration_hours,
    at.island_location,
    at.meeting_point,
    at.special_requirements,
    at.equipment_provided,
    at.photos,
    at.video_links,
    at.tags,
    at.is_featured,
    
    -- Pricing (with override capability)
    COALESCE(ti.override_price_adult, at.discount_price_adult) as discount_price_adult,
    COALESCE(ti.override_price_child, at.discount_price_child) as discount_price_child,
    at.original_price_adult,
    -- Calculate discount percentage
    CASE 
        WHEN at.original_price_adult > 0 THEN 
            ROUND(((at.original_price_adult - at.discount_price_adult)::NUMERIC / at.original_price_adult::NUMERIC) * 100)
        ELSE 0
    END as discount_percentage,
    
    -- Operator Information
    o.company_name,
    o.email,
    o.whatsapp_number,
    o.island as operator_island,
    o.status as operator_status,
    
    -- Calculated fields for tourist app
    EXTRACT(EPOCH FROM ((ti.instance_date || ' ' || ti.instance_time)::TIMESTAMP - NOW())) / 3600 as hours_until_tour,
    CASE 
        WHEN ti.booking_deadline IS NOT NULL THEN
            EXTRACT(EPOCH FROM (ti.booking_deadline - NOW())) / 3600
        ELSE NULL
    END as hours_until_deadline
    
FROM public.activity_instances ti
JOIN public.activity_templates at ON ti.template_id = at.id
JOIN public.operators o ON ti.operator_id = o.id
WHERE ti.status = 'active' 
AND at.status = 'active'
AND o.status = 'active'
AND ti.available_spots > 0
AND ti.instance_date >= CURRENT_DATE
ORDER BY ti.instance_date ASC, ti.instance_time ASC;

-- ==============================================================================
-- PHASE 5: CREATE HELPER FUNCTIONS
-- ==============================================================================

-- Function: Generate tour instances from schedule
CREATE OR REPLACE FUNCTION public.generate_activity_instances_from_schedule(
    schedule_uuid UUID
) RETURNS TABLE(
    generated_count INTEGER,
    first_instance_date DATE,
    last_instance_date DATE
) AS $$
DECLARE
    schedule_record RECORD;
    template_record RECORD;
    iter_date DATE;
    end_date DATE;
    generated_instances INTEGER := 0;
    first_date DATE;
    last_date DATE;
BEGIN
    -- Get schedule details
    SELECT * INTO schedule_record FROM public.schedules WHERE id = schedule_uuid;
    
    IF schedule_record IS NULL THEN
        RAISE EXCEPTION 'Schedule not found: %', schedule_uuid;
    END IF;
    
    -- Get template details (check both tour_id and template_id for gradual migration)
    IF schedule_record.template_id IS NOT NULL THEN
        SELECT * INTO template_record FROM public.activity_templates WHERE id = schedule_record.template_id;
    ELSE
        -- Fallback to old system during migration
        RAISE NOTICE 'Schedule % does not have template_id set', schedule_uuid;
        RETURN;
    END IF;
    
    IF template_record IS NULL THEN
        RAISE EXCEPTION 'Template not found for schedule: %', schedule_uuid;
    END IF;
    
    -- Initialize dates
    iter_date := schedule_record.start_date;
    end_date := schedule_record.end_date;
    first_date := NULL;
    last_date := NULL;
    
    -- Generate instances based on recurrence type
    WHILE iter_date <= end_date LOOP
        DECLARE
            should_create_instance BOOLEAN := FALSE;
            day_of_week INTEGER;
        BEGIN
            -- Check if we should create instance for this date
            CASE schedule_record.recurrence_type
                WHEN 'once' THEN
                    should_create_instance := (iter_date = schedule_record.start_date);
                WHEN 'daily' THEN
                    should_create_instance := TRUE;
                WHEN 'weekly' THEN
                    day_of_week := EXTRACT(DOW FROM iter_date);
                    -- Convert Sunday=0 to Sunday=7 for consistency with days_of_week array
                    IF day_of_week = 0 THEN day_of_week := 7; END IF;
                    should_create_instance := (day_of_week = ANY(schedule_record.days_of_week));
                WHEN 'monthly' THEN
                    should_create_instance := (EXTRACT(DAY FROM iter_date) = EXTRACT(DAY FROM schedule_record.start_date));
            END CASE;
            
            -- Check exceptions
            IF should_create_instance AND schedule_record.exceptions IS NOT NULL THEN
                IF iter_date::TEXT = ANY(
                    SELECT jsonb_array_elements_text(schedule_record.exceptions::jsonb)
                ) THEN
                    should_create_instance := FALSE;
                END IF;
            END IF;
            
            -- Create instance if conditions are met
            IF should_create_instance THEN
                INSERT INTO public.activity_instances (
                    template_id,
                    schedule_id,
                    operator_id,
                    instance_date,
                    instance_time,
                    max_capacity,
                    available_spots,
                    booking_deadline
                ) VALUES (
                    template_record.id,
                    schedule_uuid,
                    template_record.operator_id,
                    iter_date,
                    schedule_record.start_time,
                    template_record.max_capacity,
                    template_record.max_capacity,
                    -- Calculate booking deadline
                    (iter_date || ' ' || schedule_record.start_time)::TIMESTAMP 
                    - INTERVAL '1 hour' * template_record.advance_booking_hours
                );
                
                generated_instances := generated_instances + 1;
                
                -- Track first and last dates
                IF first_date IS NULL THEN first_date := iter_date; END IF;
                last_date := iter_date;
            END IF;
            
            -- Increment date
            iter_date := iter_date + INTERVAL '1 day';
        END;
    END LOOP;
    
    -- Return results
    RETURN QUERY SELECT generated_instances, first_date, last_date;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PHASE 6: CREATE TRIGGERS
-- ==============================================================================

-- Trigger: Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_activity_templates_updated_at 
    BEFORE UPDATE ON public.activity_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_instances_updated_at 
    BEFORE UPDATE ON public.activity_instances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Auto-update available_spots when bookings change
CREATE OR REPLACE FUNCTION public.update_tour_instance_spots()
RETURNS TRIGGER AS $$
BEGIN
    -- Update available_spots = max_capacity - booked_spots
    NEW.available_spots := NEW.max_capacity - NEW.booked_spots;
    
    -- Auto-update status based on availability
    IF NEW.available_spots <= 0 THEN
        NEW.status := 'full';
    ELSIF NEW.status = 'full' AND NEW.available_spots > 0 THEN
        NEW.status := 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tour_instance_spots_trigger
    BEFORE INSERT OR UPDATE OF max_capacity, booked_spots
    ON public.activity_instances
    FOR EACH ROW EXECUTE FUNCTION public.update_tour_instance_spots();

-- ==============================================================================
-- PHASE 7: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on new tables
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_instances ENABLE ROW LEVEL SECURITY;

-- Activity Templates: Operators can only access their own templates
CREATE POLICY activity_templates_operator_policy ON public.activity_templates
    FOR ALL TO authenticated
    USING (
        operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Activity Templates: Public read access for active templates (for tourist app)
CREATE POLICY activity_templates_public_read ON public.activity_templates
    FOR SELECT TO anon, authenticated
    USING (status = 'active');

-- Tour Instances: Operators can manage their own instances
CREATE POLICY activity_instances_operator_policy ON public.activity_instances
    FOR ALL TO authenticated
    USING (
        operator_id IN (
            SELECT id FROM public.operators 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Tour Instances: Public read access for active instances (for tourist app)
CREATE POLICY activity_instances_public_read ON public.activity_instances
    FOR SELECT TO anon, authenticated
    USING (status = 'active' AND available_spots > 0 AND instance_date >= CURRENT_DATE);

-- ==============================================================================
-- PHASE 8: GRANTS AND PERMISSIONS
-- ==============================================================================

-- Grant permissions for tables
GRANT ALL ON public.activity_templates TO authenticated;
GRANT SELECT ON public.activity_templates TO anon;
GRANT ALL ON public.activity_instances TO authenticated;
GRANT SELECT ON public.activity_instances TO anon;

-- Grant permissions for views  
GRANT SELECT ON public.active_activity_templates_with_operators TO authenticated, anon;
GRANT SELECT ON public.active_activity_instances_with_details TO authenticated, anon;

-- Grant permissions for functions
GRANT EXECUTE ON FUNCTION public.generate_activity_instances_from_schedule(UUID) TO authenticated;

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

-- Log successful migration
INSERT INTO public.audit_logs (
    event_type, 
    table_name, 
    actor_type, 
    additional_info
) VALUES (
    'MIGRATION_COMPLETED',
    'activity_template_system',
    'system',
    jsonb_build_object(
        'migration_id', '20250906000001',
        'description', 'Activity Template System Created',
        'tables_added', ARRAY['activity_templates', 'activity_instances'],
        'views_added', ARRAY['active_activity_templates_with_operators', 'active_activity_instances_with_details'],
        'functions_added', ARRAY['generate_activity_instances_from_schedule'],
        'impact', 'No breaking changes - gradual migration approach'
    )
);

COMMENT ON TABLE public.activity_templates IS 
'Template-based activity definitions. Replaces single-date tours with reusable templates.';

COMMENT ON TABLE public.activity_instances IS 
'Generated instances from activity templates + schedules. Represents bookable time slots.';

COMMENT ON VIEW public.active_activity_instances_with_details IS 
'Tourist app view: Active bookable instances with all template and operator details.';