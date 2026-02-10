# BADA Report Quality Upgrade Plan

> 벤치마크: 사주아이 990원 리포트 (12p)
> 작성일: 2026-01-16

---

## 1. 벤치마크 분석: 사주아이 vs BADA 현재

### 사주아이 리포트 구조 (12페이지)

| # | 섹션 | 타이틀 예시 | 특징 |
|---|-----|----------|------|
| 1 | 종합 인트로 | "한여름 사막 한가운데 우뚝 선 고고한 여왕" | 강렬한 첫인상 |
| 2 | 오행 분석 | "불바다 속 메마른 대지, 물이 시급합니다!" | 원소 불균형 진단 |
| 3 | 일주 분석 | "카리스마 끝판왕, 무오일주의 위엄" | Day Master 심층 |
| 4 | 그림자 분석 | "고집불통에 귀 막고 사는 독불장군" | 약점/주의점 |
| 5 | 잠재력 | "누구도 흉내 낼 수 없는 압도적인 존재감" | 강점 강조 |
| 6 | 성격 심층 | "화끈한 뒤끝 없음, 그러나 혼자만의 완벽주의" | 양면성 + 조언 |
| 7 | 직업/커리어 | "자유로운 영혼의 전문직 프리랜서" | 맞는 직업군 |
| 8 | 재물운 | "버는 것보다 지키는 것이 관건인 재물운" | 돈 패턴 |
| 9 | 연애/이성운 | "눈은 높은데 남자는 안 보이는 아이러니" | 연애 패턴 |
| 10 | 가족관계 | "애증의 모녀 관계, 그리고 그리운 아버지" | 가족 역학 |
| 11 | 인간관계 + 개운법 | "친구는 많으나 진짜 내 편은 소수 정예" | 관계 + 장소 |
| 12 | 클로징 | "뜨거운 열정을 지혜롭게 식힐 때 비로소 꽃핀다" | 임파워링 |

### 사주아이의 핵심 강점

1. **캐치한 타이틀**: "~하는 ~" 형태의 기억에 남는 문장
2. **구체적 메타포**: "스포츠카처럼 질주하려는 본능", "가마솥이 펄펄 끓고 있는 형상"
3. **양면성 분석**: 같은 특성을 강점/약점 양쪽에서 다룸
4. **실용적 조언**: "3초의 법칙", "검은색/흰색 옷", "물을 자주 마시고"
5. **생활 영역별 분류**: 직업, 재물, 연애, 가족, 친구 각각 분리
6. **분량**: 섹션당 3-4문단 (150-200자씩)

### 현재 BADA vs 사주아이 Gap

| 항목 | BADA 현재 | 사주아이 | Gap |
|-----|---------|---------|-----|
| **섹션 수** | 5개 (고정) | 12개 | 생활 영역 없음 |
| **타이틀** | 영어, 추상적 ("The Core Tension") | 한국어, 구체적 메타포 | 몰입도 낮음 |
| **분량** | 2-3문장/섹션 | 3-4문단/섹션 | 얕음 |
| **구체성** | "High Agency detected" | "화가 나면 그 자리에서 불같이 폭발" | 뻔함 |
| **실천 조언** | "A specific cognitive task" | "3초만 심호흡을 하세요" | 실행 불가 |
| **톤** | 차갑고 과학적 | 따뜻하고 친근 (~하시죠, ~이에요) | 거리감 |

---

## 2. 현재 BADA 프롬프트 문제점

### 2.1 구조적 문제

```
문제: 배열 길이 미고정
현재: core_insight: ["Insight about their core drive", "Insight about their natural strength"]
결과: AI가 1개만 주거나 5개 줄 수 있음
```

```
문제: 포맷/길이 미지정
현재: blueprint_summary: "2-3 sentences describing..."
결과: 한 문장만 주거나 너무 길게 줄 수 있음
```

