# Report V3: Card-News Prototype

**Date:** 2026-02-09 (initial) → 02-09 (updated)
**Route:** `/results/:reportId/v3`
**Test Report:** `6b9b0222-e0ce-48ff-b3d1-141dbaffb89e`

---

## 1. 핵심 진단: 왜 V3를 만드는가

### v2 문제점
- 프롬프트 constraint 15개+/페이지 → Gemini가 체크리스트 소화 모드 → 영혼 없는 텍스트
- 5개 섹션 × 3개 하위항목 = 정보 나열 (백과사전형). 서사가 아님
- `SAMPLE_HD_DATA`(이지윤)가 모든 유저에게 적용 → Design vs Perception gap이 엉뚱
- 분량 목표를 3,000→6,000자로 올리는 건 정반대 방향 (뷔페 전략)

### V3 핵심 인사이트
```
사주  = "넌 이렇게 태어났다" (설계도)
서베이 = "넌 스스로를 이렇게 본다" (자기인식)
→ 이 둘의 충돌(GAP)이 인사이트다
→ "왜 늘 이러지?"의 답 = $10 moment
```

---

## 2. 현재 구현 상태

### 2.1 완료된 것

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | 카드뉴스 UI (scroll-snap, 9:16) | ✅ | `ResultsV3.tsx` |
| 2 | 충돌 프레이밍 카드 구조 | ✅ | Hook→거울→설계도→충돌→증거→대가→프로토콜→클로징 |
| 3 | Q→A 구조 (모든 카드에 질문→답변) | ✅ | 질문 = accent 컬러, 대형 텍스트 → 디바이더 → 답변 |
| 4 | LLM 기반 콘텐츠 생성 (`generateV3Cards`) | ✅ | Gemini 2.5 Flash, few-shot 프롬프트 |
| 5 | 다른 유저도 정곡을 찌르는지 검증 | ✅ | Passive Floater vs Master Builder — 완전히 다른 콘텐츠 생성 확인 |
| 6 | Energy Allocation 카드 (deterministic) | ✅ | 서베이 raw score → 공식 → %, LLM이 해석만 담당 |
| 7 | Neuroscience 프레이밍 | ✅ | Energy bars + 뇌과학 해석 + Neural Protocol |
| 8 | 대운/세운 십신 계산 | ✅ | `getTenGod()`, prev/current/next 대운, 지지 본기 |
| 9 | Hardcoded/LLM 토글 | ✅ | 우상단 버튼으로 비교 가능 |

### 2.2 진행 중

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | Timeline 카드 (대운→세운→Protocol) | 🔜 | 대운 데이터 준비 완료, LLM 프롬프트 + UI 카드 구현 필요 |
| 2 | LLM 프롬프트에 대운/세운 데이터 통합 | 🔜 | `generateV3Cards()`에 luck cycle 데이터 추가 |

### 2.3 미착수

| # | 항목 | 비고 |
|---|------|------|
| 1 | Free/Paid 분할 (자이가르닉 효과) | 카드 3장 무료 → Lock → 나머지 유료 |
| 2 | HD API 연동 (실제 유저별 HD 데이터) | €229 Basic, 검증 후 구매 |
| 3 | 카드 이미지 캡처/공유 기능 | |
| 4 | A/B 테스트 인프라 (v2 vs v3) | |
| 5 | 다국어 (ko/en/id) 카드 지원 | 현재 en only |

---

## 3. 카드 구조 (확정)

### 3.1 카드 순서

```
1. Hook Card       — 이름 + 한 줄 찔리는 질문
2. Mirror Card     — "당신은 스스로를 이렇게 봅니다" (서베이 기반)
3. Blueprint Card  — "근데 태어난 구조는 이렇습니다" (사주 기반)
── 🔒 여기서 Free/Paid 분할 예정 ──
4. Collision Card  — 거울 ≠ 설계도 → 반복 패턴의 원인
5. Energy Card     — Energy Allocation (서베이 → deterministic %)
6. Evidence Card   — 구체적 행동 증거 3개
7. Cost Cards ×3   — 커리어 / 관계 / 돈에서의 비용
8. Chapter Card    — 대운: 10년 방향성 (NEW)
9. Year Card       — 세운: 올해 에너지 (NEW)
10. Protocol Card  — Neural Protocol (첫 스텝)
11. Closing Card   — 한 줄 리프레임
```

