# 중복 제출 & 결제 시스템 개선

**작성일:** 2026-01-13
**문제:** 같은 이메일로 여러 번 제출 시 비용 중복 청구
**해결:** 중복 방지 + Gumroad/Lemon Squeezy 통합

---

## 🔴 현재 문제점

### 같은 이메일로 여러 번 제출하면:

```typescript
// 현재 로직 (server/routes.ts:169)
const sajuResult = await storage.createSajuResult({
  leadId: lead.id,  // 같은 lead_id
  userInput,
  sajuData: sajuData || {},
  reportData: reportData || {},  // 매번 Gemini API 호출! 💸
});
```

**비용 예시:**
- 1회 제출: Gemini API $0.10
- 10회 제출: $1.00
- 악의적 사용: 무제한 비용 💥

---

## ✅ 해결 방법 1: 기존 리포트 재사용

### 전략

1. **인증된 사용자**: 리포트 1개만 허용
2. **미인증 사용자**: 24시간 내 재제출 방지
3. **새 리포트 원하면**: 기존 리포트 삭제 or 업그레이드

### 구현

```typescript
// server/routes.ts
app.post("/api/assessment/submit", async (req, res) => {
  try {
    const input = assessmentInputSchema.parse(req.body);
    const lead = await storage.upsertLead(input.email, input.marketingConsent);

    // ✅ 중복 체크 추가
    const existingReports = await storage.getSajuResultsByLeadId(lead.id);

    if (existingReports.length > 0) {
      const latestReport = existingReports[0];
      const hoursSinceCreation =
        (Date.now() - new Date(latestReport.createdAt).getTime()) / (1000 * 60 * 60);

      // 옵션 1: 기존 리포트 재사용
      if (hoursSinceCreation < 24) {
        return res.status(200).json({
          success: true,
          reportId: latestReport.id,
          leadId: lead.id,
          email: lead.email,
          emailSent: false,
          message: "You already have a recent report. Redirecting to existing report."
        });
      }

      // 옵션 2: 명시적 재생성 요청만 허용
      if (!input.regenerate) {
        return res.status(400).json({
          message: "You already have a report. Set regenerate=true to create a new one.",
          existingReportId: latestReport.id
        });
      }
    }

    // ✅ 새 리포트 생성 (기존 로직)
    // ... Saju calculation & AI report generation
  }
});
```

---

## ✅ 해결 방법 2: Rate Limiting

### Redis 기반 Rate Limiting

```bash
npm install express-rate-limit redis
```

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const assessmentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:assessment:',
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24시간
  max: 3, // 24시간 내 최대 3번
  message: 'Too many submissions. Please try again tomorrow.',
  keyGenerator: (req) => req.body.email, // 이메일 기준
});

