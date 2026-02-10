# Report Tone Sharpening: Indirect → Direct

**Date:** 2026-01-31
**Updated:** 2026-02-07
**Goal:** 리포트 언어를 vague/indirect에서 sharp/diagnostic으로 전환
**Reference:**
- Dan Koe - Human 3.0 Framework (writing style + structural concreteness)
- MyselfManual (3만원 상품) - Human Design + 연령 기반 조언 (구조 + 깊이 + 개인화)

---

## 핵심 진단

현재 리포트는 **"분위기 전달"은 잘 하지만 "진단"은 못 한다.**

### 가격대별 기대치 분석

| 가격 | 상품 | 분량 | 특징 |
|------|------|------|------|
| 3만원 | MyselfManual | ~25,000자 (12섹션) | Human Design + 사주, 연령 기반, 연애/재정/파트너 포함 |
| $1.9 | BADA | ~3,000자 (5섹션) → 목표 ~6,000자 | OS Type + 사주, 자기이해 + 행동 프로토콜 중심 |

**$1.9 가격대에서의 합리적 기대치:**
- MyselfManual의 1/4~1/3 분량
- 연애/재정/파트너 예측은 범위 밖 (BADA는 자기이해 + 행동 변화에 집중)
- 하지만 "내 돈 주고 산 리포트"라는 느낌은 확실히 줘야 함

---

## Dan Koe에서 채택하는 것 (전부 채택):

1. ✅ **Named patterns** — 모든 안티패턴에 이름을 붙인다. "The Productive Burnout Loop", "The Over-Prepare Trap" 등. 이름이 있으면 인식할 수 있고, 인식하면 멈출 수 있다.
   - 적용: Page 2 shadow → named anti-pattern, Page 4 friction → named loop

2. ✅ **Level declaration** — "You are at Level X" 선언. **BADA 자체 시스템 사용** (Dan Koe의 1.0→3.0이 아님).
   - BADA의 기존 데이터: `operatingRate` → `rateToLevel()` → Level 1-5 (Survival / Recovery / Stable / Aligned / Flow)
   - + `AlignmentType` (aligned / underutilized / overdriven / scattered / depleted) — 같은 레벨 안에서의 상태 구분
   - 예: "Level 3 — Stable, but Overdriven. 안정적이지만 과잉 가동 중."
   - 적용: Page 1 identity에 Level + AlignmentType 선언, Page 5에 "현재 레벨 → 다음 레벨" 전환 경로

3. ✅ **Behavioral evidence** — 추상적 진단을 구체적 행동 3개로 증명. "You do X. You do Y. You do Z. That's why we say you're [진단]." 읽는 사람이 "이거 나다"라고 느끼게.
   - 적용: Page 2 nature_description, Page 3 axis descriptions, Page 4 friction descriptions

4. ✅ **Anti-pattern per protocol** — 모든 행동 지침에 "안 하면 이렇게 된다" 추가. "Do X. If you don't, Y happens."
   - 적용: Page 5 daily_rituals에 각각 anti_pattern 필드 추가

5. ✅ **Cascade effects** — "A가 B를 악화시키고, B가 C를 소모한다." 시스템 간 연쇄 관계를 명시.
   - 적용: Page 3 os_summary에서 3축 간 cascade 관계 서술

6. ✅ **Cost statements** — 현재 패턴의 숨겨진 비용. "This burns 40% of your energy on false alarms." 구체적 비용을 수치로.
   - 적용: Page 4 각 friction에 cost 필드 추가

7. ✅ **Concrete numbers** — "70%", "3 minutes", "7 days". "soon", "regularly", "sometimes" 금지.
   - 적용: Page 5 protocols의 모든 지시에 구체적 숫자/시간/횟수

8. ✅ **Monday test** — 모든 action item이 "이번 월요일에 할 수 있는가?" 통과해야 함.
   - 적용: Page 5 protocols 검증 기준

---

## MyselfManual 벤치마크 (핵심 분석)

> MyselfManual은 3만원 상품으로, 입력은 "이지윤 1996-09-18 11:56 AM 서울 출생" 뿐인데 ~25,000자 12섹션 리포트가 나옴.