```
문제: Few-shot 예시 없음
현재: "A catchy name for their specific friction pattern"
결과: 매번 다른 스타일, 톤 불일치
```

### 2.2 콘텐츠 문제

```
문제: 생활 영역 부재
현재: Hardware → OS → Mismatch → Solution (추상적)
결과: "그래서 내 직장/연애/돈은 어떻게 되는데?" 답변 불가
```

```
문제: 구체성 부족
현재: "Point about threat response"
결과: "You have elevated threat perception" (뻔한 문장)
```

```
문제: Operating Rate 활용 미흡
현재: 68.5% (Energy Leakage) - 숫자만 보여줌
결과: "그래서 뭘 어떻게 하라는 건데?" 행동 연결 없음
```

---

## 3. 개선 기획안

### 3.1 새로운 리포트 구조 (5페이지 유지, 깊이 강화)

> 페이지 수는 유지하되 각 페이지 콘텐츠 밀도를 높임

| Page | 현재 | 개선안 | 변경 사항 |
|------|-----|-------|---------|
| **1** | Identity (티저) | **Identity + Hook** | 유지 (훅 역할) |
| **2** | Hardware | **Core Nature + Shadow** | 강점 + 그림자 양면성 추가 |
| **3** | OS | **Operating Pattern Deep Dive** | 3개 축 각각 구체적 설명 |
| **4** | Mismatch | **Life Friction Map** | 직업/관계/돈 3영역 마찰 구체화 |
| **5** | Solution | **Action Protocol + Quick Wins** | 실천 가능한 구체적 조언 |

### 3.2 프롬프트 표준화

#### A. 타이틀 포맷 강제

```diff
- "insight_title": "A catchy name for their specific friction pattern"
+ "insight_title": "Create a Korean title in this exact format: '[감정/상태] + [핵심 갈등]'
+   Examples:
+   - '타오르는 열정, 그러나 방향을 잃은 불꽃'
+   - '완벽을 향해 달리지만, 스스로 지치는 러너'
+   - '깊은 통찰력, 그러나 말하지 못하는 입'
+   Must be emotionally resonant and specific to this person."
```

#### B. 배열 길이 & 포맷 명시

```diff
- "core_insight": ["Insight about their core drive", "Insight about their natural strength"]
+ "core_insight": [
+   // EXACTLY 3 items, each 40-60 characters in Korean
+   "첫 번째 인사이트: 핵심 드라이브 (예: '당신의 엔진은 인정받고 싶은 욕구로 작동합니다')",
+   "두 번째 인사이트: 자연적 강점 (예: '위기 상황에서 오히려 명확해지는 판단력')",
+   "세 번째 인사이트: 숨겨진 니즈 (예: '혼자만의 시간이 재충전의 핵심')"
+ ]
```

#### C. 분량 가이드라인 추가

```diff
- "blueprint_summary": "2-3 sentences describing their innate engine"
+ "blueprint_summary": "Write EXACTLY 3 paragraphs (each 2-3 sentences, total 150-200 Korean characters):
+   Para 1: 핵심 본성을 자연 메타포로 설명
+   Para 2: 이 본성이 일상에서 어떻게 나타나는지
+   Para 3: 이 본성의 양면성 (강점이자 약점인 부분)
+
+   Example tone: '지윤님은 마치 한여름 사막의 태양과 같습니다. 겉으로는 조용해 보이지만,
+   그 속에는 언제든 폭발할 수 있는 뜨거운 마그마를 품고 있죠. 남들의 시선에 아랑곳하지 않고
+   본인만의 길을 묵묵히, 그러나 아주 강력하게 걸어가는 포스가 느껴지네요.'"
```

### 3.3 새로운 섹션 콘텐츠 스펙

#### Page 2: Core Nature + Shadow (강화)

