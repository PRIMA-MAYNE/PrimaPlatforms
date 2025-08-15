-- =====================================================
-- CREATE DEMO USER FOR CATALYST SYSTEM
-- Run this ONCE in Supabase SQL Editor if demo sign-in fails
-- =====================================================

-- Insert demo user directly into auth.users table
-- Note: This requires service role key or manual creation in Supabase Auth UI

-- OPTION 1: Create via Supabase Auth UI (Recommended)
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" 
-- 3. Use these details:
--    Email: demo@catalyst.edu
--    Password: CatalystDemo2024!
--    Email Confirmed: Yes
--    User Metadata: {"full_name": "Demo Teacher", "role": "teacher", "school_name": "Catalyst Demo Secondary School"}

-- OPTION 2: SQL Insert (Advanced - use if Auth UI doesn't work)
-- WARNING: Only use this if you understand Supabase auth internals

-- First, check if demo user already exists
SELECT id, email FROM auth.users WHERE email = 'demo@catalyst.edu';

-- If no results, the user doesn't exist and needs to be created
-- Use Supabase Dashboard > Authentication > Users > "Add User" instead of SQL

-- OPTION 3: Ensure demo school exists
-- This will be auto-created by the schema, but verify:
INSERT INTO public.schools (id, name, school_type, region, district, address, phone, email, principal_name)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Catalyst Demo Secondary School',
    'secondary',
    'Lusaka',
    'Lusaka Urban',
    '123 Education Street, Lusaka, Zambia',
    '+260-97-1234567',
    'admin@catalystdemo.edu.zm',
    'Mrs. Margaret Phiri'
) ON CONFLICT (id) DO NOTHING;

-- Verify the demo school was created
SELECT * FROM public.schools WHERE id = '11111111-1111-1111-1111-111111111111';

-- After creating the demo user via Dashboard, verify profile was created:
-- SELECT * FROM public.profiles WHERE email = 'demo@catalyst.edu';

-- =====================================================
-- MANUAL STEPS TO CREATE DEMO USER:
-- =====================================================
-- 1. Go to your Supabase project: https://mkheppdwmzylmiiaxelq.supabase.co
-- 2. Navigate to Authentication > Users
-- 3. Click "Add User"
-- 4. Fill in:
--    - Email: demo@catalyst.edu
--    - Password: CatalystDemo2024!
--    - Confirm: Yes
--    - User Metadata (Raw JSON):
--      {
--        "full_name": "Demo Teacher",
--        "role": "teacher", 
--        "school_name": "Catalyst Demo Secondary School"
--      }
-- 5. Click "Create User"
-- 6. The profile will be auto-created by the trigger
-- 7. Demo sign-in button should now work
-- =====================================================