### MyselfManual 구조 분석

| 섹션 | 내용 | BADA 적용 가능성 |
|------|------|-----------------|
| 1. 저는 어떤 사람인가요? | 첫인상, 강점, 편안한 상황 | ✅ Page 1-2와 유사 |
| 2. 내 타고난 재능과 강점 | 고유 재능, 커리어 활용, 환경 조건 | ✅ Page 2 core_drive |
| 3. 나의 이상적인 연애 스타일 | 시작, 감정 흐름, 데이트 패턴 | ❌ 범위 밖 |
| 4. 돈을 끌어당기는 나만의 방식 | 직무, 비즈니스 구조, 네트워크 | ⚠️ 일부만 (friction으로) |
| 5. 나에게 맞는 일하는 방식 | 추진 방식, 에너지 리듬, 업무 환경 | ✅ Page 3 OS |
| 6. 직장/팀에서 나의 이상적인 역할 | 소통, 동료 인식, 리더십 | ⚠️ friction에 포함 |
| 7. 나와 잘 맞는 파트너의 특징 | 편안함, 케미, 경계할 패턴 | ❌ 범위 밖 |
| 8. 인간관계에서 조심해야 할 패턴 | 에너지 빼앗김, 좌절 원인 | ✅ Page 4 friction |
| 9. 재정적 풍요를 위해 주의할 점 | 낭비 순간, 큰돈 결정 | ⚠️ friction에 포함 |
| 10. 내 인생의 목적과 방향성 | 핵심 테마, 단계별 성장 | ✅ Page 5 transformation |
| 11. 중요한 의사결정 | 신호, 올바른 과정 | ✅ Page 5 protocols |
| 12. 에너지 관리 | 에너지 흐름, 보호, 충전 | ✅ Page 5 rituals |
| 13. 번아웃 방지 | 번아웃 신호, 균형, 스트레스 | ✅ Page 4-5 |

### MyselfManual에서 채택하는 것:

1. ✅ **연령 기반 조언** — "29세인 지윤님은 이제 '관조의 단계'로 넘어가고 있습니다"
   - BADA 적용: birthDate에서 나이 계산 → 연령대별 조언 분기
   - 20대 초반 / 20대 후반 / 30대 / 40대+ 각각 다른 뉘앙스

2. ✅ **구체적 상황 예시** — "회의 시간에 중구난방으로 흩어진 의견들을 듣고 나서 '그러니까 결론은 이거고, 앞으로 이렇게 하면 되겠네요'라고 깔끔하게 정리해 내는 능력"
   - BADA 현재: "In meetings, you probably hold back" (generic)
   - BADA 목표: 구체적인 장면 묘사 + 행동 패턴

3. ✅ **양면 동시 제시** — 강점과 약점이 같은 뿌리에서 나옴을 명시
   - MyselfManual: "지윤님의 '급한 성격'이 관계에서 오해를 부르기도 해요. 지윤님은 결론부터 딱 말하고 빠르게 해결하고 싶은데..."
   - BADA 적용: Page 2 shadow에서 core_drive와의 연결 명시

4. ✅ **감정 신호 체계** — 결정할 때 몸/감정이 보내는 신호
   - MyselfManual: "아랫배에서 올라오는 즉각적인 반응", "파도가 지나가고 맑게 갠 하늘처럼"
   - BADA 적용: Page 5 protocols에 "언제 하면 안 되는지" 포함

5. ✅ **대화체 톤** — "~거든요", "~하죠?", "지윤님~"
   - 현재 BADA는 3인칭 관찰자 톤 → 2인칭 대화체로 전환
   - 단, Dan Koe의 direct함은 유지 (둘을 조합)

6. ✅ **에너지 관리 프레임** — 번아웃 신호, 충전 방법, 방전 패턴
   - MyselfManual: "지윤님의 에너지를 가장 빠르게 고갈시키는 주범은 '완벽주의'와 '불필요한 오지랖'입니다"
   - BADA 적용: Page 4 friction에 "에너지 소모 패턴" 추가

### MyselfManual에서 채택하지 않는 것:

