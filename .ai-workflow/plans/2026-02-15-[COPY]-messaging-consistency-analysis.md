# 메시징 일관성 As-Is 불일치 분석

**Date:** 2026-02-15
**Agent:** Claude
**Related Issue:** 배포 전 랜딩/FAQ/잠금카드 문구 점검

---

## 분석 대상

| 영역 | 파일 | 역할 |
|------|------|------|
| 랜딩페이지 | `client/src/lib/simple-i18n.ts` (EN/KO/ID) | 첫 인상. 제품이 뭔지, 왜 해야 하는지 설득 |
| FAQ | 같은 파일 `faq.*` 키 | 의심 해소. 구체적으로 뭘 받는지 설명 |
| 잠금 카드 | `client/src/pages/ResultsV3.tsx:639-699` | 결제 전환. $2.9 내면 뭘 얻는지 마지막 설득 |

**비교 기준 = 실제 V3 리포트가 전달하는 경험**

---

## 실제 V3 리포트는 이렇게 생겼다

### 구조: 13장 스와이프 카드

| # | 라벨 | 내용 | 무료/유료 |
|---|------|------|-----------|
| 1 | BADA | 이름 + 훅 질문 ("왜 ~하는데 ~할까?") | 무료 |
| 2 | Your mirror | 자기 인식 (서베이 기반 OS 타입) | 무료 |
| 3 | Your blueprint | 구조적 설계 (사주+HD 기반) | 무료 |
| 4 | The collision | mirror ≠ blueprint 간극 분석 | 유료 |
| 5 | Your brain | 뇌과학 스캔 (alarm/drive/stability) | 유료 |
| 6 | Proof | 행동 증거 3개 ("익숙하지 않나요?") | 유료 |
| 7 | At work | 직장에서의 비용 | 유료 |
| 8 | In relationships | 관계에서의 비용 | 유료 |
| 9 | With money | 돈에서의 비용 | 유료 |
| 10 | Your chapter | 10년 대운 사이클 (과거→현재→다음) | 유료 |
| 11 | This year | 올해 에너지 해석 (세운) | 유료 |
| 12 | This week | 7일 행동 프로토콜 1개 | 유료 |
| 13 | Closing | 마무리 메시지 + 공유 버튼 | 유료 |

### 핵심 프레이밍 (Gemini 프롬프트 기준)

- **Collision(충돌)**: "자기 인식 ≠ 구조적 설계 ≠ 에너지 블루프린트 → 그 간극에 행동 패턴이 숨어있다"
- **Cost(비용)**: "이 패턴이 직장/관계/돈에서 매일 얼마의 에너지를 태우는가"
- **Protocol(처방)**: "시스템이 고장난 게 아니라 잘못 보정된 것 → 7일짜리 리추얼 1개"
- **톤**: 직접적이지만 따뜻한. 현명한 친구 같은. 치료사/코치 아님.
- **금지**: 사주/HD 전문용어 일절 노출 안 함. 전부 행동 언어로 번역.

---

## 불일치 1: 잠금 카드 — 언어 혼재 + 내용 부재

**위치:** `ResultsV3.tsx:646-690`

### 현재 상태

```
거울 ≠ 설계도              ← 한국어 하드코딩
이 간극이 만드는            ← 한국어 하드코딩
반복 패턴 10장              ← 한국어 하드코딩

[Unlock Full Report — $2.9] ← 영어
         or                 ← 영어
[Enter code]  [Apply]       ← 영어
```

### 문제

| # | 이슈 | 심각도 |
|---|------|--------|
| 1 | **한국어 하드코딩**: EN/ID 유저에게도 "거울 ≠ 설계도"가 한국어로 표시됨. 제품은 3개 언어 지원인데 잠금 카드만 한국어 고정 | Critical |
| 2 | **한영 혼재**: 설명은 한국어, CTA/코드 입력은 영어. 한 카드 안에서 언어 뒤섞임 | High |
| 3 | **$2.9로 뭘 얻는지 안내 없음**: "반복 패턴 10장"만으로는 유료 카드 내용(Brain Scan, 3 Cost 분석, 10년 챕터, 주간 프로토콜 등)이 전혀 전달 안 됨. 결제 전환율에 직접 영향 | High |
| 4 | **"반복 패턴"이라는 표현**: 리포트 실제 내용은 collision→evidence→cost→chapter→action인데 "반복 패턴"은 일부만 커버하는 표현 | Medium |

---

## 불일치 2: FAQ Q8 "What do I actually get?"

