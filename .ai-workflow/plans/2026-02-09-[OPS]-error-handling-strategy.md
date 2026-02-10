# Error Handling Strategy

> 생성일: 2026-02-09
> 상태: 🟡 계획 중

## 개요
시스템 안정성 강화를 위한 에러 핸들링 전략

---

## 1. Gemini API

### Potential 문제
- [ ] Rate limit / quota 초과
- [ ] API 응답 파싱 실패 (JSON 깨짐)
- [ ] Timeout (리포트 생성 60초+)
- [ ] API 일시 장애

### Contingency Plan
- [ ] Retry logic (3회, exponential backoff)
- [ ] JSON 파싱 실패 시 재시도 or fallback
- [ ] Timeout 설정 + 사용자에게 "생성 중" 상태 표시
- [ ] Circuit breaker 패턴 고려

---

## 2. Saju/Luck Cycle 계산

### Potential 문제
- [ ] 잘못된 날짜 형식
- [ ] lunar-typescript 예외
- [ ] 대운 범위 밖 나이 (100세+)
- [ ] birthTime null 처리

### Contingency Plan
- [ ] Input validation 강화
- [ ] try-catch + graceful fallback (대운 없이 진행)
- [ ] 에러 로깅

---

## 3. Database (Supabase)

### Potential 문제
- [ ] 연결 끊김 / pool exhaustion
- [ ] 쿼리 실패
- [ ] Row limit 초과 (free tier)
- [ ] 동시성 이슈

### Contingency Plan
- [ ] Connection retry
- [ ] Transaction rollback 처리
- [ ] DB health check endpoint
- [ ] 에러 시 사용자 메시지

---

## 4. Email (Resend)

### Potential 문제
- [ ] API 장애
- [ ] Rate limit (100/day free)
- [ ] 잘못된 이메일 주소

### Contingency Plan
- [ ] Retry queue
- [ ] 실패 시 로깅 + 나중에 재시도
- [ ] 이메일 검증 강화

---

## 5. Payment (Gumroad Webhook)

### Potential 문제
- [ ] Webhook 검증 실패
- [ ] 중복 처리 (같은 webhook 여러 번)
- [ ] 네트워크 지연으로 순서 꼬임

### Contingency Plan
- [ ] Idempotency key 체크
- [ ] Webhook 로깅
- [ ] 수동 unlock 백업 (관리자용)

---

## 6. Client-Side

### Potential 문제
- [ ] JS 에러로 화면 crash
- [ ] Network 실패
- [ ] 렌더링 에러

### Contingency Plan
- [ ] React Error Boundary
- [ ] Loading/Error 상태 UI
- [ ] Retry 버튼

---

## 7. Logging & Alerting

### 필요 사항
- [ ] 에러 로그 수집 (Sentry 등)
- [ ] Critical 에러 알림 (Slack/Email)
- [ ] 에러 대시보드

---

## 우선순위

| 순위 | 항목 | 이유 |
|------|------|------|
| 1 | Gemini API retry | 리포트 생성 핵심 |
| 2 | Client Error Boundary | UX 안정성 |
| 3 | Gumroad webhook 중복 방지 | 결제 신뢰성 |
| 4 | Logging (Sentry) | 디버깅 필수 |
| 5 | 나머지 | 점진적 개선 |

---

## 참고
- 현재 mock report fallback 있음 (Gemini 키 없을 때)
- Supabase는 자체 retry 있음
