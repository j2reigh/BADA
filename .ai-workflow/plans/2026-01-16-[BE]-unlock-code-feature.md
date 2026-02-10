# Unlock Code Feature Plan

**작성일:** 2026-01-16
**목적:** 결제 없이 코드로 리포트 잠금 해제 기능
**상태:** Draft

---

## 1. 요구사항 정리

### 1.1 코드 생성 규칙
- **형식**: 긍정적 영어단어 + 숫자 조합
- **예시**: `SHINE2024`, `BLOOM777`, `BRIGHT123`, `SPARK888`
- **길이**: 8-12자
- **대소문자**: 대문자만 (입력 시 자동 변환)

### 1.2 코드 사용 규칙
- **1회성**: 각 코드는 1번만 사용 가능
- **리포트 연결**: 사용된 코드는 어떤 리포트에 사용됐는지 추적
- **즉시 적용**: 코드 입력 시 바로 리포트 잠금 해제

---

## 2. 데이터베이스 설계

### 2.1 현재 스키마 (수정 필요)
```typescript
// shared/schema.ts - 현재
export const usedCodes = pgTable("used_codes", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().unique(),
  usedByReportId: uuid("used_by_report_id").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});
```

### 2.2 제안: validCodes 테이블 추가
```typescript
// 유효한 코드 목록 (미리 생성)
export const validCodes = pgTable("valid_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  usedByReportId: uuid("used_by_report_id").references(() => sajuResults.id),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // optional: 만료일
  memo: text("memo"), // optional: 누구한테 줬는지 메모
});
```

### 2.3 대안: 기존 usedCodes만 활용
- 유효한 코드 목록을 환경변수나 별도 JSON에 저장
- 사용 시 usedCodes에 기록
- **장점**: 스키마 변경 불필요
- **단점**: 관리 어려움

**권장: 2.2 (validCodes 테이블 추가)**

---

## 3. API 설계

### 3.1 코드 검증 및 사용 API
```
POST /api/codes/redeem
```

**Request:**
```json
{
  "code": "SHINE2024",
  "reportId": "uuid-here"
}
```

**Response (성공):**
```json
{
  "success": true,
  "message": "Report unlocked successfully"
}
```

**Response (실패):**
```json
{
  "success": false,
  "error": "INVALID_CODE" | "ALREADY_USED" | "EXPIRED" | "REPORT_NOT_FOUND"
}
```

### 3.2 코드 생성 API (관리자용)
```
POST /api/admin/codes/generate
```

**Request:**
```json
{
  "count": 10,
  "memo": "베타 테스터용",
  "expiresAt": "2026-03-01" // optional
}
```

**Response:**
```json
{
  "codes": ["SHINE2024", "BLOOM777", ...]
}
```

---

## 4. 프론트엔드 UI 설계

### 4.1 CTASection 수정 (Results.tsx)

**현재 구조:**
```
┌─────────────────────────────┐
│     Unlock Your Blueprint   │
│     $2.99 (was $19.99)      │
│                             │
│  [Unlock Full Report - $2.99]  ← Gumroad
│                             │
│  Secure payment via Gumroad │
└─────────────────────────────┘
```

**변경 후 구조:**
```
┌─────────────────────────────┐
│     Unlock Your Blueprint   │
│     $2.99 (was $19.99)      │
│                             │
│  [Unlock Full Report - $2.99]  ← Gumroad
│                             │
│  ─────── or ───────         │
│                             │
│  Have a code?               │
│  ┌─────────────┐ [Apply]    │
│  │ Enter code  │            │
│  └─────────────┘            │
│                             │
│  Secure payment via Gumroad │
└─────────────────────────────┘
```

### 4.2 코드 입력 컴포넌트

```tsx
function CodeRedeemSection({ reportId, onSuccess }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase().trim(),
        reportId
      }),
    });

    const data = await res.json();

    if (data.success) {
      onSuccess(); // 리포트 refetch
    } else {
      setError(getErrorMessage(data.error));
    }

    setIsLoading(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <p className="text-sm text-muted-foreground mb-3">Have a code?</p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="uppercase"
          maxLength={12}
        />
        <Button onClick={handleRedeem} disabled={!code || isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
```

