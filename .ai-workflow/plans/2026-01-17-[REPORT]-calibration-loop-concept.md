# Calibration Section: Change Card - 회고 맛보기

**작성일:** 2026-01-17
**목적:** 리포트 기반 "바꾸고 싶은 것" 선택 → Action Item 연결 → **카드 이미지 저장/공유**
**상태:** Concept v9 (Change Card + Image Export)

---

## 핵심 원리

바꾸고 싶은 것 선택 → 연결된 Action Item 제시 → **카드 이미지 저장**

**글쓰기 ❌** (마찰 최소화)
**기존 리포트 데이터 활용 ✅** (Shadow, Friction, Quick Tips)
**이미지 저장 = 심리적 커밋 ✅**
**배경화면/공유 → 상기 + 바이럴 ✅**

---

## 선택지: 6개 Change Target

### 선택지 구조 (6개 고정)

| # | 카테고리 | 소스 (리포트) | 연결 Action Item |
|---|----------|--------------|------------------|
| 1 | **OS: Alarm** | page3_os.threat_axis | daily_rituals[0] |
| 2 | **OS: Processing** | page3_os.environment_axis | daily_rituals[1] |
| 3 | **OS: Drive** | page3_os.agency_axis | daily_rituals[2] |
| 4 | **Friction: Work** | page4_mismatch.career_friction | career_friction.quick_tip |
| 5 | **Friction: Relationship** | page4_mismatch.relationship_friction | relationship_friction.quick_tip |
| 6 | **Friction: Money** | page4_mismatch.money_friction | money_friction.quick_tip |

### 데이터 매핑

```typescript
interface ChangeOption {
  id: 'alarm' | 'processing' | 'drive' | 'work' | 'relationship' | 'money';
  category: 'os' | 'friction';
  label: string;           // 리포트에서 가져온 레벨/타이틀
  description: string;     // 리포트에서 가져온 설명 (truncated)
  actionItem: {
    name: string;          // ritual name 또는 "Quick Tip"
    description: string;   // 구체적 행동
  };
}
```

### 예시 (test_report_output.json 기준)

```typescript
const options: ChangeOption[] = [
  // OS 3개
  {
    id: 'alarm',
    category: 'os',
    label: 'Relaxed Alarm',
    description: "Your Amygdala is quite relaxed... sometimes means you might not quickly spot subtle warning signs.",
    actionItem: {
      name: 'Morning Sunlight Exposure',
      description: "Right after waking, within 30 minutes, step outside or sit by a bright window for 10-15 minutes..."
    }
  },
  {
    id: 'processing',
    category: 'os',
    label: 'Steady Processing',
    description: "You have a steady way of processing the world around you...",
    actionItem: {
      name: 'Micro-Win Momentum',
      description: "Choose one tiny, easy task related to a 'whispered vision'..."
    }
  },
  {
    id: 'drive',
    category: 'os',
    label: 'Conservation Mode',
    description: "Your drive engine operates in a conservation mode...",
    actionItem: {
      name: 'Reflective Gratitude & Future Spark',
      description: "Before bed, take a few moments to quietly list 1-3 things..."
    }
  },
  // Friction 3개
  {
    id: 'work',
    category: 'friction',
    label: 'At Work',
    description: "You likely see creative solutions... but often keep them to yourself.",
    actionItem: {
      name: 'Quick Tip',
      description: "Next time you have an idea, try writing it down before the meeting..."
    }
  },
  {
    id: 'relationship',
    category: 'friction',
    label: 'In Relationships',
    description: "Your quiet, observant nature can sometimes be misinterpreted...",
    actionItem: {
      name: 'Quick Tip',
      description: "When someone is sharing, practice active listening..."
    }
  },
  {
    id: 'money',
    category: 'friction',
    label: 'With Money',
    description: "Your relaxed, unhurried approach means you might not feel a strong urge...",
    actionItem: {
      name: 'Quick Tip',
      description: "Set up a monthly 'Money Check-in' in your calendar..."
    }
  }
];
```

---

## Interaction Flow: Change Card

### 1. 선택지 제시 (6개) - v10 디자인 개선 (카드 설명 추가)

리포트 마지막에 "바꾸고 싶은 것" 선택지 등장. 각 카드에 요약 설명(Preview)을 포함하여 선택 돕기.

