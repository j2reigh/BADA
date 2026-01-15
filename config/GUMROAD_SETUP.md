# Gumroad 통합 가이드

**베타 런치 가격:** $2.99 (정가 $19.99)
**예상 작업 시간:** 30분-1시간

---

## 📝 Step 1: Gumroad 제품 생성

### 1.1 Gumroad 계정 생성
1. https://gumroad.com 가입
2. 이메일 인증

### 1.2 제품 생성
1. Dashboard → "Create Product" → "Digital Product"
2. 제품 정보 입력:

```
Product Name: BADA Full Life Blueprint Report
Description:
  Unlock your complete 5-page Life Blueprint Report including:
  • Your Natural Blueprint (Hardware)
  • Your Current Operating System
  • The Core Tension Analysis
  • Your Personalized Action Protocol
  • Downloadable PDF Report

  🎉 BETA LAUNCH SPECIAL: $2.99 (Regular Price: $19.99)

Price: $2.99
Regular Price: $19.99 (show as crossed out)

Categories: Self-Improvement, Personal Development
```

3. **Custom Fields 추가** (중요!):
```
Field Name: report_id
Type: Text
Required: Yes
Description: Your Report ID (auto-filled)
```

4. **Permalink 설정**:
```
URL: https://gumroad.com/l/bada-full-report
```

### 1.3 상품 이미지
- 메인 이미지: 1200x630px
- 썸네일: 400x400px
- BADA 브랜딩 + "Life Blueprint" 텍스트

---

## 🔧 Step 2: 백엔드 Webhook 설정

### 2.1 환경 변수 추가

```bash
# .env or Replit Secrets
GUMROAD_PRODUCT_PERMALINK=bada-full-report
```

### 2.2 Webhook 엔드포인트 생성

```typescript
// server/routes.ts에 추가

// Gumroad Webhook Handler
app.post("/api/webhooks/gumroad", async (req, res) => {
  try {
    console.log("[Gumroad] Webhook received:", req.body);

    const {
      sale_id,
      product_permalink,
      email,
      purchaser_id,
      report_id, // Custom field
      price,
      currency,
      sale_timestamp
    } = req.body;

    // 유효성 검증
    if (!sale_id || !report_id) {
      console.error("[Gumroad] Missing sale_id or report_id");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 리포트 존재 확인
    const sajuResult = await storage.getSajuResultById(report_id);
    if (!sajuResult) {
      console.error("[Gumroad] Report not found:", report_id);
      return res.status(404).json({ error: "Report not found" });
    }

    // 이미 결제됨?
    if (sajuResult.isPaid) {
      console.log("[Gumroad] Report already paid:", report_id);
      return res.status(200).json({ message: "Already paid" });
    }

    // 리포트 잠금 해제
    await storage.unlockReport(report_id);

    console.log(`[Gumroad] Report ${report_id} unlocked successfully`);
    console.log(`[Gumroad] Sale ID: ${sale_id}, Price: ${price} ${currency}`);

    res.status(200).json({ success: true, message: "Report unlocked" });
  } catch (error) {
    console.error("[Gumroad] Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Webhook 테스트용 엔드포인트 (개발 전용)
if (process.env.NODE_ENV === 'development') {
  app.post("/api/webhooks/gumroad/test", async (req, res) => {
    const { reportId } = req.body;
    await storage.unlockReport(reportId);
    res.json({ success: true });
  });
}
```

---

## 🎨 Step 3: 프론트엔드 통합

### 3.1 Gumroad Script 로드

```typescript
// client/src/pages/Results.tsx

import { useEffect } from 'react';

export default function Results() {
  // Gumroad script 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ... 기존 코드
}
```

### 3.2 결제 버튼 수정

```tsx
// client/src/pages/Results.tsx - 248번 줄부터 수정

{!isPaid && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="text-center py-12"
  >
    <Card className="max-w-md mx-auto p-8 bg-white border-2 border-[#0800FF]/20 shadow-xl shadow-[#0800FF]/5">
      <Sparkles className="w-12 h-12 text-[#0800FF] mx-auto mb-4" />

      <div className="mb-4">
        <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold mb-2">
          🎉 BETA LAUNCH - 85% OFF
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Unlock Your Full Blueprint
      </h3>

      <p className="text-gray-600 mb-4">
        Get your complete Life Architecture analysis including your natural blueprint,
        OS diagnosis, core tensions, and personalized action plan.
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl font-bold text-[#0800FF]">$2.99</span>
          <span className="text-lg text-gray-400 line-through">$19.99</span>
        </div>
        <p className="text-xs text-gray-500">
          Limited time beta pricing
        </p>
      </div>

      {/* Gumroad 버튼 */}
      <a
        href={`https://gumroad.com/l/bada-full-report?wanted=true&report_id=${data.reportId}`}
        className="gumroad-button block w-full py-3 px-6 text-center bg-[#0800FF] hover:bg-[#0600CC] text-white rounded-full shadow-lg shadow-[#0800FF]/30 transition-colors font-semibold"
        data-gumroad-single-product="true"
        data-gumroad-overlay="true"
      >
        🔓 Unlock Full Report
      </a>

      <p className="text-xs text-gray-400 mt-4">
        Secure payment via Gumroad • Instant access
      </p>
    </Card>
  </motion.div>
)}
```

---

## 🔗 Step 4: Gumroad Webhook 연결

### 4.1 Webhook URL 설정

1. Gumroad Dashboard → Settings → Advanced
2. "Ping URL" 입력:
```
https://your-replit-url.repl.co/api/webhooks/gumroad
```

예시:
```
https://137e95b2-44f0-4b43-86e2-b6f10e35088e-00-15uh3rcrlots4.janeway.replit.dev/api/webhooks/gumroad
```

3. "Send test ping" 클릭하여 테스트

### 4.2 Webhook 데이터 형식

Gumroad가 보내는 데이터:
```json
{
  "seller_id": "your_seller_id",
  "product_id": "product_id",
  "product_name": "BADA Full Life Blueprint Report",
  "permalink": "bada-full-report",
  "product_permalink": "https://gumroad.com/l/bada-full-report",
  "email": "buyer@example.com",
  "price": "299",
  "currency": "usd",
  "quantity": "1",
  "sale_id": "unique_sale_id",
  "sale_timestamp": "2026-01-13T05:30:00Z",
  "purchaser_id": "purchaser_id",
  "report_id": "your-report-id-here",
  "custom_fields": {
    "report_id": "your-report-id-here"
  }
}
```

---

## 🧪 Step 5: 테스트 플로우

### 5.1 개발 환경 테스트

```bash
# Terminal에서 webhook 테스트
curl -X POST http://localhost:5000/api/webhooks/gumroad/test \
  -H "Content-Type: application/json" \
  -d '{"reportId":"your-report-id-here"}'
