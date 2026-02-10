# Operating Rate v2: Hardware-OS Alignment Algorithm

**작성일:** 2026-01-17
**목적:** Birth Pattern(Hardware)과 Survey(OS)의 궁합 기반 Operating Rate 재설계
**상태:** Planning (v2.3 - 유효기간 시스템 추가)

---

## 0. 모델의 본질적 강점

✔️ 사주를 성격·운명 설명이 아니라 **'Engine Spec'**으로 재정의
✔️ Survey는 현재 **OS 상태**(Threat / Env / Agency)만 본다
✔️ Hardware(선천)와 OS(후천)를 의도적으로 분리
✔️ **Alignment → Operating Rate**로 연결되는 논리적 파이프라인

> "맞는 사주로 살고 있는가?"를 처음으로 계산 가능한 형태로 만든 구조

---

## 1. 현재 문제점

```typescript
// 현재 로직 (saju_calculator.ts:200-210)
const imbalancePenalty = (maxCount > 3 ? (maxCount - 3) * 10 : 0) + (zeroCount * 5);
const balanceBonus = result.dayMasterCategory === 'balanced' ? 5 : 0;
result.stats.operatingRate = Math.max(40, 100 - imbalancePenalty + balanceBonus);
```

| 문제 | 설명 |
|------|------|
| 오행 균형만 봄 | 십성, 신강/신약 미반영 |
| OS 무시 | Survey 결과와 Birth Pattern 궁합 미반영 |
| 단순 패널티 방식 | 하한선 40%로 변별력 낮음 |
| Dynamic/Static 미분류 | 엔진 특성 파악 불가 |

### 1.1 v2.0 초안의 구조적 리스크 (v2.1 해결)

| 리스크 | 문제 | 해결 방향 |
|--------|------|----------|
| **① OS 이분법** | Active/Passive만으로 현실 반영 불가 | **3단계**: Active/Reactive/Passive |
| **② Threat 방향성 무시** | 각성 여부만 봄, 반응 방향 무시 | **ThreatMode**: forward/emotional/freeze |
| **③ 극단값 과대평가** | 극단적 사주 = 항상 고성능? | **감쇠 로직**: absScore > 6일 때 효율 감소 |

### 1.2 v2.1의 추가 리스크 (v2.2 해결)

| 리스크 | 문제 | 해결 방향 |
|--------|------|----------|
| **④ Hardware Score 선형성** | 십성 조합 효과 무시 (신약+재성 = 번아웃) | **Interaction Penalty** 테이블 |
| **⑤ ElementBalance 의미 충돌** | 균형이 미스얼라인을 덮어줌 | **상한 보정**으로 전환 |
| **⑥ 하한 40% 착시** | Depleted도 40%면 "괜찮네?" 착각 | **하한 25%** + Critical 표시 |
| **⑦ 숫자 신뢰비용** | %로 보여주면 의심/비교 발생 | **5단계 레벨** 시스템으로 전환 |

---

## 2. 새로운 개념 모델

### 2.1 Hardware Type (Birth Pattern → Engine)

**에너지 방향성(Vector)** 기반 분류:

| Type | 오행 | 계절 | 특성 | 기본값 |
|------|------|------|------|--------|
| **Dynamic** | 木(Wood) | Spring | Growth - 위로 솟구침 | 가만히 있으면 병남 |
| **Dynamic** | 火(Fire) | Summer | Expansion - 사방 확산 | 움직여야 건강 |
| **Static** | 金(Metal) | Autumn | Definition - 안으로 뭉침 | 수렴·절제·경계 설정 |
| **Static** | 水(Water) | Winter | Depth - 아래로 고임 | 보존이 미덕 |
| **Static** | 土(Earth) | Transition | Stability - 중재/저장 | 흡수·중재·변환 |

### 2.2 Ten Gods 가중치

| Category | 십성 | 한글 | 방향 | 점수 |
|----------|------|------|------|------|
| **Dynamic Factor** | 食傷 (Output) | 식상 | 내 기운을 밖으로 | +1 |
| **Dynamic Factor** | 財星 (Result) | 재성 | 목표를 향해 달림 | +1 |
| **Static Factor** | 印星 (Input) | 인성 | 밖을 안으로 수용 | -1 |
| **Static Factor** | 官星 (Control) | 관성 | 나를 통제 | -1 |
| **Booster Factor** | 比劫 (Self) | 비겁 | 주체성 (신강 시 Dynamic↑) | 조건부 |

### 2.3 Body Strength (신강/신약)

| 상태 | 조건 | 에너지 상태 | 권장 모드 | 점수 |
|------|------|------------|----------|------|
| **신강 (Strong)** | 비겁/인성 과다 | 넘침 | Dynamic (소모 필요) | +3 |
| **신약 (Weak)** | 식재관 과다 | 부족 | Static (보존 필요) | -2 |
| **중화 (Balanced)** | 균형 | 적정 | 유연 | 0 |

---

## 3. Hardware Score 계산 알고리즘

### Step 1: Base Score (Day Master Element)

```typescript
function getBaseScore(dayMasterElement: string): number {
  const DYNAMIC_ELEMENTS = ['wood', 'fire'];
  const STATIC_ELEMENTS = ['metal', 'water', 'earth'];

  if (DYNAMIC_ELEMENTS.includes(dayMasterElement)) return +2;
  if (STATIC_ELEMENTS.includes(dayMasterElement)) return -2;
  return 0;
}
```

### Step 2: Ten Gods Weight

```typescript
function getTenGodsScore(tenGodsDistribution: Record<string, number>): number {
  // 십성 한글 → 영문 매핑 필요
  const DYNAMIC_GODS = ['식신', '상관', '편재', '정재']; // 식상 + 재성
  const STATIC_GODS = ['편인', '정인', '편관', '정관'];   // 인성 + 관성

  let score = 0;

  for (const [god, count] of Object.entries(tenGodsDistribution)) {
    if (DYNAMIC_GODS.includes(god)) score += count * 1;
    if (STATIC_GODS.includes(god)) score -= count * 1;
    // 비겁(비견, 겁재)은 Step 3에서 신강/신약으로 처리
  }

  return score;
}
```

