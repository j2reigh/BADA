# Sprint Retrospective

> 각 작업 세션 종료 시 Claude와 Gemini가 각자의 관점에서 회고를 작성합니다.
> 이 문서는 지속적으로 업데이트되며, 스프린트 종료 시 아카이빙됩니다.

---

## 📅 Sprint Period
**Start:** 2026-01-14
**End:** (진행 중)

---

## 🔄 최근 회고 (최신순)

### 2026-01-31 - Gumroad 결제 연결 + 리포트 생성 로딩 화면 + 워크플로우 간소화
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **근본 원인 추적:** "Unlock 버튼이 안 된다" 신고에서 LockedBlurOverlay → onUnlock 미전달 → fallback #pricing 미존재까지 정확하게 역추적
- **기존 코드 활용:** Gumroad 연동이 Results.backup.tsx에 이미 있었음을 확인하고, 새로 만들지 않고 URL만 연결
- **기획→구현 원스톱:** 로딩 화면 기획(UX/메시지/프로그레스 로직)부터 컴포넌트 구현까지 한 세션에 완료
- **즉각적 피드백 반영:** "사주 용어가 어렵다" → 인사이트 문구 즉시 교체, "95%에서 멈춤" → 점근적 프로그레스로 즉시 수정

#### 🤔 Problem (문제점)
- **프로그레스 시뮬레이션 첫 설계 미흡:** 25초간 90%→95% 하드스톱이라 API 느릴 때 체감이 나빴음. 점근 곡선으로 바로 교체
- **Vercel 배포 준비가 아직 안 됨:** Express 모놀리스를 Serverless로 분리하는 리팩토링이 필요 (다음 세션)

#### 💡 Try (시도할 것)
- **프로그레스 바는 항상 점근적으로:** 하드스톱 지점 없이 목표값에 수렴하는 패턴을 기본으로 사용
- **Vercel Serverless 어댑터 구현:** server/app.ts 분리 + api/index.ts 래퍼 작성

#### 📦 산출물
- `client/src/components/GeneratingScreen.tsx`: 신규 (5단계 시뮬레이션 + 점근적 프로그레스 + 인사이트 로테이션)
- `client/src/pages/Survey.tsx`: GeneratingScreen 연동 (isApiComplete + pendingNavRef 패턴)
- `.ai-workflow/PROMPT_CLAUDE.md`, `START_CLAUDE.md`: Claude 역할을 기획+구현+QA 전담으로 변경, Gemini 역할 분리 삭제
- `.ai-workflow/plans/2026-01-31-deployment-environment-strategy.md`: Vercel 배포 + 환경 관리 전략
- `.ai-workflow/plans/2026-01-31-report-generating-screen.md`: 로딩 화면 기획서

---

### 2026-01-31 - FAQ 페이지 신규 구현
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **플랜 → 구현 직결:** 플랜 모드에서 콘텐츠(11개 Q&A), 디자인 스펙, 파일 목록까지 확정한 후 구현하여 재작업 없이 한 번에 완료
- **기존 패턴 재사용:** Landing.tsx의 배경 그라디언트, 노이즈 텍스처, Footer 언어 토글 패턴을 그대로 가져와 일관성 유지
- **3개 언어 동시 작업:** EN/KO/ID 번역을 i18n 키 추가 시점에 함께 완료하여 별도 번역 패스 불필요

#### 🤔 Problem (문제점)
- **Landing Footer 시그니처 변경:** FAQ 링크 추가를 위해 Footer에 `t` prop을 추가해야 했음 — 기존 Footer가 번역 함수를 받지 않는 설계였기 때문. 컴포넌트 시그니처 변경이 필요했지만 Landing 내부 컴포넌트이므로 영향 범위가 제한적

#### 💡 Try (시도할 것)
- **공통 컴포넌트 추출:** Header/Footer가 Landing과 FAQ에서 중복됨 — 다음 페이지 추가 시 공통 Layout 컴포넌트로 추출 고려
- **FAQ 콘텐츠 CMS화:** 현재 i18n 키에 하드코딩된 콘텐츠를 향후 CMS나 마크다운 파일로 분리하면 비개발자도 수정 가능

