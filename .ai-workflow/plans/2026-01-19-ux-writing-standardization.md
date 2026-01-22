# BADA UX Writing 표준화 계획

> 작성일: 2026-01-19
> 목표: 브랜딩 철학 기반 용어 및 GUI 통일

---

## 1. As-Is 분석

### 1.1 페이지별 톤앤매너 현황

| 페이지 | 톤 | 주요 용어 | CTA 버튼 |
|--------|-----|---------|---------|
| **Landing** | 철학적, 감정적 | Self-Alignment, OS, Birth Pattern | "Analyze My Operating System" |
| **Survey** | 신비로운, 탐험 | Navigation Chart, Depth, Final Sequence | "Generate Navigation Chart" |
| **Wait** | 친근한, 직설적 | Verification, Report, Saju | "Resend Email" |
| **Results** | 구조적, 기술적 | Acts I-V, Blueprint, Debugging | "Export Blueprint" |

---

### 1.2 핵심 불일치 사항

#### 1.2.1 같은 개념, 다른 용어

**최종 결과물 지칭:**
```
├── Landing: "Report"
├── Survey:  "Navigation Chart"
├── Wait:    "BADA report"
└── Results: "Blueprint"
          ↑
      4가지 혼용
```

**분석/진단 행위 지칭:**
```
├── Landing: "Analyze My Operating System"
├── Survey:  "Assessment" (코드 내부)
└── Results: "Analysis Complete"
```

#### 1.2.2 Saju(사주)의 모호한 위치

- 대기 페이지에서만 등장: *"with Saju insights"*
- 랜딩/설문/리포트에서는 언급 없음
- 영어 인터페이스에서 한글 개념이 갑자기 등장 → 사용자 혼란

#### 1.2.3 메타포 혼재

```
현재 사용 중인 메타포 시스템:
├── 🌊 탐험/깊이: "Current Depth", "Navigation Chart", "Abyss"
├── 💻 시스템/기술: "OS", "Hardware", "Software", "Debugging Patch"
├── 🌌 우주/자연: "Celestial coordinates", "Birth Pattern", "Element"
└── 🏥 건강/균형: "System mismatch", "Energy leaks", "Restoring Balance"
```

#### 1.2.4 톤 점프 (Tone Jump)

| 페이지 | 예시 문구 | 톤 특성 |
|--------|----------|--------|
| Landing | "Working hard, but feeling empty?" | 감정 호소 |
| Survey | "Celestial coordinates" | 신비로움 |
| Wait | "Wrong email? Click to fix" | 캐주얼 |
| Results | "Act IV: Your Life Friction" | 연극적/기술적 |

---

### 1.3 컴포넌트별 하드코딩된 텍스트 (상세)

#### HeroSection.tsx
| 텍스트 | 문제점 |
|--------|--------|
| "Analysis Complete" | ✅ OK |
| "Act I : The Core Identity" | ✅ OK |
| "Current Operating State" | ⚠️ OS 메타포 |
| "System Restoration" / "System Status" | ⚠️ OS 메타포 |

#### BlueprintSection.tsx
| 텍스트 | 문제점 |
|--------|--------|
| "Act II : Your Birth Pattern" | ⚠️ Birth Pattern? |
| "Core Insights" | ✅ OK |
| "The Shadow Side" | ✅ OK |

#### DiagnosticsSection.tsx
| 텍스트 | 문제점 |
|--------|--------|
| "Act III : Your Operating System" | 🔴 OS 메타포 |
| (axis.title은 백엔드 데이터) | 확인 필요 |

#### GlitchSection.tsx
| 텍스트 | 문제점 |
|--------|--------|
| "Act IV : Your Life Friction" | ✅ OK |
| "Career Signal" | ✅ OK |
| "Relationship Signal" | ✅ OK |
| "Resource Signal" | ✅ OK |
| "Debugging Patch Applied" | 🔴 개발자 용어 |

#### ProtocolSection.tsx
| 텍스트 | 문제점 |
|--------|--------|
| "Act V : Science Based Protocol" | ⚠️ Protocol? |
| "Daily Rituals" | ✅ OK |
| "Execution Mode" | ⚠️ 기술 용어 |
| "Environment Optimization" | ⚠️ 기술 용어 |
| "{element} Element" | ✅ OK |
| "Restoring Balance..." | ✅ OK |
| "BADA Blueprint ID:" | ⚠️ Blueprint 용어 |
| "Analysis Valid Until:" | ✅ OK |

