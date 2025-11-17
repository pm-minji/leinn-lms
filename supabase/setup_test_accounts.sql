-- 테스트 계정 및 관리자 계정 설정
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. skhansky@gmail.com을 관리자로 설정
-- 먼저 해당 이메일로 가입한 후, 이 스크립트를 실행하세요
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'skhansky@gmail.com';

-- users 테이블에도 반영
UPDATE users 
SET role = 'admin'
WHERE email = 'skhansky@gmail.com';

-- 2. 테스트 계정 정보 (가입 후 역할 설정용)
-- 
-- 📧 테스트 계정 이메일:
-- - 관리자: admin@test.com (비밀번호: Test1234!)
-- - 코치: coach@test.com (비밀번호: Test1234!)
-- - 학습자: learner@test.com (비밀번호: Test1234!)
--
-- 가입 후 아래 SQL로 역할 설정:

-- 관리자 계정 설정
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@test.com';

UPDATE users 
SET role = 'admin'
WHERE email = 'admin@test.com';

-- 코치 계정 설정
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"coach"'
)
WHERE email = 'coach@test.com';

UPDATE users 
SET role = 'coach'
WHERE email = 'coach@test.com';

-- 코치 레코드 생성
INSERT INTO coaches (user_id, active)
SELECT id, true
FROM users
WHERE email = 'coach@test.com'
ON CONFLICT (user_id) DO NOTHING;

-- 학습자 계정 설정
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"learner"'
)
WHERE email = 'learner@test.com';

UPDATE users 
SET role = 'learner'
WHERE email = 'learner@test.com';

-- 학습자 레코드 생성
INSERT INTO learners (user_id, active)
SELECT id, true
FROM users
WHERE email = 'learner@test.com'
ON CONFLICT (user_id) DO NOTHING;

-- 확인 쿼리
SELECT 
  email,
  role,
  created_at
FROM users
WHERE email IN ('skhansky@gmail.com', 'admin@test.com', 'coach@test.com', 'learner@test.com')
ORDER BY email;
