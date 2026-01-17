# Product Backlog

**목적:** 향후 구현할 기능 아이디어 관리
**평가 프레임워크:** RICE Score (정성적)

---

## RICE 평가 기준

| 항목 | 설명 | 점수 |
|------|------|------|
| **R**each | 얼마나 많은 유저에게 영향? | Low / Medium / High |
| **I**mpact | 유저당 임팩트 크기? | Minimal(0.25) / Low(0.5) / Medium(1) / High(2) / Massive(3) |
| **C**onfidence | 예측 확신도? | Low(50%) / Medium(80%) / High(100%) |
| **E**ffort | 구현 노력 (person-weeks) | 0.5 / 1 / 2 / 4+ |

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

---

## Backlog 파일 구조

```
backlog/
├── README.md              # 이 파일
├── 001-email-reminder.md  # 개별 feature
├── 002-xxx.md
└── ...
```

---

## Quick View (우선순위)

| ID | Feature | RICE | Status |
|----|---------|------|--------|
| 001 | 만료 후 이메일 리마인더 | **4.8** | Draft |

### RICE 계산 예시
```
001: (High=3 × Impact=1 × Confidence=0.8) / Effort=0.5 = 4.8
```