#### Landing.tsx - 하드코딩 텍스트
| 위치 | 텍스트 | 문제점 |
|------|--------|--------|
| Hero | "BADA SELF-ALIGNMENT SYSTEM" | ⚠️ 기술 메타포 |
| Hero | "Working hard, but feeling empty?" | ✅ OK |
| Hero | "system mismatch" | ⚠️ OS 메타포 |
| Pain | "wrong operating system" | 🔴 OS 메타포 |
| How | "your **Birth Pattern**" | ⚠️ Birth Pattern |
| How | "**Operating System (OS)**" | 🔴 OS 메타포 |
| How | "Hardware", "Software", "energy leaks" | 🔴 기술 메타포 전체 |
| Preview | "Your Life Blueprint" | ⚠️ Blueprint |
| Preview | "Your Natural Blueprint" | ⚠️ Blueprint 또 |
| Preview | "Your Current Operating System" | 🔴 OS 메타포 |
| Preview | "Your Action Protocol" | ⚠️ Protocol |
| CTA | "Analyze My Operating System" | 🔴 OS 메타포 |
| Nav | "Why Lost?" / "The How" / "Preview" | ✅ OK |
| Sticky | "Start your self-alignment" | ⚠️ 검토 필요 |
| Sticky | "Start Analysis" | ✅ OK |

**Landing.tsx 핵심 문제:**
1. OS/Hardware/Software/System 메타포 과다 사용
2. "Birth Pattern" 용어
3. "Blueprint" 용어 2회
4. "Protocol" 용어

#### Wait.tsx - 하드코딩 텍스트
| 텍스트 | 문제점 |
|--------|--------|
| "Your Report is Ready!" | ✅ OK |
| "We sent a verification link to:" | ✅ OK |
| "...BADA report with Saju insights." | 🔴 **SAJU 노출!** |
| "Resend Verification Email" | ✅ OK |
| "Wrong email? Click to fix" | ✅ OK |

#### lib/email.ts - 이메일 템플릿
| 위치 | 텍스트 | 문제점 |
|------|--------|--------|
| Subject | "BADA Assessment Results Ready" | ✅ OK |
| Header | "Operating Pattern Assessment" | ⚠️ Operating 용어 |
| Body | "personalized Operating Pattern report with Saju insights" | 🔴 **SAJU + Operating** |
| CTA | "View My Results" | ✅ OK |

---

### 1.4 Landing Preview ↔ Results Act 매칭 문제

**현재 불일치 상태:**

| Landing Preview | Results Act | 문제 |
|-----------------|-------------|------|
| "Your Life Blueprint" | Act I: The Core Identity | 🔴 다름 |
| "Your Natural Blueprint" | Act II: Your Birth Pattern | 🔴 다름 |
| "Your Current Operating System" | Act III: Your Operating System | ⚠️ 비슷하나 OS 용어 |
| "The Core Tension" | Act IV: Your Life Friction | 🔴 다름 |
| "Your Action Protocol" | Act V: Science Based Protocol | ⚠️ 비슷 |

**통일안 필요** - 둘 중 하나로 맞춰야 함

---

### 1.5 색상 코딩 시스템 (유지)

| 색상 | 용도 |
|------|------|
| 🟢 Emerald | Identity, Insights, Environment |
| 🔴 Rose | Shadow, Friction |
| 🔵 Blue | Current State |
| 🩵 Cyan | 헤더 |

---

### 1.5 PDF vs 웹 불일치 (pdfExport.ts)

| 섹션 | 웹 (Results) | PDF | 문제 |
|------|-------------|-----|------|
| 커버 | "Analysis Complete" | "BADA ANALYSIS COMPLETE" | 불일치 |
| Act I | "Act I : The Core Identity" | "CORE IDENTITY" (Act 없음) | 포맷 불일치 |
| Act II | "Act II : Your Birth Pattern" | "ACT II: THE BLUEPRINT" | 🔴 완전 다름 |
| Act III | "Act III : Your Operating System" | "ACT III: SAJU O.S." | 🔴 SAJU 노출! |
| Act IV | "Act IV : Your Life Friction" | (PDF에 없음) | 누락 |
| Act V | "Act V : Science Based Protocol" | "ACT V: SYSTEM PROTOCOL" | 불일치 |
| 기타 | "Environment Optimization" | "ENVIRONMENT OPTIMIZATION" | OK (동일) |
| 파일명 | - | `{name}_BADA_Blueprint.pdf` | Blueprint 용어 |

