-- Set joon@pm-minji.com as super admin with coach and learner access
-- This migration should be run after the user has signed up

-- Update user role to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'joon@pm-minji.com';

-- Insert or update in users table
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

-- Create coach record for admin (so they can access coach features)
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

-- Create learner record for admin (so they can access learner features)
INSERT INTO public.learners (user_id, team_id, active, joined_at)
SELECT 
  id,
  NULL,
  true,
  NOW()
FROM auth.users
WHERE email = 'joon@pm-minji.com'
ON CONFLICT (user_id) 
DO NOTHING;
