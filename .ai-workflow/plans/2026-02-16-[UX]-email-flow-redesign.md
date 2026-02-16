# 이메일 수집 & 인증 플로우 재설계

> 생성일: 2026-02-16
> 상태: 🟡 기획 중

## 배경

이메일 인증(Resend)이 프로덕션에서 작동하지 않아 verification을 비활성화했다.
현재는 Survey에서 이메일을 수집하고, 인증 없이 바로 Results로 이동한다.

이메일이 필요한 이유와 타이밍을 재설계한다.

---

## AS-IS (현재 상태)

```
Survey (이메일 입력 + 설문)
  → 리포트 생성
  → /results/{id} 바로 이동 (인증 없음)
  → Free preview (3장) 열람
  → "Unlock" 클릭 → Gumroad 결제 (이메일 다시 입력)
  → Webhook → report unlock
```

### 이메일 접점

| 시점 | 수집 여부 | 인증 여부 | 용도 |
|------|-----------|-----------|------|
| Survey 제출 | ✅ 수집 (필수) | ❌ 미인증 | Lead 저장, Gumroad 매칭 |
| Gumroad 결제 | ✅ 수집 (Gumroad이) | ✅ 결제로 검증됨 | 영수증, webhook 매칭 |

### 문제점

1. **Survey 이메일 = 미인증** — 가짜 이메일 입력 가능
2. **Gumroad 이메일 ≠ Survey 이메일일 수 있음** — 다른 이메일로 결제하면 매칭 실패
3. **이메일 활용을 못 하고 있음** — 리포트 링크 전송, 알림, 마케팅 다 불가
4. **Survey에서 이메일 입력이 friction** — 아직 가치를 모르는 상태에서 이메일 요구

---

## 이메일이 필요한 목적 정리

| 목적 | 필요 시점 | 인증 필요? |
|------|-----------|-----------|
| Gumroad 결제 매칭 | 결제 시 | ❌ (Gumroad webhook에 email 포함) |
| 리포트 링크 재전송 | 리포트 열람 후 | ✅ (진짜 이메일이어야 받음) |
| 마케팅/뉴스레터 | 관심 표현 후 | ✅ (스팸 방지) |
| 피드백/후속 소통 | 리포트 열람 후 | ✅ |

**핵심 인사이트: 인증이 필요한 건 "이메일을 보내야 할 때"뿐이다.**

---

## 옵션별 분석

### Option A: Survey에서 이메일 제거, Gumroad에서만 수집

```
Survey (이메일 없음, 설문만)
  → 리포트 생성 → /results/{id}
  → Free preview 열람
  → Gumroad 결제 → 이메일 수집 (결제로 자동 검증)
  → Webhook → unlock + lead 이메일 저장
```

**장점:**
- Survey friction 최소화 (이메일 안 물어봄)
- Gumroad 이메일 = 결제 검증됨 = 진짜 이메일
- 이메일 수집 시점이 "돈 낸 사람"으로 한정 → 고품질 리드

**단점:**
- 무료 유저 이메일 0개 — 리드 수집 불가
- 무료 유저에게 리포트 링크 재전송 불가 (URL 잃으면 끝)
- 마케팅 타겟 풀이 결제자로 한정

**필요 변경:**
- Survey에서 email 필드 제거
- Lead 생성 로직 변경 (email 없이 생성, 또는 Gumroad webhook에서 생성)
- Gumroad webhook에서 lead.email 업데이트

---

### Option B: Survey에서 수집하되 인증 없음 (현재)

```
Survey (이메일 입력)
  → 리포트 생성 → /results/{id}
  → Free preview 열람
  → Gumroad 결제
  → Webhook → unlock
```

**장점:**
- 현재 작동 중 (변경 불필요)
- 무료 유저 이메일도 수집
- Gumroad 매칭 가능 (같은 이메일이면)

**단점:**
- 가짜 이메일 가능 → 이메일 보내면 바운스
- Survey에서 이메일 friction 존재
- 이메일 활용 불가 (인증 안 됐으니 보내면 안 됨)

---

### Option C: 리포트 끝에서 이메일 수집 + soft 인증

```
Survey (이메일 없음)
  → 리포트 생성 → /results/{id}
  → Free preview 열람 (3장)
  → 마지막 카드 or 별도 섹션:
    "리포트 링크를 이메일로 보내드릴까요?"
    → 이메일 입력 → 링크 이메일 발송 (= soft 인증)
  → Gumroad 결제 (이메일 pre-fill 가능)
```

**장점:**
- Survey friction 제로 (이메일 안 물어봄)
- 유저가 가치를 확인한 후 이메일 줌 → 전환율 높음 + 진짜 이메일
- "리포트 링크 전송" 자체가 인증 역할 (받았으면 진짜 이메일)
- 무료 유저도 이메일 수집 가능 (선택적)

**단점:**
- 이메일 입력 안 하는 유저 존재 → 리드 누락
- Gumroad 매칭을 위해 이메일을 pre-fill해야 함 (또는 report_id로만 매칭)
- 구현 복잡도 중간

**필요 변경:**
- Survey에서 email 필드 제거
- Lead 생성: email 없이 생성 (anonymous lead)
- Results 페이지 끝에 이메일 입력 UI 추가
- 이메일 입력 시: lead에 email 저장 + 리포트 링크 이메일 발송
- Gumroad checkout URL에 email pre-fill (수집됐으면)

---

### Option D: 리포트 중간 피드백 모달 + 이메일 수집

