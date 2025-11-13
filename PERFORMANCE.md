# LEINN LMS 성능 최적화 가이드

## 이미 적용된 최적화

### 1. React Query 캐싱

`lib/query/query-client.ts`에서 설정:

```typescript
{
  staleTime: 60 * 1000,        // 1분 - 데이터가 신선한 것으로 간주되는 시간
  gcTime: 5 * 60 * 1000,       // 5분 - 캐시 유지 시간
  retry: 1,                     // 실패 시 1회 재시도
  refetchOnWindowFocus: false,  // 윈도우 포커스 시 자동 재조회 비활성화
}
```

### 2. Next.js 최적화

`next.config.ts`에서 설정:

- **Image Optimization**: AVIF, WebP 포맷 지원
- **Compression**: Gzip 압력 활성화
- **Package Optimization**: Supabase, React Query 최적화
- **Security Headers**: 보안 헤더 자동 추가

### 3. React Compiler

- React 19의 새로운 컴파일러 활성화
- 자동 메모이제이션
- 불필요한 리렌더링 방지

## 데이터베이스 최적화

### 인덱스 생성

Supabase에서 다음 인덱스를 생성하세요:

```sql
-- reflections 테이블
CREATE INDEX idx_reflections_learner_id ON reflections(learner_id);
CREATE INDEX idx_reflections_status ON reflections(status);
CREATE INDEX idx_reflections_created_at ON reflections(created_at DESC);

-- learners 테이블
CREATE INDEX idx_learners_user_id ON learners(user_id);
CREATE INDEX idx_learners_team_id ON learners(team_id);

-- teams 테이블
CREATE INDEX idx_teams_active ON teams(active);

-- coaching_logs 테이블
CREATE INDEX idx_coaching_logs_coach_id ON coaching_logs(coach_id);
CREATE INDEX idx_coaching_logs_learner_id ON coaching_logs(learner_id);
CREATE INDEX idx_coaching_logs_team_id ON coaching_logs(team_id);
CREATE INDEX idx_coaching_logs_session_date ON coaching_logs(session_date DESC);

-- ai_prompts 테이블
CREATE INDEX idx_ai_prompts_active ON ai_prompts(is_active);
```

### 쿼리 최적화

#### Before (N+1 문제)
```typescript
// 각 리플렉션마다 별도 쿼리
const reflections = await supabase.from('reflections').select('*');
for (const reflection of reflections) {
  const learner = await supabase
    .from('learners')
    .select('*')
    .eq('id', reflection.learner_id)
    .single();
}
```

#### After (JOIN 사용)
```typescript
// 한 번의 쿼리로 모든 데이터 조회
const reflections = await supabase
  .from('reflections')
  .select(`
    *,
    learner:learners(
      id,
      user:users(name, email)
    )
  `);
```

## 프론트엔드 최적화

### 1. 코드 스플리팅

동적 import 사용:

```typescript
// Before
import { HeavyComponent } from './HeavyComponent';

// After
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

### 2. 이미지 최적화

Next.js Image 컴포넌트 사용:

```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  priority={false}
/>
```

### 3. 폰트 최적화

`next/font` 사용 (이미 적용됨):

```typescript
import { Geist } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});
```

### 4. 번들 크기 최적화

불필요한 import 제거:

```typescript
// Before
import _ from 'lodash';

// After
import debounce from 'lodash/debounce';
```

## API 최적화

### 1. 응답 캐싱

```typescript
export const revalidate = 60; // 60초마다 재검증

export async function GET() {
  // 캐시된 응답 반환
}
```

### 2. 페이지네이션

```typescript
const { data, error } = await supabase
  .from('reflections')
  .select('*')
  .range(0, 9) // 10개씩
  .order('created_at', { ascending: false });
```

### 3. 필요한 필드만 조회

```typescript
// Before
.select('*')

// After
.select('id, title, status, created_at')
```

## AI 분석 최적화

### 1. 타임아웃 설정

`lib/ai/analyzer.ts`에 이미 적용:

```typescript
const ANALYSIS_TIMEOUT_MS = 30000; // 30초
```

### 2. 재시도 로직

```typescript
{
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
}
```

### 3. 프롬프트 최적화

- 불필요한 내용 제거
- 명확한 지시사항
- 적절한 토큰 수 유지

## 성능 측정

### Lighthouse 실행

```bash
# Chrome DevTools에서
1. F12 (개발자 도구 열기)
2. Lighthouse 탭
3. "Analyze page load" 클릭
```

### 목표 점수

- **Performance**: 90+ 
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

### Core Web Vitals 목표

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 모니터링

### Vercel Analytics

실시간 성능 지표 확인:

- Page load time
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

### Sentry Performance

API 응답 시간 추적:

- 평균 응답 시간
- P95, P99 응답 시간
- 느린 트랜잭션 식별

## 최적화 체크리스트

### 배포 전

- [ ] Lighthouse 점수 확인
- [ ] 번들 크기 확인 (`npm run build`)
- [ ] 이미지 최적화 확인
- [ ] 불필요한 console.log 제거
- [ ] 타입 에러 확인

### 배포 후

- [ ] 실제 사용자 성능 지표 확인
- [ ] API 응답 시간 모니터링
- [ ] 에러율 확인
- [ ] 데이터베이스 쿼리 성능 확인

## 추가 최적화 아이디어

### 1. Service Worker

오프라인 지원 및 캐싱:

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
});

module.exports = withPWA({
  // config
});
```

### 2. CDN 활용

정적 자산을 CDN에 배포:

- Vercel은 자동으로 CDN 사용
- 이미지, CSS, JS 파일 캐싱

### 3. Database Connection Pooling

Supabase는 자동으로 connection pooling 제공

### 4. Redis 캐싱

자주 조회되는 데이터 캐싱:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// 캐시 조회
const cached = await redis.get('key');
if (cached) return cached;

// 데이터 조회 및 캐싱
const data = await fetchData();
await redis.set('key', data, { ex: 3600 }); // 1시간
```

## 성능 문제 해결

### 느린 페이지 로드

1. Network 탭에서 느린 요청 확인
2. 불필요한 데이터 조회 제거
3. 이미지 최적화
4. 코드 스플리팅 적용

### 높은 메모리 사용

1. 메모리 프로파일링
2. 메모리 누수 확인
3. 큰 객체 최적화
4. 캐시 크기 조정

### 느린 AI 분석

1. 프롬프트 길이 최적화
2. 타임아웃 조정
3. 재시도 로직 개선
4. 병렬 처리 고려

## 참고 자료

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Web.dev Performance](https://web.dev/performance/)
