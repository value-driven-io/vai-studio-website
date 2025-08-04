-- Phase 1: Create the new 'schedules' table.
CREATE TABLE public.schedules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tour_id uuid NOT NULL,
    operator_id uuid NOT NULL,
    recurrence_type text NOT NULL,
    days_of_week integer[],
    start_time time without time zone NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    exceptions date[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT schedules_pkey PRIMARY KEY (id),
    CONSTRAINT schedules_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE CASCADE,
    CONSTRAINT schedules_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE
);

-- Add row-level security policies for the new table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- ✅ FIXED: All policies use consistent auth pattern
CREATE POLICY "Operators can view their own schedules." ON public.schedules  
    FOR SELECT USING (auth.uid() IN (
        SELECT auth_user_id FROM operators WHERE id = schedules.operator_id
    ));

CREATE POLICY "Operators can insert their own schedules." ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT auth_user_id FROM operators WHERE id = schedules.operator_id
    ));

CREATE POLICY "Operators can update their own schedules." ON public.schedules
    FOR UPDATE USING (auth.uid() IN (
        SELECT auth_user_id FROM operators WHERE id = schedules.operator_id
    ));

CREATE POLICY "Operators can delete their own schedules." ON public.schedules
    FOR DELETE USING (auth.uid() IN (
        SELECT auth_user_id FROM operators WHERE id = schedules.operator_id
    ));

-- Phase 2: Safely alter the 'bookings' table.
ALTER TABLE public.bookings
    ADD COLUMN schedule_id uuid NULL,
    ADD COLUMN booking_date date NULL,
    ADD CONSTRAINT bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;