// 사용
app.post("/api/assessment/submit", assessmentLimiter, async (req, res) => {
  // ...
});
```

**비용:**
- Redis: Upstash Free tier (10k requests/day)
- 또는 Vercel KV: $0.20/100k requests

---

## ✅ 해결 방법 3: 프론트엔드 체크

```typescript
// client/src/pages/Survey.tsx
const handleSubmit = async () => {
  try {
    const response = await fetch('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.status === 400 && data.existingReportId) {
      // 이미 리포트 있음
      const confirmRegenerate = confirm(
        "You already have a report. Generate a new one? (Additional charges may apply)"
      );

      if (confirmRegenerate) {
        // 재생성 요청
        await fetch('/api/assessment/submit', {
          method: 'POST',
          body: JSON.stringify({ ...payload, regenerate: true })
        });
      } else {
        // 기존 리포트로 이동
        setLocation(`/results/${data.existingReportId}`);
      }
    }
  } catch (error) {
    // ...
  }
};
```

---

## 🎯 추천 전략 (조합)

### Phase 1: 즉시 적용 (오늘)
```typescript
// 같은 lead_id로 최근 24시간 내 리포트 있으면 재사용
if (existingReports.length > 0) {
  const latest = existingReports[0];
  const age = Date.now() - new Date(latest.createdAt).getTime();

  if (age < 24 * 60 * 60 * 1000) {
    return res.json({
      success: true,
      reportId: latest.id,
      message: "Returning existing report"
    });
  }
}
```

### Phase 2: Rate Limiting (다음주)
- Express-rate-limit 추가
- IP + Email 기반 제한
- 24시간 내 3회 제한

### Phase 3: 프리미엄 기능 (장기)
- 무료: 1개 리포트
- 유료: 리포트 재생성 무제한
- 가족 패키지: 최대 5명

---

## 💳 결제 시스템: Gumroad vs Lemon Squeezy

### Stripe 대체재 비교

| Feature | Gumroad | Lemon Squeezy | Stripe |
|---------|---------|---------------|--------|
| **한국 지원** | ✅ Yes | ✅ Yes | ❌ No |
| **수수료** | 10% + $0.30 | 5% + $0.50 | 2.9% + $0.30 |
| **설정 난이도** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| **Webhook** | ✅ Yes | ✅ Yes | ✅ Yes |
| **구독 지원** | ✅ Yes | ✅ Yes | ✅ Yes |
| **VAT 처리** | ✅ Auto | ✅ Auto | Manual |
| **정산 주기** | Weekly | Weekly | Daily |

### 추천: Lemon Squeezy ⭐

**이유:**
1. 수수료 Gumroad보다 낮음 (한국 시장에선 차이 큼)
2. API가 더 현대적 (REST + GraphQL)
3. Webhook 안정적
4. 대시보드 깔끔
5. 한국 카드 지원 좋음

---

## 🔧 Lemon Squeezy 통합 방법

### 1. 계정 생성 & 제품 등록

```
1. https://lemonsqueezy.com 가입
2. Store 생성
3. Product 생성:
   - Name: "BADA Full Report"
   - Price: $9.99
   - Type: Single payment
4. Variant 생성 (선택적):
   - Basic: $9.99
   - Premium: $19.99 (재생성 무제한)
```

### 2. 환경 변수 추가

```bash
# .env
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_VARIANT_ID=your_variant_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. 백엔드 통합

```typescript
// server/payment.ts
import crypto from 'crypto';

interface CheckoutData {
  reportId: string;
  email: string;
  name: string;
}

export async function createCheckoutSession(data: CheckoutData) {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: data.email,
            name: data.name,
            custom: {
              report_id: data.reportId
            }
          }
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMON_SQUEEZY_STORE_ID
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: process.env.LEMON_SQUEEZY_VARIANT_ID
            }
          }
        }
      }
    })
  });

  const result = await response.json();
  return result.data.attributes.url; // Checkout URL
}

// Webhook 검증
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}
```

### 4. 결제 엔드포인트

```typescript
// server/routes.ts
app.post("/api/payment/create-checkout", async (req, res) => {
  try {
    const { reportId, email, name } = req.body;

    // 리포트 존재 확인
    const report = await storage.getSajuResultById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // 이미 결제됨?
    if (report.isPaid) {
      return res.status(400).json({ message: "Report already paid" });
    }

    // Checkout 세션 생성
    const checkoutUrl = await createCheckoutSession({
      reportId,
      email,
      name
    });

    res.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout creation error:", error);
    res.status(500).json({ message: "Failed to create checkout" });
  }
});

// Webhook 핸들러
app.post("/api/webhooks/lemon-squeezy", async (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = JSON.stringify(req.body);

    // 서명 검증
    const isValid = verifyWebhookSignature(
      payload,
      signature,
      process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body;

    // 결제 성공 이벤트
    if (event.meta.event_name === 'order_created') {
      const reportId = event.data.attributes.first_order_item.product_name;
      const customData = event.meta.custom_data;

      // 리포트 잠금 해제
      await storage.unlockReport(customData.report_id);

      console.log(`Report ${customData.report_id} unlocked via Lemon Squeezy`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});
```

### 5. 프론트엔드 통합

```typescript
// client/src/pages/Results.tsx
const handleUnlock = async () => {
  try {
    const response = await fetch('/api/payment/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: data.reportId,
        email: data.userInput.email,
        name: data.userInput.name
      })
    });

    const { checkoutUrl } = await response.json();

    // Lemon Squeezy checkout으로 리다이렉트
    window.location.href = checkoutUrl;
  } catch (error) {
    toast({
      title: "Payment Error",
      description: "Failed to start checkout process",
      variant: "destructive"
    });
  }
};
```

---

## 🎨 Gumroad 통합 (더 간단)