### Step 3: Body Strength Modifier

```typescript
function getBodyStrengthScore(
  dayMasterCategory: 'strong' | 'weak' | 'balanced',
  dayMasterStrength: number
): number {
  if (dayMasterCategory === 'strong') return +3;  // 신강: 에너지 소모 필요
  if (dayMasterCategory === 'weak') return -2;    // 신약: 에너지 보존 필요
  return 0;  // 중화
}
```

### Step 4: Final Hardware Type

```typescript
function determineHardwareType(totalScore: number): 'dynamic' | 'static' {
  return totalScore > 0 ? 'dynamic' : 'static';
}

// 점수 범위에 따른 세부 분류
function getHardwareIntensity(totalScore: number): string {
  if (totalScore >= 5) return 'highly_dynamic';      // 스포츠카
  if (totalScore >= 1) return 'moderately_dynamic';  // 세단
  if (totalScore >= -1) return 'balanced';           // 하이브리드
  if (totalScore >= -4) return 'moderately_static';  // SUV
  return 'highly_static';                            // 탱크/요새
}
```

---

## 4. OS State 판정 (Survey 기반) - v2.1 개선

### 4.1 Survey Scores 재해석

```typescript
interface SurveyScores {
  threatScore: number;        // 0-3
  threatClarity: number;      // 0 or 1
  environmentScore: number;   // 0-2
  environmentStable: number;  // 0 or 1
  agencyScore: number;        // 0-3
  agencyActive: number;       // 0 or 1
  typeKey: string;
  typeName: string;
}

// NEW: Survey 원본 답변도 필요
interface SurveyAnswers {
  q1: 'A' | 'B' | 'C';  // Threat Q1
  q2: 'A' | 'B' | 'C';  // Threat Q2
  q3: 'A' | 'B' | 'C';  // Threat Q3
  // ... q4-q8
}
```

### 4.2 OS Mode: 3단계 (v2.1 핵심 변경)

**왜 Reactive가 필요한가?**

| 상황 | 기존 판정 | 실제 상태 | 문제 |
|------|----------|----------|------|
| 불안정 환경 + Low Agency | Active | Freeze/Collapse | 오판 → 과대평가 |
| 위협 반응 기반 움직임 | Active | 소모적 반응 | Aligned로 오분류 |

```typescript
type OSMode = 'active' | 'reactive' | 'passive';

function determineOSMode(surveyScores: SurveyScores): OSMode {
  const { agencyActive, environmentStable } = surveyScores;

  // Active: 의도적 행동 (주체성 있음)
  if (agencyActive === 1 && environmentStable === 1) return 'active';
  if (agencyActive === 1 && environmentStable === 0) return 'active';

  // Reactive: 위협 반응 기반 움직임 (주체성 없이 불안정)
  if (agencyActive === 0 && environmentStable === 0) return 'reactive';

  // Passive: 유지·회피·정지
  return 'passive';
}
```

| Agency | Environment | OS Mode | 설명 |
|--------|-------------|---------|------|
| High (1) | Stable (1) | **Active** | 의도적 + 안정 = 최적 Active |
| High (1) | Unstable (0) | **Active** | 의도적 + 불안정 = 전투형 Active |
| Low (0) | Unstable (0) | **Reactive** | 비의도적 + 불안정 = 생존 모드 |
| Low (0) | Stable (1) | **Passive** | 비의도적 + 안정 = 정지 상태 |

### 4.3 Threat Mode: 방향성 분해 (v2.1 추가)

**문제**: ThreatClarity는 각성 여부만 봄. 반응 방향 무시.

```typescript
type ThreatMode = 'forward' | 'emotional' | 'freeze';

function determineThreatMode(answers: SurveyAnswers): ThreatMode {
  const threatAnswers = [answers.q1, answers.q2, answers.q3];

  const aCount = threatAnswers.filter(a => a === 'A').length;
  const bCount = threatAnswers.filter(a => a === 'B').length;
  const cCount = threatAnswers.filter(a => a === 'C').length;

  // Forward: 추진형 각성 (A 우세)
  if (aCount >= 2) return 'forward';

  // Freeze: 정지형 반응 (C 존재 + A 부족)
  if (cCount >= 1 && aCount < 2) return 'freeze';

  // Emotional: 감정형 각성 (B 우세)
  return 'emotional';
}
```

| ThreatMode | 조건 | 특성 | Alignment 영향 |
|------------|------|------|---------------|
| **Forward** | A ≥ 2 | 공격/추진형 | Dynamic과 시너지 |
| **Emotional** | B ≥ 2 | 감정/표현형 | 중립 |
| **Freeze** | C ≥ 1 & A < 2 | 회피/정지형 | Static과 충돌 시 추가 패널티 |

### 4.4 OS Intensity (ThreatMode 반영)

```typescript
function getOSIntensity(
  surveyScores: SurveyScores,
  threatMode: ThreatMode
): string {
  const { agencyScore, environmentScore } = surveyScores;
  const osMode = determineOSMode(surveyScores);

  if (osMode === 'active') {
    if (threatMode === 'forward' && agencyScore >= 2) return 'highly_active';
    return 'moderately_active';
  }

  if (osMode === 'reactive') {
    if (threatMode === 'freeze') return 'frozen_reactive';     // 가장 비효율
    if (threatMode === 'emotional') return 'emotional_reactive';
    return 'forward_reactive';  // 그나마 나음
  }

  // passive
  if (agencyScore <= 1 && environmentScore >= 1) return 'deeply_passive';
  return 'moderately_passive';
}
```

---

## 5. Hardware-OS Alignment Matrix (v2.1 개선)

### 5.1 Alignment 점수표 (3x3 Matrix)