**PDF 하드코딩 위치**: `client/src/lib/pdfExport.ts`
- Line 64: "BADA ANALYSIS COMPLETE"
- Line 74: "CORE IDENTITY"
- Line 84: "ACT II: THE BLUEPRINT"
- Line 97: "THE SHADOW SIDE"
- Line 107: "ACT III: SAJU O.S." 🔴
- Line 135: "ACT V: SYSTEM PROTOCOL"
- Line 157: "ENVIRONMENT OPTIMIZATION"
- Line 161: 파일명 `_BADA_Blueprint.pdf`

---

### 1.6 문제 심각도 정리

| 카테고리 | 문제 | 심각도 |
|---------|------|--------|
| 용어 통일 | Report/Blueprint/Navigation Chart 혼용 | 🔴 높음 |
| 핵심 개념 | "Saju" 설명 없이 등장 | 🔴 높음 |
| 메타포 | 4가지 메타포 혼재 | 🟡 중간 |
| 톤 | 페이지별 급격한 톤 변화 | 🟡 중간 |
| CTA | 버튼 라벨 불일치 | 🟡 중간 |

---

## 2. 브랜딩 철학 & 메타포

### 2.1 선택된 방향: 서핑/파도 + 자연 리듬 (10~20%만)

> **"You cannot stop the waves, but you can learn to surf."**

#### 핵심 원칙
```
✅ 90%는 직관적인 일상 단어 (Report, Analysis, Strength, Weakness)
✅ 10%만 브랜드 터치 (Flow, Nature 정도)
✅ 서핑 메타포는 태그라인/카피에서만, UI 용어는 직관적으로
```

#### 핵심 컨셉
```
파도 = 삶의 변화, 도전, 환경
서핑 = 그 변화에 맞춰 타는 기술
리듬 = 당신만의 고유한 패턴/타이밍
```

#### 브랜드 포지셔닝
- **금지어**: Saju, 사주, fortune, destiny, horoscope, astrology
- **허용 표현**:
  - "Ancient eastern wisdom" (동양의 오래된 지혜)
  - "Your natural rhythm" (당신의 자연스러운 리듬)
  - "Birth timing data" (출생 타이밍 데이터)
  - "Neuroscience" / "Mind science" (Neuroscience)
  - "Your natural rhythm" (Chronobiology)

#### 태그라인 후보
```
"Flow with your nature."
```

---

### 2.2 언어 가이드라인

#### 타겟 영어 수준: IELTS 5.5 (중급)

**원칙:**
- 1-2음절 단어 선호
- 학술 용어 → 일상 단어로 대체
- 은유는 직관적으로

**용어 변환 예시:**
| 어려운 표현 | 쉬운 표현 |
|------------|----------|
| chronobiology | your natural rhythm |
| optimization | find your best way |
| synchronization | get in sync |
| inherent pattern | the way you're built |
| calibration | fine-tuning |

---

### 2.3 톤앤매너 통일

**전체 톤**: 따뜻하지만 신뢰감 있는, 코치 같은 목소리

| 요소 | 가이드 |
|------|--------|
| 인칭 | "You/Your" 중심 (2인칭) |
| 문장 | 짧고 명확하게 (15단어 이내) |
| 감정 | 공감 → 희망 → 행동 유도 |
| 과학 | "연구에 따르면" 대신 "We found that..." |

**톤 스펙트럼:**
```
[캐주얼] ----[BADA]---- [포멀]
         ↑
    친근하지만 전문적
    (친구 같은 코치)
```

---

## 3. To-Be 용어 사전

### 3.1 핵심 용어 통일

| 개념 | As-Is (혼용) | To-Be (통일) |
|------|-------------|-------------|
| 최종 결과물 | Report, Blueprint, Navigation Chart | **Report** |
| 분석 행위 | Analyze, Assessment, Analysis | **Analysis** |
| 사주/생년월일/핵심 성향 | Saju, Birth Pattern, Core Identity | **Your Nature** |
| 현재 상태 | Operating State, Operating Rate | **Current State** |
| 문제점/마찰 | Friction, Glitch, Shadow | **Friction** |
| 해결책 | Protocol, Debugging Patch | **Tip** / **Guide** |
| 강점 | Core Insights | **Strength** |
| 약점 | Shadow Side | **Weakness** |

### 3.2 하드코딩 텍스트 변경안