**위치:** `simple-i18n.ts:201-202` (EN), `:417-418` (KO), `:633-634` (ID)

### 현재 상태 (EN)

```
A multi-page personal report covering:

• Your core operating pattern (how you're wired)
• Your current energy phase (what's active now)
• Where tension builds (what drains you)
• Actionable direction (what to adjust)

The first section is free. The full report is unlocked with payment.
```

### 문제

| # | 이슈 | 심각도 |
|---|------|--------|
| 1 | **"multi-page report"**: 실제는 13장 세로 스와이프 카드. "multi-page"는 PDF/문서 느낌 → 실제 경험과 다름 | Medium |
| 2 | **설명이 추상적**: 4개 불릿이 리포트의 고유 가치를 전달 못함. 아래 비교 참고 | High |
| 3 | **"The first section is free"**: 실제로는 "3장 무료, 10장 유료". "section"이 모호 — 1장? 절반? | Medium |

### FAQ Q8 vs 실제 카드 매핑

| FAQ 표현 | 실제 대응 카드 | 빠진 가치 |
|----------|---------------|-----------|
| "core operating pattern" | Mirror + Blueprint (무료) | — |
| "current energy phase" | Chapter + This Year | 10년 대운, 올해 세운이라는 구체성 없음 |
| "where tension builds" | Collision + Cost 3장 | **직장/관계/돈 3영역 분석**이라는 핵심 셀링포인트 누락 |
| "actionable direction" | This Week | **7일 프로토콜**이라는 구체성 없음 |
| *(아예 안 나옴)* | Brain Scan | **뇌과학 스캔** 카드 존재 자체 언급 없음 |
| *(아예 안 나옴)* | Proof (Evidence) | **행동 증거 3개** 언급 없음 |

---

## 불일치 3: 소요시간 — 랜딩 "5분" vs FAQ "3분"

**위치:**

| 영역 | 키 | 현재 문구 |
|------|-----|-----------|
| 랜딩 hero (EN) | `landing.hero.subtitle` | "A 5-minute analysis..." |
| 랜딩 hero (KO) | 같은 키 | "5분 만에 알 수 있습니다" |
| 랜딩 CTA (EN) | `landing.cta.desc` | "The analysis takes 5 minutes." |
| 랜딩 CTA (KO) | 같은 키 | "분석은 5분." |
| FAQ Q9 (EN) | `faq.q9.a` | "About 3 minutes to complete the survey." |
| FAQ Q9 (KO) | 같은 키 | "설문 완료까지 약 3분." |
| FAQ Q9 (ID) | 같은 키 | "Sekitar 3 menit..." |

**문제:** 같은 제품인데 랜딩은 5분, FAQ는 3분. 사용자가 두 페이지를 모두 보면 신뢰도 하락.

**실측:** 서베이 8문항(~1.5분) + 생년월일 입력(~1분) + 리포트 생성 대기(~15-30초) = **약 3~4분**

---

## 불일치 4: 랜딩 Step 3 — 제품 프레이밍 불일치

**위치:** `simple-i18n.ts` — `landing.solution.step3.desc`

### 현재 상태

| 언어 | Step 3 문구 |
|------|------------|
| EN | "Get your personalized guide to flow" |
| KO | "맞춤형 흐름 가이드 제공" |
| ID | "Dapatkan panduan personal untuk flow" |

### 문제

| # | 이슈 | 심각도 |
|---|------|--------|
| 1 | **"guide to flow"**: 리포트는 "flow 가이드"가 아님. collision 진단 → cost 분석 → 행동 프로토콜. "Flow"라는 단어가 리포트 어디에도 안 나옴 | Medium |
| 2 | **Step 1~3 전체 흐름**: Step 1 "8개 질문" OK / Step 2 "시간 데이터로 리듬 매핑" OK / Step 3은 실제 리포트 경험과 안 맞음 | Medium |

---

## 불일치 5: 랜딩 톤 vs 리포트 톤

이건 "잘못됐다"기보다 **인지해야 할 간극**이다.

| | 랜딩 (기대 설정) | 실제 리포트 (경험) |
|---|---|---|
| **프레이밍** | "self-discovery analysis", "DNA profiling for your mind" | "collision diagnostic", "what it costs you" |
| **톤** | 희망적/열망적 ("clarity lasts a lifetime", "be more human") | 직면적/진단적 ("what breaks", "sound familiar?", "that's the problem") |
| **약속** | 나를 이해하게 된다 | 나의 간극과 그 비용을 보여준다 |
| **CTA 뉘앙스** | "Start My Analysis" (중립) | "Unlock Full Report" (잠금 해제) |