| Hardware | OS Mode | Alignment | 설명 | Base Rate |
|----------|---------|-----------|------|-----------|
| Dynamic | Active | ✅ **Aligned** | 스포츠카 + 고속도로 | 90% |
| Dynamic | Reactive | ⚠️ **Scattered** | 스포츠카 + 막힌 도로 (분출 못함) | 55% |
| Dynamic | Passive | ⚠️ **Underutilized** | 스포츠카 + 주차장 | 60% |
| Static | Active | ⚠️ **Overdriven** | 탱크 + 레이스 | 65% |
| Static | Reactive | ⚠️ **Depleted** | 탱크 + 게릴라전 (소모전) | 50% |
| Static | Passive | ✅ **Aligned** | 탱크 + 요새 | 90% |

### 5.2 Alignment Type 정의

```typescript
type AlignmentType =
  | 'aligned'        // 최적 궁합
  | 'underutilized'  // Dynamic인데 멈춤
  | 'overdriven'     // Static인데 과속
  | 'scattered'      // Dynamic인데 반응형 (분출 불가)
  | 'depleted';      // Static인데 반응형 (소모전)
```

### 5.3 Alignment Score 계산 (v2.1)

```typescript
interface AlignmentResult {
  hardwareType: 'dynamic' | 'static';
  hardwareScore: number;        // -7 ~ +8
  hardwareIntensity: string;
  osMode: 'active' | 'reactive' | 'passive';
  osIntensity: string;
  threatMode: 'forward' | 'emotional' | 'freeze';
  alignmentType: AlignmentType;
  operatingRate: number;        // 40-100%
  diagnosis: string;
}

function calculateAlignment(
  hardwareType: 'dynamic' | 'static',
  hardwareScore: number,
  osMode: 'active' | 'reactive' | 'passive',
  threatMode: 'forward' | 'emotional' | 'freeze'
): AlignmentResult {

  let alignmentType: AlignmentType;
  let baseRate: number;
  let diagnosis: string;

  // Dynamic Hardware
  if (hardwareType === 'dynamic') {
    if (osMode === 'active') {
      alignmentType = 'aligned';
      baseRate = 90;
      diagnosis = 'Your engine thrives on action, and your current life provides it.';
    }
    else if (osMode === 'reactive') {
      alignmentType = 'scattered';
      baseRate = 55;
      diagnosis = 'Your engine wants to sprint, but you\'re stuck dodging obstacles.';
    }
    else { // passive
      alignmentType = 'underutilized';
      baseRate = 60;
      diagnosis = 'Your engine craves movement, but your current life is too still.';
    }
  }
  // Static Hardware
  else {
    if (osMode === 'passive') {
      alignmentType = 'aligned';
      baseRate = 90;
      diagnosis = 'Your engine thrives on stability, and your current life provides it.';
    }
    else if (osMode === 'reactive') {
      alignmentType = 'depleted';
      baseRate = 50;
      diagnosis = 'Your engine needs calm, but you\'re fighting constant fires.';
    }
    else { // active
      alignmentType = 'overdriven';
      baseRate = 65;
      diagnosis = 'Your engine needs calm, but your current life demands constant action.';
    }
  }

  // Intensity 보정 (v2.1: 감쇠 로직 포함)
  const intensityBonus = calculateIntensityBonus(hardwareScore, osMode, threatMode);

  return {
    // ...
    operatingRate: Math.min(100, Math.max(40, baseRate + intensityBonus))
  };
}
```

### 5.4 Intensity Bonus 계산 (v2.1: 극단값 감쇠)

```typescript
function calculateIntensityBonus(
  hardwareScore: number,
  osMode: 'active' | 'reactive' | 'passive',
  threatMode: 'forward' | 'emotional' | 'freeze'
): number {
  const absScore = Math.abs(hardwareScore);
  let bonus = 0;

  // Step 1: 기본 Intensity Bonus
  const isAligned =
    (hardwareScore > 0 && osMode === 'active') ||
    (hardwareScore < 0 && osMode === 'passive');

  if (isAligned) {
    bonus = Math.min(10, absScore * 1.5);  // 최대 +10
  } else if (osMode === 'reactive') {
    bonus = -Math.min(20, absScore * 2.5); // Reactive는 더 큰 페널티
  } else {
    bonus = -Math.min(15, absScore * 2);   // 최대 -15
  }

  // Step 2: 극단값 감쇠 (v2.1 핵심)
  // 극단적 사주일수록 효율이 아니라 리스크
  if (absScore > 6) {
    bonus *= 0.7;  // 30% 감쇠
  } else if (absScore > 4) {
    bonus *= 0.85; // 15% 감쇠
  }

  // Step 3: ThreatMode 추가 보정
  if (threatMode === 'freeze' && hardwareScore > 0) {
    // Dynamic hardware + freeze threat = 실질 Underutilized
    bonus -= 5;
  }
  if (threatMode === 'emotional' && hardwareScore < 0) {
    // Static hardware + emotional threat = 소모형 Overdrive
    bonus -= 3;
  }
  if (threatMode === 'forward' && hardwareScore > 0 && osMode === 'active') {
    // Dynamic + forward + active = 시너지
    bonus += 3;
  }

  return Math.round(bonus);
}
```

### 5.5 극단값 감쇠 로직 설명

| absScore | 감쇠율 | 이유 |
|----------|--------|------|
| 1-4 | 100% | 정상 범위 |
| 5-6 | 85% | 편중 시작 (burnout 리스크) |
| 7+ | 70% | 극단적 편중 (시스템 한계) |

**왜 필요한가?**

```
highly_dynamic (+7) + aligned → 기존: +10 보너스
                              → v2.1: +10 × 0.7 = +7 보너스

실제 인간은 극단적 사주일수록 burnout 한계가 있음
"스포츠카 엔진이라도 레드라인 계속 밟으면 고장"
```

### 5.6 Interaction Penalty (v2.2 추가)

**문제**: Hardware Score가 선형 합산만 하면 조합 효과를 놓침

