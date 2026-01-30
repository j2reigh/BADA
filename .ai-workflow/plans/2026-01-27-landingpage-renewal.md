# Landing Page Renewal Plan (v2)

**Date:** 2026-01-27
**Core Strategy:** Two-Track UX — 즉시 행동 vs. 설득 스크롤

---

## Problem Statement

현재 랜딩페이지는 "읽고 → 결정하고 → 시작" 구조.
**문제:** 유저는 버튼 누르기조차 귀찮아함. 스크롤 피로도 높음.

**Solution:** Hero에서 Q1을 바로 보여주고, 답변 클릭 = 진단 시작.
스크롤은 의심 많은 유저를 위한 "설득 서사"로 분리.

---

## As-Is vs. To-Be

| Area | As-Is | To-Be |
|------|-------|-------|
| **Hero** | 텍스트 + "Discover Why" 스크롤 유도 | 좌: 롤링 카피 / 우: Q1 임베디드 카드 |
| **CTA** | 하단 고정 "Start Analysis" | "Continue Diagnosis" + Progress 0% |
| **설득 구조** | 4개 섹션 (장황함) | 4개 섹션 (간결 + 비주얼 강화) |
| **Saju 언급** | 없음 | Easter Egg로 숨김 (Intel Inside 전략) |
| **Social Proof** | 없음 | Instagram Moodboard |

---

## Section 1: The Hero (The Door)

**목표:** 0% 이탈률. 한 화면에 다 담고, 클릭 = 시작.

### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│  BADA                                         [Menu]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Stop Guessing.                    ┌─────────────────────┐ │
│   ─────────────────                 │  When things get    │ │
│   [Why you are burnt out._]         │  intense, what      │ │
│                                     │  happens first?     │ │
│   ↑ Typewriter rotation             │                     │ │
│                                     │  [🔥 Alert mode  ]  │ │
│                                     │  [😰 Overwhelmed ]  │ │
│                                     │  [🏃 Escape      ]  │ │
│                                     │  [🤷 It depends..]  │ │
│                                     │                     │ │
│                                     │  ────────────────── │ │
│                                     │  0% · 5 min        │ │
│                                     └─────────────────────┘ │
│                                                             │
│                        ↓ Scroll for more                    │
└─────────────────────────────────────────────────────────────┘
```

### Left: The Message
- **Static:** "Stop Guessing."
- **Rolling (Typewriter, 3s interval):**
  1. "Why you are burnt out." → 직장인
  2. "Why your brain is foggy." → Gen Z
  3. "Who you really are." → 힙스터/셀프 디스커버리

### Right: Embedded Q1 Card
- **Design:** 흰색 카드, 그림자, 둥근 모서리
- **Question:** "When things get intense or chaotic, what happens first?"
- **Options (4개):**
  - "I become more alert and focused" → `high_pitta`
  - "I feel overwhelmed or emotional" → `high_kapha`
  - "I try to escape the situation" → `high_vata`
  - "It depends on the situation" → `neutral`
- **Footer:** "0% complete · Takes 5 minutes"

### Interaction Logic
```
클릭 → localStorage에 firstAnswer 저장 → /survey?q=2 로 이동
```

### Mobile Layout
```
┌─────────────────────┐
│  BADA        [☰]   │
├─────────────────────┤
│                     │
│  Stop Guessing.     │
│  ─────────────────  │
│  [Why you are...]   │
│                     │
│  ┌───────────────┐  │
│  │ When things.. │  │
│  │               │  │
│  │ [Option 1   ] │  │
│  │ [Option 2   ] │  │
│  │ [Option 3   ] │  │
│  │ [Option 4   ] │  │
│  │               │  │
│  │ 0% · 5 min    │  │
│  └───────────────┘  │
│                     │
│      ↓ More         │
└─────────────────────┘
```

---

## Sticky CTA (The Nudge)

**Trigger:** Hero 섹션 벗어나면 나타남 (scrollY > heroHeight)

### Desktop: Top Bar
```
┌─────────────────────────────────────────────────────────────┐
│  [■□□□□□□□□□] 0%        You started something.  [Continue →]│
└─────────────────────────────────────────────────────────────┘
```

### Mobile: Bottom Sheet
```
┌─────────────────────┐
│ ████░░░░░░░░░░ 0%  │
│ [Continue Diagnosis]│
└─────────────────────┘
```

### Psychology
Zeigarnik Effect — 시작한 건 끝내고 싶어함.
"너 아까 진단하려다 말았잖아."

---

## Section 2: The Problem (Empathy)

**목표:** "내 얘기다" 공감 유발

### Copy
- **Headline:** "Why does hard work feel empty?"
- **Subhead:** "It's not your lack of effort."
- **Body:** "The problem is an **Energy Mismatch** — your operating system is running code that wasn't written for you."

### Visual Concept
- **Option A:** 방전된 배터리 아이콘 (🔋→💀)
- **Option B:** 얽힌 전선/뇌 회로 일러스트
- **Animation:** 배터리가 천천히 방전되는 모션

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        [🔋 Discharged Battery Visual]                       │
│                                                             │
│   "Why does hard work feel empty?"                          │
│   ───────────────────────────────                           │
│   It's not your lack of effort.                             │
│   The problem is Energy Mismatch.                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 3: The Solution (Tech Re-branding)

**목표:** "사주"를 기술 용어로 세탁. 신뢰도 확보.

### Copy
- **Headline:** "We don't do fortune telling."
- **Subhead:** "We analyze **Time-Data**."
- **Body:**
  > BADA uses a 2,000-year-old algorithm called 'The 60-Year Cycle' to map your innate energy pattern.
  > Think of it as **DNA profiling for your soul**.

### Easter Egg (Hover/Tap)
`"The 60-Year Cycle"` 위에 마우스 올리면 툴팁:
> "In Korea, we call this logic **'Saju'** (四柱)."

### Visual
- BADA 리포트 목업 이미지 (기울어진 카드 스택)
- 또는 간단한 "Input → Algorithm → Output" 다이어그램

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   We don't do fortune telling.                              │
│   We analyze Time-Data.                                     │
│   ────────────────────────                                  │
│                                                             │
│   BADA uses a 2,000-year-old algorithm                      │
│   called [The 60-Year Cycle]* to map your                   │
│   innate energy pattern.                                    │
│                                                             │
│   Think of it as DNA profiling for your soul.               │
│                                                             │
│   * hover: "In Korea, we call this 'Saju'"                  │
│                                                             │
│              [Report Mockup Image]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 4: The Vibe Check (Social Proof)

**목표:** "진짜 사람들이 쓰는구나" 신뢰 + 브랜드 무드

### Copy
- **Headline:** "Real People, Real Grounding."
- **Alt:** "Join the Ritual"

### Content
- Instagram 피드 임베드: `@badathebrand`
- **Layout:** Moodboard 스타일 (불규칙 그리드, Pinterest 느낌)

### Implementation Options
1. **Instagram Basic Display API** (공식, 인증 필요)
2. **Static 이미지** (수동 업데이트, 심플)
3. **Elfsight/SnapWidget** (3rd party embed)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Real People, Real Grounding.                              │
│   ────────────────────────────                              │
│                                                             │
│   ┌─────┐ ┌───────────┐ ┌─────┐                             │
│   │ IMG │ │    IMG    │ │ IMG │                             │
│   └─────┘ └───────────┘ └─────┘                             │
│   ┌───────────┐ ┌─────┐ ┌─────┐                             │
│   │    IMG    │ │ IMG │ │ IMG │                             │
│   └───────────┘ └─────┘ └─────┘                             │
│                                                             │
│              [@badathebrand →]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 5: Final CTA

**목표:** 마지막 한방. 스크롤 끝까지 온 유저 전환.

### Copy
- **Tagline:** "Stop Guessing. Start Aligning."
- **Headline:** "In the age of AI, be more human."
- **Subtext:** "The analysis takes 5 minutes. The clarity lasts a lifetime."
- **Button:** "Start My Analysis →"

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│             STOP GUESSING. START ALIGNING.                  │
│                                                             │
│        In the age of AI, be more human.                     │
│        ─────────────────────────────────                    │
│                                                             │
│        The analysis takes 5 minutes.                        │
│        The clarity lasts a lifetime.                        │
│                                                             │
│              [  Start My Analysis →  ]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Components to Create/Modify
- [ ] `TypewriterText.tsx` — 롤링 텍스트 컴포넌트
- [ ] `EmbeddedDiagnosticCard.tsx` — Hero용 Q1 카드
- [ ] `StickyProgressBar.tsx` — 스크롤 시 나타나는 CTA
- [ ] `InstagramMoodboard.tsx` — Section 4용

### Landing.tsx 구조
```tsx
<Landing>
  <Header />
  <HeroSection>
    <TypewriterText />
    <EmbeddedDiagnosticCard />
  </HeroSection>
  <StickyProgressBar />
  <ProblemSection />      // Section 2
  <SolutionSection />     // Section 3
  <VibeCheckSection />    // Section 4
  <FinalCTASection />     // Section 5
</Landing>
```

### Data Flow
```
Hero Q1 클릭
  → localStorage.setItem('firstAnswer', value)
  → navigate('/survey?q=2')

Survey.tsx
  → useEffect: check localStorage.firstAnswer
  → if exists: start from Q2, prefill Q1
```

---

## Design Tokens (Reference)

```css
/* Colors from existing brand */
--blue-primary: #233F64;
--blue-dark: #182339;
--blue-light: #ABBBD5;
--blue-mid: #879DC6;
--brown-primary: #402525;

/* New for Landing */
--card-bg: #FFFFFF;
--card-shadow: 0 8px 32px rgba(0,0,0,0.12);
--text-muted: rgba(255,255,255,0.6);
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Hero → Survey 전환율 | ~15% | 30%+ |
| Avg. Scroll Depth | 40% | 60%+ |
| Bounce Rate | ~60% | <40% |

---

## Open Questions

1. **Instagram 연동 방식** — API vs. Static vs. Widget?
2. **Q1 선택지 문구** — 현재 Survey Q1과 동일하게 할지?
3. **Mobile 우선?** — Hero 레이아웃 모바일 먼저 확정?