→ 랜딩이 **부드럽게 끌어들이고** 리포트가 **직면하게 하는** 구조 자체는 의도적일 수 있음. 하지만 Step 3 "guide to flow"처럼 **리포트에 없는 약속**을 하는 건 기대 불일치.

---

## 요약: 수정 필요 항목

| 우선순위 | 영역 | 핵심 이슈 | 수정 범위 |
|----------|------|-----------|-----------|
| **P0** | 잠금 카드 | 한국어 하드코딩 (EN/ID 유저 영향) + 유료 내용 안내 없음 | `ResultsV3.tsx` |
| **P1** | FAQ Q8 | 리포트 내용 설명이 추상적, 실제 카드 가치 미전달 | `simple-i18n.ts` (3개 언어) |
| **P2** | FAQ Q9 + 랜딩 | 소요시간 3분 vs 5분 불일치 | `simple-i18n.ts` (3개 언어) |
| **P2** | 랜딩 Step 3 | "guide to flow" → 실제 리포트에 없는 약속 | `simple-i18n.ts` (3개 언어) |
| **P3** | 랜딩 전체 톤 | 열망적 톤 vs 리포트 진단적 톤 간극 | 의도적일 수 있음 — 판단 필요 |

---

---
---

# 수정안

> As-Is 분석 기반 구체적 수정 제안. 수정 파일 총 3개.

---

## 수정 1 (P0): 잠금 카드 다국어 + 유료 내용 안내

### 수정 대상

| 파일 | 변경 |
|------|------|
| `server/routes.ts:503-509` | API 응답에 `language` 필드 추가 |
| `client/src/pages/ResultsV3.tsx:63-72` | `ResultsApiResponse`에 `language` 추가 |
| `client/src/pages/ResultsV3.tsx:600-699` | LockCard에 `language` prop + 번역 객체 + 내용 안내 |
| `client/src/pages/ResultsV3.tsx:846-850` | LockCard 호출부에 `language` 전달 |

### 1-a. 서버: API 응답에 language 추가

`server/routes.ts:503-509` — responseData에 1줄 추가:

```typescript
const responseData: any = {
  reportId: sajuResult.id,
  email: lead.email,
  userInput: sajuResult.userInput,
  sajuData: sajuResult.sajuData,
  isPaid,
  createdAt: sajuResult.createdAt,
  language: (sajuResult as any).language || "en",  // ← 추가
};
```

### 1-b. 클라이언트: 타입 + LockCard props

`ResultsV3.tsx` — interface에 `language` 추가, LockCard에 `language` prop 추가.

### 1-c. LockCard 문구 — Before / After

**설계 원칙:**
- 유저는 이미 무료 3장을 읽고 "어 이거 나한테 맞는데?" 상태
- 잠금 카드는 그 느낌을 인정하고, "왜 맞았는지 + 그래서 뭘 해야 하는지"로 연결
- 번역체/마케팅체 금지. 짧은 문장, 말하듯이.
- "거울 ≠ 설계도"는 영어 라벨 직역이라 어색 → **"보이는 나 ≠ 진짜 나"** 또는 카드 라벨 자체를 안 쓰고 경험을 소환

**Before:**
```
거울 ≠ 설계도              ← 영어 라벨 직역, 어색
이 간극이 만드는            ← 한국어 하드코딩
반복 패턴 10장              ← 한국어 하드코딩

[Unlock Full Report — $2.9] ← 영어
         or                 ← 영어
[Enter code]  [Apply]       ← 영어
```

**After (EN):**
```
what you see ≠ what's there

If those 3 cards hit close,
the next 10 show you why.

$2.9

[Unlock]
   or
[Enter code]  [Apply]
```

**After (KO):**
```
보이는 나 ≠ 진짜 나

3장이 찔렸다면,
다음 10장은 그 이유입니다.

$2.9

[잠금 해제]
   또는
[코드 입력]  [적용]
```

**After (ID):**
```
yang kamu lihat ≠ yang sebenarnya

Kalau 3 kartu tadi terasa tepat,
10 kartu berikutnya jelaskan kenapa.

$2.9

[Buka]
   atau
[Masukkan kode]  [Terapkan]
```

**왜 이게 작동하는가:**
1. "보이는 나 ≠ 진짜 나" — 자연스러운 한국어. mirror/blueprint 라벨 직역 대신 의미 전달.
2. "3장이 찔렸다면" — 유저 경험을 직접 소환. "맞았지?" 를 묻지 않고 전제함 → 자신감.
3. "다음 10장은 그 이유입니다." — 뭘 받는지가 아니라 **왜 계속 읽어야 하는지**. 호기심.
4. 가격만 단독 표시. 설명 없음. 자신 있는 가격.

