-- Create the new 'waitlist' table to store email signups
CREATE TABLE public.waitlist (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT waitlist_pkey PRIMARY KEY (id),
    CONSTRAINT waitlist_email_key UNIQUE (email) -- Prevents duplicate email signups
);

-- IMPORTANT: Enable Row Level Security for the new table
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows ANYONE to sign up (insert their email)
-- This is safe because they cannot see or read any other data.
CREATE POLICY "Public can insert their own email for the waitlist"
    ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- As a safety measure, explicitly DISALLOW anyone from viewing the list from the browser.
-- Only you, from the Supabase dashboard or with your admin key, should be able to see the emails.
CREATE POLICY "No one can view the waitlist"
    ON public.waitlist
    FOR SELECT
    USING (false);