```typescript
page2_hardware: {
  section_name: "Your Natural Blueprint",

  // NEW: 메인 메타포 타이틀 (한국어)
  nature_title: string; // "한여름 사막 한가운데 우뚝 선 고고한 여왕"

  // 강화: 3문단으로 확장
  nature_description: string; // 150-200자, 자연 메타포 중심

  // NEW: 그림자 섹션 추가
  shadow_title: string; // "완벽주의의 그림자, 스스로를 가두는 감옥"
  shadow_description: string; // 약점/주의점을 부드럽게

  // 유지: 핵심 인사이트 (3개 고정)
  core_insights: [string, string, string];
}
```

#### Page 3: Operating Pattern Deep Dive (강화)

```typescript
page3_os: {
  section_name: "Your Current Operating System",

  // NEW: OS 타입별 메인 타이틀
  os_title: string; // "행동하고 싶지만 생각에 갇힌 전략가"

  // 강화: 3개 축 각각 독립 섹션
  threat_axis: {
    title: string; // "위협 감지: 예민한 안테나"
    score_label: string; // "High (3/3)"
    description: string; // 100자 이상, 구체적 상황 예시 포함
  };

  environment_axis: {
    title: string; // "환경 민감도: 변화에 흔들리는 뿌리"
    score_label: string; // "Unstable"
    description: string;
  };

  agency_axis: {
    title: string; // "주도성: 잠자는 거인"
    score_label: string; // "Low (1/3)"
    description: string;
  };

  // NEW: OS 종합 진단
  os_summary: string; // "이 세 가지가 만나 당신은..."
}
```

#### Page 4: Life Friction Map (신규 구조)

```typescript
page4_mismatch: {
  section_name: "The Core Tension",

  // 유지: 메인 마찰 타이틀
  friction_title: string; // "타오르는 열정, 그러나 방향을 잃은 불꽃"

  // NEW: 생활 영역별 마찰 (사주아이 스타일)
  career_friction: {
    title: string; // "직장에서의 마찰"
    description: string; // "회의 시간에 아이디어가 넘치지만 말하지 못하고..."
    quick_tip: string; // "발언 전 3초만 심호흡하세요"
  };

  relationship_friction: {
    title: string; // "관계에서의 마찰"
    description: string;
    quick_tip: string;
  };

  money_friction: {
    title: string; // "돈 관리에서의 마찰"
    description: string;
    quick_tip: string;
  };
}
```

#### Page 5: Action Protocol + Quick Wins (강화)

```typescript
page5_solution: {
  section_name: "Your Action Protocol",

  // 유지
  transformation_goal: string;
  protocol_name: string;

  // 강화: 구체적 실천 액션 (사주아이 스타일)
  daily_rituals: [
    {
      name: string; // "3초 법칙"
      description: string; // "화가 나거나 결정을 내려야 할 때 딱 3초만 심호흡을..."
      when: string; // "감정이 격해질 때"
    },
    // exactly 3 items
  ];

  // NEW: 환경 개운법 (사주아이의 "물을 건너거나 바닷가 도시가 살길")
  environment_boost: {
    element_needed: string; // "water"
    practical_tips: string[]; // ["물을 자주 마시세요", "파란색 계열 소품 활용", "바다가 보이는 곳으로 여행"]
  };

  // 강화: 임파워링 클로징 (2-3문장 → 1문단)
  closing_message: string; // 100자 이상
}
```

### 3.4 Operating Rate 계산 로직 개선

현재 로직:
```typescript
// 현재: 단순 패널티 기반
const imbalancePenalty = (maxCount > 3 ? (maxCount - 3) * 10 : 0) + (zeroCount * 5);
operatingRate = Math.max(40, 100 - imbalancePenalty + balanceBonus);
```