```
┌─────────────────────────────────────────────┐
│                                             │
│  What would you like to change?             │
│                                             │
│  YOUR OPERATING SYSTEM                      │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐
│  │ Relaxed       │ │ Steady        │ │Conservation │
│  │ Alarm         │ │ Processing    │ │ Mode        │
│  │               │ │               │ │             │
│  │ "Vigilance..."│ │ "Methodical.."│ │ "Resting..."│
│  └───────────────┘ └───────────────┘ └─────────────┘
│                                             │
│  WHERE YOU GET STUCK                        │
│  ┌───────────────┐ ┌───────────────┐ ┌─────────────┐
│  │ At Work       │ │ In            │ │ With        │
│  │               │ │ Relationships │ │ Money       │
│  │               │ │               │ │             │
│  │ "Holding back"│ │ "Misunder..." │ │ "No urge..."│
│  └───────────────┘ └───────────────┘ └─────────────┘
│                                             │
└─────────────────────────────────────────────┘
```

**[v10 개선사항]**: 
- 카드 선택 전, 사용자가 내용을 짐작할 수 있도록 **요약(Snippet)** 추가.
- 예: OS 카드는 `description`의 첫 문장, Friction 카드는 `title` 또는 `description`의 핵심 키워드 표시.

**[v11 변경사항]**:
- "I'm good for now" 버튼 삭제. (사용자가 선택을 원하지 않으면 그냥 이탈하면 됨. 불필요한 선택지 제거)


### 2. 선택 → 모달로 Action Card 표시

선택하면 → **모달**이 열리며 Action Card 이미지 표시.

```
┌─────────────────────────────────────────────┐
│  ╳                                          │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │           Conservation Mode             │ │
│ │                                         │ │
│ │  ─────────────────────────────────────  │ │
│ │                                         │ │
│ │  💡 Reflective Gratitude                │ │
│ │     & Future Spark                      │ │
│ │                                         │ │
│ │  Before bed, quietly list 1-3 things    │ │
│ │  you're grateful for. Then imagine      │ │
│ │  completing one small desired action.   │ │
│ │                                         │ │
│ │                         BADA ✦          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│         [ 💾 Save Image ]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. 사용자 액션

| 액션 | 결과 |
|------|------|
| **Save Image** 클릭 | 이미지 다운로드 + DB 기록 |
| **╳** 클릭 | 모달 닫기 (선택은 DB에 기록됨) |
| 모달 바깥 클릭 | 모달 닫기 |

### 4. 저장 완료

- 이미지 다운로드 = 심리적 커밋
- 선택 기록 DB 저장 (재방문 시 활용)

---

## 카드 이미지 스펙

### 사이즈 (Strict Rule)

**무조건 9:16 비율 (1080 x 1920)**
(인스타 스토리, 모바일 배경화면 최적화. 데스크탑에서도 세로형 카드로 저장됨)

### 카드 디자인 요소 (v12)

**핵심 변경**: "Action"만 보여주는 게 아니라 **"Context (Problem)"**를 같이 보여줌.

```
┌─────────────────────────────────────────────┐
│  [ Background: 리포트 visual_concept ]      │
│                                             │
│  [ Icon (Anchor) ]                          │
│                                             │
│  "Conservation Mode" (Title)                │
│  "Your drive engine feels depleted..."      │
│  (Problem Summary - 2줄 요약)               │
│                                             │
│  ─────────── CONNECTION LINE ─────────────  │
│                                             │
│  [ ACTION ITEM ]                            │
│                                             │
│  💡 Reflective Gratitude                    │
│                                             │
│  "Before bed, list 1-3 things..."           │
│  (Action Detail)                            │
│                                             │
│                                BADA ✦       │
└─────────────────────────────────────────────┘
```

**구성:**
1.  **Top (Context)**: 내가 무엇을 바꾸려 했는지 (Title + Problem Summary)
2.  **Bottom (Action)**: 그래서 무엇을 해야 하는지 (Action Title + Description)
3.  **Layout**: 위아래가 연결된 9:16 세로형 디자인.


### 구현 방식

- **Option A**: html2canvas로 DOM → 이미지 변환
- **Option B**: Canvas API 직접 렌더링
- **Option C**: 서버사이드 이미지 생성 (Sharp/Puppeteer)

**추천**: Option A (html2canvas) - 프론트엔드만으로 빠르게 구현 가능

---

## Data Strategy: Change Selection 저장

### Schema Update

```typescript
interface ChangeSelection {
  odapId: string;               // 리포트 식별자
  selectedTarget: 'shadow' | 'work' | 'relationship' | 'money' | 'none';
  actionItem: string;           // 선택된 Action Item 텍스트
  imageDownloaded: boolean;     // 이미지 저장 여부
  selectedAt: Date;             // 선택 시점
}
```

### 저장 시점

- **선택 시**: 어떤 영역 선택했는지 저장
- **이미지 다운로드 시**: `imageDownloaded = true` 업데이트

### 재방문 시 활용

```
┌─────────────────────────────────────────────┐
│                                             │
│  지난번에 "Quiet Drift"를                    │
│  바꾸고 싶다고 하셨어요.                      │
│                                             │
│  💡 "기상 후 30분 내 자연광 쬐기"             │
│                                             │
│  어떠셨어요?                                 │
│                                             │
│  [ 해봤어요 ✓ ] [ 아직이요 ] [ 잊었어요 ]     │
│                                             │
└─────────────────────────────────────────────┘
```

### 분석 가능한 데이터

- 어떤 영역(Shadow/Work/Relationship/Money)이 가장 많이 선택되는지
- 이미지 다운로드 전환율
- 재방문 시 실천 여부

---

## Action Item 연결 로직

### 1:1 매핑 (6개)

| Change Target | Action Item Source |
|---------------|-------------------|
| `alarm` | `page5_solution.daily_rituals[0]` |
| `processing` | `page5_solution.daily_rituals[1]` |
| `drive` | `page5_solution.daily_rituals[2]` |
| `work` | `page4_mismatch.career_friction.quick_tip` |
| `relationship` | `page4_mismatch.relationship_friction.quick_tip` |
| `money` | `page4_mismatch.money_friction.quick_tip` |

### 구현 코드

```typescript
type ChangeTarget = 'alarm' | 'processing' | 'drive' | 'work' | 'relationship' | 'money';

