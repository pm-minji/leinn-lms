-- 테스트 계정 직접 생성 (SQL로)
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- 비밀번호: Test1234! (모든 계정 동일)

-- 먼저 기존 테스트 계정 삭제 (있다면)
DELETE FROM auth.users WHERE email IN ('admin@test.com', 'coach@test.com', 'learner@test.com');

-- 1. 관리자 테스트 계정 생성
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- auth.users에 삽입
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- users 테이블에 추가
  INSERT INTO users (id, email, name, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'admin@test.com',
    'Admin Test',
    'admin',
    NOW(),
    NOW()
  );
END $$;

-- 2. 코치 테스트 계정 생성
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- auth.users에 삽입
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'coach@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"coach"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- users 테이블에 추가
  INSERT INTO users (id, email, name, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'coach@test.com',
    'Coach Test',
    'coach',
    NOW(),
    NOW()
  );

  -- coaches 테이블에 추가
  INSERT INTO coaches (user_id, active, created_at)
  VALUES (new_user_id, true, NOW());
END $$;

-- 3. 학습자 테스트 계정 생성
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- auth.users에 삽입
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'learner@test.com',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"learner"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- users 테이블에 추가
  INSERT INTO users (id, email, name, role, created_at, updated_at)
  VALUES (
    new_user_id,
    'learner@test.com',
    'Learner Test',
    'learner',
    NOW(),
    NOW()
  );

  -- learners 테이블에 추가
  INSERT INTO learners (user_id, active, joined_at)
  VALUES (new_user_id, true, NOW());
END $$;

-- 4. skhansky@gmail.com을 관리자로 설정 (Google 로그인 후)
UPDATE users 
SET role = 'admin'
WHERE email = 'skhansky@gmail.com';

-- 확인 쿼리
SELECT 
  u.email,
  u.name,
  u.role,
  u.created_at,
  CASE 
    WHEN c.id IS NOT NULL THEN 'Coach'
    WHEN l.id IS NOT NULL THEN 'Learner'
    ELSE 'Admin Only'
  END as additional_role
FROM users u
LEFT JOIN coaches c ON u.id = c.user_id
LEFT JOIN learners l ON u.id = l.user_id
WHERE u.email IN ('skhansky@gmail.com', 'admin@test.com', 'coach@test.com', 'learner@test.com')
ORDER BY u.email;