```

### 5.2 실제 테스트 구매

1. 자신의 이메일로 평가 완료
2. Results 페이지에서 "Unlock Full Report" 클릭
3. Gumroad 결제 진행 ($2.99)
4. 결제 완료 후 자동으로 리포트 잠금 해제 확인
5. PDF 다운로드 테스트

### 5.3 환불 테스트

Gumroad는 자동 환불 지원:
1. Dashboard → Sales → 특정 판매 선택
2. "Refund" 클릭

**환불 시 리포트 다시 잠금?**
- 옵션 1: 그냥 놔둠 (추천 - 고객 만족)
- 옵션 2: Webhook으로 자동 잠금

---

## 💰 수익 계산

### 베타 가격 ($2.99)

```
매출: $2.99
Gumroad 수수료: $0.30 + 10% ($0.30) = $0.60
순수익: $2.39
수익률: 80%
```

### 정가 전환 후 ($19.99)

```
매출: $19.99
Gumroad 수수료: $0.30 + 10% ($2.00) = $2.30
순수익: $17.69
수익률: 88.5%
```

### 베타 → 정가 전환 시나리오

**가정:**
- 베타 (3개월): 1000명 × $2.99 = $2,990
- 정가 전환 후: 100명/월 × $19.99 = $1,999/월

**연간 예상:**
- 베타 수익: $2,990 (3개월)
- 정가 수익: $17,991 (9개월)
- **총 연간 수익: $20,981**

---

## 🔄 Step 6: 나중에 전환 (Lemon Squeezy/Stripe)

### 전환이 쉬운 설계

```typescript
// server/payment-provider.ts
type PaymentProvider = 'gumroad' | 'lemon-squeezy' | 'stripe';

interface PaymentConfig {
  provider: PaymentProvider;
  checkoutUrl: string;
  webhookSecret?: string;
}

export async function createCheckout(
  provider: PaymentProvider,
  data: CheckoutData
): Promise<string> {
  switch (provider) {
    case 'gumroad':
      return createGumroadCheckout(data);
    case 'lemon-squeezy':
      return createLemonSqueezyCheckout(data);
    case 'stripe':
      return createStripeCheckout(data);
  }
}

// 환경 변수로 제어
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'gumroad';
```

이렇게 하면 나중에 provider만 바꾸면 됩니다!

---

## 📊 전환 시점 가이드

### Gumroad → Lemon Squeezy 전환 고려

**전환해야 할 때:**
1. 월 매출 > $1,000 (수수료 차이가 커짐)
2. 구독 모델 도입 시
3. 더 상세한 분석 필요 시

**전환 시 절약:**
```
월 매출 $10,000 기준
- Gumroad: $1,000 수수료
- Lemon Squeezy: $500 수수료
- 절약: $500/월 = $6,000/년
```

### Stripe 전환 고려

**전환해야 할 때:**
1. 한국 법인 설립
2. 더 복잡한 결제 흐름 필요
3. 수수료 최소화 (2.9% vs 5-10%)

---

## 🎨 마케팅 팁

### 베타 가격 활용

```tsx
// Landing 페이지에 추가
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
  <p className="text-red-600 font-bold text-center">
    🎉 BETA LAUNCH SPECIAL: Get 85% OFF
  </p>
  <p className="text-center text-sm text-gray-600 mt-1">
    First 1,000 users get full report for just $2.99 (Regular: $19.99)
  </p>
</div>
```

### 가격 인상 예고

```
"Price increases to $19.99 after beta (500 spots left)"
```

### 사회적 증거

```
"Join 234 people who discovered their Life Blueprint"
```

---

## 🚀 체크리스트

- [ ] Gumroad 계정 생성
- [ ] 제품 생성 ($2.99, 정가 $19.99 표시)
- [ ] Custom field "report_id" 추가
- [ ] Permalink 설정
- [ ] Webhook 엔드포인트 코드 추가
- [ ] Webhook URL Gumroad에 등록
- [ ] 프론트엔드 버튼 수정
- [ ] Gumroad script 로드 추가
- [ ] 테스트 구매
- [ ] 환불 프로세스 확인
- [ ] 베타 가격 마케팅 메시지 추가

---

**예상 완료 시간: 30-60분**
**즉시 수익 창출 가능!** 🎉