1. ❌ **Human Design 시스템** — BADA에 데이터 없음
   - MyselfManual은 Human Design(타입, 프로파일, 센터)을 핵심 프레임으로 사용
   - BADA는 OS Type + 사주 오행으로 대체

2. ❌ **연애/파트너 섹션** — $1.9 가격대에서 범위 밖
   - 연애 스타일, 파트너 특징, 관계 패턴은 premium tier에서 고려

3. ❌ **재정/투자 예언** — 데이터 없이 예측 불가
   - "부동산이 확실", "코인 비추" 같은 예언은 BADA 철학과 맞지 않음

4. ❌ **12섹션 구조** — 분량 과다
   - BADA는 5섹션 유지, 각 섹션의 깊이를 높임

5. ❌ **대운/세운 기반 조언** — 현재 BADA에 대운/세운 계산 없음
   - MyselfManual의 "20대까지는 시행착오, 30대부터는 관조" 같은 조언은
   - BADA에서는 단순 연령 기반으로 대체 (대운 계산 없이)

---

## BADA 고유 강점 (유지 및 강화)

### 현재 BADA만의 데이터:

1. **OS Type 시스템 (8가지)** — Survey 기반
   - threat_mode (3레벨), drive_mode (3레벨), maintenance_mode (3레벨)
   - 이것은 MyselfManual/사주아이에 없는 BADA만의 자산

2. **오행 분석 (elementCounts)** — 사주 기반
   - wood, fire, earth, metal, water 각 0~8 분포
   - 과다/부족 element → 행동 패턴 + 처방 연결

3. **Operating Rate** — Survey + 사주 조합
   - Level 1-5 + AlignmentType = 현재 상태 진단

4. **Visual System** — 배경 이미지 + 분위기
   - 사용자별 고유한 시각적 경험

### 강화해야 할 것:

| 현재 | 문제 | 목표 |
|------|------|------|
| OS Type 결과 → 일반론 | 구체적 행동 예시 없음 | OS Type별 구체적 장면 3개씩 |
| 오행 분석 → 배경 설명 | 행동 연결 안 됨 | "Fire x4 → 그래서 당신은 이렇게 행동한다" |
| Operating Rate → 숫자만 | 의미 설명 부족 | Level 선언 + 다음 레벨 경로 |

---

## 톤 전환: Dan Koe + MyselfManual 조합

### 삭제할 것 (REMOVE)
- "You might..." / "You probably..." / "Perhaps..."
- "Imagine a landscape where..." (1문장 이상 쓰지 않기)
- "gentle but honest" (gentle 삭제. honest만.)
- "warm and empowering" → "direct and supportive"
- "untapped potential" / "beautiful nature" / "so much possibility"
- "Try..." 로 시작하는 팁 (시도하라는 건 안 해도 된다는 뜻)

### 추가할 것 (ADD)

**From Dan Koe:**
- Named patterns, Level declaration, Behavioral evidence
- Cascade effects, Cost statements, Anti-patterns per protocol
- Concrete numbers, Monday test

**From MyselfManual:**
- 연령 기반 분기 ("29세인 당신은...")
- 구체적 상황 예시 ("회의에서 의견이 흩어졌을 때, 당신은...")
- 양면 동시 제시 ("이 강점이 바로 이 약점의 뿌리입니다")
- 감정/몸 신호 언급 ("아랫배가 묵직해지면 멈추세요")
- 에너지 관리 프레임 ("이것이 당신의 에너지를 고갈시킵니다")

### 톤 공식

```
[MyselfManual의 대화체 + 공감] + [Dan Koe의 직설 + 구체성] = BADA 톤
```

**AS-IS (현재 BADA):**
> "Your amygdala, your brain's alarm system, is highly tuned. This means you pick up on subtle changes others miss."