개선안:
```typescript
// 개선: Survey 점수도 반영
const sajuImbalance = (maxCount > 3 ? (maxCount - 3) * 10 : 0) + (zeroCount * 5);
const osEfficiency = (surveyScores.agencyActive * 10) + (surveyScores.threatClarity * 5);
const alignmentBonus = calculateHardwareOsAlignment(sajuResult, surveyScores); // 0-15

operatingRate = Math.max(40, 100 - sajuImbalance + osEfficiency + alignmentBonus);

// 해석 추가
operatingRateInterpretation = {
  score: operatingRate,
  label: operatingRate >= 80 ? "High Efficiency" : operatingRate >= 60 ? "Moderate" : "Needs Attention",
  metaphor: generateRateMetaphor(operatingRate, dominantElement), // "80마력 엔진을 40%만 쓰고 있어요"
  primaryBlocker: identifyBlocker(sajuResult, surveyScores) // "과도한 생각이 행동을 막고 있어요"
};
```

### 3.5 뇌과학적 해석 통합 방안 (Grounded Approach)

> **핵심 원칙**: 리포트의 기본 언어는 B1-B2 수준의 쉬운 영어를 기반으로 합니다. 데이터 수집이나 코어 로직을 변경하는 대신, 리포트 생성의 '두뇌' 역할을 하는 `lib/gemini_client.ts`의 프롬프트 엔지니어링을 강화합니다. 즉, **기존의 입력 데이터(Saju, Survey)를 새로운 '뇌과학'의 렌즈를 통해 해석하도록 AI에게 지시**합니다.

#### 페이지 3: Operating Pattern Deep Dive (뇌과학 접목)

- **수정 대상 파일**: `lib/gemini_client.ts`
- **사용 데이터**: `surveyScores.threat_axis` 점수
- **변경 제안**: 프롬프트 지시문에 다음과 같이 구체성을 더합니다.
    > "Given the user's `threat_score` of X, explain this to them in simple English (B2 level) by referencing their **amygdala** (the brain's alarm system) and their **sympathetic nervous system** (the 'fight-or-flight' response). Frame a high score as a sign of a highly perceptive, but sensitive, system."

#### 페이지 5: Action Protocol (실행 가능한 솔루션 강화)

- **수정 대상 파일**: `lib/gemini_client.ts`
- **사용 데이터**: 이전 페이지들에서 분석된 사용자의 종합적인 상태 (예: 높은 위협 민감도)
- **변경 제안**: 솔루션 생성 지시문에 아래와 같은 로직을 추가합니다.
    > "In the `daily_rituals` section, if the user's `threat_score` is high, you must include the **'Physiological Sigh'** as a tool. Describe it simply (two quick inhales, one long exhale) and explain that it's a science-backed way to quickly calm the nervous system."

이 접근법은 핵심 로직의 변경 없이 해석 레이어만 강화하여, 추상적인 점수를 구체적이고 과학에 기반한 개념 및 행동과 연결시켜 리포트의 신뢰도와 가치를 높입니다.

---

## 4. 프롬프트 템플릿 (신규)

### System Prompt 개선안

```typescript
const systemPrompt = `You are the "Life Architect" for BADA. Generate deeply personalized reports.

# CRITICAL RULES
1. **Language**: Write ALL content in easy-to-understand English (B1-B2 Level).
2. **Tone**: Warm, conversational, and scientific, like a wise friend explaining how your brain works.
3. **Specificity**: NO generic advice. Every sentence must reflect THIS person's data.
4. **Neuroscience Integration**: Where specified in the User Prompt, you MUST explain user patterns using simple neuroscience concepts (e.g., amygdala, prefrontal cortex, dopamine).
5. **Metaphors**: Use a blend of nature and modern tech/life metaphors ("Your focus system is like a spotlight," "Your threat response is a sensitive alarm system").
6. **Balance**: Always show both sides of a trait (e.g., strength vs. shadow).

# FORMAT REQUIREMENTS
- Titles: Must be emotionally resonant and specific.
- Descriptions: Must adhere to length and paragraph counts specified in the User Prompt.
- Insights & Tips: Must be actionable and adhere to specified constraints.

