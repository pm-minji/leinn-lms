-- Grant coach access to joon@pm-minji.com
-- Run this in Supabase SQL Editor

-- Step 1: Check current status
SELECT 'Current User Status:' as info;
SELECT id, email, name, role
FROM public.users
WHERE email = 'joon@pm-minji.com';

SELECT 'Current Coach Status:' as info;
SELECT c.id, c.user_id, c.active
FROM public.coaches c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'joon@pm-minji.com';

-- Step 2: First ensure user exists in public.users
INSERT INTO public.users (id, email, name, role, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Joon'),
  'admin',
  NOW()
FROM auth.users
WHERE email = 'joon@pm-minji.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin';

-- Step 3: Insert or update coach record
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

-- Verify coaches
SELECT 'After Update:' as info;
SELECT c.id, c.user_id, c.active, u.email
FROM public.coaches c
JOIN auth.users u ON c.user_id = u.id
WHERE u.email = 'joon@pm-minji.com';

-- Step 4: Also ensure learner record exists
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

SELECT 'Learner Status:' as info;
SELECT l.id, l.user_id, l.team_id, l.active, u.email
FROM public.learners l
JOIN auth.users u ON l.user_id = u.id
WHERE u.email = 'joon@pm-minji.com';
