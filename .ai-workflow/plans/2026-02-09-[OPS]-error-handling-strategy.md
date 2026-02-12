# Error Handling Strategy

> 생성일: 2026-02-09
> 상태: 🟢 분석 완료 → 구현 대기

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
- ✅ Drizzle ORM 사용 (SQL injection 방지)
- ✅ 기본적인 try/catch
- ✅ 서버 사이드 only (클라이언트에서 직접 접근 불가)
- ✅ `.env` gitignore 됨
- ❌ **RLS 비활성화** — 모든 테이블 `isRLSEnabled: false`
- ❌ Rate limiting 없음 — API abuse 방어 불가
- ❌ Helmet/CORS 미설정 — 기본 보안 헤더 없음
- ❌ Connection pool 관리 미확인
- ❌ Retry 없음

### API Security
- ✅ 이메일 인증 토큰 방식 (verificationToken)
- ❌ API 인증 없음 — 누구나 `/api/results/:id` 접근 가능
- ❌ Rate limiting 없음 — 무한 요청 가능
- ❌ Report ID enumeration 취약 — UUID지만 brute force 가능

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

- [x] Retry with exponential backoff (3회) ✅ **완료**
- [x] JSON 파싱 실패 시 재시도 ✅ **완료**
- [ ] Timeout 설정 (90초) — 선택사항

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

- [x] Global ErrorBoundary 추가 ✅ **완료**
- [x] 친절한 에러 UI + 새로고침 버튼 ✅ **완료**
- [ ] 에러 발생 시 Sentry 리포팅 — Sentry 연동 후

### 3. Gumroad Webhook (우선순위: 중간)

**문제:** Idempotency 미흡 — 중복 결제/리플레이 공격 방어 불가

**현재 코드 분석:**
```typescript
// server/routes.ts:622-677
app.post("/api/webhooks/gumroad", async (req, res) => {
  const { sale_id, ... } = req.body;
  // sale_id를 로그만 찍고 저장하지 않음!
  console.log(`[Gumroad] 💰 Sale ID: ${sale_id}, ...`);
  await storage.unlockReport(reportId);  // isPaid = true만 설정
});

// server/storage.ts:210-218
async unlockReport(id: string) {
  await db.update(sajuResults)
    .set({ isPaid: true })  // sale_id 미저장
    .where(eq(sajuResults.id, id));
}
```
- ❌ `sale_id` 미저장 → 중복 webhook 감지 불가
- ❌ 같은 `sale_id`로 여러 번 호출 시 매번 처리
- ❌ 1 결제 = N 리포트 unlock 가능 (버그)

**해결안:**
```typescript
// Option A: SajuResults에 paymentSaleId 컬럼 추가
sajuResults 테이블:
  + paymentSaleId: text (nullable, unique)

unlockReportWithPayment(id: string, saleId: string) {
  // 1. 이미 이 sale_id로 unlock된 리포트 있는지 확인
  const existing = await db.select().from(sajuResults)
    .where(eq(sajuResults.paymentSaleId, saleId));
  if (existing.length > 0) {
    return { success: false, reason: "DUPLICATE_SALE" };
  }
  // 2. unlock + sale_id 저장
  await db.update(sajuResults)
    .set({ isPaid: true, paymentSaleId: saleId })
    .where(eq(sajuResults.id, id));
}

// Option B: 별도 payments 테이블
payments 테이블:
  id, saleId (unique), reportId, amount, currency, createdAt
→ 결제 히스토리 추적 + 환불 처리 용이
```

- [ ] `paymentSaleId` 컬럼 추가 (최소 변경)
- [ ] Webhook에서 중복 `sale_id` 체크 후 거부
- [ ] (선택) 별도 `payments` 테이블로 확장

### 4. Logging (우선순위: 중간)

**문제:** console.error만 사용, 프로덕션에서 추적 불가

**해결:**
- [ ] Sentry 또는 LogRocket 연동
- [ ] Critical 에러 Slack 알림
- [ ] 에러 context 포함 (userId, reportId 등)

### 5. Database Security (우선순위: 높음)

**문제:** RLS 비활성화 — Supabase Security Advisor 경고

**현재 상태:**
```
Supabase Security Advisor 경고:
- RLS Disabled in Public: public.survey_results
- RLS Disabled in Public: public.birth_patterns
- RLS Disabled in Public: public.leads
- RLS Disabled in Public: public.saju_results
- RLS Disabled in Public: public.valid_codes
- RLS Disabled in Public: public.content_archetypes
```

**위험:**
- Supabase anon key 노출 시 모든 데이터 접근 가능
- 현재는 DATABASE_URL (직접 연결) 사용 중이라 실질적 위험 낮음
- 하지만 defense in depth 원칙상 활성화 권장

**해결: Supabase SQL Editor에서 실행**

```sql
-- ============================================
-- BADA RLS 활성화 스크립트
-- Supabase Dashboard → SQL Editor에서 실행
-- ============================================

-- 1. 모든 테이블 RLS 활성화
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saju_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valid_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_archetypes ENABLE ROW LEVEL SECURITY;

-- 2. 전체 접근 Policy 추가 (서버는 DATABASE_URL로 bypass하지만, 안전장치)
CREATE POLICY "Allow all for service" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON public.saju_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON public.valid_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON public.survey_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON public.birth_patterns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service" ON public.content_archetypes FOR ALL USING (true) WITH CHECK (true);
```

**참고:**
- `DATABASE_URL` 직접 연결은 RLS bypass (우리 서버)
- `anon key` 사용 시 RLS 적용됨 (현재 안 씀)
- Policy `USING (true)`는 "모두 허용" — 나중에 세분화 가능

- [x] Supabase RLS 활성화 ✅ **완료 (2026-02-11)**
- [x] express-rate-limit 추가 ✅ **완료**
  - General API: 100 req / 15분 / IP
  - Heavy endpoints (/api/assessment): 10 req / 15분 / IP
  - Webhooks: 제외
- [x] Helmet 보안 헤더 추가 ✅ **완료**
- [x] CORS 설정 명시적으로 지정 ✅ **완료**

### 6. Email (Resend) (우선순위: 낮음)

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

| 순위 | 항목 | 이유 | 상태 |
|------|------|------|------|
| 1 | **RLS 활성화** | Supabase Security Advisor 경고 | ✅ 완료 |
| 2 | **Gemini retry** | 핵심 기능, 실패 시 리포트 생성 불가 | ✅ 완료 |
| 3 | **ErrorBoundary** | UX 치명적 (white screen) | ✅ 완료 |
| 4 | Gumroad idempotency | 결제 신뢰성 (sale_id 미저장 확인됨) | ⬜ |
| 5 | **Rate Limiting** | API abuse 방지 | ✅ 완료 |
| 6 | Sentry 연동 | 프로덕션 디버깅 필수 | ⬜ |
| 7 | 나머지 | 점진적 개선 | ⬜ |

---

## 참고 파일
- `server/routes.ts` - 백엔드 에러 핸들링
- `lib/gemini_client.ts` - Gemini API 호출
- `client/src/pages/Wait.tsx` - React Query 에러 핸들링
- `lib/behavior_translator.ts:261` - Luck cycle try/catch