#### 📦 산출물
- `client/src/pages/FAQ.tsx`: FAQ 페이지 (11개 Q&A + Contact + CTA)
- `client/src/App.tsx`: `/faq` 라우트 등록
- `client/src/pages/Landing.tsx`: 헤더 nav + 푸터에 FAQ 링크 추가
- `client/src/lib/simple-i18n.ts`: EN/KO/ID 각 ~30개 FAQ 번역 키 추가

---

### 2026-01-31 - i18n 품질 개선 + 언락 모달 + 재사용 코드
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **근본 원인 추적:** 한국어 리포트에서 영어 제목이 섞이는 문제를 UI → Gemini prompt → archetype override 로직까지 역추적하여 정확한 원인 파악 (영어 하드코딩 덮어쓰기)
- **범용 해결책:** 한국어만이 아닌 모든 비영어 언어에 적용되는 anti-translationese 프롬프트로 설계하여 i18n 전체 품질 향상
- **기존 인프라 활용:** 코드 리딤 백엔드가 이미 완성되어 있음을 확인하고, 프론트엔드 UI만 추가하여 빠르게 기능 복원

#### 🤔 Problem (문제점)
- **Gumroad overlay 호환성:** `gumroad.js`가 React 동적 DOM을 감지하지 못하는 문제 — overlay 시도 후 `window.open` 새 탭 방식으로 전환 (시간 소요)
- **drizzle-kit generate 첫 마이그레이션:** 기존 DB에 이미 테이블이 있는 상태에서 `0000` full-schema 마이그레이션이 생성됨 — `drizzle-kit push`로 우회

#### 💡 Try (시도할 것)
- **외부 스크립트 호환성 사전 조사:** 서드파티 JS(Gumroad 등)가 SPA 동적 렌더링과 호환되는지 먼저 확인 후 도입
- **Gumroad 결제 후 자동 unlock:** 현재 Gumroad 결제 완료 후 수동으로 코드를 입력해야 함 — webhook 연동으로 자동화 필요

#### 📦 산출물
- `lib/gemini_client.ts`: anti-translationese 프롬프트 + 비영어 archetype 참조 방식
- `config/I18N_STRATEGY.md`: Phase 2 진단 및 구현 스펙 업데이트
- `client/src/components/report-v2/LockedBlurOverlay.tsx`: Purchase + Code 이중 경로 모달
- `client/src/components/report-v2/{Blueprint,Diagnostics,Glitch,Protocol}Section.tsx`: reportId prop 전달
- `shared/schema.ts` + `server/storage.ts`: `is_reusable` 컬럼 추가, 무한 사용 코드 지원
- DB: `BADA-DEV` 테스트 코드 등록 (무한 재사용)

---

### 2026-01-30 - PDF Export 전면 재작성
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **기획 → 구현 직결:** 플랜 모드에서 컬러 팔레트, 타이포그래피 스케일, 페이지 구조를 사전 정의하고 그대로 구현하여 재작업 없이 완료
- **Helper 함수 설계:** `writeText`, `writeParagraph`, `ensureSpace`, `measureTextHeight` 등 재사용 가능한 함수로 구성하여 300줄 → 460줄이지만 가독성과 유지보수성 대폭 향상
- **Atomic block 패턴:** friction area, axis, ritual 등을 pre-measure 후 ensureSpace로 감싸서 페이지 중간 잘림 방지

#### 🤔 Problem (문제점)
- **브라우저 전용 API:** `doc.save()`가 Node에서 동작하지 않아 검증용 스크립트를 별도로 작성 (`doc.output('arraybuffer')` + `fs.writeFileSync` 사용)
- **jsPDF 라인 높이 계산:** `setLineHeightFactor(1.6)` 설정과 수동 `lh()` 계산이 정확히 일치하는지 확인이 필요했음

#### 💡 Try (시도할 것)
- **PDF 검증 자동화:** 향후 test script를 CI에 포함시켜 PDF 페이지 수, 텍스트 존재 여부 자동 검증 고려
- **한글 폰트 지원:** 현재 helvetica/times만 사용 — 한글 리포트가 필요해지면 커스텀 폰트 임베딩 필요

#### 📦 산출물
- `client/src/lib/pdfExport.ts`: 전면 재작성 (브랜드 컬러 6색, 타이포 11단계, Cover + 5 Parts, 페이지 번호, atomic block pagination)
- `scripts/test_pdf.ts`: Node 환경 PDF 생성 검증 스크립트
- `test_BADA_Report.pdf`: 검증용 출력 (8페이지)