```typescript
function getInteractionPenalty(
  dayMasterCategory: 'strong' | 'weak' | 'balanced',
  tenGodsDistribution: Record<string, number>
): number {
  let penalty = 0;

  // 재성(財星) 개수
  const jaeCount = (tenGodsDistribution['편재'] || 0) + (tenGodsDistribution['정재'] || 0);
  // 관성(官星) 개수
  const gwanCount = (tenGodsDistribution['편관'] || 0) + (tenGodsDistribution['정관'] || 0);
  // 식상(食傷) 개수
  const sikCount = (tenGodsDistribution['식신'] || 0) + (tenGodsDistribution['상관'] || 0);

  // 신약 + 재성 과다 → 번아웃 가속
  if (dayMasterCategory === 'weak' && jaeCount >= 2) {
    penalty -= 3;  // 결과 압박
  }

  // 신강 + 관성 과다 → 통제 충돌
  if (dayMasterCategory === 'strong' && gwanCount >= 2) {
    penalty -= 2;  // 폭주/반발
  }

  // 신약 + 식상 과다 → 에너지 고갈
  if (dayMasterCategory === 'weak' && sikCount >= 2) {
    penalty -= 2;  // 출력 과부하
  }

  // 신강 + 재성 과다 → 추진력 (보너스)
  if (dayMasterCategory === 'strong' && jaeCount >= 2) {
    penalty += 2;  // 목표 달성력
  }

  return penalty;
}
```

| 조합 | 효과 | 점수 | 설명 |
|------|------|------|------|
| 신약 + 재성 ≥2 | 번아웃 가속 | -3 | 목표는 큰데 에너지 부족 |
| 신강 + 관성 ≥2 | 통제 충돌 | -2 | 자유 vs 책임 갈등 |
| 신약 + 식상 ≥2 | 에너지 고갈 | -2 | 표현은 많은데 충전 불가 |
| 신강 + 재성 ≥2 | 추진력 | +2 | 에너지 + 목표 = 달성 |

---

## 6. 최종 Operating Rate 공식 (v2.2)

```
Raw Rate = BaseRate + IntensityBonus + InteractionPenalty

// ElementBalance는 상한 보정 (v2.2)
Ceiling = 100 + ElementBalanceBonus

Operating Rate = min(max(Raw Rate, 25), Ceiling)
```

**v2.2 핵심 변경:**
- 하한: 40% → **25%** (Survival 상태 반영)
- ElementBalance: 절대 보너스 → **상한 보정** (균형은 더 잘 살 때만 효과)
- InteractionPenalty: **조합 효과** 추가

### 6.1 Element Balance Bonus → Ceiling Modifier (v2.2)

**철학 변경:**
- 기존: 균형이 미스얼라인을 덮어줌 (잘못된 보험)
- v2.2: 균형은 잘 살 때 더 잘 사는 조건

```typescript
function getElementBalanceCeiling(elementCounts: Record<string, number>): number {
  const counts = Object.values(elementCounts);
  const zeroCount = counts.filter(c => c === 0).length;
  const maxCount = Math.max(...counts);

  // 모든 오행 존재 + 과잉 없음 = 100% + 5
  if (zeroCount === 0 && maxCount <= 3) return 105;
  // 모든 오행 존재 = 100% + 3
  if (zeroCount === 0) return 103;
  // 결핍 1개 = 100%
  if (zeroCount === 1) return 100;
  // 결핍 2개 이상 = 97% (상한 제한)
  return 97;
}
```

| 오행 상태 | 상한 | 설명 |
|----------|------|------|
| 완전 균형 (0결핍, ≤3과잉) | 105% | Flow 상태 가능 |
| 균형 (0결핍) | 103% | 높은 효율 가능 |
| 경미한 불균형 (1결핍) | 100% | 정상 상한 |
| 심한 불균형 (2+결핍) | 97% | 상한 제한 |

### 6.2 Operating Rate 계산 (최종)

```typescript
function calculateOperatingRate(
  baseRate: number,
  intensityBonus: number,
  interactionPenalty: number,
  elementBalanceCeiling: number
): number {
  const rawRate = baseRate + intensityBonus + interactionPenalty;

  // 하한 25%, 상한은 ElementBalance 기반
  return Math.min(Math.max(rawRate, 25), elementBalanceCeiling);
}
```

---

## 7. 5단계 레벨 시스템 (v2.2 핵심)

### 7.1 왜 숫자 대신 레벨인가?

| 문제 | 숫자(%) 표시 시 |
|------|-----------------|
| 신뢰비용 | "이거 어떻게 계산한거야?" 의심 |
| 비교 욕구 | "친구는 몇 %야?" 경쟁심 |
| 착시 | 47% vs 53% 차이 과대평가 |
| 의미 불명 | "67%면 잘 사는 거야?" |

**레벨 시스템의 장점:**
- 직관적 상태 인식
- "지금 뭘 하면 안 되는지" 명확
- 비교 불가 (레벨 3끼리 비교 무의미)

### 7.2 5단계 정의 (User-facing)

```typescript
type OperatingLevel = 1 | 2 | 3 | 4 | 5;

interface LevelInfo {
  level: OperatingLevel;
  name: string;
  description: string;
  guidance: string[];
}

const OPERATING_LEVELS: Record<OperatingLevel, LevelInfo> = {
  1: {
    level: 1,
    name: "Survival",
    description: "에너지 누수 중. 시스템 과부하 상태.",
    guidance: [
      "회복 우선, 확장 금지",
      "의사결정 최소화",
      "기본 루틴만 유지"
    ]
  },
  2: {
    level: 2,
    name: "Recovery",
    description: "기본 기능 복구 중. 방향 전환 가능.",
    guidance: [
      "무리한 목표 설정 금지",
      "작은 성공 경험 쌓기",
      "에너지 충전 루틴 필수"
    ]
  },
  3: {
    level: 3,
    name: "Stable",
    description: "시스템 정상 작동. 루틴 유지 최적.",
    guidance: [
      "현재 페이스 유지",
      "소규모 확장 가능",
      "큰 변화는 신중히"
    ]
  },
  4: {
    level: 4,
    name: "Aligned",
    description: "엔진과 OS 정렬. 효율 높은 생산 가능.",
    guidance: [
      "중요한 결정에 적합",
      "장기 프로젝트 시작 가능",
      "관계 확장 최적기"
    ]
  },
  5: {
    level: 5,
    name: "Flow",
    description: "에너지 활용 극대화. 창조/확장 최적 구간.",
    guidance: [
      "단기 성과 폭발 가능",
      "도전적 목표 설정 가능",
      "지속 불가 - 충전 계획 필수"
    ]
  }
};
```

