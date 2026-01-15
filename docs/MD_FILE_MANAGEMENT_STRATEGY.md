# 📄 BADA 프로젝트 MD 파일 관리 전략

**작성일:** 2026-01-15
**목적:** 체계적이고 일관된 문서 관리

---

## 🎯 핵심 원칙

1. **위치별 역할 분담**: 각 폴더는 명확한 목적을 가짐
2. **일관된 네이밍**: 날짜 형식과 파일명 규칙 통일
3. **중복 제거**: 비슷한 역할의 파일들 통합
4. **접근성**: 자주 참조하는 파일은 쉽게 찾을 수 있는 위치

---

## 📁 새로운 폴더 구조

```
BADA-Report/
├── README.md                           # 프로젝트 개요 (메인)
├── docs/                              # 📚 모든 문서화
│   ├── README.md                      # 문서화 인덱스
│   ├── SETUP_GUIDE.md                 # 환경 설정 가이드
│   ├── ARCHITECTURE.md                # 시스템 아키텍처
│   ├── API_REFERENCE.md               # API 문서
│   ├── DEPLOYMENT.md                  # 배포 가이드
│   └── CHANGELOG.md                   # 변경 이력
├── .ai-workflow/                      # 🤖 AI 워크플로우 (현재 구조 유지)
│   ├── retrospective.md               # 통합 회고 (모든 세션)
│   ├── TROUBLESHOOTING.md             # 통합 트러블슈팅
│   └── ... (기존 구조 유지)
└── config/                           # ⚙️ 설정 관련 문서
    ├── GUMROAD_SETUP.md
    ├── I18N_STRATEGY.md
    └── PAYMENT_SETUP.md
```

---

## 🔄 파일 재구성 계획

### Phase 1: 즉시 정리 (루트 정리)
```bash
# 루트에서 docs/config/로 이동
GUMROAD_SETUP.md       → config/GUMROAD_SETUP.md
I18N_STRATEGY.md       → config/I18N_STRATEGY.md  
PAYMENT_DUPLICATE_FIX.md → config/PAYMENT_SETUP.md (통합)
replit.md              → docs/DEPLOYMENT.md (통합)
```

### Phase 2: 문서 통합
- **PAYMENT_DUPLICATE_FIX.md** + 기존 결제 로직 → **config/PAYMENT_SETUP.md**
- **replit.md** → **docs/DEPLOYMENT.md**에 Replit 섹션으로 추가
- **client/requirements.md** → **docs/ARCHITECTURE.md**에 Frontend 섹션으로 통합

### Phase 3: AI 워크플로우 정리
- **TROUBLESHOOTING_2026-01-13.md** → **TROUBLESHOOTING.md** (날짜 제거, 지속적 업데이트)
- 모든 세션 회고를 **retrospective.md**에 통합 관리

---

## 📝 네이밍 컨벤션

### 파일명 규칙
```
기본 형식: [PURPOSE]_[CATEGORY].md
- PURPOSE: 명확한 역할 (SETUP, GUIDE, STRATEGY, REFERENCE)
- CATEGORY: 분야 (API, DEPLOY, PAYMENT, I18N)

예시:
✅ GOOD:
- SETUP_GUIDE.md
- API_REFERENCE.md  
- PAYMENT_SETUP.md
- I18N_STRATEGY.md

❌ BAD:
- gumroad-integration.md
- i18n_구현방법.md
- troubleshooting_2026-01-13.md
```

### 폴더별 목적
- **docs/**: 사용자/개발자를 위한 가이드
- **config/**: 서드파티 통합 설정
- **.ai-workflow/**: AI 협업 전용 (건드리지 않음)

---

## 🏷️ 문서 태깅 시스템

각 MD 파일 상단에 메타데이터 추가:
```markdown
---
type: [guide|reference|strategy|setup]
category: [frontend|backend|deployment|integration]
last_updated: YYYY-MM-DD
status: [current|deprecated|draft]
---
```

---

## 🔍 참조 우선순위

### 자주 참조하는 문서 (루트/docs/)
1. **README.md** - 프로젝트 첫 인상
2. **docs/SETUP_GUIDE.md** - 개발 환경 구성
3. **docs/ARCHITECTURE.md** - 시스템 이해
4. **docs/API_REFERENCE.md** - 개발 참조

### 설정 문서 (config/)
5. **config/GUMROAD_SETUP.md** - 결제 연동
6. **config/I18N_STRATEGY.md** - 다국어 전략

### AI 워크플로우 (.ai-workflow/)
7. **.ai-workflow/START_CLAUDE.md** - AI 작업 시작점
8. **.ai-workflow/retrospective.md** - 작업 기록

---

## 📈 유지보수 규칙

### 업데이트 주기
- **매 주요 기능 추가 시**: docs/ 업데이트
- **매 세션 종료 시**: .ai-workflow/ 회고 업데이트
- **매 배포 시**: CHANGELOG.md 업데이트

### 중복 방지 규칙
1. 새 MD 파일 생성 전 기존 파일 확인
2. 비슷한 내용은 섹션으로 추가, 새 파일 지양
3. 월 1회 중복 파일 정리

### 접근성 규칙
- 모든 문서는 **docs/README.md**에서 링크로 접근 가능
- 중요한 설정은 메인 README.md에서 바로 링크
- AI 워크플로우는 별도 관리 (간섭 X)

---

## ✅ 즉시 실행 체크리스트

- [ ] config/ 폴더 생성
- [ ] 루트 MD 파일들 해당 폴더로 이동
- [ ] docs/README.md 생성 (문서 인덱스)
- [ ] 메인 README.md 업데이트 (문서 링크)
- [ ] client/requirements.md → docs/ARCHITECTURE.md 통합
- [ ] PAYMENT_DUPLICATE_FIX.md 내용 정리 후 통합
- [ ] 불필요한 중복 파일 삭제
- [ ] Git 커밋: "Reorganize documentation structure"

---

## 🎯 기대 효과

1. **빠른 정보 접근**: 역할별 폴더로 원하는 문서 즉시 찾기
2. **중복 제거**: 파일 수 50% 감소, 유지보수 부담 줄임
3. **일관성**: 통일된 네이밍과 구조로 예측 가능한 위치
4. **확장성**: 새 문서 추가 시 명확한 위치 결정 가능

---

**다음 단계:** 이 전략에 따라 파일 재구성 실행