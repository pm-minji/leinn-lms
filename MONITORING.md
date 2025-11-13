# LEINN LMS 모니터링 가이드

## Vercel Analytics

### 활성화 방법

1. Vercel Dashboard > 프로젝트 선택
2. Analytics 탭으로 이동
3. "Enable Analytics" 클릭

### 확인 가능한 지표

- **Real-time visitors**: 실시간 방문자 수
- **Page views**: 페이지 조회수
- **Top pages**: 가장 많이 방문한 페이지
- **Top referrers**: 유입 경로
- **Devices**: 디바이스 분포 (Desktop, Mobile, Tablet)
- **Browsers**: 브라우저 분포

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: 2.5초 이하 목표
- **FID (First Input Delay)**: 100ms 이하 목표
- **CLS (Cumulative Layout Shift)**: 0.1 이하 목표

## Sentry 설정

### 1. Sentry 프로젝트 생성

1. [Sentry.io](https://sentry.io)에 로그인
2. "Create Project" 클릭
3. Platform: Next.js 선택
4. 프로젝트 이름 입력

### 2. 환경 변수 설정

Vercel Dashboard에 다음 환경 변수 추가:

```
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
```

### 3. Sentry 기능

#### Error Tracking
- 자동으로 JavaScript 에러 캡처
- 서버 사이드 에러 추적
- 에러 발생 시 스택 트레이스 제공

#### Performance Monitoring
- API 응답 시간 추적
- 페이지 로드 시간 측정
- 데이터베이스 쿼리 성능 모니터링

#### Session Replay
- 에러 발생 시 사용자 세션 재생
- 사용자 행동 패턴 분석
- 버그 재현 용이

### 4. 알림 설정

Sentry Dashboard에서:

1. Settings > Alerts
2. "Create Alert Rule" 클릭
3. 조건 설정:
   - Error rate threshold
   - Performance degradation
   - New issue created

4. 알림 채널 설정:
   - Email
   - Slack
   - Discord
   - Webhook

## 로그 모니터링

### Vercel Logs

실시간 로그 확인:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그 확인
vercel logs --follow
```

### 로그 레벨

- **DEBUG**: 개발 중 디버깅 정보
- **INFO**: 일반 정보 (API 호출, 작업 완료 등)
- **WARN**: 경고 (재시도 가능한 에러, 성능 저하 등)
- **ERROR**: 에러 (처리 실패, 예외 발생 등)

### 구조화된 로깅

모든 로그는 JSON 형식으로 출력:

```json
{
  "level": "error",
  "message": "Failed to analyze reflection",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "context": {
    "learner": "홍길동",
    "team": "Team Alpha",
    "error": {
      "name": "APIError",
      "message": "Gemini API timeout"
    }
  }
}
```

## 성능 모니터링

### 1. API 응답 시간

Sentry Performance에서 확인:

- `/api/reflections` - 리플렉션 조회
- `/api/reflections/[id]/analyze` - AI 분석
- `/api/teams` - 팀 목록

목표: 평균 응답 시간 < 500ms

### 2. 데이터베이스 쿼리

느린 쿼리 식별:

- Supabase Dashboard > Performance
- Query 실행 시간 확인
- 인덱스 최적화 필요 여부 판단

### 3. AI 분석 성능

- Gemini API 응답 시간 모니터링
- 타임아웃 발생 빈도 추적
- 재시도 횟수 분석

## 알림 및 대응

### Critical Errors

즉시 대응 필요:

- 데이터베이스 연결 실패
- AI API 완전 장애
- 인증 시스템 오류

### Warning Alerts

모니터링 필요:

- API 응답 시간 증가
- 에러율 상승 (> 1%)
- 메모리 사용량 증가

### 대응 절차

1. **에러 확인**
   - Sentry에서 에러 상세 확인
   - 영향 범위 파악 (사용자 수, 기능)

2. **원인 분석**
   - 스택 트레이스 확인
   - 관련 로그 검색
   - Session Replay 확인

3. **임시 조치**
   - 필요시 이전 버전으로 롤백
   - 장애 공지

4. **근본 원인 해결**
   - 코드 수정
   - 테스트
   - 배포

5. **사후 분석**
   - 재발 방지 대책 수립
   - 모니터링 개선

## 대시보드

### Vercel Dashboard

- 배포 상태
- 트래픽 현황
- 성능 지표

### Sentry Dashboard

- 에러 발생 추이
- 성능 지표
- 사용자 영향도

### Supabase Dashboard

- 데이터베이스 성능
- API 사용량
- 스토리지 사용량

## 정기 점검

### 일일 점검

- [ ] 에러율 확인 (< 1% 목표)
- [ ] API 응답 시간 확인
- [ ] 배포 상태 확인

### 주간 점검

- [ ] 성능 트렌드 분석
- [ ] 사용자 피드백 검토
- [ ] 로그 패턴 분석

### 월간 점검

- [ ] 인프라 비용 검토
- [ ] 보안 업데이트 확인
- [ ] 성능 최적화 계획

## 유용한 명령어

```bash
# Vercel 배포 상태 확인
vercel ls

# 특정 배포의 로그 확인
vercel logs [deployment-url]

# 환경 변수 확인
vercel env ls

# 프로젝트 정보 확인
vercel inspect
```

## 참고 자료

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/metrics)