### 7.3 Rate → Level 변환 (System-facing)

```typescript
function rateToLevel(rate: number): OperatingLevel {
  if (rate < 35) return 1;      // Survival
  if (rate < 50) return 2;      // Recovery
  if (rate < 65) return 3;      // Stable
  if (rate < 80) return 4;      // Aligned
  return 5;                      // Flow
}
```

| Rate 범위 | Level | Name | 상태 |
|-----------|-------|------|------|
| 25-34% | 1 | Survival | 🔴 Critical |
| 35-49% | 2 | Recovery | 🟠 Warning |
| 50-64% | 3 | Stable | 🟡 Normal |
| 65-79% | 4 | Aligned | 🟢 Good |
| 80-105% | 5 | Flow | 🔵 Optimal |

### 7.4 Rate는 절대 외부 노출 안 함

```typescript
interface OperatingResult {
  // User-facing (외부 노출)
  level: OperatingLevel;
  levelName: string;
  levelDescription: string;
  guidance: string[];

  // System-facing (내부 전용)
  _internal: {
    rawRate: number;
    baseRate: number;
    intensityBonus: number;
    interactionPenalty: number;
    ceiling: number;
  };
}
```

**Rate 사용처 (내부):**
- 로그 / 디버깅
- A/B 테스트
- 알고리즘 개선 추적
- 연구용 분석

---

## 8. 구현 계획

### 8.1 파일 수정

| 파일 | 변경 내용 |
|------|----------|
| `lib/saju_calculator.ts` | Hardware Score 계산 로직 추가 |
| `lib/saju_constants.ts` | 십성 분류 상수 추가 |
| `shared/schema.ts` | SajuResult 타입 확장 |
| `server/routes.ts` | OS State 계산 후 Alignment 전달 |
| `lib/gemini_client.ts` | Alignment 정보 프롬프트에 반영 |

### 8.2 타입 정의 (v2.1)

```typescript
// OS Mode (3단계)
type OSMode = 'active' | 'reactive' | 'passive';

// Threat Mode (방향성)
type ThreatMode = 'forward' | 'emotional' | 'freeze';

// Alignment Type (6가지)
type AlignmentType =
  | 'aligned'        // 최적 궁합
  | 'underutilized'  // Dynamic + Passive
  | 'overdriven'     // Static + Active
  | 'scattered'      // Dynamic + Reactive (v2.1)
  | 'depleted';      // Static + Reactive (v2.1)

// SajuResult 확장
export interface SajuResult {
  // 기존 필드...

  // NEW: Hardware Analysis
  hardwareAnalysis: {
    type: 'dynamic' | 'static';
    score: number;              // -7 ~ +8
    intensity: string;          // highly_dynamic, moderately_dynamic, etc.
    baseScoreBreakdown: {
      dayMaster: number;        // ±2
      tenGods: number;          // 가변
      bodyStrength: number;     // -2 ~ +3
    };
  };

  stats: {
    operatingRate: number;
    // v2.1 확장
    alignmentType?: AlignmentType;
    alignmentDiagnosis?: string;
    osMode?: OSMode;
    threatMode?: ThreatMode;
  };
}

// Survey 답변 (ThreatMode 계산용)
interface SurveyAnswers {
  q1: string;  // 'a' | 'b' | 'c'
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
}
```

### 8.3 구현 순서 (v2.2 업데이트)

**Phase 1: Constants & Types**
1. [ ] `saju_constants.ts`에 십성 분류 상수 추가
   - DYNAMIC_GODS, STATIC_GODS 배열
2. [ ] `lib/operating_level.ts` 신규 파일 생성
   - `OSMode`, `ThreatMode`, `AlignmentType`, `OperatingLevel` 타입
   - `OPERATING_LEVELS` 상수

**Phase 2: Hardware Score**
3. [ ] `saju_calculator.ts`에 Hardware Score 계산 함수 추가
   - `getBaseScore()`, `getTenGodsScore()`, `getBodyStrengthScore()`
   - `determineHardwareType()`, `getHardwareIntensity()`
4. [ ] `getInteractionPenalty()` 함수 추가 (v2.2)
5. [ ] `SajuResult` 타입에 `hardwareAnalysis` 필드 추가

**Phase 3: OS Analysis**
6. [ ] Survey 원본 답변 전달 구조 확인 (ThreatMode 계산용)
7. [ ] `determineOSMode()` 함수 구현 (3단계)
8. [ ] `determineThreatMode()` 함수 구현
9. [ ] `getOSIntensity()` 함수 구현

**Phase 4: Alignment & Level**
10. [ ] `calculateAlignment()` 함수 구현
    - 6가지 Alignment Type 분기
11. [ ] `calculateIntensityBonus()` 함수 구현
    - 극단값 감쇠 로직 포함
    - ThreatMode 보정 포함
12. [ ] `getElementBalanceCeiling()` 함수 구현 (v2.2)
13. [ ] `calculateOperatingRate()` 최종 함수 (하한 25%)
14. [ ] `rateToLevel()` 함수 구현 (v2.2)

**Phase 5: Integration**
15. [ ] `routes.ts`에서 Survey + Saju 결합하여 Alignment 계산
16. [ ] `gemini_client.ts` 프롬프트에 Level 정보 추가 (Rate 제외)
17. [ ] Results.tsx에서 Level + Guidance 표시 (Rate 숨김)
18. [ ] 테스트 리포트 생성 및 검증

**Phase 6: QA**
19. [ ] 6가지 시나리오 테스트 (Case 1-6)
20. [ ] Edge case 테스트 (극단값, 경계값)
21. [ ] Level 경계값 테스트 (34→35, 49→50 등)

