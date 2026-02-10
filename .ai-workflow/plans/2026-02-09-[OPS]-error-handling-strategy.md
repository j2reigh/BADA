# Error Handling Strategy

> 생성일: 2026-02-09
> 상태: 🟡 계획 중

## 개요
시스템 안정성 강화를 위한 에러 핸들링 전략

---

## AS-IS 현황

### Backend (server/routes.ts)
```typescript
// 현재 패턴
try {
  // ... 로직
} catch (err) {
  console.error("[Assessment] error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
}
```
- ✅ try/catch로 감싸져 있음
- ✅ Zod validation 에러 처리 (field별 메시지)
- ✅ console.error 로깅
- ❌ Retry 로직 없음
- ❌ 외부 로깅 서비스 없음 (Sentry 등)
- ❌ 에러 타입별 분기 처리 미흡

### Gemini API (lib/gemini_client.ts)
```typescript
// 현재 패턴
try {
  const result = await model.generateContent(...);
  return parseJSON(result.response.text());
} catch (error) {
  console.error("Report Generation Failed:", error);
  throw new Error(`Failed to generate...`);
}
```
- ✅ try/catch 있음
- ✅ API 키 없을 때 mock fallback
- ❌ Retry 없음 (rate limit, 일시 장애 시 바로 실패)
- ❌ JSON 파싱 실패 시 재시도 없음
- ❌ Timeout 설정 없음

### Client (React)
```typescript
// React Query 사용 (Wait.tsx, Results.tsx)
onError: (error: Error) => {
  // 처리
}
```
- ✅ React Query의 onError 핸들러 사용
- ✅ 일부 컴포넌트에 try/catch
- ❌ Global ErrorBoundary 없음 (JS 에러 시 white screen)
- ❌ 네트워크 에러 UI 미흡

### Database (Supabase/Drizzle)
- ✅ Drizzle ORM 사용
- ✅ 기본적인 try/catch
- ❌ Connection pool 관리 미확인
- ❌ Retry 없음

---

## TO-BE 개선안

### 1. Gemini API (우선순위: 높음)

**문제:** Rate limit, 일시 장애, JSON 파싱 실패 시 바로 실패

**해결:**
```typescript
// lib/gemini_client.ts에 추가
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
  throw new Error("Retry exhausted");
}
```

- [ ] Retry with exponential backoff (3회)
- [ ] JSON 파싱 실패 시 1회 재시도
- [ ] Timeout 설정 (90초)

### 2. Client ErrorBoundary (우선순위: 높음)

**문제:** JS 에러 시 white screen

**해결:**
```typescript
// client/src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
```

- [ ] Global ErrorBoundary 추가
- [ ] 친절한 에러 UI + 새로고침 버튼
- [ ] 에러 발생 시 Sentry 리포팅

### 3. Gumroad Webhook (우선순위: 중간)

**문제:** 중복 처리, 검증 실패

**현재 코드 확인 필요:**
- [ ] Idempotency 체크 있는지 확인
- [ ] 중복 purchase_id 방지

### 4. Logging (우선순위: 중간)

**문제:** console.error만 사용, 프로덕션에서 추적 불가

**해결:**
- [ ] Sentry 또는 LogRocket 연동
- [ ] Critical 에러 Slack 알림
- [ ] 에러 context 포함 (userId, reportId 등)

### 5. Email (Resend) (우선순위: 낮음)

**현재:** 실패 시 로그만 남김
```typescript
if (!emailResult.success) {
  console.error("[Assessment] Failed to send verification email:", emailResult.error);
}
```

**개선:**
- [ ] 실패 시 retry queue (optional)
- [ ] 실패 알림

---

## 우선순위 정리

| 순위 | 항목 | 이유 | 예상 작업량 |
|------|------|------|-------------|
| 1 | Gemini retry | 핵심 기능, 실패 시 리포트 생성 불가 | 1-2시간 |
| 2 | ErrorBoundary | UX 치명적 (white screen) | 30분 |
| 3 | Sentry 연동 | 프로덕션 디버깅 필수 | 1시간 |
| 4 | Gumroad 중복 방지 | 결제 신뢰성 | 확인 후 결정 |
| 5 | 나머지 | 점진적 개선 | - |

---

## 참고 파일
- `server/routes.ts` - 백엔드 에러 핸들링
- `lib/gemini_client.ts` - Gemini API 호출
- `client/src/pages/Wait.tsx` - React Query 에러 핸들링
- `lib/behavior_translator.ts:261` - Luck cycle try/catch
