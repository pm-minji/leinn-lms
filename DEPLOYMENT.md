# LEINN LMS 배포 가이드

## Vercel 배포 설정

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 선택 및 Import

### 2. 환경 변수 설정

Vercel Dashboard의 프로젝트 설정에서 다음 환경 변수를 추가하세요:

#### Supabase 설정
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### AI 설정
```
GEMINI_API_KEY=your_gemini_api_key
```

#### 선택적 설정
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. 빌드 설정

Vercel은 자동으로 Next.js 프로젝트를 감지합니다. 기본 설정:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 4. 도메인 설정

1. Vercel Dashboard에서 "Domains" 탭으로 이동
2. 커스텀 도메인 추가 (선택사항)
3. DNS 설정 업데이트

### 5. 자동 배포 설정

- **Production Branch**: `main` 또는 `master`
- **Preview Branches**: 모든 브랜치에서 자동 프리뷰 배포
- **Pull Request**: PR마다 자동 프리뷰 생성

## Supabase 설정

### 1. 데이터베이스 마이그레이션

배포 전에 Supabase에서 다음을 확인하세요:

1. 모든 테이블이 생성되었는지 확인
2. RLS (Row Level Security) 정책이 적용되었는지 확인
3. 필요한 인덱스가 생성되었는지 확인

### 2. 인증 설정

Supabase Dashboard에서:

1. Authentication > URL Configuration
2. Site URL: `https://your-domain.vercel.app`
3. Redirect URLs: `https://your-domain.vercel.app/auth/callback`

### 3. CORS 설정

Supabase Dashboard에서:

1. Settings > API
2. CORS allowed origins에 Vercel 도메인 추가

## 배포 후 확인사항

### 1. 기능 테스트

- [ ] 로그인/로그아웃
- [ ] 리플렉션 작성
- [ ] AI 피드백 생성
- [ ] 코치 피드백 작성
- [ ] 관리자 기능

### 2. 성능 확인

- [ ] Lighthouse 점수 확인
- [ ] Core Web Vitals 확인
- [ ] API 응답 시간 확인

### 3. 보안 확인

- [ ] HTTPS 적용 확인
- [ ] 환경 변수 노출 확인
- [ ] RLS 정책 작동 확인

## 트러블슈팅

### 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 에러 확인
npm run type-check
```

### 환경 변수 문제

- Vercel Dashboard에서 환경 변수가 올바르게 설정되었는지 확인
- 변수 이름이 정확한지 확인 (대소문자 구분)
- 재배포 필요 (환경 변수 변경 후)

### Supabase 연결 문제

- Supabase URL과 키가 올바른지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- CORS 설정 확인

## 모니터링

### Vercel Analytics

1. Vercel Dashboard > Analytics 탭
2. 트래픽, 성능 지표 확인

### Vercel Logs

1. Vercel Dashboard > Deployments
2. 각 배포의 로그 확인
3. 런타임 에러 모니터링

## 롤백

문제 발생 시 이전 배포로 롤백:

1. Vercel Dashboard > Deployments
2. 이전 성공한 배포 선택
3. "Promote to Production" 클릭

## 추가 리소스

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
