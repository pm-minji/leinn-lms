# LEINN LMS MVP

LEINN 스타일 학습 관리 시스템(LMS) MVP - 팀 기반 창업 교육을 위한 웹 애플리케이션

## 프로젝트 개요

이 시스템은 몬드라곤 대학의 LEINN 프로그램을 기반으로 한 "Learning-by-Doing" 교육 모델을 한국형 팀 기반 창업 교육에 맞게 구현합니다.

### 핵심 기능

#### 학습자 (Learner)
- 주간 리플렉션 작성 및 제출
- AI 피드백 및 코치 피드백 확인
- 개인 학습 대시보드

#### 코치 (Coach)
- 담당 팀 학습자 리플렉션 검토
- AI 분석 결과 참고
- 코치 피드백 작성
- 코칭 로그 기록 (1:1, 팀, 주간 세션)

#### 관리자 (Admin)
- 팀 생성 및 관리
- 학습자 팀 배정
- 코치 팀 할당
- 사용자 역할 관리
- AI 프롬프트 관리

### 주요 특징

- **AI 기반 분석**: Google Gemini를 활용한 리플렉션 자동 분석
- **동적 프롬프트**: 관리자가 AI 프롬프트를 직접 관리 및 테스트
- **역할 기반 접근 제어**: 학습자, 코치, 관리자별 권한 분리
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **실시간 모니터링**: Sentry 및 Vercel Analytics 통합

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Google OAuth)
- **AI**: Google Gemini API
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod
- **Monitoring**: Sentry, Vercel Analytics
- **Deployment**: Vercel

## 시작하기

### 필수 요구사항

- Node.js 20 이상
- npm 또는 yarn
- Supabase 계정
- Google Cloud Console 계정 (OAuth 2.0)
- Google Gemini API 키

### 설치 방법

1. 저장소 클론

```bash
git clone <repository-url>
cd leinn-lms
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env.local`로 복사하고 필요한 값을 입력하세요:

```bash
cp .env.example .env.local
```

4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
leinn-lms/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # 관리자 페이지
│   ├── (coach)/                  # 코치 페이지
│   ├── (learner)/                # 학습자 페이지
│   ├── api/                      # API Routes
│   └── auth/                     # 인증 페이지
├── components/                   # React 컴포넌트
│   ├── admin/                    # 관리자 컴포넌트
│   ├── coach/                    # 코치 컴포넌트
│   ├── dashboard/                # 대시보드 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   ├── reflections/              # 리플렉션 컴포넌트
│   └── ui/                       # 공통 UI 컴포넌트
├── lib/                          # 라이브러리 및 유틸리티
│   ├── ai/                       # AI 관련 로직
│   ├── auth/                     # 인증 관련
│   ├── query/                    # React Query 설정
│   ├── services/                 # 비즈니스 로직
│   ├── supabase/                 # Supabase 클라이언트
│   ├── utils/                    # 유틸리티 함수
│   └── validations/              # Zod 스키마
├── types/                        # TypeScript 타입 정의
├── public/                       # 정적 파일
└── supabase/                     # 데이터베이스 스키마
```

## 개발 가이드

### 코드 포맷팅

```bash
npm run format
```

### 린팅

```bash
npm run lint
```

### 타입 체크

```bash
npm run type-check
```

### 빌드

```bash
npm run build
```

## 문서

- [배포 가이드](./DEPLOYMENT.md) - Vercel 배포 및 환경 설정
- [모니터링 가이드](./MONITORING.md) - Sentry 및 로그 모니터링
- [성능 최적화](./PERFORMANCE.md) - 성능 최적화 가이드

## 배포

### 자동 배포

Vercel을 통해 자동 배포됩니다:

- `main` 브랜치 → 프로덕션 환경
- 기타 브랜치 → 프리뷰 환경

### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 환경 변수

필수 환경 변수는 `.env.example` 파일을 참고하세요:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 역할 키
- `GEMINI_API_KEY`: Google Gemini API 키

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스

MIT