| 컴포넌트 | As-Is | To-Be | 비고 |
|----------|-------|-------|------|
| Hero | "Act I : The Core Identity" | **"Part 1. Who You Are"** | Act→Part |
| Hero | "Current Operating State" | **"Current State"** | OS 제거 |
| Hero | "System Restoration/Status" | **"Flow Status"** | 🏄 브랜드 터치 |
| Blueprint | "Act II : Your Birth Pattern" | **"Part 2. Your Nature"** | Act→Part |
| Diagnostics | "Act III : Your Operating System" | **"Part 3. Your Mind"** | Act→Part, OS 제거 |
| Glitch | "Act IV : Your Life Friction" | **"Part 4. Your Friction"** | Act→Part |
| Glitch | "Debugging Patch Applied" | **"Quick Tip"** | 개발자 용어 제거 |
| Protocol | "Act V : Science Based Protocol" | **"Part 5. Your Guide"** | Act→Part |
| Protocol | "Execution Mode" | **삭제 또는 유지** | 검토 필요 |
| Protocol | "Environment Optimization" | **"Your Environment"** | 직관적 |
| Protocol | "BADA Blueprint ID" | **"BADA Report ID"** | 통일 |

### 3.3 CTA 버튼 통일

| 위치 | As-Is | To-Be |
|------|-------|-------|
| Landing 메인 | "Analyze My Operating System" | **"Start Analysis"** |
| Survey 제출 | "Generate Navigation Chart" | **"Get My Report"** |
| Results 내보내기 | "Export Blueprint" | **"Save Report"** |
| 재전송 | "Resend Verification Email" | **"Resend Email"** (유지) |

### 3.4 PDF 텍스트 변경안 (pdfExport.ts)

| Line | As-Is | To-Be |
|------|-------|-------|
| 64 | "BADA ANALYSIS COMPLETE" | **"ANALYSIS COMPLETE"** |
| 74 | "CORE IDENTITY" | **"WHO YOU ARE"** |
| 84 | "ACT II: THE BLUEPRINT" | **"PART 2. YOUR NATURE"** |
| 97 | "THE SHADOW SIDE" | ✅ 유지 |
| 107 | "ACT III: SAJU O.S." | **"PART 3. YOUR MIND"** 🔴 |
| 135 | "ACT V: SYSTEM PROTOCOL" | **"PART 5. YOUR GUIDE"** |
| 157 | "ENVIRONMENT OPTIMIZATION" | **"YOUR ENVIRONMENT"** |
| 161 | `_BADA_Blueprint.pdf` | **`_BADA_Report.pdf`** |

**추가 필요**: Part 4 (Friction) PDF에 누락됨 - 추가 여부 검토

### 3.5 Landing 텍스트 변경안 (Landing.tsx)

#### Hero Section
| As-Is | To-Be |
|-------|-------|
| "BADA SELF-ALIGNMENT SYSTEM" | **"BADA"** (심플하게) |
| "system mismatch" | **"out of sync"** 또는 그냥 삭제 |

#### Pain Section (Line 174)
| As-Is | To-Be |
|-------|-------|
| "wrong operating system" | **"not in your flow"** 🏄 |

#### How Section (Line 194-197) - 전체 리라이팅 필요
| As-Is | To-Be |
|-------|-------|
| "Birth Pattern" | **"your natural rhythm"** |
| "Operating System (OS)" | **"how your mind works"** |
| "Hardware" | **"your nature"** (타고난 것) |
| "Software" | **"your patterns"** (반응/사고 패턴) |
| "energy leaks" | **"what drains you"** |

**변경안 예시:**
> "BADA offers a new kind of analysis. We blend ancient eastern wisdom about your **natural rhythm** with modern neuroscience. The result is a clear picture of **how your mind works** — your nature, your patterns, and what drains you."

#### Preview Section (Line 217-221)
| As-Is | To-Be |
|-------|-------|
| "Your Life Blueprint" | **"Who You Are"** |
| "Your Natural Blueprint" | **"Your Nature"** |
| "Your Current Operating System" | **"How Your Mind Works"** |
| "The Core Tension" | **"Your Friction"** |
| "Your Action Protocol" | **"Your Guide"** |

#### CTA Button (Line 273)
| As-Is | To-Be |
|-------|-------|
| "Analyze My Operating System" | **"Start My Analysis"** |

### 3.6 Landing Preview ↔ Results 섹션 통일안

