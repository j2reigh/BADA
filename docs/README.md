# 📚 BADA 프로젝트 문서

BADA (Operating Pattern Assessment Platform) 프로젝트의 모든 문서를 한곳에서 찾을 수 있습니다.

---

## 🚀 개발자 가이드

### 시작하기
- **[설정 가이드](SETUP_GUIDE.md)** - 개발 환경 구성 (예정)
- **[아키텍처 문서](ARCHITECTURE.md)** - 시스템 구조 이해 (예정)
- **[API 레퍼런스](API_REFERENCE.md)** - API 엔드포인트 및 스키마 (예정)

### 배포 및 운영
- **[배포 가이드](DEPLOYMENT.md)** - 프로덕션 배포 방법 (예정)
- **[변경 이력](CHANGELOG.md)** - 버전별 변경사항 (예정)

---

## ⚙️ 설정 및 통합

### 외부 서비스 연동
- **[Gumroad 설정](../config/GUMROAD_SETUP.md)** - 결제 시스템 연동
- **[결제 시스템](../config/PAYMENT_SETUP.md)** - 중복 제출 방지 및 결제 로직
- **[다국어 전략](../config/I18N_STRATEGY.md)** - 국제화 구현 방법

---

## 🤖 AI 워크플로우

AI와의 협업을 위한 문서들은 별도로 관리됩니다:

- **[AI 워크플로우 가이드](../.ai-workflow/README.md)** - AI 협업 전체 가이드
- **[Claude 시작 가이드](../.ai-workflow/START_CLAUDE.md)** - Claude 작업 시작점
- **[프로젝트 회고](../.ai-workflow/retrospective.md)** - 세션별 작업 기록
- **[트러블슈팅](../.ai-workflow/TROUBLESHOOTING.md)** - 문제 해결 기록

---

## 📄 문서 작성 규칙

### 새 문서 추가 시
1. **위치 결정**: 
   - 개발/사용자 가이드 → `docs/`
   - 외부 서비스 설정 → `config/`
   - AI 관련 → `.ai-workflow/`

2. **네이밍 규칙**: `[PURPOSE]_[CATEGORY].md`
   - `SETUP_GUIDE.md`, `API_REFERENCE.md` 등

3. **메타데이터 추가**:
   ```markdown
   ---
   type: [guide|reference|strategy|setup]
   category: [frontend|backend|deployment|integration]
   last_updated: YYYY-MM-DD
   status: [current|deprecated|draft]
   ---
   ```

4. **이 인덱스 업데이트**: 새 문서를 추가하면 이 파일도 업데이트

---

## 🔍 빠른 참조

### 자주 찾는 정보
- 개발 환경 설정: `docs/SETUP_GUIDE.md` (예정)
- API 사용법: `docs/API_REFERENCE.md` (예정)
- 결제 연동: `config/GUMROAD_SETUP.md`
- 문제 해결: `.ai-workflow/TROUBLESHOOTING.md`

### 프로젝트 상태
- 현재 스프린트: `.ai-workflow/retrospectives/CURRENT_SPRINT.md`
- 최근 변경사항: `docs/CHANGELOG.md` (예정)

---

**문서 관리 전략**: [MD_FILE_MANAGEMENT_STRATEGY.md](MD_FILE_MANAGEMENT_STRATEGY.md)