---

### 2026-01-30 - Location Search 안정화 (Photon 제거)
**Agent:** Gemini

#### 👍 Keep (계속 할 것)
- **과감한 결단:** 불안정한 외부 API(Photon)를 제거하고 "국가 선택 -> Timezone 자동화"라는 더 안정적인 대안으로 신속하게 선회.
- **사용자 피드백 즉시 반영:** "Birth City 입력 불필요" 및 "기본 언어 설정 오류" 피드백을 받고 `Survey.tsx`를 실시간으로 수정하여 반영.
- **안정성 확보:** `birthCity` 필드를 백엔드 스키마 변경 없이 "국가명 자동 주입"으로 처리하여 데이터 무결성 유지.

#### 🤔 Problem (문제점)
- **초기 기획의 복잡성:** 처음에는 검색 기능을 살리려고 했으나, Photon API의 신뢰성 문제로 시간을 소모함. (처음부터 수동 입력을 고려했으면 좋았을 것)
- **기본값 로직 누락:** UI 언어와 리포트 언어의 기본값 동기화를 초기에 놓침.

#### 💡 Try (시도할 것)
- **외부 의존성 최소화:** 핵심 기능(가입, 서베이)에는 SLA가 보장되지 않는 외부 API 사용을 지양.
- **타입 체크 생활화:** `npm run check`를 통해 리팩토링 후 사이드 이펙트를 확실하게 잡고 넘어가는 습관 유지.

#### 📦 산출물
- `client/src/pages/Survey.tsx`: 수동 입력 UI (City Input 제거, Country/Timezone Dropdown)
- `server/routes.ts`: `/api/cities/search` 엔드포인트 제거 및 클린업
- `client/src/lib/simple-i18n.ts`: UI 언어 기반 Default Language 선택 로직 개선

---

### 2026-01-28 - Survey i18n 완료 & Landing Q1 동기화
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **일관성 유지:** Landing Q1과 Survey Q1이 불일치하는 문제를 발견하고 즉시 수정 (2개 → 4개 옵션)
- **구조적 번역:** scoring.ts의 QUESTIONS 구조를 그대로 유지하면서 번역만 교체하는 방식으로 안정적 구현
- **3개 언어 완성:** EN/KO/ID 모두 Q1-Q8 × A/B/C/D 형식으로 통일

#### 🤔 Problem (문제점)
- **이전 세션 불일치:** 이전에 Landing용으로 별도 Q1을 만들어놓은 것이 혼란 유발 (landing.q1 vs survey.q1)
- **컨텍스트 복구 비용:** 세션 요약에서 재구성하는 데 시간 소요

#### 💡 Try (시도할 것)
- **단일 소스 원칙:** 같은 데이터는 하나의 소스에서만 관리 (survey.q* 키만 사용)
- **번역 키 네이밍 컨벤션:** `{페이지}.{컴포넌트}.{필드}` 형식 일관 유지

#### 📦 산출물
- `client/src/lib/simple-i18n.ts`: ID Survey Q1-Q8 추가, 3개 언어 완전 통일
- `client/src/pages/Survey.tsx`: 번역 함수 사용으로 변경
- `client/src/components/landing/EmbeddedDiagnosticCard.tsx`: survey.q1.* 키 사용, 4개 옵션으로 수정

---

### 2026-01-28 - 리포트 페이지 고도화 (BADA Report V2)
**Agent:** Gemini

#### 👍 Keep (계속 할 것)
- **사용자 의도 파악:** "깨졌다"는 피드백에서 PDF 인코딩 및 레이아웃 문제를 신속하게 진단하고 해결.
- **적극적 제안:** 사용자의 목차 아이디어를 "Floating TOC & Scroll Spy"로 구체화하여 제안 및 구현.
- **디테일 완성도:** PDF 마진, 커서 색상, 문구 짤림, 이모지 깨짐 등 완성도를 저해하는 요소들을 꼼꼼하게 수정.

#### 🤔 Problem (문제점)
- **PDF 라이브러리 한계:** `jsPDF`의 기본 폰트가 이모지를 지원하지 않아 초기에 깨짐 현상 발생 (텍스트 라벨링 변경으로 해결).
- **컴포넌트 주입 오류:** `Results.tsx` 수정 시 `TableOfContents` 컴포넌트 주입 위치를 잘못 파악하여 한 번 실패함.