| # | Landing Preview (To-Be) | Results 섹션 (To-Be) |
|---|------------------------|----------------------|
| 1 | "Who You Are" | **Part 1. Who You Are** |
| 2 | "Your Nature" | **Part 2. Your Nature** |
| 3 | "How Your Mind Works" | **Part 3. Your Mind** |
| 4 | "Your Friction" | **Part 4. Your Friction** |
| 5 | "Your Guide" | **Part 5. Your Guide** |

**변경: Act I~V → Part 1~5** (더 직관적, 덜 연극적)

**수정 파일:**
- `Landing.tsx` Line 217-221 (Preview 리스트)
- `HeroSection.tsx` (Act I 타이틀)
- `BlueprintSection.tsx` (Act II 타이틀)
- `DiagnosticsSection.tsx` (Act III 타이틀)
- `GlitchSection.tsx` (Act IV 타이틀) - 이미 Friction이라 OK
- `ProtocolSection.tsx` (Act V 타이틀)
- `pdfExport.ts` (PDF Act 타이틀들)

### 3.7 Wait.tsx 변경안

| As-Is | To-Be |
|-------|-------|
| "...BADA report with Saju insights." | **"...your personalized BADA report."** |

### 3.8 lib/email.ts 변경안

| 위치 | As-Is | To-Be |
|------|-------|-------|
| Header | "Operating Pattern Assessment" | **"Personal Analysis"** |
| Body | "Operating Pattern report with Saju insights" | **"personalized report"** |

---

## 4. 페이지별 To-Be 문구 (TODO)

### 4.1 Landing Page

**Hero Section**
- Headline:
- Sub-headline:
- CTA:

**Value Props**
- Section 1 Title:
- Section 2 Title:
- Section 3 Title:

### 4.2 Survey Page

**Progress Indicator**:
**Final Step Title**:
**Submit CTA**:

### 4.3 Wait Page

**Headline**:
**Description**:

### 4.4 Results Page

**각 Act 타이틀 유지/변경 여부**:
- Act I:
- Act II:
- Act III:
- Act IV:
- Act V:

---

## 5. 관련 파일

| 파일 | 설명 |
|------|------|
| `client/src/pages/Landing.tsx` | 랜딩페이지 |
| `client/src/pages/Survey.tsx` | 설문페이지 |
| `client/src/pages/Wait.tsx` | 대기페이지 |
| `client/src/pages/Results.tsx` | 결과페이지 |
| `client/src/components/report-v2/HeroSection.tsx` | 리포트 히어로 |
| `client/src/components/report-v2/BlueprintSection.tsx` | 리포트 Act II |
| `client/src/components/report-v2/DiagnosticsSection.tsx` | 리포트 Act III |
| `client/src/components/report-v2/GlitchSection.tsx` | 리포트 Act IV |
| `client/src/components/report-v2/ProtocolSection.tsx` | 리포트 Act V |

---

## 6. 작업 로그

| 날짜 | 작업 내용 |
|------|----------|
| 2026-01-19 | As-Is 분석 완료 |
| 2026-01-19 | 브랜딩 철학 확정: 서핑 메타포 10~20%, 나머지 직관적 단어 |
| 2026-01-19 | 핵심 용어 사전 v1 완성 |
| 2026-01-19 | 컴포넌트별 하드코딩 텍스트 상세 분석 추가 |
| 2026-01-19 | Wave Chart/Surf Tip 제거, 직관적 용어로 수정 (v2) |
| 2026-01-19 | PDF vs 웹 불일치 분석 추가 (SAJU O.S. 발견!) |
| 2026-01-19 | Landing.tsx 하드코딩 분석 및 변경안 추가 |
| 2026-01-19 | Wait.tsx, email.ts 분석 (SAJU 발견 2건 추가) |
| 2026-01-19 | Landing Preview ↔ Results Act 매칭 테이블 작성 |
| 2026-01-19 | Act I~V → Part 1~5 변경, "habits" → "patterns" 수정 |
| 2026-01-19 | **코드 적용 완료** - 9개 파일 수정 |
| | - HeroSection.tsx ✅ |
| | - BlueprintSection.tsx ✅ |
| | - DiagnosticsSection.tsx ✅ |
| | - GlitchSection.tsx ✅ |
| | - ProtocolSection.tsx ✅ |
| | - pdfExport.ts ✅ (Part 4 추가) |
| | - Landing.tsx ✅ |
| | - Wait.tsx ✅ |
| | - lib/email.ts ✅ |
| | |