**TO-BE (Dan Koe + MyselfManual):**
> "Threat score 3/3 — 당신의 경보 시스템은 최대 가동 중입니다.
>
> 구체적 신호: 대화 전에 리허설을 합니다. 방에 들어가면 무의식적으로 스캔합니다. 남들이 못 느끼는 톤 변화를 캐치합니다.
>
> 이건 불안이 아닙니다. 과잉경계입니다. 당신의 편도체가 24시간 보안 점검을 돌리고 있어요. 언젠가 그게 당신을 지켜줬기 때문입니다. 문제는 지금도 그러고 있다는 것 — 에너지의 40%가 허위 경보에 소모됩니다.
>
> 29세인 당신에게 필요한 것: 경보 시스템을 끄는 게 아니라, 오경보를 걸러내는 필터를 설치하는 것입니다."

---

## Page-by-Page 변경 요약

### Page 1: Identity
- `sub_headline` → behavioral_tagline (행동 패턴 한 문장)
- `efficiency_snapshot` → Level 선언 (BADA Level 1-5 + AlignmentType)
- NEW: `one_line_diagnosis` — 행동 패턴 한 줄 진단

### Page 2: Hardware (Natural Blueprint)
- `nature_description` → 은유 1문장 + 행동 증거 3문장
- `shadow_description` → named anti-pattern + 메커니즘
- `core_insights` → behavioral markers (구체적 행동 + 왜)

### Page 3: Operating System
- axis descriptions → 점수 선언 + 구체적 행동 3개 + 메커니즘 + 비용
- `os_summary` → 시스템 간 cascade 관계 명시
- NEW: 연령 기반 조언 1문장 추가

### Page 4: Friction Map
- friction titles → 진단형 제목 ("At Work" → "The 9-to-5 Will Crush You")
- friction descriptions → 패턴 선언형 + 에너지 비용
- `quick_tip` → 구체적 DO/DON'T + 월요일 테스트

### Page 5: Action Protocol
- `transformation_goal` → Level 전환 경로 + 연령 맥락
- rituals → named protocols + anti_pattern 필드
- `environment_boost` → 오행 부족 → 구체적 처방 (색상/활동/환경)
- `closing_message` → direct, honest, 7일 실험 제안

---

## 구현 우선순위

### Phase 1: Prompt 수정 (80% of impact)
- `lib/gemini_client.ts` — 5개 페이지 prompt 전면 수정
- 새 출력 필드 없이 기존 필드 내용만 변경
- 예상 분량: ~3,000자 → ~6,000자

### Phase 2: 프론트 수정 (3건)
1. Element Radar Chart — ProtocolSection + Results
2. Ritual `anti_pattern` 필드 렌더링 — ProtocolSection
3. `one_line_diagnosis` 렌더링 — IdentitySection

### Phase 3: 데이터 확장 (선택)
- 연령 계산 → prompt에 나이 전달
- 대운/세운 — 추후 고려 (현재 미구현)
- Human Design — 추후 고려 (데이터 수집 필요)

---

## 검증 체크리스트

### Dan Koe 요소
- [ ] Named pattern 최소 3개
- [ ] Level 선언 있음
- [ ] 행동 증거 각 진단당 2개 이상
- [ ] Cascade 관계 1개 이상
- [ ] 비용 명시 2개 이상
- [ ] 구체적 숫자 5개 이상
- [ ] Monday test 통과

### MyselfManual 요소
- [ ] 연령 언급 있음
- [ ] 구체적 상황 예시 3개 이상
- [ ] 양면 동시 제시 1개 이상
- [ ] 감정/몸 신호 언급 1개 이상
- [ ] 대화체 톤 (2인칭)

### BADA 고유
- [ ] OS Type 데이터 활용됨
- [ ] 오행 데이터 행동 연결됨
- [ ] Operating Level 선언됨

---

## 분량 목표

| 섹션 | 현재 | 목표 | 증가율 |
|------|------|------|--------|
| Page 1 | ~400자 | ~600자 | 1.5x |
| Page 2 | ~600자 | ~1,200자 | 2x |
| Page 3 | ~800자 | ~1,200자 | 1.5x |
| Page 4 | ~800자 | ~1,500자 | 1.9x |
| Page 5 | ~400자 | ~1,500자 | 3.8x |
| **Total** | ~3,000자 | ~6,000자 | 2x |