# USER DATA (Internal Reference)
${userDataContext}

# EXAMPLES OF GOOD OUTPUT

## Good Title Examples:
- "The Resilient Pioneer with a Hidden Fear of Failure"
- "The Luminous Navigator Aiming for an Unclear Shore"
- "The Overheated Achiever Running on an Empty Tank"

## Good Description Example (incorporating neuroscience):
"Externally, you project an image of calm and stability, much like a vast, quiet desert. But internally, your brain's threat-detection system (the amygdala) is incredibly active, constantly scanning the horizon. This makes you highly perceptive and prepared, but it also consumes a significant amount of energy, sometimes leaving you feeling drained without knowing why."

## Good Tip Example (actionable & science-backed):
- "When you feel overwhelmed, practice the 'Physiological Sigh': take two sharp inhales through your nose, and one long, slow exhale through your mouth. This is the fastest known way to tell your brainstem to calm your body down."
- "Get 10 minutes of morning sunlight within an hour of waking. This helps set your body's master clock (circadian rhythm) and provides a stable foundation for your day's dopamine levels, improving mood and focus."`;
```

### User Prompt 개선안

```typescript
const userPrompt = `Generate a Life Blueprint Report for ${userName}.

Return a JSON object with this EXACT structure. Follow all character limits and instructions strictly.

{
  "page1_identity": {
    "main_title": "${synthesizedTitle}",
    "hook_subtitle": "5-7 English words, intriguing",
    "nature_snapshot": {
      "title": "Birth Pattern (Your Nature)",
      "definition": "Powerful metaphor, 20-30 chars",
      "explanation": "50-80 chars explaining why"
    },
    "brain_snapshot": {
      "title": "Current Mind State",
      "definition": "Compelling phrase, 20-30 chars",
      // INSTRUCTION: Add a hint for neuroscience here
      "explanation": "50-80 chars. Explain with simple psychology or neuroscience terms."
    },
    "efficiency_snapshot": {
      "score": "${sajuResult.stats.operatingRate.toFixed(1)}%",
      "label": "Energy Leakage",
      "metaphor": "Powerful car/engine metaphor, 50-80 chars"
    }
  },

  "page2_hardware": {
    "section_name": "Your Natural Blueprint",
    "nature_title": "English title, [State] + [Metaphor] format, 25-40 chars",
    "nature_description": "3 paragraphs, 150-200 chars total, nature metaphors only",
    "shadow_title": "English title about shadow side, 25-40 chars",
    // INSTRUCTION: Add a hint for neuroscience here
    "shadow_description": "2 paragraphs, 100-150 chars, gentle tone. Hint at a potential neurological pattern (e.g., an overactive error-detection circuit for a perfectionist).",
    "core_insights": [
      "Insight 1: core drive, 40-60 chars",
      "Insight 2: natural strength, 40-60 chars",
      "Insight 3: hidden need, 40-60 chars"
    ]
  },

  "page3_os": {
    "section_name": "Your Current Operating System",
    "os_title": "English title about their OS pattern, 25-40 chars",
    "threat_axis": {
      "title": "Threat Detection: [Characteristic]",
      "level": "${surveyScores.threatClarity === 1 ? 'High' : 'Low'} (${surveyScores.threatScore}/3)",
      // INSTRUCTION: Specify neuroscience integration
      "description": "100+ chars. Explain using simple neuroscience terms like 'amygdala' and 'sympathetic nervous system'."
    },
    "environment_axis": {
      "title": "Environmental Sensitivity: [Characteristic]",
      "level": "${surveyScores.environmentStable === 1 ? 'Stable' : 'Unstable'}",
       // INSTRUCTION: Specify neuroscience integration
      "description": "100+ chars. Explain using concepts like 'cognitive load' or 'sensory processing sensitivity'."
    },
    "agency_axis": {
      "title": "Agency & Drive: [Characteristic]",
      "level": "${surveyScores.agencyActive === 1 ? 'High' : 'Low'} (${surveyScores.agencyScore}/3)",
       // INSTRUCTION: Specify neuroscience integration
      "description": "100+ chars. Explain using simple neuroscience terms like 'prefrontal cortex (PFC)' and 'dopamine'."
    },
    "os_summary": "2-3 sentences synthesizing all three axes"
  },

  "page4_mismatch": {
    "section_name": "The Core Tension",
    "friction_title": "English title, [Emotion] + [Conflict] format, 30-50 chars",
    "career_friction": {
      "title": "In Your Career",
      "description": "80-120 chars, specific workplace scenario, hinting at the underlying neuroscience.",
      "quick_tip": "Actionable tip, 30-50 chars"
    },
    "relationship_friction": {
      "title": "In Your Relationships",
      "description": "80-120 chars, specific relationship scenario, hinting at the underlying neuroscience.",
      "quick_tip": "Actionable tip, 30-50 chars"
    },
    "money_friction": {
      "title": "With Your Finances",
      "description": "80-120 chars, specific money scenario, hinting at the underlying neuroscience.",
      "quick_tip": "Actionable tip, 30-50 chars"
    }
  },

  "page5_solution": {
    "section_name": "Your Action Protocol",
    "transformation_goal": "One powerful sentence, 30-50 chars",
    "protocol_name": "Memorable English name, 15-25 chars",
    "daily_rituals": [
      {
        "name": "Catchy ritual name, 10-20 chars (e.g., 'The 5-Minute Reset')",
        // INSTRUCTION: Specify science-backed protocols
        "description": "How to do it. Must be a science-backed protocol (e.g., Physiological Sigh, Morning Sunlight). 50-80 chars",
        "when": "When to apply, 10-20 chars"
      },
      // exactly 3 rituals
    ],
    "environment_boost": {
      "element_needed": "${missingElement}",
      "tips": [
        "Practical tip 1, related to the element, 20-40 chars",
        "Practical tip 2, related to the element, 20-40 chars",
        "Practical tip 3, related to the element, 20-40 chars"
      ]
    },
    "closing_message": "Empowering closing, 100+ chars, reference their identity title"
  }
}