### 4.3 에러 메시지
| Error Code | 한국어 | English |
|------------|--------|---------|
| INVALID_CODE | 유효하지 않은 코드입니다 | Invalid code |
| ALREADY_USED | 이미 사용된 코드입니다 | This code has already been used |
| EXPIRED | 만료된 코드입니다 | This code has expired |
| REPORT_NOT_FOUND | 리포트를 찾을 수 없습니다 | Report not found |

---

## 5. 코드 생성 유틸리티

### 5.1 긍정적 단어 목록
```typescript
const POSITIVE_WORDS = [
  // 빛/에너지
  "SHINE", "GLOW", "SPARK", "LIGHT", "BLAZE", "BEAM",
  // 성장
  "BLOOM", "GROW", "RISE", "SOAR", "LEAP", "CLIMB",
  // 강인함
  "BRAVE", "BOLD", "STRONG", "POWER", "FORCE",
  // 긍정
  "HAPPY", "LUCKY", "BLISS", "JOY", "PEACE",
  // 성공
  "STAR", "CROWN", "PRIME", "PEAK", "ELITE",
  // 자연
  "OCEAN", "RIVER", "STORM", "WAVE", "BREEZE",
  // 기타
  "DREAM", "MAGIC", "WONDER", "GRACE", "HOPE"
];
```

### 5.2 코드 생성 함수
```typescript
function generateUnlockCode(): string {
  const word = POSITIVE_WORDS[Math.floor(Math.random() * POSITIVE_WORDS.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `${word}${number}`;
}

// 결과 예시: SHINE4521, BLOOM7832, BRAVE1234
```

### 5.3 배치 생성 스크립트
```typescript
// scripts/generate_codes.ts
import { db } from "../server/db";
import { validCodes } from "../shared/schema";

async function generateCodes(count: number, memo?: string) {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    let code: string;
    let attempts = 0;

    // 중복 방지
    do {
      code = generateUnlockCode();
      attempts++;
    } while (codes.includes(code) && attempts < 100);

    codes.push(code);
  }

  // DB에 삽입
  await db.insert(validCodes).values(
    codes.map(code => ({ code, memo }))
  );

  console.log(`Generated ${count} codes:`);
  codes.forEach(c => console.log(c));

  return codes;
}
```

---

## 6. 구현 순서

### Phase 1: 백엔드 (예상: 1시간)
1. [ ] `validCodes` 테이블 스키마 추가
2. [ ] `db:push`로 마이그레이션
3. [ ] storage 함수 추가 (validateCode, useCode)
4. [ ] `/api/codes/redeem` 엔드포인트 구현
5. [ ] 코드 생성 스크립트 작성

### Phase 2: 프론트엔드 (예상: 30분)
1. [ ] CodeRedeemSection 컴포넌트 생성
2. [ ] CTASection에 통합
3. [ ] 에러 핸들링 및 로딩 상태

### Phase 3: 테스트 (예상: 30분)
1. [ ] 코드 생성 테스트
2. [ ] 코드 사용 테스트
3. [ ] 중복 사용 방지 테스트
4. [ ] UI 테스트

---

## 7. 보안 고려사항

1. **Brute Force 방지**: 5회 실패 시 1분 대기
2. **Rate Limiting**: IP당 분당 10회 제한
3. **코드 형식 검증**: 서버에서도 형식 체크
4. **로깅**: 모든 코드 사용 시도 기록

---

## 8. 미래 확장

- [ ] 관리자 대시보드에서 코드 생성/조회
- [ ] 코드 만료일 설정
- [ ] 코드별 사용 통계
- [ ] 대량 코드 CSV 내보내기

---

## 결정 필요 사항

1. **스키마 방식**: validCodes 테이블 추가 vs usedCodes만 사용?
2. **만료일**: 코드에 만료일 필요한가?
3. **메모 필드**: 누구한테 줬는지 기록 필요한가?
4. **관리자 API**: 웹에서 코드 생성 필요? 아니면 스크립트로만?

---

**작성자:** Claude
**검토자:** (대기중)