**$1.9 가격대에서 6,000자 = 합리적인 가치 제공**
- MyselfManual(3만원, 25,000자)의 1/4 분량
- 가격 대비 분량 밀도는 BADA가 더 높음
- 단, 분량보다 "내 얘기 같다"는 느낌이 더 중요

---

## 사주 용어 plain language 규칙

| 사주 용어 | ❌ 쓰지 않는다 | ✅ 이렇게 쓴다 |
|----------|-------------|-------------|
| 오오자형 | "오오자형이 있어서" | "Your chart has 5 of the same branch — extreme concentration" |
| 비견 3개, 극신강 | "비견이 3개로 극신강" | "3 out of 8 elements are your core — extremely strong self-identity" |
| 인성 과다 | "인성이 과다해서" | "Your chart over-indexes on thinking energy — too much analysis" |
| 관성 없음 | "관성이 0" | "Zero structure energy in your chart — no internal governor" |
| 재성 약 | "재성이 약해서" | "Wealth-holding energy is weak — money comes but doesn't stay" |
| 식상 강 | "식상이 강해서" | "Expression energy is dominant — ideas overflow but finish rate is low" |

**원칙: 모든 사주 데이터는 element 이름(Wood, Fire, Earth, Metal, Water) + 숫자 + 행동 번역으로만 표현.**

1. 현재 Survey 구조 (8문항 → 3축 → 8타입)                                                                       
                                                                                                                  
  Q1-Q3: Threat Response    → ThreatScore (0-3) → ThreatClarity (0 or 1)                                          
  Q4-Q5: Environment        → EnvironmentScore (0-2) → EnvironmentStable (0 or 1)                                 
  Q6-Q8: Agency Orientation → AgencyScore (0-3) → AgencyActive (0 or 1)                                           
                                                                                                                  
                      ↓ 조합                                                                                      
                                                                                                                  
           T(0/1) - E(0/1) - A(0/1) = 8가지 타입                                                                  
                                                                                                                  
  "T1-E0-A1": "State Architect"                                                                                   
  "T1-E0-A0": "Silent Sentinel"                                                                                   
  "T1-E1-A1": "Master Builder"                                                                                    
  "T1-E1-A0": "Safe Strategist"                                                                                   
  "T0-E0-A1": "Fire Converter"                                                                                    
  "T0-E0-A0": "Emotional Drifter"                                                                                 
  "T0-E1-A1": "Conscious Maintainer"                                                                              
  "T0-E1-A0": "Passive Floater"                                                                                   
                                                                                                                  
  ---                                                                                                             
  2. Survey = "Self-Awareness" vs HD = "Design" (좋은 아이디어!)                                                  
                                                                                                                  
  ┌─────────────────────────────────────────────────────────────────┐                                             
  │  Human Design (태어날 때 결정됨)                                  │                                           
  │  "당신은 이렇게 설계되었다"                                        │                                          
  │                                                                  │                                            
  │  예: Emotional Authority                                         │                                            
  │  → 설계상 감정 파도 타고 결정해야 함                               │                                          
  └─────────────────────────────────────────────────────────────────┘                                             
                                vs                                                                                
  ┌─────────────────────────────────────────────────────────────────┐                                             
  │  Survey (지금 내가 인식하는 나)                                    │                                          
  │  "나는 이렇게 행동한다고 생각한다"                                  │                                         
  │                                                                  │                                            
  │  예: Q1 = "A" (위기에서 차분하고 명확해진다)                       │                                          
  │  → 스스로는 즉각 결정한다고 인식                                   │                                          
  └─────────────────────────────────────────────────────────────────┘                                             
                                ↓                                                                                 
  ┌─────────────────────────────────────────────────────────────────┐                                             
  │  GAP = 인사이트                                                  │                                            
  │                                                                  │                                            
  │  "당신은 스스로 빠르게 결정한다고 생각하지만,                       │                                         
  │   설계상으로는 감정의 파도를 기다려야 합니다.                       │                                         
  │   이 GAP이 당신의 후회와 좌절감의 원인일 수 있습니다."              │                                         
  └─────────────────────────────────────────────────────────────────┘                                             
                                                                                                                  
  이게 진짜 personalization이야!      