interface ActionItem {
  name: string;
  description: string;
  when?: string;  // daily_rituals에만 있음
}

function getActionItem(report: Report, target: ChangeTarget): ActionItem {
  const { page4_mismatch, page5_solution } = report;

  switch (target) {
    // OS → Daily Rituals
    case 'alarm':
      return page5_solution.daily_rituals[0];
    case 'processing':
      return page5_solution.daily_rituals[1];
    case 'drive':
      return page5_solution.daily_rituals[2];

    // Friction → Quick Tips
    case 'work':
      return { name: 'Quick Tip', description: page4_mismatch.career_friction.quick_tip };
    case 'relationship':
      return { name: 'Quick Tip', description: page4_mismatch.relationship_friction.quick_tip };
    case 'money':
      return { name: 'Quick Tip', description: page4_mismatch.money_friction.quick_tip };
  }
}
```

### 텍스트 처리

**영어 원문 그대로 사용** - 리포트에 있는 단어 활용.

카드 이미지에서 긴 텍스트는 **CSS로 처리**:
- `line-clamp` 또는 max-height로 제한
- 또는 카드 높이를 텍스트에 맞게 유동적으로

---

## 톤 가이드

### 카드 레이블

| ❌ 피할 것 | ✅ 지향할 것 |
|-----------|-------------|
| "Hypervigilance" (전문용어) | "On Guard" (쉬운 말) |
| "당신의 문제점" (판단) | "이런 경향이 있어요" (관찰) |
| 길고 복잡한 설명 | 2-4 단어 핵심만 |

### 확인 메시지

| ❌ 피할 것 | ✅ 지향할 것 |
|-----------|-------------|
| "좋은 선택이에요!" (평가) | "기억해둘게요" (보관) |
| "이걸 유지하세요" (지시) | "3개월 후 같이 봐요" (동행) |
| 긴 설명 | 한 문장 |

---

## Future Value: The Retrospective Link

이 기능은 **회고 시스템의 첫 단추**다.

### ❓ Critical Question (v11): 이미지 저장만으로 충분한가?

사용자 질문: *"이미지 저장만으로 회고의 첫 단추가 될까?"*

**분석:**
- **장점:** 마찰이 적고(Low Friction), "내가 골랐다"는 소유권을 줌.
- **약점:** 저장 후 갤러리에 묻히면 끝. **Trigger(상기 장치)**가 약함.
- **보완책 (v2~):**
    - 이미지는 "토템(Totem)" 역할. 실제 행동 유도는 **시스템 알림**이 해야 함.
    - **캘린더 연동**: "Add to Calendar" (다음주 토요일 아침 9시: [Action] 해보기)
    - **이메일 리마인더**: 선택한 카드를 2주 뒤 메일로 발송 ("잘 지내고 계신가요?")

### 진화 경로

| Phase | 기능 | 마찰 | Trigger 강도 |
|-------|------|------|--------------|
| **v1 (MVP)** | Change 선택 + 카드 저장 | 탭 2-3번 | 약함 (사용자 자율) |
| **v2** | **캘린더/알림** 추가 ("나중에 다시 보기") | 탭 1번 추가 | **중감 (외부 알림)** |
| **v3** | Tinder UI로 전체 요소 분류 | 스와이프 | 강함 (게임화) |

### 회고 완결 구조

```
바꾸고 싶은 것 선택 (인식/기록) -> DB 저장 (가장 중요)
        ↓