```
Survey (이메일 없음)
  → 리포트 생성 → /results/{id}
  → Free preview 3장 열람
  → 3장 후 피드백 모달: "지금까지 얼마나 정확했나요?"
    → 별점/반응 + "결과를 이메일로 보내드릴까요?" (이메일 입력)
  → 나머지 카드 or Unlock CTA
```

**장점:**
- 몰입 상태에서 피드백 + 이메일 수집 동시에
- "정확했다"고 느낀 직후라 이메일 줄 확률 높음
- 피드백 데이터도 얻음 (리포트 품질 측정)

**단점:**
- 흐름 끊김 — 모달이 짜증날 수 있음
- 무료 카드 3장 읽은 후 모달 + 결제 CTA → 벽이 두 개
- UX 설계가 섬세해야 함 (강제가 아닌 자연스러운 전환)

---

### Option E: Survey에서 수집 + 인증 없이 리포트 링크 발송 (passive 검증) ⭐

```
Survey (이메일 입력 — 현재와 동일)
  → 리포트 생성 → /results/{id} 바로 이동
  → 동시에 백그라운드: "Your report is ready" 이메일 발송 (리포트 링크 포함)
  → Resend delivery status로 리드 품질 자동 판별
```

**유저 입장에서 달라지는 것: 없음.** 기존과 똑같이 이메일 넣고 설문하면 바로 리포트.
차이는 뒤에서 리포트 링크 이메일이 날아가는 것뿐.

**장점:**
- UX 변경 제로 — 현재 flow 그대로
- "인증하세요" 없이 자연스럽게 이메일 도달 확인
- 유저에게는 가치 전달 (리포트 링크가 이메일에 있으니 나중에 다시 접속 가능)
- Resend bounce/delivery webhook으로 리드 품질 자동 분류
- 나중에 마케팅 메일 보낼 때 delivered 리드만 타겟 가능
- co-star도 이 방식 (인증 없이 결과 이메일만 발송)

**단점:**
- 가짜 이메일에 발송 시도 → Resend 비용 약간 낭비 (bounce)
- bounce rate 높으면 발신 도메인 평판 하락 가능 (대량 유입 시 주의)

**리드 검증 로직:**
```
이메일 발송 → Resend delivery webhook 수신
  → delivered: lead.emailStatus = 'valid'
  → bounced:  lead.emailStatus = 'invalid'
  → (미수신): lead.emailStatus = 'unknown' (기본값)
```

**이메일 내용 (verification → report link로 변경):**
```
Subject: "Your BADA Report is Ready"
Body:
  - 리포트 링크 (https://bada.one/results/{id})
  - "Bookmark this link — it's your personal report."
  - (결제 전이면) "Unlock the full report" CTA
```

---

## 추천안

### ⭐ 단기 (지금): Option E — 리포트 링크 이메일 발송

**이유:**
1. UX 변경 제로 — 코드 변경 최소
2. 인증 없이 리드 검증 가능 (Resend delivery status)
3. 유저에게 가치 전달 (리포트 링크 이메일)
4. co-star 등 레퍼런스와 동일한 패턴
5. Survey 이메일 수집 유지 → 무료 유저 리드도 확보

**구현 단계:**

| 단계 | 할 일 | 복잡도 |
|------|-------|--------|
| 1 | `lib/email.ts`: verification email → report link email 템플릿으로 변경 | 낮음 |
| 2 | `server/routes.ts`: submit 후 비동기로 report link email 발송 (non-blocking) | 낮음 |
| 3 | (선택) Resend webhook 연동: delivery/bounce status → leads 테이블에 emailStatus 저장 | 중간 |
| 4 | `Wait.tsx`, `VerificationFailed.tsx`: 미사용 → 라우트에서 제거 | 낮음 |

### 중기 (유저 유입 후): Option E + A 강화

- Resend bounce webhook으로 리드 품질 자동 관리
- Gumroad 결제자는 결제 이메일로 이중 검증
- delivered 리드만 마케팅 대상으로 활용
- bounce rate 모니터링 → 높으면 Survey에 이메일 유효성 체크 추가 (ex: DNS MX lookup)

---

## 구현 시 변경 범위

| 파일 | 변경 |
|------|------|
| `lib/email.ts` | `sendVerificationEmail` → `sendReportLinkEmail`로 리팩토링 |
| `server/routes.ts` | submit 후 report link email 비동기 발송 (결과 미대기) |
| `shared/schema.ts` | (선택) leads에 `emailStatus` 컬럼 추가 (`unknown`/`valid`/`invalid`) |
| `server/routes.ts` | (선택) Resend delivery webhook 엔드포인트 추가 |
| `client/src/App.tsx` | `/wait`, `/verification-failed` 라우트 제거 or redirect |
| `Wait.tsx` | 미사용 (삭제 가능) |
| `VerificationFailed.tsx` | 미사용 (삭제 가능) |

---

## 미결 질문

- [x] Resend 도메인(bada.one) DNS 인증은 완료됐나? → ✅ verified (ap-northeast-1, sending enabled)
- [ ] Resend delivery webhook 연동할 건지? (리드 품질 자동 관리 — 선택사항)
- [ ] 리포트 링크 이메일 디자인 — 기존 verification 템플릿 재활용? 새로 만들기?
- [ ] 결제 후 "full report unlocked" 이메일도 보낼 건지?

---

## 참고

- `server/routes.ts`: assessment submit, Gumroad webhook, verification endpoints
- `client/src/pages/Survey.tsx`: 이메일 입력 + 제출
- `client/src/pages/Wait.tsx`: 인증 대기 (현재 비활성)
- `lib/email.ts`: Resend 이메일 발송
- `config/GUMROAD_SETUP.md`: Gumroad 연동 설정