### Gumroad Overlay 방식 (추천)

```typescript
// client/src/pages/Results.tsx
import { useEffect } from 'react';

export default function Results() {
  useEffect(() => {
    // Gumroad script 로드
    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <Button
      as="a"
      href={`https://gumroad.com/l/bada-report?wanted=true&report_id=${reportId}`}
      className="gumroad-button"
      data-gumroad-single-product="true"
    >
      Unlock Full Report - $9.99
    </Button>
  );
}
```

### Gumroad Webhook

```typescript
// server/routes.ts
app.post("/api/webhooks/gumroad", async (req, res) => {
  try {
    // Gumroad는 간단한 POST 요청
    const { sale_id, product_permalink, email, custom_fields } = req.body;

    if (sale_id) {
      // 리포트 잠금 해제
      const reportId = custom_fields.report_id;
      await storage.unlockReport(reportId);

      console.log(`Report ${reportId} unlocked via Gumroad`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error("Gumroad webhook error:", error);
    res.status(500).send('Error');
  }
});
```

---

## 💰 비용 비교 (실제 예시)

### 판매가: $9.99

| Platform | 수수료 | 순수익 | VAT 처리 |
|----------|--------|--------|----------|
| **Lemon Squeezy** | $0.50 + 5% ($0.50) = $1.00 | **$8.99** | ✅ Auto |
| **Gumroad** | $0.30 + 10% ($1.00) = $1.30 | **$8.69** | ✅ Auto |
| **Stripe** | $0.30 + 2.9% ($0.29) = $0.59 | **$9.40** | ❌ Manual |

**결론:**
- 가장 많은 수익: Stripe (하지만 한국 불가)
- **한국에서 최선**: Lemon Squeezy
- 가장 간단: Gumroad (하지만 수수료 높음)

---

## 🚀 즉시 적용 가능한 코드

### 중복 방지 (5분 내 적용)

```typescript
// server/routes.ts - 89번 줄 이후에 추가
const lead = await storage.upsertLead(input.email, input.marketingConsent);

// ✅ 중복 체크 추가
const existingReports = await storage.getSajuResultsByLeadId(lead.id);
if (existingReports.length > 0) {
  const latest = existingReports[0];
  const ageInHours = (Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60);

  if (ageInHours < 24) {
    console.log(`[Assessment] Returning existing report for ${input.email}`);
    return res.status(200).json({
      success: true,
      reportId: latest.id,
      leadId: lead.id,
      email: lead.email,
      emailSent: false,
      isExisting: true
    });
  }
}
```

### Gumroad 버튼 (10분 내 적용)

```tsx
// client/src/pages/Results.tsx - 257번 줄 수정
{!isPaid && (
  <Card className="max-w-md mx-auto p-8">
    <Sparkles className="w-12 h-12 text-[#0800FF] mx-auto mb-4" />
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      Unlock Your Full Blueprint
    </h3>
    <p className="text-gray-600 mb-6">
      Get your complete Life Architecture analysis
    </p>

    {/* Gumroad 버튼 */}
    <a
      href={`https://gumroad.com/l/bada-full-report?report_id=${data.reportId}`}
      className="gumroad-button block w-full py-3 px-6 text-center bg-[#0800FF] hover:bg-[#0600CC] text-white rounded-full"
      data-gumroad-single-product="true"
    >
      Unlock Full Report - $9.99
    </a>
  </Card>
)}
```

---

## 📊 최종 추천

### 단계별 구현

**Week 1: 중복 방지** ✅
- 24시간 내 같은 이메일 제출 방지
- 비용: $0
- 시간: 30분

**Week 2: Gumroad 통합** 💳
- 가장 빠르게 결제 시작
- 비용: 10% 수수료
- 시간: 2-3시간

**Week 3: Lemon Squeezy 마이그레이션** 💎
- 수수료 절감 (10% → 5%)
- Webhook으로 자동화
- 시간: 1일

**총 투자: 2-3일 작업 → 수익 창출 시작!** 🚀

---

**다음 단계:**
1. 중복 방지 코드 즉시 적용 (저장하실까요?)
2. Gumroad vs Lemon Squeezy 선택
3. 테스트 결제 설정

어떤 것부터 시작하시겠습니까?