---

## 9. 예시 시나리오 (v2.2)

### Case 1: Aligned Dynamic (최적)

```
사주: 甲木 일간, 식상 3개, 신강
→ Hardware Score: +2 (목) + 3 (식상) + 3 (신강) = +8 (Highly Dynamic)

Survey: Agency High, Environment Stable, Threat: A-A-B
→ OS Mode: Active
→ ThreatMode: Forward

Alignment: Dynamic + Active = ✅ Aligned
IntensityBonus: +10 × 0.7 (극단값 감쇠) + 3 (forward 시너지) = +10
Operating Rate: 90 + 10 = 100%
Diagnosis: "Your engine thrives on action, and your current life provides it."
```

### Case 2: Scattered Dynamic (v2.1 신규 케이스)

```
사주: 丙火 일간, 식상 2개, 신강
→ Hardware Score: +2 (화) + 2 (식상) + 3 (신강) = +7 (Highly Dynamic)

Survey: Agency Low, Environment Unstable, Threat: B-C-A
→ OS Mode: Reactive (주체성 없이 불안정)
→ ThreatMode: Freeze (C 존재 + A < 2)

Alignment: Dynamic + Reactive = ⚠️ Scattered
IntensityBonus: -20 × 0.7 (극단값) - 5 (freeze 패널티) = -19
Operating Rate: 55 - 19 = 36% → 40% (하한)
Diagnosis: "Your engine wants to sprint, but you're stuck dodging obstacles."
```

**v2.0 vs v2.1 비교:**
- v2.0: Active로 판정 → 65% (오판)
- v2.1: Reactive로 판정 → 40% (실제 상태 반영)

### Case 3: Depleted Static (v2.1 신규 케이스)

```
사주: 壬水 일간, 관성 3개, 신약
→ Hardware Score: -2 (수) - 3 (관성) - 2 (신약) = -7 (Highly Static)

Survey: Agency Low, Environment Unstable, Threat: B-B-C
→ OS Mode: Reactive
→ ThreatMode: Emotional

Alignment: Static + Reactive = ⚠️ Depleted
IntensityBonus: -20 × 0.7 - 3 (emotional 패널티) = -17
Operating Rate: 50 - 17 = 33% → 40% (하한)
Diagnosis: "Your engine needs calm, but you're fighting constant fires."
```

### Case 4: Underutilized Dynamic (기존)

```
사주: 甲木 일간, 식상 1개, 중화
→ Hardware Score: +2 (목) + 1 (식상) + 0 (중화) = +3 (Moderately Dynamic)

Survey: Agency Low, Environment Stable, Threat: B-B-B
→ OS Mode: Passive
→ ThreatMode: Emotional

Alignment: Dynamic + Passive = ⚠️ Underutilized
IntensityBonus: -6 (정상 범위)
Operating Rate: 60 - 6 = 54%
Diagnosis: "Your engine craves movement, but your current life is too still."
```

### Case 5: Overdriven Static (기존)

```
사주: 庚金 일간, 인성 2개, 신약
→ Hardware Score: -2 (금) - 2 (인성) - 2 (신약) = -6 (Highly Static)

Survey: Agency High, Environment Unstable, Threat: A-A-A
→ OS Mode: Active
→ ThreatMode: Forward

Alignment: Static + Active = ⚠️ Overdriven
IntensityBonus: -12 × 0.85 (감쇠) = -10
Operating Rate: 65 - 10 = 55%
Diagnosis: "Your engine needs calm, but your current life demands constant action."
```

### Case 6: Aligned Static (최적)

```
사주: 癸水 일간, 인성 2개, 신약
→ Hardware Score: -2 (수) - 2 (인성) - 2 (신약) = -6 (Highly Static)

Survey: Agency Low, Environment Stable, Threat: C-B-C
→ OS Mode: Passive
→ ThreatMode: Freeze

Alignment: Static + Passive = ✅ Aligned
IntensityBonus: +9 × 0.85 = +8
Operating Rate: 90 + 8 = 98%
Diagnosis: "Your engine thrives on stability, and your current life provides it."
```

---

## 10. 리포트 유효기간 (Validity Period)

### 10.1 왜 유효기간이 필요한가?

| 문제 | 설명 |
|------|------|
| **스냅샷 고정** | Survey는 특정 시점의 상태만 반영 |
| **상태 변동성** | 인간은 3-6개월 주기로 변동 |
| **과거 결과 의존** | "6개월 전 리포트"로 현재 결정하는 위험 |
| **재측정 유도** | 적절한 시점에 재평가 권장 |

### 10.2 핵심 원칙: 불안정할수록 짧게

```
유효기간 ∝ 1 / 상태 변동성
```

- **위기 상태** (Survival/Reactive) → 빠른 변화 예상 → 짧은 유효기간
- **안정 상태** (Stable/Aligned) → 느린 변화 → 긴 유효기간
- **Flow 상태** → 지속 불가 (피크) → 짧은 유효기간

### 10.3 유효기간 산정 매트릭스

#### Level 기반

| Level | Name | 기본 유효기간 | 이유 |
|-------|------|--------------|------|
| 1 | Survival | **4주** | 위기 상태, 빠른 변화 필요/예상 |
| 2 | Recovery | **6주** | 회복 과정, 변동성 높음 |
| 3 | Stable | **12주** | 안정적 패턴, 느린 변화 |
| 4 | Aligned | **16주** | 정렬 상태, 유지 가능 |
| 5 | Flow | **8주** | 피크 상태, 지속 불가 |

#### Alignment Type 보정

| Alignment | 보정 | 이유 |
|-----------|------|------|
| Aligned | +4주 | 안정적 궁합 |
| Underutilized | 0 | 만성화 가능 (stuck) |
| Overdriven | -2주 | 소진 위험 |
| Scattered | -4주 | 불안정, 빠른 변화 |
| Depleted | -4주 | 위기, 빠른 개입 필요 |

#### OS Mode 보정

