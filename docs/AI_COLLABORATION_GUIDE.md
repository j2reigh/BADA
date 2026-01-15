---
type: guide
category: ai-collaboration
last_updated: 2026-01-15
status: current
---

# 🤖 BADA AI 협업 가이드

AI와 함께 BADA 프로젝트를 개발할 때 따라야 할 문서 관리 규칙입니다.

---

## 🎯 핵심 원칙

### 1. 새 MD 파일 생성 금지
❌ **절대 하지 말 것:**
```bash
# 잘못된 예시들
새로운-기능-구현.md
troubleshooting-2026-01-XX.md  
client/새로운-요구사항.md
session-log-YYYYMMDD.md
```

✅ **대신 할 것:**
- 기존 문서에 섹션 추가
- 적절한 폴더의 기존 파일 업데이트
- `.ai-workflow/retrospective.md`에 회고 추가

### 2. 파일 생성 전 필수 체크
```bash
# 1. 현재 구조 확인
npm run check:docs

# 2. 기존 문서 검색
find docs/ config/ -name "*.md" | grep [키워드]

# 3. 적절한 기존 파일 찾기
docs/README.md  # 문서 인덱스 확인
```

---

## 📁 올바른 파일 위치 결정

### 의사결정 트리

```mermaid
graph TD
    A[새 내용 추가 필요] --> B{어떤 종류?}
    
    B -->|개발 가이드/설명| C[docs/ 폴더]
    B -->|외부 서비스 설정| D[config/ 폴더] 
    B -->|AI 작업 기록| E[.ai-workflow/ 폴더]
    
    C --> F{기존 파일 있음?}
    F -->|Yes| G[기존 파일에 섹션 추가]
    F -->|No| H[새 파일 생성 고려]
    
    D --> I{기존 설정 파일 있음?}
    I -->|Yes| J[기존 파일 업데이트]
    I -->|No| K[새 [SERVICE]_SETUP.md 생성]
    
    E --> L[retrospective.md에 추가]
```

### 구체적인 예시

| 추가하고 싶은 내용 | 올바른 위치 | 방법 |
|---|---|---|
| 새로운 API 엔드포인트 설명 | `docs/API_REFERENCE.md` | 기존 파일에 섹션 추가 (없으면 새로 생성) |
| Stripe 결제 연동 방법 | `config/STRIPE_SETUP.md` | 새 파일 생성 가능 |
| 버그 수정 과정 | `.ai-workflow/TROUBLESHOOTING.md` | 기존 파일에 새 섹션 추가 |
| 세션 회고 | `.ai-workflow/retrospective.md` | 기존 파일에 날짜별 섹션 추가 |
| 새 컴포넌트 설명 | `docs/ARCHITECTURE.md` | 프론트엔드 섹션에 추가 |

---

## 🔄 AI 작업 플로우

### 1. 작업 시작 시
```typescript
// AI가 해야 할 체크리스트
1. 현재 문서 구조 파악: npm run check:docs
2. 기존 관련 문서 검색
3. 적절한 위치 결정
4. 새 파일 생성하지 않고 기존 파일 업데이트
```

### 2. 문서 업데이트 시
```typescript
// 필수 포함 사항
1. 메타데이터 업데이트: last_updated 날짜
2. 목차/인덱스 업데이트 (해당되는 경우)
3. 관련 문서 링크 추가
4. 일관된 마크다운 스타일 유지
```

### 3. 작업 완료 시
```bash
# 마지막 체크
npm run check:docs  # MD 구조 검사
git add .
git commit -m "Update documentation: [specific change]"
```

---

## 🚫 금지된 패턴들

### 절대 생성하지 말 것

```bash
# ❌ 날짜가 포함된 파일들 (AI 워크플로우 외부)
TROUBLESHOOTING_2026-01-15.md
session-log-20260115.md
meeting-notes-YYYYMMDD.md

# ❌ 루트에 설정 파일들
STRIPE_SETUP.md
DISCORD_INTEGRATION.md
EMAIL_CONFIG.md

# ❌ client/, server/ 폴더에 MD 파일
client/component-guide.md
server/api-documentation.md

# ❌ 임시성 파일들
temp-notes.md
draft-feature-spec.md
quick-memo.md
```

### 대신 할 것

```bash
# ✅ 올바른 접근
.ai-workflow/retrospective.md         # 모든 세션 기록
config/STRIPE_SETUP.md               # 서비스 설정
docs/ARCHITECTURE.md                 # 시스템 설명
docs/API_REFERENCE.md               # API 문서
```

---

## 📝 문서 작성 표준

### 메타데이터 필수 포함
```yaml
---
type: [guide|reference|strategy|setup]
category: [frontend|backend|deployment|integration]
last_updated: YYYY-MM-DD
status: [current|deprecated|draft]
---
```

### 제목 규칙
```markdown
# 🔧 [Purpose] [Category]
예시:
- # 🔧 Stripe 결제 연동 가이드
- # 📚 API 레퍼런스
- # 🏗️ 시스템 아키텍처
```

### 섹션 구조
```markdown
## 🎯 개요
## 📋 주요 내용  
## 🔧 실습 가이드
## ⚠️ 주의사항
## 📚 관련 문서
```

---

## 🤖 AI별 특화 가이드

### Claude 작업 시
1. **기존 문서 먼저 읽기**: Read 도구로 관련 문서 확인
2. **구조 파악**: `npm run check:docs`로 현재 상태 확인
3. **점진적 업데이트**: 새 파일보다 기존 파일 확장 우선
4. **일관성 유지**: 기존 스타일과 톤 매치

### Gemini 기획 시
1. **전체적 관점**: docs/README.md에서 문서 구조 파악
2. **전략적 배치**: 새 기능이 어떤 문서에 포함되어야 할지 계획
3. **연관성 고려**: 관련 문서들 간의 연결 고리 설계

---

## 🔍 자가 점검 체크리스트

작업 완료 전 반드시 확인:

- [ ] `npm run check:docs` 통과하는가?
- [ ] 새 MD 파일을 불필요하게 생성하지 않았는가?
- [ ] 기존 문서의 업데이트를 우선 고려했는가?
- [ ] 메타데이터가 올바르게 포함되어 있는가?
- [ ] 관련 문서들과 적절히 링크되어 있는가?
- [ ] 문서 인덱스(`docs/README.md`)가 업데이트되었는가?

---

## 🚨 문제 발생 시 대응

### 구조 검사 실패 시
```bash
# 문제 확인
npm run check:docs

# 문제 파일 찾기
find . -name "*.md" -not -path "./node_modules/*" | sort

# 올바른 위치로 이동
mv "잘못된위치.md" "docs/올바른위치.md"
```

### Pre-commit Hook 실패 시
```bash
# 문제 수정 후 다시 커밋
npm run check:docs  # 문제 확인
# 문제 해결
git add .
git commit -m "Fix documentation structure"
```

---

## 📈 지속적 개선

### 월간 리뷰
- [ ] 문서 구조의 유효성 검토
- [ ] 사용되지 않는 문서 확인
- [ ] 업데이트가 필요한 문서 파악

### 신규 도구 추가 시
1. 기존 체크 스크립트 업데이트
2. 새로운 패턴 규칙 추가
3. 팀원들과 규칙 공유

---

## 📞 도움 요청

문서 구조에 대해 확실하지 않을 때:

1. **기존 패턴 확인**: 비슷한 문서들이 어디에 있는지 확인
2. **관리 전략 참조**: `docs/MD_FILE_MANAGEMENT_STRATEGY.md`
3. **자동 검사 실행**: `npm run check:docs`

---

**마지막 업데이트:** 2026-01-15