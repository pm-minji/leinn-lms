-- Check current user status
SELECT id, email, raw_user_meta_data->>'role' as meta_role
FROM auth.users 
WHERE email = 'joon@pm-minji.com';

SELECT id, email, name, role
FROM public.users
WHERE email = 'joon@pm-minji.com';

SELECT user_id, specialty, active
FROM public.coaches
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'joon@pm-minji.com');

SELECT user_id, team_id, active
FROM public.learners
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'joon@pm-minji.com');

-- Fix: Set joon@pm-minji.com as admin with coach and learner access
-- Step 1: Update auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'joon@pm-minji.com';

-- Step 2: Insert or update in public.users table
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Joon'),
  'admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'joon@pm-minji.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Step 3: Create coach record
INSERT INTO public.coaches (user_id, active, created_at)
SELECT 
  id,
  true,
  NOW()
FROM auth.users
WHERE email = 'joon@pm-minji.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  active = true;

-- Step 4: Create learner record
INSERT INTO public.learners (user_id, team_id, active, joined_at)
SELECT 
  id,
  NULL,
  true,
  NOW()
FROM auth.users
WHERE email = 'joon@pm-minji.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  active = true;

-- Verify the changes
SELECT 'Auth Users:' as table_name;
SELECT id, email, raw_user_meta_data->>'role' as meta_role
FROM auth.users 
WHERE email = 'joon@pm-minji.com';

SELECT 'Public Users:' as table_name;
SELECT id, email, name, role
FROM public.users
WHERE email = 'joon@pm-minji.com';

SELECT 'Coaches:' as table_name;
SELECT user_id, specialty, active
FROM public.coaches
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'joon@pm-minji.com');

SELECT 'Learners:' as table_name;
SELECT user_id, team_id, active
FROM public.learners
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'joon@pm-minji.com');