### 3.2 모든 카드 공통 구조: Q→A

```
┌──────────────────────────┐
│                          │
│  질문 (accent color,     │
│   큰 텍스트, 상단)       │
│                          │
│  ── 구분선 ──            │
│                          │
│  답변 (white, 작은       │
│   텍스트, 하단)          │
│                          │
│  [카드 라벨]             │
└──────────────────────────┘
```

### 3.3 디자인 원칙
- 배경: 다크 (#182339)
- 모바일 only (9:16), `snap-y snap-mandatory`
- 한 카드 = 한 화면 = 스크롤 없음
- 캡처 시 Instagram story 사이즈 호환

---

## 4. 데이터 아키텍처

### 4.1 데이터 흐름

```
[사주팔자] ─┐
            ├→ behavior_translator.ts → BehaviorPatterns
[서베이]   ─┘                              │
                                           ├→ gemini_client.ts → generateV3Cards()
[대운/세운] → calculateLuckCycle() ────────┘         │
                                                     ▼
                                              V3CardContent JSON
                                                     │
                                                     ▼
                                         /api/results/:reportId/v3-cards
                                                     │
                                                     ▼
                                              ResultsV3.tsx (렌더링)
```

### 4.2 사주 데이터 활용 범위 (v2 vs v3)

| 데이터 | v2 | v3 |
|--------|----|----|
| 오행 (5 elements) | 사용 | 사용 |
| 사주팔자 (4 pillars) | 일부 | **전체 전달** (LLM에) |
| 십신 분포 (ten gods) | 일부 | **전체 전달** |
| 일간 강약 (day master strength) | 사용 | 사용 |
| Hardware/Operating Analysis | 사용 | 사용 |
| 대운 (10-year cycle) | 미사용 | **십신 관계 포함** |
| 세운 (annual cycle) | 미사용 | **십신 관계 포함** |
| 이전/다음 대운 | 미사용 | **신규 추가** |

### 4.3 Energy Allocation (deterministic 공식)

LLM 환각 방지를 위해 서버에서 계산 후 LLM에 "이 숫자를 그대로 써라" 지시.

```typescript
threatBurn    = Math.round((threatScore / 3) * 80 + 15)    // 15-95%
driveBurn     = Math.round((agencyScore / 3) * 80 + 15)    // 15-95%
stabilityBurn = Math.round((environmentScore / 2) * 60 + 20) // 20-80%
remaining     = Math.max(5, 100 - average(위 3개))
```

- 위 숫자 = 시각화용 (측정값 아님)
- LLM은 바 아래 뇌과학적 해석만 생성

### 4.4 대운/세운 십신 계산 (신규)

`calculateLuckCycle()` → `LuckCycleInfo` 반환:

```typescript
{
  dayMaster: "戊",
  currentDaYun: {
    ganZhi: "甲午", startAge: 25, endAge: 34,
    ganElement: "wood", zhiElement: "fire",
    tenGodGan: "편관",    // 甲(wood) controls 戊(earth), same yang
    tenGodZhi: "정인",    // 午→丁(fire) produces 戊(earth), diff polarity
  },
  previousDaYun: { ganZhi: "乙未", tenGodGan: "정관", tenGodZhi: "겁재", ... },
  nextDaYun: { ganZhi: "癸巳", tenGodGan: "정재", tenGodZhi: "편인", ... },
  currentSeUn: { year: 2026, ganZhi: "丙午", tenGodGan: "편인", tenGodZhi: "정인", ... },
}
```

십신 해석 키:
- **편관/정관** = 외부 압력, 통제, 구조화 에너지
- **편인/정인** = 지원, 보호, 학습 에너지
- **편재/정재** = 목표, 성취, 자원 에너지
- **식신/상관** = 표현, 창작, 출력 에너지
- **비견/겁재** = 자아, 경쟁, 독립 에너지

---

## 5. LLM 프롬프트 전략

### 5.1 핵심 원칙: Few-shot + 자유도

```
v2: constraint 15개 → 체크리스트 소화 모드
v3: 골드스탠다드 예시 1개 + "이 품질로 써라" → 감으로 찔러
```

### 5.2 프롬프트 구조 (`generateV3Cards`)

```
1. COLLISION 컨셉 설명 (서베이 vs 사주 = GAP)
2. 사주 데이터 전체 (4 pillars, elements, ten gods, day master, hardware/operating)
3. 서베이 데이터 (type, scores)
4. 행동 패턴 (behavior_translator 출력)
5. Energy Allocation 사전 계산값 → "이 숫자 그대로 사용"
6. 골드스탠다드 예시 (이지윤 데이터 기반 완성 출력)
7. WRITING_STYLE_RULES (짧고 날카롭게)
8. JSON 출력 포맷
```

### 5.3 검증 결과

| 테스트 | 결과 |
|--------|------|
| 이지윤 (Master Builder, earth, fire:4, overdriven) | 산/깊이 메타포, 72시간 룰 → 정곡 |
| User B (Passive Floater, water, wood:3, underperforming) | 바다/흐름 메타포, 파도 관찰 → 완전히 다른 콘텐츠 |
| Energy Allocation 정확도 | 사전계산값 그대로 사용 확인 (User B에서 remaining:120% 환각 있었으나 사전계산 방식으로 해결) |

---

## 6. 파일 구조

### 변경된 파일

```
lib/behavior_translator.ts
  ├── calculateLuckCycle()     — 대운/세운 + 십신 + prev/next 대운
  ├── getTenGod()              — 십신 관계 계산 (element cycle + polarity)
  ├── buildDaYunInfo()         — 대운 정보 구조체 빌더
  ├── ZHI_MAIN_QI              — 지지 본기 매핑
  ├── LuckCycleInfo interface  — 확장 (dayMaster, prev/next, tenGod)
  └── DaYunInfo interface      — 신규

lib/gemini_client.ts
  ├── generateV3Cards()        — V3 전용 LLM 프롬프트 + Gemini 호출
  └── V3CardContent interface  — 출력 포맷 정의

server/routes.ts
  └── GET /api/results/:reportId/v3-cards — V3 카드 API

client/src/pages/ResultsV3.tsx
  ├── HookCard, InsightCard, EvidenceCard, CostCard — 기본 카드들
  ├── EnergyCard (구 BrainScanCard)                  — Energy Allocation bars
  ├── ActionCard                                      — Neural Protocol
  ├── ScanBar                                         — 에너지 바 컴포넌트
  ├── deriveV3Content()                               — 하드코딩 fallback
  └── LLM 토글 (hardcoded vs llm)                    — 비교용

scripts/test_v3_cards_diff.ts    — LLM 차별화 검증 스크립트
scripts/test_dayun.ts            — 대운/십신 검증 스크립트
```

---

## 7. 다음 단계: Timeline 카드

### 7.1 추가할 카드 (대운→세운→Protocol 순서)

**Card: Chapter (대운)** — 10년 방향성
```
Q: "What chapter of life are you actually in?"
A: 현재 대운 해석 (甲午 = wood chapter with fire support)
   이전 대운과의 전환점
   다음 대운 미리보기
   십신 관계로 해석 (편관 = 외부 압력 챕터)
```

**Card: Year (세운)** — 올해 에너지
```
Q: "What is 2026 actually asking of you?"
A: 세운 해석 (丙午 = 편인/정인 에너지)
   현재 대운과 세운의 상호작용
   올해의 충돌 or 지원 방향
```

**Card: Protocol** — 첫 스텝
```
Q: "Can your brain actually learn to [X]?"
A: 뇌과학 설명 + 구체적 7일 행동 처방
```

### 7.2 구현 계획

1. `generateV3Cards()` 프롬프트에 `LuckCycleInfo` 데이터 추가
2. `V3CardContent` interface에 timeline 필드 추가
3. `ResultsV3.tsx`에 ChapterCard, YearCard 컴포넌트 추가
4. `/api/results/:reportId/v3-cards` 에서 `calculateLuckCycle()` 호출 후 전달

---

## 8. 핵심 설계 원칙 (확정)

1. **정확도 > 분량** — 한마디에 소름 = $50, 1시간 떠듬 = $5
2. **충돌 = 인사이트** — 데이터 나열 X, GAP이 "와"를 만듦
3. **Deterministic + LLM 하이브리드** — 숫자는 서버가, 해석은 LLM이
4. **짧으면 캡처** — 캡처 = 공유 = 바이럴
5. **사주 데이터 최대 활용** — 오행만이 아니라 팔자+십신+대운+세운 전부
6. **Long→Short 방향성** — 10년 챕터 → 올해 → 이번 주 → 오늘 한 가지
