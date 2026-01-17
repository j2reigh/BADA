# Results Page Redesign v2

**작성일:** 2026-01-16
**목적:** 가독성 개선 + Pinterest 감성 적용
**상태:** In Progress

---

## 1. 현재 문제점

| 문제 | 현재 상태 | 개선 방향 |
|------|-----------|-----------|
| 카드 과다 | 섹션당 3-4개 카드, 테두리 난립 | 카드 줄이고 타이포그래피 중심 |
| 색상 혼란 | 초록/파랑/회색/주황 혼재 | 오행 기반 단일 색상 테마 |
| 어두운 블록 | OS/Solution 섹션 어둡고 무거움 | 밝은 배경 + 컬러 악센트 |
| 작은 텍스트 | text-sm, text-xs 과다 | text-base 이상, 여백 확대 |
| 패럴랙스 약함 | blur + opacity 60%로 거의 안보임 | 선명도 높이고 효과 강화 |

---

## 2. 디자인 방향

### 2.1 Pinterest 감성 (NOT Minimalist)
- **Vibrant gradients** - 선명한 그라디언트 배경
- **Textured overlays** - 오행 이미지 레이어
- **Bold typography** - 큰 제목, 넉넉한 여백
- **Color-rich** - 단색이 아닌 풍부한 색감

### 2.2 오행 기반 색상 테마

| 오행 | Primary | Accent | Gradient |
|------|---------|--------|----------|
| 木 (Wood) | emerald-600 | lime-400 | emerald → teal |
| 火 (Fire) | rose-600 | orange-400 | rose → amber |
| 土 (Earth) | amber-600 | yellow-400 | amber → orange |
| 金 (Metal) | slate-500 | zinc-300 | slate → gray |
| 水 (Water) | blue-600 | cyan-400 | blue → indigo |

### 2.3 레이아웃

**Desktop (≥768px)**
```
┌─────────────────────────────────────────────┐
│ [LEFT 60%]              │ [RIGHT 40%]       │
│                         │                   │
│ 스크롤 콘텐츠           │ 고정 패럴랙스     │
│ - 큰 제목               │ 배경              │
│ - 넉넉한 여백           │                   │
│ - 섹션별 구분선         │ 오행 오버레이     │
│                         │ + 그라디언트      │
└─────────────────────────────────────────────┘
```

**Mobile (<768px)**
```
┌─────────────────────┐
│ 🎨 고정 비주얼      │ ← 40vh, 캡처용
│ (오행 오버레이      │
│  + 제목)            │
├─────────────────────┤
│ 📄 스크롤 콘텐츠    │
│ - 심플한 카드       │
│ - 읽기 쉬운 텍스트  │
└─────────────────────┘
```

---

## 3. 컴포넌트 변경 사항

### 3.1 ParallaxBackground.tsx
**변경:**
- opacity 60% → 80% (더 선명하게)
- blur-sm → blur-[2px] (살짝만 블러)
- 그라디언트 오버레이 강화
- 오행별 그라디언트 색상 적용

### 3.2 FixedTopVisual.tsx
**변경:**
- 제목 크기 증가
- 그라디언트 오버레이 오행별 색상
- 브랜딩 텍스트 스타일 개선

### 3.3 Section Components (Results.tsx)
**IdentitySection:**
- 카드 3개 → 심플 텍스트 블록
- 제목 크기 증가 (5xl → 6xl)
- 서브타이틀 강조

**HardwareSection:**
- 그라디언트 카드 제거 → 깔끔한 텍스트
- Core Insights 리스트 스타일 개선

**OSSection:**
- 어두운 배경 제거
- 3축 카드 → 심플 블록 + 컬러 악센트

**MismatchSection:**
- 테두리 카드 제거
- 깔끔한 텍스트 레이아웃

**SolutionSection:**
- 어두운 배경 제거
- 리추얼 카드 심플화

**LockedSection:**
- 더 눈에 띄는 잠금 UI

---

## 4. 색상 시스템

```typescript
// 오행별 테마 색상
const ELEMENT_THEMES = {
  overlay_wood: {
    primary: "text-emerald-700",
    accent: "bg-emerald-500",
    gradient: "from-emerald-50 via-teal-50 to-cyan-50",
    border: "border-emerald-200",
  },
  overlay_fire: {
    primary: "text-rose-700",
    accent: "bg-rose-500",
    gradient: "from-rose-50 via-orange-50 to-amber-50",
    border: "border-rose-200",
  },
  overlay_earth: {
    primary: "text-amber-700",
    accent: "bg-amber-500",
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    border: "border-amber-200",
  },
  overlay_metal: {
    primary: "text-slate-700",
    accent: "bg-slate-500",
    gradient: "from-slate-50 via-gray-50 to-zinc-50",
    border: "border-slate-200",
  },
  overlay_water: {
    primary: "text-blue-700",
    accent: "bg-blue-500",
    gradient: "from-blue-50 via-indigo-50 to-purple-50",
    border: "border-blue-200",
  },
};
```

---

## 5. 타이포그래피 가이드

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 메인 제목 | text-5xl | text-6xl md:text-7xl |
| 섹션 제목 | text-3xl | text-4xl font-light |
| 서브 제목 | text-xl | text-2xl |
| 본문 | text-sm | text-base leading-relaxed |
| 설명 | text-xs | text-sm |

---

## 6. 구현 순서

1. [x] 기획서 업데이트
2. [ ] ParallaxBackground 개선
3. [ ] FixedTopVisual 개선
4. [ ] Results.tsx 섹션 컴포넌트 전면 리팩토링
5. [ ] 테스트

---

## 7. 참고 자료

- **Olivier Larose Parallax Tutorial**: clip-path + fixed + useTransform 기법
- **Pinterest 레퍼런스**: 모던 그라디언트, 레이어드 구성, 대담한 타이포
- **오행 오버레이 이미지**: `/overlays/overlay_[element].png`