| OS Mode | 보정 | 이유 |
|---------|------|------|
| Active | 0 | 기준 |
| Reactive | **-4주** | 본질적 불안정 |
| Passive | +2주 | 변화 느림 (관성) |

### 10.4 유효기간 계산 로직

```typescript
interface ValidityResult {
  validUntil: Date;
  validityWeeks: number;
  urgency: 'low' | 'medium' | 'high';
  reAssessmentReason: string;
}

function calculateValidity(
  level: OperatingLevel,
  alignmentType: AlignmentType,
  osMode: OSMode,
  surveyDate: Date
): ValidityResult {

  // Step 1: Level 기반 기본값
  const BASE_WEEKS: Record<OperatingLevel, number> = {
    1: 4,   // Survival
    2: 6,   // Recovery
    3: 12,  // Stable
    4: 16,  // Aligned
    5: 8,   // Flow (피크, 지속 불가)
  };

  // Step 2: Alignment 보정
  const ALIGNMENT_MODIFIER: Record<AlignmentType, number> = {
    aligned: 4,
    underutilized: 0,
    overdriven: -2,
    scattered: -4,
    depleted: -4,
  };

  // Step 3: OS Mode 보정
  const OS_MODIFIER: Record<OSMode, number> = {
    active: 0,
    reactive: -4,
    passive: 2,
  };

  // 계산
  let weeks = BASE_WEEKS[level];
  weeks += ALIGNMENT_MODIFIER[alignmentType];
  weeks += OS_MODIFIER[osMode];

  // 최소 2주, 최대 20주
  weeks = Math.max(2, Math.min(20, weeks));

  // 유효기간 종료일
  const validUntil = new Date(surveyDate);
  validUntil.setDate(validUntil.getDate() + weeks * 7);

  // Urgency 결정
  const urgency = weeks <= 4 ? 'high' : weeks <= 8 ? 'medium' : 'low';

  // 재측정 이유
  const reAssessmentReason = getReAssessmentReason(level, alignmentType, osMode);

  return { validUntil, validityWeeks: weeks, urgency, reAssessmentReason };
}
```

### 10.5 재측정 권장 메시지

```typescript
function getReAssessmentReason(
  level: OperatingLevel,
  alignmentType: AlignmentType,
  osMode: OSMode
): string {
  if (level === 1) {
    return "You're in survival mode. Re-assess in 4 weeks to track recovery.";
  }
  if (level === 5) {
    return "Flow state is powerful but unsustainable. Check back in 8 weeks.";
  }
  if (osMode === 'reactive') {
    return "Reactive states shift quickly. Re-assess after major changes stabilize.";
  }
  if (alignmentType === 'depleted' || alignmentType === 'scattered') {
    return "Your current state needs attention. Re-assess in 4-6 weeks.";
  }
  if (alignmentType === 'aligned') {
    return "You're well-aligned. Re-assess in 4 months or after major life changes.";
  }
  return "Re-assess in 3 months or when circumstances significantly change.";
}
```

### 10.6 예시 케이스

#### Case A: Survival + Depleted + Reactive
```
Level: 1 (Survival) → 4주
Alignment: Depleted → -4주
OS Mode: Reactive → -4주
─────────────────────────
Raw: -4주 → 최소값 적용 → 2주

Result: {
  validUntil: "2026-01-31",
  validityWeeks: 2,
  urgency: "high",
  message: "위기 상태입니다. 2주 후 재측정을 권장합니다."
}
```

#### Case B: Aligned + Aligned + Active
```
Level: 4 (Aligned) → 16주
Alignment: Aligned → +4주
OS Mode: Active → 0
─────────────────────────
Total: 20주 (최대값)

Result: {
  validUntil: "2026-06-05",
  validityWeeks: 20,
  urgency: "low",
  message: "안정적인 상태입니다. 5개월 후 또는 큰 변화가 있을 때 재측정하세요."
}
```

#### Case C: Flow + Aligned + Active
```
Level: 5 (Flow) → 8주
Alignment: Aligned → +4주
OS Mode: Active → 0
─────────────────────────
Total: 12주

Result: {
  validUntil: "2026-04-11",
  validityWeeks: 12,
  urgency: "medium",
  message: "Flow 상태는 강력하지만 지속 불가합니다. 3개월 후 재측정하세요."
}
```

### 10.7 UI 표시

```
┌─────────────────────────────────────────┐
│  📅 Report Valid Until: April 11, 2026  │
│  ─────────────────────────────────────  │
│  ⏱️ Re-assess in 12 weeks               │
│                                         │
│  💡 Flow state is powerful but          │
│     unsustainable. Check back then.     │
│                                         │
│  [🔄 Take Survey Again]                 │
└─────────────────────────────────────────┘
```

### 10.8 자동 리마인더 (Optional)

```typescript
// 이메일 리마인더 스케줄
interface ReminderSchedule {
  firstReminder: Date;   // 만료 1주 전
  finalReminder: Date;   // 만료일
  subject: string;
}

function scheduleReminders(validity: ValidityResult): ReminderSchedule {
  const firstReminder = new Date(validity.validUntil);
  firstReminder.setDate(firstReminder.getDate() - 7);

  return {
    firstReminder,
    finalReminder: validity.validUntil,
    subject: `Your BADA Blueprint is expiring soon`
  };
}
```

### 10.9 Major Life Event 조기 만료

유효기간과 별개로, **중대 사건** 발생 시 즉시 재측정 권장:

| Event | 영향 | 권장 |
|-------|------|------|
| 이직/실직 | OS Mode 변경 가능 | 즉시 재측정 |
| 이별/결혼 | Environment 변경 | 2주 후 재측정 |
| 건강 이슈 | 전반적 변경 | 안정화 후 재측정 |
| 이사/이민 | Environment 변경 | 1개월 후 재측정 |
| 출산 | 전반적 변경 | 3개월 후 재측정 |

```typescript
// 리포트에 포함
{
  validUntil: "2026-04-11",
  earlyInvalidationEvents: [
    "Major career change",
    "Significant relationship change",
    "Health crisis",
    "Relocation"
  ],
  disclaimer: "Re-assess immediately if any of these occur."
}
```