### 구현 방식

LockCard 컴포넌트 내부에 인라인 번역 객체 사용 (ResultsV3는 i18n 시스템 미사용이므로):



---

## 수정 2 (P1): FAQ Q8 답변 구체화

### 수정 대상

`client/src/lib/simple-i18n.ts` — `faq.q8.a` (EN :202, KO :418, ID :634)

### 설계 원칙

- FAQ를 읽는 사람은 **"이거 괜찮은 건가?"** 상태. 말을 많이 하면 역효과.
- 대화하듯. 뭘 받는지 → 뭘 알게 되는지 → 얼마인지. 끝.

### Before (EN)

```
A multi-page personal report covering:

• Your core operating pattern (how you're wired)
• Your current energy phase (what's active now)
• Where tension builds (what drains you)
• Actionable direction (what to adjust)

The first section is free. The full report is unlocked with payment.
```

### After (EN)

```
3 cards for free.
They show how you see yourself vs. how you're actually built.

If you want the rest — what this gap is doing to your work, relationships, and money, plus one thing to change this week — that's 10 more cards for $2.9.
```

### After (KO)

```
3장은 무료입니다.
보이는 나와 실제 설계된 나를 보여줍니다.

이 간극이 직장, 관계, 돈에서 뭘 하고 있는지, 그리고 이번 주에 바꿀 수 있는 한 가지까지 보고 싶다면 — 10장 추가, $2.9.
```

### After (ID)

```
3 kartu gratis.
Menunjukkan bagaimana kamu melihat dirimu vs. bagaimana kamu sebenarnya dirancang.

Kalau kamu mau tahu apa yang kesenjangan ini lakukan terhadap kerja, hubungan, dan uangmu, plus satu hal yang bisa diubah minggu ini — 10 kartu lagi, $2.9.
```

---

## 수정 3 (P2): 소요시간 통일 → "5분"

### 수정 대상

`client/src/lib/simple-i18n.ts` — `faq.q9.a` (EN :204, KO :420, ID :636)

| 언어 | Before | After |
|------|--------|-------|
| EN | "About **3** minutes to complete the survey." | "About **5** minutes to complete the survey." |
| KO | "설문 완료까지 약 **3**분." | "설문 완료까지 약 **5**분." |
| ID | "Sekitar **3** menit untuk menyelesaikan survei." | "Sekitar **5** menit untuk menyelesaikan survei." |

나머지 문장 (리포트 전달 안내) 변경 없음.

---

## 수정 4 (P2): 랜딩 Step 3 문구

### 수정 대상

`client/src/lib/simple-i18n.ts` — `landing.solution.step3.desc` (EN :53, KO :269, ID :485)

| 언어 | Before | After |
|------|--------|-------|
| EN | "Get your personalized guide to flow" | "See what to change, starting this week" |
| KO | "맞춤형 흐름 가이드 제공" | "이번 주부터 바꿀 수 있는 것 확인" |
| ID | "Dapatkan panduan personal untuk flow" | "Lihat apa yang bisa diubah, mulai minggu ini" |

→ "flow"라는 리포트에 없는 약속 제거. 리포트의 마지막 카드(This Week — 7일 프로토콜)와 직결.

---

## 수정 범위 요약

| 파일 | 변경 수 | 내용 |
|------|---------|------|
| `server/routes.ts` | 1곳 | language 필드 추가 |
| `client/src/pages/ResultsV3.tsx` | 3곳 | interface, LockCard 컴포넌트, 호출부 |
| `client/src/lib/simple-i18n.ts` | 9곳 | FAQ Q8 ×3, FAQ Q9 ×3, Step3 ×3 |

---

## 검증 방법

1. `npm run dev` 실행
2. 랜딩 → Solution Step 3 문구 확인 (EN/KO/ID 전환)
3. FAQ → Q8, Q9 확인 (EN/KO/ID 전환)
4. 기존 unpaid 리포트 URL 접속 → 잠금 카드 문구 + 언어별 전환 확인
5. 잠금 카드 결제 버튼 → Gumroad URL 정상 동작 확인
6. 코드 입력 → 적용 버튼 동작 확인

---

## Human Review Required

**승인 상태:** [ ] 대기 중 / [ ] 승인됨 / [ ] 수정 필요

**승인자 의견:**
```
```
