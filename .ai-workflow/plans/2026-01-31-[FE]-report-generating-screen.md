# 리포트 생성 로딩 화면 기획 + 구현 계획

**Date:** 2026-01-31
**Agent:** Claude

---

## 📌 문제

Survey 제출 후 Gemini AI가 리포트를 생성하는 동안 (10~30초) 사용자에게 아무런 피드백이 없다.
사용자는 "눌렀는데 멈췄나?" → 뒤로가기 → 재제출 같은 이탈 패턴을 보일 수 있다.

---

## 🎯 목표

제출 후 ~ 응답 수신까지의 대기 시간을 **"리포트가 만들어지고 있다"**는 경험으로 전환한다.

---

## 🎨 UX 기획

### 전체 플로우

```
Survey 마지막 단계 → Submit 클릭
    │
    ▼
┌──────────────────────────────────┐
│  Generating Screen (풀스크린)     │
│                                  │
│  단계별 메시지가 순서대로 등장:    │
│                                  │
│  ✓ Reading your birth chart...   │
│  ✓ Calculating four pillars...   │
│  → Generating your blueprint...  │
│    Finalizing report...          │
│                                  │
│  + 프로그레스 바 (시뮬레이션)     │
│  + 하단에 짧은 인사이트 문구      │
└──────────────────────────────────┘
    │
    ▼ (API 응답 도착)
    │
페이드아웃 → Results 또는 Wait 페이지로 이동
```

### 디자인 컨셉

- 배경: Survey 마지막 단계 색상 유지 (Deep Navy `#182339`)
- 흰 텍스트, 미니멀
- 브랜드 톤: 차분하고 신뢰감 있는 분위기

### 단계별 메시지 (Simulated Progress)

서버의 실제 진행률을 모르므로, **타이머 기반 시뮬레이션**으로 단계를 보여준다.

| 시간 | 메시지 | 설명 |
|------|--------|------|
| 0초 | Reading your birth chart... | 사주 분석 시작 |
| 3초 | Calculating four pillars... | 사주 계산 |
| 6초 | Analyzing your operating system... | 설문 분석 |
| 10초 | Generating your blueprint... | AI 리포트 생성 |
| 18초 | Finalizing your report... | 마무리 |

- 각 단계 진입 시 이전 단계에 체크(✓) 표시
- 현재 단계에 스피너 또는 펄스 애니메이션
- 아직 안 온 단계는 흐리게

### 프로그레스 바

- 0~90%: 타이머 기반으로 천천히 채워짐 (25초 동안)
- 90~100%: API 응답이 오면 빠르게 100%로 완성
- API가 일찍 오면 바가 빠르게 100%로 점프
- API가 늦으면 90%에서 멈추고 천천히 미세하게 증가 (체감상 안 멈춘 느낌)

### 하단 인사이트 문구 (로테이션)

대기 중 흥미를 유지하기 위해 5초마다 바뀌는 짧은 문구 (사주 용어 없이, 기대감 중심):

```
"No two blueprints are alike — yours is being crafted now."
"We're looking at how your natural wiring meets your current reality."
"Your report maps both your strengths and your blind spots."
"Over 480 unique archetype combinations exist. Finding yours."
"Almost there — preparing your personalized action guide."
```

### 에러 처리

- 60초 초과 시: "Taking longer than expected... Please wait." 메시지
- API 에러 시: 에러 토스트 + Survey로 돌아가기 버튼

---

## 📁 변경 예정 파일

- [ ] `client/src/components/GeneratingScreen.tsx` — 신규 생성
- [ ] `client/src/pages/Survey.tsx` — submit 후 GeneratingScreen 표시

---

## 🔧 구현 내용

### 1. GeneratingScreen 컴포넌트 (신규)

```
Props:
  isVisible: boolean      — 표시 여부
  onComplete: () => void  — API 응답 도착 후 애니메이션 끝나면 호출
```

- framer-motion으로 진입/퇴장 애니메이션
- 내부 상태: currentStep (0~4), progress (0~100)
- useEffect 타이머로 단계 자동 진행
- progress는 실제 API 응답과 동기화

### 2. Survey.tsx 수정

```
변경 전:
  setIsSubmitting(true)
  → await fetch(...)
  → setLocation(...)

변경 후:
  setIsSubmitting(true)  → GeneratingScreen 표시
  → await fetch(...)
  → GeneratingScreen에 완료 신호
  → 짧은 완료 애니메이션 후 setLocation(...)
```

핵심: `isSubmitting` 상태일 때 GeneratingScreen을 풀스크린으로 렌더링.
API 응답이 오면 `isComplete` 상태로 전환 → 100% 도달 애니메이션 → 페이지 이동.

---

## ⚠️ 고려사항

### Vercel 타임아웃 대응

- Free: 10초 → 거의 확실히 타임아웃 (Pro 필수)
- Pro: 60초 → 대부분 성공하지만 간혹 실패 가능
- 타임아웃 시 사용자에게 "다시 시도" 옵션 제공

### 나중에 고려: 비동기 생성 (v2)

현재는 동기식(API 응답 대기)이지만, 규모가 커지면:
1. Submit → 즉시 reportId 반환 + status: "generating"
2. 서버 백그라운드에서 리포트 생성
3. 클라이언트가 폴링으로 완료 확인
→ 이건 지금 안 하고, 타임아웃이 실제로 문제될 때 전환

---

## 🧪 테스트 계획

- [ ] 정상 케이스: 제출 → 로딩 화면 → 단계 진행 → 결과 페이지
- [ ] 빠른 응답 (5초): 단계가 빠르게 넘어가고 바가 100%로 점프
- [ ] 느린 응답 (30초+): 바가 90%에서 천천히 진행, "Taking longer" 미표시
- [ ] 에러 케이스: 에러 메시지 + Survey 복귀
- [ ] 모바일 반응형: 풀스크린에서 텍스트/애니메이션 정상 표시

---

## ✋ Human Review Required

**승인 상태:** [ ] 대기 중 / [ ] 승인됨 / [ ] 수정 필요

**승인자 의견:**
```
```
