-- Phase 1: Create the new 'schedules' table.
-- This is the new "filing cabinet" for recurring tours.
CREATE TABLE public.schedules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tour_id uuid NOT NULL,
    operator_id uuid NOT NULL,
    recurrence_type text NOT NULL, -- e.g., 'once', 'daily', 'weekly'
    days_of_week integer[], -- e.g., {1,3,5} for Mon, Wed, Fri
    start_time time without time zone NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    exceptions date[], -- Dates to skip in a recurring schedule
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT schedules_pkey PRIMARY KEY (id),
    CONSTRAINT schedules_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON DELETE CASCADE,
    CONSTRAINT schedules_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE
);

-- Add row-level security policies for the new table
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can view their own schedules." ON public.schedules
    FOR SELECT USING (auth.uid() = operator_id);

CREATE POLICY "Operators can insert their own schedules." ON public.schedules
    FOR INSERT WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Operators can update their own schedules." ON public.schedules
    FOR UPDATE USING (auth.uid() = operator_id);

CREATE POLICY "Operators can delete their own schedules." ON public.schedules
    FOR DELETE USING (auth.uid() = operator_id);

-- Phase 2: Safely alter the 'bookings' table.
-- We are adding two new *optional* columns. This does not affect existing data.
ALTER TABLE public.bookings
    ADD COLUMN schedule_id uuid NULL,
    ADD COLUMN booking_date date NOT NULL DEFAULT '1970-01-01', -- Add with a default, then remove it
    ADD CONSTRAINT bookings_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id) ON DELETE SET NULL;

-- Now remove the default after the column has been safely added
ALTER TABLE public.bookings
    ALTER COLUMN booking_date DROP DEFAULT;