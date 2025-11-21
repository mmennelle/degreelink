-- Add mmennell@uno.edu to advisor whitelist
-- Run this SQL script to add the initial advisor

INSERT INTO advisor_auth (
    email,
    is_active,
    failed_attempts,
    added_at,
    added_by
) VALUES (
    'mmennell@uno.edu',
    false,
    0,
    CURRENT_TIMESTAMP,
    'system_initialization'
)
ON CONFLICT (email) DO NOTHING;

-- Verify the advisor was added
SELECT id, email, added_at, added_by FROM advisor_auth WHERE email = 'mmennell@uno.edu';
