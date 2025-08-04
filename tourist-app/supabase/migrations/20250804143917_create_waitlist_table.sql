-- Create the new 'waitlist' table to store email signups
CREATE TABLE public.waitlist (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    agreed_to_marketing boolean NOT NULL DEFAULT false,
    source text DEFAULT 'app',  -- Track where signup came from
    preferred_language text DEFAULT 'en',  -- Track user language
    user_agent text,  -- Track device info
    ip_country text,  -- Track location (if available)
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT waitlist_pkey PRIMARY KEY (id),
    CONSTRAINT waitlist_email_key UNIQUE (email)
);

-- Enable Row Level Security for the new table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for public email signup
CREATE POLICY "Public can insert their own email for the waitlist"
    ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- No one can view the waitlist from the app
CREATE POLICY "No one can view the waitlist"
    ON public.waitlist
    FOR SELECT
    USING (false);