#### 💡 Try (시도할 것)
- **PDF 생성 고도화:** 레이아웃이 복잡해질 경우 `html2canvas`나 서버 사이드 PDF 생성 방식 고려.
- **코드 수정 신중함:** 대규모 파일 수정 시 `view_file`로 최신 컨텍스트를 확실히 파악 후 작업.

#### 📦 산출물
- `client/src/lib/pdfExport.ts`: PDF 레이아웃 전면 수정 (표지 분리, 통합 레이아웃, 텍스트 래핑)
- `client/src/components/report-v2/TableOfContents.tsx`: 신규 플로팅 목차 컴포넌트
- `client/src/pages/Results.tsx`: 목차 기능 통합 및 여백 최적화

---

### 2026-01-16 - Unlock Code Feature 구현
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **기획 → 구현 체계적 흐름:** 기획서 작성 → 유저 결정사항 질문 → 구현 순서로 진행하여 불필요한 재작업 방지
- **TodoWrite 적극 활용:** 8개 단계를 todo로 관리하여 진행 상황을 명확하게 추적
- **풀스택 일관성:** Schema → Storage → Routes → Frontend 순서로 레이어별 구현하여 누락 없이 완료
- **실용적 코드 생성:** 긍정적 단어(SHINE, BLOOM, BRAVE 등) + 숫자 조합으로 기억하기 쉬운 코드 형식 설계

#### 🤔 Problem (문제점)
- **환경변수 불일치:** `SUPABASE_DATABASE_URL` vs `DATABASE_URL` 차이로 db:push 첫 시도 실패
- **기존 타입 에러:** 이번 작업과 무관한 routes.ts:593 타입 에러가 존재 (db null 체크)

#### 💡 Try (시도할 것)
- **환경변수 문서화:** drizzle.config.ts가 기대하는 환경변수명을 README나 .env.example에 명시
- **기존 타입 에러 해결:** 다음 세션에서 routes.ts의 db null 체크 에러 수정

#### 📦 산출물
- `shared/schema.ts`: validCodes 테이블 추가
- `server/storage.ts`: getValidCode, redeemCode, createValidCodes 함수
- `server/routes.ts`: /api/codes/redeem 엔드포인트
- `scripts/generate_codes.ts`: 코드 생성 스크립트
- `client/src/pages/Results.tsx`: 코드 입력 UI
- `.ai-workflow/plans/2026-01-16-unlock-code-feature.md`: 기획서
- 50개 베타 테스터용 코드 생성 완료

---

### 2026-01-15 14:00 - 랜딩페이지 콘텐츠 및 인터랙션 업데이트 (안정화)
**Agent:** Gemini

#### 👍 Keep (계속 할 것)
- **사용자 피드백 중심:** 복잡한 UI 구현 실패 시, 과감히 롤백하고 사용자 피드백(안정화)을 최우선으로 반영하여 최종 목표 달성.
- **문제 해결의 끈기:** 이전부터 존재하던 TypeScript 에러(MemStorage) 및 pre-commit 훅 문제를 끈기 있게 추적하고 해결하여 빌드 안정성 확보.
- **명확한 커뮤니케이션:** 복잡한 상황(Rollback, Git 사용)에서 사용자에게 상황을 명확히 설명하고 동의를 구하는 과정.

#### 🤔 Problem (문제점)
- **복잡한 UI 구현의 한계:** Framer Motion을 이용한 복잡한 스태킹 인터랙션 구현 시, `useTransform` 로직 설계의 난이도가 높고 디버깅에 많은 시간이 소요됨. (AI 모델의 시각적 디버깅 한계).
- **예상치 못한 종속성:** UI 변경 과정에서 백엔드 `MemStorage`의 타입 에러(기존 문제)가 발견되어 작업 흐름이 지연됨.
- **Git Hook 이해 부족:** `pre-commit` 훅의 존재를 뒤늦게 파악하여 커밋에 지연 발생.