---

## 11. 리포트 반영 (v2.2 - Level 시스템)

### Page 1 (Identity) - Level 표시

```json
{
  "efficiency_snapshot": {
    "level": 2,
    "levelName": "Recovery",
    "alignment": "Overdriven",
    "metaphor": "A deep-sea submarine forced to race on the surface...",
    "guidance": "기본 기능 복구 중. 무리한 목표 설정 금지."
  }
}
```

**UI 표시 (Rate 숨김):**
```
┌─────────────────────────────┐
│  🟠 Level 2: Recovery       │
│  ─────────────────────────  │
│  기본 기능 복구 중           │
│  무리한 목표 설정 금지        │
└─────────────────────────────┘
```

### Page 3 (OS) - Alignment + Level

```json
{
  "os_summary": "Your ${hardwareType} engine is currently ${alignmentType}.",
  "level_context": "You're operating at Level ${level} (${levelName}). ${levelDescription}",
  "current_state": "${alignmentDiagnosis}"
}
```

### Page 5 (Solution) - Level 기반 Guidance

```json
{
  "transformation_goal": "${getLevelBasedGoal(level, alignmentType)}",
  "level_guidance": "${OPERATING_LEVELS[level].guidance}",
  "warning": "${level <= 2 ? 'Recovery first. Expansion later.' : ''}"
}
```

```typescript
function getLevelBasedGoal(level: OperatingLevel, alignmentType: AlignmentType): string {
  if (level <= 2) {
    return 'Focus on recovery. Energy conservation is your priority.';
  }
  if (alignmentType === 'underutilized') {
    return 'Find channels to release your pent-up energy.';
  }
  if (alignmentType === 'overdriven' || alignmentType === 'depleted') {
    return 'Create pockets of stillness in your demanding life.';
  }
  if (alignmentType === 'scattered') {
    return 'Build agency before acceleration. Control before speed.';
  }
  return 'Maintain your current alignment while expanding capacity.';
}
```

### 모델의 핵심 메시지

> "지금 상태에서 뭘 하면 안 되는지"가 바로 보인다.

| Level | 해도 되는 것 | 하면 안 되는 것 |
|-------|-------------|----------------|
| 1 Survival | 기본 루틴 유지 | 새 프로젝트, 큰 결정 |
| 2 Recovery | 작은 성공 쌓기 | 무리한 목표 |
| 3 Stable | 소규모 확장 | 급격한 변화 |
| 4 Aligned | 중요한 결정 | 과도한 확장 |
| 5 Flow | 도전적 목표 | 장기 지속 (충전 필요) |

---

## Changelog

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-01-17 | v2.0 | 초기 기획서 작성 |
| 2026-01-17 | v2.1 | 구조적 리스크 3가지 보완 |
| 2026-01-17 | v2.2 | 조합 효과 + 5단계 레벨 시스템 |
| 2026-01-17 | v2.3 | 리포트 유효기간 시스템 추가 |

### v2.1 변경 상세

**① OS 3단계 확장**
- 기존: `active` | `passive`
- 변경: `active` | `reactive` | `passive`
- Reactive = Low Agency + Unstable Environment (생존 모드)

**② ThreatMode 추가**
- `forward`: A ≥ 2 (추진형)
- `emotional`: B ≥ 2 (감정형)
- `freeze`: C ≥ 1 & A < 2 (정지형)
- Alignment 계산에 보정값 반영

**③ 극단값 감쇠**
- absScore > 6: 30% 감쇠
- absScore > 4: 15% 감쇠
- "스포츠카도 레드라인 계속 밟으면 고장"

**④ 신규 Alignment Type**
- `scattered`: Dynamic + Reactive (분출 불가)
- `depleted`: Static + Reactive (소모전)

### v2.2 변경 상세

**① Interaction Penalty 추가**
- 신약 + 재성 ≥2 → -3 (번아웃 가속)
- 신강 + 관성 ≥2 → -2 (통제 충돌)
- 신약 + 식상 ≥2 → -2 (에너지 고갈)
- 신강 + 재성 ≥2 → +2 (추진력 보너스)

**② ElementBalance → 상한 보정으로 전환**
- 기존: 절대 보너스 (+5)
- 변경: 상한 제한 (97% ~ 105%)
- 철학: "균형은 잘 살 때 더 잘 사는 조건"

**③ 하한선 변경**
- 기존: 40%
- 변경: 25%
- Survival 상태 실제 반영

**④ 5단계 레벨 시스템**
- Level 1: Survival (25-34%)
- Level 2: Recovery (35-49%)
- Level 3: Stable (50-64%)
- Level 4: Aligned (65-79%)
- Level 5: Flow (80-105%)
- **Rate는 절대 외부 노출 안 함**

**⑤ 레벨별 Guidance**
- 각 레벨마다 "지금 뭘 하면 안 되는지" 명확히 제시
- 숫자 비교 불가 → 신뢰비용 제거

### v2.3 변경 상세

**① 리포트 유효기간 시스템**
- 핵심 원칙: 불안정할수록 짧게
- 범위: 2주 ~ 20주 (동적 산정)

**② 유효기간 산정 공식**
```
기본값 (Level) + Alignment 보정 + OS Mode 보정
```

| Level | 기본 | Reactive 보정 | Depleted 보정 |
|-------|------|--------------|---------------|
| 1 Survival | 4주 | -4주 | -4주 |
| 4 Aligned | 16주 | -4주 | N/A |
| 5 Flow | 8주 | -4주 | N/A |

**③ Major Life Event 조기 만료**
- 이직/이별/건강 이슈 시 즉시 재측정 권장
- 리포트에 조기 만료 조건 명시

**④ UI/UX**
- 유효기간 + 재측정 권장 메시지 표시
- [Take Survey Again] 버튼 노출
- (Optional) 만료 1주 전 이메일 리마인더; 백로그로 쌓아두고 추후 검토
