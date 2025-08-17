ALTER TABLE operators ADD COLUMN IF NOT EXISTS operator_role VARCHAR(50) DEFAULT 'onboarding';
UPDATE operators SET operator_role = 'verified' WHERE status = 'active';

-- Add helpful comment
COMMENT ON COLUMN operators.operator_role IS 'Role-based access control: onboarding, verified, premium, etc.';

-- Verify the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'operators' AND column_name = 'operator_role'
    ) THEN
        RAISE NOTICE 'SUCCESS: operator_role column added to operators table';
    ELSE
        RAISE EXCEPTION 'FAILED: operator_role column not found';
    END IF;
END $$;