#### 💡 Try (시도할 것)
- **UI/UX 계획 시 구현 난이도 고려:** AI 모델의 시각적 피드백 및 정교한 애니메이션 구현 한계를 인지하고, 초기 기획 단계에서부터 구현 난이도를 면밀히 평가하여 현실적인 목표 설정.
- **작업 시작 전 코드베이스 전체 스캔:** 초기 단계에서 `npm run check` 외 `git status`, `git log` 등 전체적인 코드베이스 상태를 점검하여 숨겨진 문제를 조기에 파악.
- **`pre-commit` 훅 및 프로젝트 규칙 사전 파악:** 작업 시작 전 `README.md`나 `.githooks` 등 프로젝트의 빌드/커밋 규칙을 먼저 확인하여 예상치 못한 블로커 방지.

---

### 2026-01-14 21:15 - 프리뷰 환경 구성 & 오류 수정
**Agent:** Gemini

#### 👍 Keep (계속 할 것)
- **철저한 환경 진단:** 문제 해결 전 `lsof`, `env`, 로그 분석을 통해 근본 원인(포트 충돌, macOS 제약) 파악
- **유연한 대처:** 필수 환경변수(DB, API Key) 부재 시 개발이 중단되지 않도록 Mock Data & In-memory DB로 Fallback 구현

#### 🤔 Problem (문제점)
- **macOS 특이사항:** AirPlay가 5000번 포트를 점유하는 macOS 특성을 초기에 인지하지 못해 진단에 시간이 소요됨
- **재시도 반복:** 서버 재시작 및 로그 확인 과정이 여러 번 반복됨

#### 💡 Try (시도할 것)
- 프로젝트 시작 시 OS별 포트 점유 현황을 먼저 스캔하는 절차 도입
- `npm run check` 등 정적 분석 도구를 조기에 활용하여 빌드 에러 방지

---

### 2026-01-14 [현재 시각 + 20분] - 워크플로우 자동화 & 간편 시작 기능 추가
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- 사용자 피드백을 즉시 반영하여 워크플로우 개선
- 사용자 경험을 최우선으로 고려 (매번 긴 프롬프트 읽는 불편함 해소)
- 여러 옵션 제공 (간편 시작 / alias / 상세 가이드)

#### 🤔 Problem (문제점)
- 초기 구축 시 사용자가 매번 프롬프트를 읽어야 한다는 점을 미리 고려하지 못함
- 자동화 옵션을 처음부터 제공했으면 더 좋았을 것

#### 💡 Try (시도할 것)
- 다음 워크플로우 설계 시 자동화와 편의성을 처음부터 고려
- 사용자가 물어보기 전에 불편한 점을 미리 예측하고 해결책 제시

---

### 2026-01-14 [현재 시각 + 10분] - 능동적 승인 요청 & 역할 체크 시스템 추가
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- 사용자 요구사항을 정확히 이해하고 반영
- AI가 능동적으로 행동하도록 설계 (Human이 물어보지 않아도 AI가 먼저 요청)
- 역할 체크 시스템으로 잘못된 요청 방지

#### 🤔 Problem (문제점)
- 없음

#### 💡 Try (시도할 것)
- 실제 사용 시 AI들이 역할 체크를 잘 수행하는지 모니터링 필요

---

### 2026-01-14 [현재 시각] - AI Workflow 구조 초기 구축
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- 체계적인 폴더 구조 설계
- 템플릿 제공으로 일관성 확보
- 상세한 가이드 문서 작성

#### 🤔 Problem (문제점)
- 초기 구축 시 사용 편의성(자동화) 고려 부족

#### 💡 Try (시도할 것)
- 사용자 피드백을 받아 지속적으로 개선

---

<!-- 여기서부터 이전 회고 -->

---

## 📊 스프린트 통계

### Claude
- **완료한 작업:** 3건 (초기 구축, 개선, 자동화)
- **QA 통과율:** N/A (문서 작업만 수행)
- **평균 작업 시간:** ~10분/작업

### Gemini
- **완료한 작업:** 1건 (프리뷰 환경 정상화)
- **QA 통과율:** 100% (프리뷰 정상 작동 확인)
- **평균 작업 시간:** ~15분/작업

---

## 🎯 다음 스프린트 목표

- [ ] 서버 배포 파이프라인 구축
- [ ] 실제 데이터베이스 연결 및 마이그레이션

---

## 💬 Human Feedback

```
[사용자의 전체적인 피드백]
```