Action Card 확인 (방법 학습)
        ↓
이미지 저장 (물리적 소유/토템)
        ↓
[System Trigger] (v2): 메일/캘린더 알림
        ↓
재방문 시 실천 여부 체크 (회고)
```

**결론:** v1에서는 "선택 행위 자체"를 DB에 남기는 것이 핵심. 이미지는 사용자에게 주는 "영수증" 개념으로 접근.

---

## Changelog

| 날짜 | 변경 |
|------|------|
| 2026-01-17 | v1 초안 |
| 2026-01-17 | v2 진단 도구 방향 (폐기) |
| 2026-01-17 | v3 Static 카피 방향 (폐기) |
| 2026-01-17 | v4 동적 생성 로직으로 전환 |
| 2026-01-17 | v5 리서치 기반 질문 개선 & 쉬운 영어 적용 |
| 2026-01-17 | v6 Interaction Flow (Write & Release) 추가 |
| 2026-01-17 | v7 Time Capsule Email (Separate Consent Flag) 추가 |
| 2026-01-27 | v8 Keep One Pivot - 글쓰기 제거, 카드 탭 방식으로 전환 |
| 2026-01-27 | **v9 Change Card Final** - 6개 선택지 확정 (OS 3 + Friction 3), Action Item 1:1 매핑, 영어 원문 유지, 모달 UI, 이미지 저장 MVP |
| 2026-01-28 | **v10 Selection UX 개선** - 선택 확률을 높이기 위해 카드에 요약 텍스트(Preview) 추가 요청 반영 |
| 2026-01-28 | **v11 Critique** - "I'm good for now" 삭제 (불필요). 이미지 저장의 한계 명시 및 보완 로직(Trigger) 기획 추가 |
| 2026-01-28 | **v12 Design Polish** - 카드 이미지에 Problem Context(요약) 포함. 비율 9:16 고정 (단일 사이즈). |

---

## Decisions Made (v9)

| 항목 | 결정 |
|------|------|
| 선택지 개수 | **6개** (OS 3 + Friction 3) |
| 언어 | **영어 원문** 그대로 |
| MVP 범위 | **이미지 저장까지** |
| UI 방식 | 선택 → **모달**로 카드 표시 → 저장/닫기 |

---

## Open Questions

1. **이미지 사이즈**: 9:16 하나? 여러 사이즈?
2. **카드 디자인**: 리포트 visual_concept 활용? 새 디자인?
3. **긴 텍스트 처리**: line-clamp? 카드 높이 유동?
4. **"I'm good for now"**: 그냥 종료? 긍정 메시지?

---

## 💡 아이디어 저장소 (Future)

### Tinder UI 회고

리포트의 모든 요소를 **스와이프**로 분류하는 게임화된 회고.

```
┌─────────────────────────────────────────────┐
│                                             │
│              Relaxed Alarm                  │
│                                             │
│     "여유로운 경계 시스템"                    │
│                                             │
│                                             │
│   ← CHANGE        KEEP →                    │
│        ↓                                    │
│      MEH (관련없음)                          │
│                                             │
└─────────────────────────────────────────────┘
```

**분류 결과:**
- **KEEP →**: 유지하고 싶은 것
- **← CHANGE**: 바꾸고 싶은 것
- **↓ MEH**: 별로 중요하지 않은 것

**가치:**
- 전체 요소에 대한 자기 분석
- 게임화로 engagement ↑
- 분류 결과로 더 정교한 Change Journey 추적

**구현 복잡도:** 높음 (v3 이후 고려)