Make every word specific to ${userName}'s unique combination. Return ONLY valid JSON.`;
```

---

## 5. 구현 우선순위

### Phase 1: 프롬프트 표준화 (Quick Win)
- [ ] 배열 길이 고정 (exactly 3 items)
- [ ] 문자 수 제한 추가 (40-60 chars, 100+ chars 등)
- [ ] Few-shot 예시 추가 (사주아이 스타일 타이틀)
- [ ] 한국어 출력 강제

### Phase 2: 콘텐츠 구조 개선
- [ ] Page 2에 Shadow 섹션 추가
- [ ] Page 3 OS 축별 독립 설명
- [ ] Page 4 생활영역별 마찰 (직업/관계/돈)
- [ ] Page 5 구체적 Daily Rituals

### Phase 3: 점수 시스템 개선
- [ ] Operating Rate 해석 텍스트 추가
- [ ] Survey + Saju 통합 Alignment 점수
- [ ] 부족 원소 기반 개운법 자동 생성

### Phase 4: 검증 & 품질관리
- [ ] Zod schema로 JSON 응답 검증
- [ ] 문자 수 미달 시 재생성 로직
- [ ] A/B 테스트 (현재 vs 개선안)

---
6. 예상 결과물 비교

### Before (현재 - AS IS)
*차가운 분석 톤, 추상적인 영어 표현*

```json
{
  "page1_identity": {
    "title": "The Conscious Maintainer",
    "sub_headline": "You have a strong foundation but hesitate to build.",
    "visual_concept": "bg_type_03"
  },
  "page2_hardware": {
    "section_name": "Your Natural Blueprint",
    "blueprint_summary": "You are like a solid rock. You value stability above all else.",
    "core_insight": ["Seeking stability", "Risk averse"]
  },
  "page3_os": {
    "diagnosis_summary": "Your OS is running slowly due to high threat perception.",
    "analysis_points": ["High Threat", "Low Agency"]
  },
  "page5_solution": {
    "goal": "Try to be more active.",
    "protocol_name": "Stability Protocol",
    "steps": ["Take a deep breath", "Walk outside"]
  }
}
```

### After (개선 후 - TO BE)
*따뜻하고 구체적인 한국어 메타포 + 뇌과학적 근거 + 실행 가능한 솔루션*

#### Page 1: Identity & Hook
- **Title**: "깊이 뿌리내린 개척자 (The Deep-rooted Pioneer)"
- **Subtitle**: "타오르는 불꽃이 방향을 찾는 순간"
- **Nature Snapshot**: "한여름 사막 한가운데 우뚝 선 고고한 여왕"
- **Brain Snapshot**: "생각의 미로에 갇힌 행동가 (Action Trapped in Thoughts)"
- **Efficiency**: "48.5% (에너지 누수 경고) - 마치 스포츠카가 진흙탕에서 공회전하는 형상"

#### Page 2: Core Nature + Shadow (입체적 분석)
- **Nature Title**: "한여름 사막의 태양"
- **Nature Description**:
  "지윤님은 마치 이글거리는 태양 아래 끝없이 펼쳐진 웅장한 사막과도 같습니다. 겉으로는 조용하고 무게감 있어 보이지만, 그 땅속에는 언제든 폭발할 수 있는 뜨거운 마그마를 품고 있는 형상입니다."
- **Shadow Title**: "완벽주의의 그림자, 스스로를 가두는 감옥"
- **Shadow Description**:
  "하지만 이 강렬한 에너지가 때로는 스스로를 지치게 만들기도 합니다. 뇌의 실수 탐지 영역(ACC)이 남들보다 민감하여, 완벽하지 않으면 시작조차 하지 않으려 합니다."

#### Page 3: Operating System (뇌과학적 해석)
- **Threat Axis**: "위협 감지: 예민한 레이더 (High)"
  > "당신의 편도체(Amygdala)는 작은 신호도 놓치지 않습니다. 이는 위기에 강한 리더의 자질이지만, 평시에는 불필요한 불안을 만들어냅니다."
- **Agency Axis**: "주도성: 잠자는 거인 (Low Active)"
  > "도파민 보상 회로가 '즉각적인 만족'보다는 '확실한 결과'에만 반응하도록 설정되어 있어, 불확실한 상황에서는 엔진이 꺼지기 쉽습니다."

#### Page 4: Life Friction Map (생활 밀착형)
- **Career**: "회의 시간, 정답을 알지만 침묵하는 순간 - '나대지 않을까?' 하는 자기 검열"
- **Relationship**: "상처받기 싫어서 먼저 거리를 두는 고슴도치 전략"

#### Page 5: Action Protocol (Science-Backed)
- **Protocol Name**: "The 3-Second Reset (3초의 기적)"
- **Daily Ritual 1**: "Physiological Sigh (생리적 한숨)"
  > "코로 두 번 짧게 들이마시고, 입으로 길게 내뱉으세요. 신경계를 즉시 진정시키는 가장 과학적인 방법입니다."
- **Daily Ritual 2**: "Morning Sunlight (아침 햇살 10분)"
  > "기상 후 1시간 내에 햇볕을 쬐어 세로토닌을 깨우세요. 당신의 예민한 생체 시계를 안정화시킵니다."

---

## 7. 참고 자료

- 벤치마크 파일: `.ai-workflow/design-benchmark/이지윤_사주_사주아이.pdf`
- 현재 프롬프트: `lib/gemini_client.ts`
- 현재 스코어링: `client/src/lib/scoring.ts`
- 현재 계산 로직: `lib/saju_calculator.ts:200-210`
