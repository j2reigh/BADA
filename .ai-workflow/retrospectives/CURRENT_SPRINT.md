# Sprint Retrospective

> 각 작업 세션 종료 시 Claude와 Gemini가 각자의 관점에서 회고를 작성합니다.
> 이 문서는 지속적으로 업데이트되며, 스프린트 종료 시 아카이빙됩니다.

---

## 📅 Sprint Period
**Start:** 2026-01-14
**End:** (진행 중)

---

## 🔄 최근 회고 (최신순)

### 2026-02-17 (C) - 확언형 슬러그 URL + UI/폰트/Gemini 수정 + 커밋 히스토리 정리
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **slug 설계 간결:** 확언 문구 + UUID 앞 4자리 조합으로 충돌 체크 불필요, nullable로 기존 데이터 호환, dual-resolve로 UUID/slug 모두 동작
- **DB 마이그레이션 선행:** 코드 배포 전에 Supabase에 `ALTER TABLE` 먼저 실행 — nullable 컬럼이라 무중단 추가 가능
- **커밋 히스토리 정리:** `git reset --soft main` + 선택적 staging으로 3개 논리적 커밋으로 재구성. 이전 세션에서 slug 변경이 TST 커밋에 섞여 들어간 문제를 깔끔하게 해결

#### 🤔 Problem (문제점)
- **이전 세션에서 slug 변경이 TST 커밋에 혼입:** routes.ts의 slug 관련 변경(resolveReport 등)이 `5392dcf` TST 커밋에 포함되어 있었음. 작업 단위별 커밋을 더 신경 써야 함
- **로컬 DB 접속 불가:** ECONNREFUSED로 Supabase pooler에 직접 연결 실패 — 유저가 대시보드 SQL Editor로 직접 실행

#### 💡 Try (시도할 것)
- **작업 단위별 커밋 습관:** 파일 수정 후 바로 커밋하지 말고, 논리적 단위가 완성될 때 해당 파일만 선별 커밋
- **배포 후 검증 항목:** 새 리포트 생성 → slug URL 접근 → 기존 UUID URL 접근 → 이메일 slug 링크 확인

#### 📦 산출물
- `shared/schema.ts`: slug 컬럼 추가 (nullable, unique varchar(80))
- `server/slugs.ts`: 81개 확언 문구 풀 + `generateSlug(uuid)` 함수
- `server/storage.ts`: `getSajuResultBySlug()`, `createSajuResult()`에 slug 자동 생성
- `server/routes.ts`: `resolveReport()` dual-resolve 헬퍼, 모든 `:reportId` 라우트 적용, API 응답에 slug 필드
- `client/src/pages/ResultsV3.tsx`: facet 라벨 고정, 잠금카드 카피 수정
- `client/src/pages/FAQ.tsx`: bada.one 브랜딩
- `client/src/index.css`: Satoshi 폰트 스택
- `lib/gemini_client.ts`: `fixPrematureClose()` JSON 파싱 버그 수정, maxOutputTokens 24k

#### 커밋 이력
- `9192811` feat: implement True Solar Time (진태양시) for accurate Saju hour pillar
- `7581c55` fix: UI polish, font stack, Gemini JSON parsing
- `aab678d` feat: affirmation-based slug URLs for reports

---

### 2026-02-17 (B) - 진태양시(True Solar Time) 기반 사주 시간 계산 구현
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **유저 코드리뷰가 버그를 잡음:** 첫 구현에서 DST 이중 차감 버그 존재 — `stdMeridian`을 DST 포함 offset으로 계산하여 NYC 여름 TST가 1시간 틀림 (09:54 → 정답 10:54). 유저가 "과거 서머타임까지 계산하고 있나?"로 의문 제기 → 검증 → 발견 → 즉시 수정
- **additive 순서가 안전:** time_utils(신규 함수) → saju_calculator(신규 경로) → behavior_translator(optional param) → routes(스위치) → Survey(UI) 순서로 구현하여 각 단계에서 기존 코드 파괴 없이 진행
- **debug 메타데이터 설계:** `solarTimeConversion.debug`에 원본시간, timezone, stdMeridian, LMT, EoT, DST보정, 최종TST를 모두 기록하여 문제 추적 즉시 가능. 실제로 이 데이터로 DST 버그를 1분 만에 진단
- **geo-tz + Luxon 조합 검증:** geo-tz가 좌표 → IANA timezone을 정확하게 도출하고, Luxon이 1996년 역사적 DST를 정확하게 감지 (NYC EDT, London BST 모두 검증)

#### 🤔 Problem (문제점)
- **DST 이중 차감 버그:** `stdMeridian = utcOffsetHours × 15`에서 utcOffsetHours가 DST 포함값(EDT=-4)이라 stdMeridian=-60° (정답 EST=-75°). LMT에서 -56분 + 명시적 DST -60분 = 이중 차감. 수식 전개로 검증했으면 첫 커밋에서 잡을 수 있었음
- **테스트 케이스 불충분:** 서울/자카르타(DST 없음)만 기대값 매칭, NYC는 "DST 감지됨"만 확인하고 TST 값 수동 검증 안 함 → DST 있는 케이스의 기대값을 사전 계산했어야 함

#### 💡 Try (시도할 것)
- **수식 전개 검증 필수:** 보정 공식에 DST, LMT, EoT 여러 변수가 있을 때 수식을 대수적으로 전개하여 이중 계산/상쇄 확인
- **DST 있는 도시의 기대값 사전 계산:** NYC, London 등 DST 활성 케이스는 손으로 기대 TST를 먼저 구해놓고 코드 결과와 대조
- **경계 조건 테스트 체계화:** 자정 경계(next/prev), 극단 경도(Urumqi 등), 남반구 DST(시드니 등) 추가

#### 📦 산출물
- `lib/time_utils.ts`: `calculateTrueSolarTime()` — geo-tz 타임존 감지, LMT 보정, EoT(Spencer), DST 보정, 자정 경계 처리, debug 메타데이터
- `lib/saju_calculator.ts`: `SajuOptions` 인터페이스, lat/lon → TST 경로 / timezone → legacy KST 경로 분기
- `lib/behavior_translator.ts`: `calculateLuckCycle()`, `translateToBehaviors()`에 optional coordinates 전달
- `server/routes.ts`: assessment 스키마 timezone optional, coordinates 파이프라인 와이어링, DB에 solarTimeConversion 저장
- `client/src/pages/Survey.tsx`: 도시 선택 시 timezone 드롭다운 숨김 (서버가 lat/lon에서 도출)

#### 커밋 이력
- `5392dcf` feat: implement True Solar Time (진태양시) for accurate Saju hour pillar
- `4a60b08` fix: correct DST double-counting in True Solar Time stdMeridian

#### 검증 결과
| 케이스 | TST | 시주 | 비고 |
|---|---|---|---|
| 서울 96-09-18 11:56 | 11:31 | 戊午 | regression 없음 |
| 자카르타 96-09-18 11:56 | 12:10 | 戊午 | 기존 己未 → 수정됨 |
| 뉴욕 96-07-18 11:56 (EDT) | 10:54 | 癸巳 | DST 정확 |
| 뉴욕 96-01-18 11:56 (EST) | 11:50 | — | 겨울 정상 |
| 런던 96-07-18 11:56 (BST) | 10:50 | — | DST 정확 |
| 자카르타 96-09-18 23:50 | 00:04+1d | — | 자정 경계 정상 |

---

### 2026-02-17 - 프로덕션 500 에러 근본 원인 발견 + 에러 가시성 인프라 구축
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **에러 가시성이 근본 원인을 드러냄:** "Report not found" 하나로 퉁치던 에러를 상태별 구분 + 디버그 텍스트로 바꾸자마자 500 에러가 보였고, API 직접 호출로 **Vercel 환경변수 전체 누락**이라는 진짜 원인 발견
- **MemStorage fallback 동작 이해:** env 없으면 `db=null` → `MemStorage` fallback → 같은 서버리스 인스턴스 살아있는 동안만 데이터 존재 → cold start 후 전부 소실. "잠깐 보였다 사라짐"의 정확한 메커니즘
- **방어적 retry 인프라:** 4xx는 즉시 실패, 그 외 2회 자동 재시도 + 수동 Retry 버튼. 향후 일시적 네트워크 문제에 대한 보험

#### 🤔 Problem (문제점)
- **🔴 Vercel 환경변수 전체 누락 (Human 실수):** 초기 배포 시 설정했다고 생각했으나 실제로는 저장 안 됨. 이후 모든 유저 데이터가 DB에 저장되지 않고 MemStorage에서 소실됨 — 기존 리포트 데이터 전부 유실
- **"모바일 이슈"로 오진:** PC에서는 로컬 dev 서버(localhost)를 보고 있었기 때문에 정상으로 착각. 실제론 프로덕션 전체가 500이었음. 프로덕션 URL로 직접 테스트했으면 즉시 발견 가능했음
- **curl 200 주장과 모순:** 초기 컨텍스트에서 "curl로 200"이라 했지만 실제 프로덕션 curl은 500. 로컬 curl이었을 가능성 높음
- **에러 메시지에 상세 정보 없었음:** catch 블록이 generic "Failed to get results"만 반환 → 프론트도 백도 원인 파악 불가

#### 💡 Try (시도할 것)
- **🔴 배포 직후 프로덕션 스모크 테스트 필수:** `curl https://bada.one/api/results/{실제ID}` 한 번이면 발견 가능. 배포 체크리스트에 추가
- **env 체크 startup 로그:** 서버 시작 시 필수 env 존재 여부를 로그로 출력 (값은 마스킹). "DB: ✅ connected" / "DB: ❌ MemStorage fallback" 수준
- **프론트엔드 에러는 항상 상세 표시:** generic 메시지 지양. 최소한 디버그용 상세를 저 opacity로 노출
- **로컬 vs 프로덕션 혼동 방지:** 버그 리포트 시 어느 환경에서 테스트했는지 명시적으로 구분

#### 📦 산출물
- `client/src/pages/ResultsV3.tsx`: 에러 상태별 구분 (네트워크/404/403) + Retry 버튼 + 디버그 텍스트
- `client/src/lib/queryClient.ts`: retry 2회 (4xx 제외) + exponential backoff
- `server/app.ts`: Helmet crossOriginResourcePolicy same-site
- `server/routes.ts`: results API 500 응답에 errorType + detail 필드 추가
- **Vercel 환경변수 6개 설정:** SUPABASE_DATABASE_URL, DATABASE_URL, GEMINI_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, HD_API_KEY

#### 커밋 이력
- `cfe2535` fix: improve mobile error handling — retry, error differentiation, CORP header
- `7bb464c` fix: expose error type and detail in results API 500 response

---

### 2026-02-16 (B) - 리포트 솔루션 강화 + Blueprint 다각화 + UI 폴리시 + 브랜딩
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **진단:솔루션 비율 역전:** 기존 9:1(진단:솔루션) → Cost tip 3개 + Protocol 3개 + Chapter/Year 전략 2개 + Blueprint facets 3개 = 솔루션 11개 추가. "$2.9인데 $10 밸류" 목표에 실질적 전진
- **`responseMimeType: "application/json"` 발견:** 한국어 Gemini 출력에서 JSON 파싱 실패가 반복됐는데 control character 제거, JSON repair 등 삽질 후 이 한 줄이 근본 해결. 향후 Gemini JSON 생성은 항상 이 옵션 사용
- **유저 피드백 즉시 반영 연속 사이클:** Blueprint 2페이지 분리, Protocol 스와이프 캐러셀, Neuroscience 불렛 포인트, 가독성 opacity 조정, favicon/로고 교체 — 유저 스크린샷 기반으로 5회 연속 피드백→수정→배포 사이클 완료
- **터치 스와이프 근본 수정:** `touchAction: "pan-x"` 를 모든 캐러셀에 추가하여 세로 스냅 스크롤 안에서 가로 스와이프가 네이티브로 동작
- **Blueprint 데이터 소스 정리:** facets 프롬프트에서 "Survey vs Design gaps" 참조 제거 → Blueprint는 사주+HD만 사용하는 원칙 확립

#### 🤔 Problem (문제점)
- **Gemini JSON 파싱 삽질 30분:** control char replace → structural newline 파괴 → 원복 → repair logic → 결국 `responseMimeType`이 정답. 공식 문서를 먼저 확인했으면 바로 해결
- **maxOutputTokens 미리 계산 안 함:** 한국어 + 확장 필드로 8192 초과 예측 가능했으나 사전 조정 안 함
- **free user 응답에 blueprintFacets 누락:** routes.ts에서 free preview 필드 목록 수동 관리 → 새 필드 추가 시 빠뜨림
- **캐러셀 inline style vs Tailwind class:** BlueprintFacetsCard에서 inline `style={{ width }}` 사용했다가 ChapterCard의 `w-[300%]` + `w-1/3` 패턴과 불일치 → 통일 필요했음
- **Vercel CDN 캐시 전파 지연:** 배포 직후 무료/유료 페이지 간 다른 버전이 렌더링됨 — CDN 엣지 전파 시간차

#### 💡 Try (시도할 것)
- **Gemini API 옵션 먼저 확인:** 파싱 문제 시 코드 workaround 전에 API 설정 확인
- **캐러셀 패턴 통일:** 수평 스크롤 캐러셀은 `w-[N00%]` + `w-1/N` + `touchAction: "pan-x"` 패턴으로 표준화
- **가독성 opacity 기준선:** body text = `/80` 이상, secondary = `/70`, label/mono = `/60`. `/50` 이하는 가능한 지양
- **브랜드 에셋 중앙 관리:** `client/public/` 에 logo-badaone.svg, favicon.svg 확정. 이후 변경 시 한 곳만 교체

#### 📦 산출물
- `lib/gemini_client.ts`: V3CardContent 인터페이스 확장, Gemini `responseMimeType: "application/json"` + `maxOutputTokens: 16384`, 프롬프트 가이드 4종, NUMERIC DATA BAN, MANDATORY FIELDS, 한국어 -다 체 금지, HD 추가 데이터, Blueprint facets에서 survey 참조 제거
- `client/src/pages/ResultsV3.tsx`: CostCard tip, ActionCard 스와이프 캐러셀, StrategyBlock, ChapterCard strategy, YearCard strategy, BlueprintCard 2페이지 분리, BlueprintFacetsCard 캐러셀, EnergyCard 넘버드 불렛, 전체 opacity 가독성 개선, touchAction pan-x, 로고 교체
- `client/src/pages/Landing.tsx`: 로고 교체 (logowhite → logo-badaone)
- `client/src/components/ErrorBoundary.tsx`: 로고 교체
- `client/index.html`: favicon SVG 교체
- `client/public/favicon.svg`, `client/public/logo-badaone.svg`: 브랜드 에셋 추가
- `server/routes.ts`: free preview에 blueprintFacets 추가

#### 커밋 이력
- `40a8ea5` feat: strengthen report solutions + diversify Blueprint card
- `63d02f8` fix: split Blueprint into 2 pages + remove survey ref from facets
- `956a242` fix: split neuroscience insight into numbered bullet points
- `45d764a` fix: protocol carousel + touch swipe + readability improvements
- `d3e002b` fix: update favicon + replace logo with badaone brand asset

---

### 2026-02-16 - 랜딩 개선 + GA4 + 이메일 플로우 재설계 + 메시징 전면 정합
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **기획 → 구현 일관성:** 메시징 일관성 분석 문서(P0~P3) 기준으로 LockCard, FAQ 순차 수정. 기획 문구가 그대로 코드에 반영됨
- **FAQ 전면 개편 — 고객 관점 전환:** "사주가 뭔지 설명하는 FAQ"에서 "고객 불안을 해소하는 FAQ"로 리프레이밍. 유저의 "faq의 목표는 사람들의 불안을 없애서 결제전환 시키는 것" 인사이트를 즉시 반영하여 11개 → 6개로 압축
- **이메일 플로우 기획 문서화:** Option A~E 비교 분석 후 유저와 함께 Option E(passive lead validation) 결정. co-star 레퍼런스, Resend 도메인 인증 확인까지 기획에 포함
- **Sample Cards 캐러셀 구현:** 유저의 "남의 리포트 몰래 보는 느낌" 아이디어를 embla-carousel + JetBrains Mono 카드로 즉시 구현
- **CLAUDE.md 세션 루틴 정립:** 세션 시작(회고 읽기) → 작업(신호등 규칙) → 종료(회고 업데이트) 사이클 문서화

#### 🤔 Problem (문제점)
- **브랜치 규칙 첫 위반:** routes.ts 변경(이메일 플로우)을 main에 직접 커밋함. 🟡 노란불 규칙 위반
- **Vercel 배포 상태 인식 누락:** "아직 배포 안 됐으니 main 직접 OK"라고 잘못 판단 → 유저가 바로잡음
- **서양 점성술 birth time 오류:** 도메인 지식 불확실한데 단정 → 유저가 바로잡음

#### 💡 Try (시도할 것)
- **세션 시작 시 인프라 체크:** git remote, Vercel 상태, 현재 브랜치 확인
- **🟡 노란불 파일 변경 시 자기 점검:** "이거 feature branch에서 해야 하지 않나?"
- **"고객이 이걸 물어볼까?" 필터:** FAQ, 카피 작성 시 우리가 하고 싶은 말 vs 고객이 궁금한 것 구분

#### 📦 산출물
- `client/src/pages/Landing.tsx`: Sample Cards 캐러셀 (5장), VibeCheck 섹션 숨김, 모바일 hero 순서 수정
- `client/src/lib/simple-i18n.ts`: FAQ 11→6개 전면 개편 (EN/KO/ID), sample cards i18n
- `client/index.html`: GA4 스크립트 (G-7J946D2YP4)
- `client/src/pages/Survey.tsx`: birth date auto-advance 제거, 이메일 인증 스킵
- `server/routes.ts`: 이메일 인증 엔드포인트 제거, non-blocking report link email 발송
- `lib/email.ts`: verification → report link email 전면 재작성 (다크 테마 템플릿)
- `client/src/pages/ResultsV3.tsx`: LockCard 메시징 정합 + 인라인 FAQ 동기화
- `client/src/pages/FAQ.tsx`: 11→6개 항목 수 조정
- `scripts/check-md-structure.js`: CLAUDE.md root 허용
- `.ai-workflow/plans/2026-02-16-[UX]-email-flow-redesign.md`: 이메일 플로우 기획
- `.ai-workflow/plans/2026-02-16-[COPY]-faq-redesign.md`: FAQ 개편 기획
- `CLAUDE.md`: 프로젝트 컨텍스트 + 세션 루틴

#### 커밋 이력
- `41629b2` feat: sample card carousel + hide community section
- `27074a6` feat: add GA4 tracking
- `99ef2a0` fix: mobile hero order + birth date auto-advance
- `08a87e3` fix: skip email verification, navigate directly to results
- `1fd6d25` feat: replace email verification with report link email (Option E)
- `3dc0454` docs: update branch strategy with traffic light rules
- `03eeb6f` fix: update LockCard copy to match messaging consistency plan
- `36e5670` docs: add 2026-02-16 session retrospective
- `47c9c97` docs: add session routine to CLAUDE.md
- `5bd6034` fix: redesign FAQ from 11 to 6 questions
- `5db9d02` fix: update contact FAQ question to conversational tone

---

### 2026-02-09 (B) - V3 카드 UI 브랜딩 정합 + 서베이 버그 수정
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **브랜딩 팔레트 엄격 적용:** 오프팔레트 색상(purple #c4a0e8, teal #7ec8b8) 발견 즉시 브랜딩 문서 기준으로 교체 (#879DC6, #ABBBD5). "디자인적으로 예뻐 보이는 색" vs "브랜드 일관성" 사이에서 후자를 우선
- **유저의 "maker's trap" 지적 즉시 수용:** Energy Allocation 100% 케이스 과최적화, collision 하드코딩 등에 대해 "유저는 숫자를 검증하지 않는다"는 핵심 인사이트 반영. operating-rate-v2.md 1300줄 중 실제 구현된 50줄만 가치 있다는 냉정한 평가
- **카드 안 가로 캐러셀 UX:** 세로 스냅 스크롤(카드 간) 안에서 가로 스냅 스크롤(대운 타임라인) 구현 — snap-x + useRef scrollTo로 current 중앙 정렬 + 탭 인디케이터
- **서베이 Q10 버그 근본 원인 추적:** 스크린샷 → i18n 키 역추적 → currentStep 범위 분석 → setTimeout 레이스컨디션 발견. `setCurrentStep(prev => prev + 1)`의 functional update가 stale closure 조건분기와 결합될 때 double-advance 발생

#### 🤔 Problem (문제점)
- **off-hand 제안의 위험:** "Energy Allocation 프레이밍을 바꾸는 게 임팩트" 발언 → 유저가 구체화 요청 → 깊이 생각한 게 아니었음을 인정. 검증 안 된 아이디어를 확신 있게 말하지 말 것
- **LLM 텍스트 줄이자는 잘못된 판단:** ChapterCard overflow를 "텍스트가 길다"로 진단했으나 실제론 대운당 2문장뿐. 문제는 레이아웃이었지 콘텐츠가 아니었음. 유저가 바로잡음
- **색상 교체 시 그라디언트 endpoint 누락:** 카드 배경색만 교체하고 그라디언트 endpoint(purple/teal-tinted #1a1c2e 등)을 놓침 → 유저 재지적 후 수정

#### 💡 Try (시도할 것)
- **"이 제안 깊이 생각한 건가?" 자기 점검:** 확신 없는 제안에는 명시적으로 "아직 검증 안 됨" 표시
- **레이아웃 문제 vs 콘텐츠 문제 분리:** overflow 발생 시 "콘텐츠를 줄이자"가 아니라 "레이아웃으로 해결할 수 있는가"를 먼저 확인
- **색상 교체 시 grep으로 전수 검사:** hex값 교체할 때 해당 색상의 모든 변형(rgba, gradient endpoint, shadow)까지 검색

#### 📦 산출물
- `client/src/pages/ResultsV3.tsx`: 브랜딩 컬러 정합 (off-palette 제거), 워터마크 추가, CardProgress 제거, ChapterCard 가로 캐러셀, ClosingCard SVG 마키 텍스트, 폰트 시스템 적용 (Inter body + JetBrains Mono data)
- `client/src/index.css`: Inter + JetBrains Mono import, scrollbar-hide 유틸리티
- `client/src/pages/Survey.tsx`: Q10 버그 수정 (handleNext double-advance 방지 — `Math.min(prev + 1, QUESTIONS.length)`)
- `client/public/logowhite.svg`: 브랜드 로고 추가

---

### 2026-02-09 - V3 카드뉴스 리포트 프로토타입 (충돌 프레이밍 + 타임라인)
**Agent:** Claude

#### 👍 Keep (계속 할 것)
- **"충돌 = 인사이트" 발견:** 서베이(자기인식) vs 사주(설계도)의 GAP을 핵심 프레이밍으로 삼은 것이 $10 moment를 만듦. 정보 나열이 아닌 서사 구조가 핵심
- **Few-shot > Constraint:** v2의 constraint 15개 방식 대신 골드스탠다드 예시 1개 + "이 품질로 써라"가 훨씬 좋은 LLM 출력을 만듦
- **Deterministic + LLM 하이브리드:** Energy Allocation 숫자는 서버가, 해석은 LLM이 — 환각 방지와 품질을 동시에 잡음
- **사주 데이터 최대 활용:** 오행만이 아니라 사주팔자+십신+대운+세운까지 전부 활용. 최소 480개 조합 기반
- **즉시 검증:** User B(Passive Floater)로 "산 vs 바다" 완전히 다른 콘텐츠 생성 확인 — 하드코딩 과최적화 아님을 증명
- **유저 피드백 즉시 반영:** "전문용어 노출 금지" → 프롬프트에 JARGON BAN 추가, "타임라인 느낌 안남" → 시각적 세로 타임라인 + zoom-in 브레드크럼

#### 🤔 Problem (문제점)
- **하드코딩으로 먼저 만족시키려는 경향:** deriveV3Content()로 이지윤 데이터 하나에 과최적화한 후 LLM 프롬프트로 전환 — 순서가 반대였으면 더 빨랐음
- **Brain Scan 환각:** LLM이 remaining:120% 생성. 숫자는 LLM에 맡기면 안 된다는 교훈
- **오행→행동축 매핑 오류:** 목=flexibility로 잘못 매핑 (실제는 수=flexibility). 도메인 지식 확인 없이 매핑하면 안 됨
- **HD 데이터 여전히 하드코딩:** SAMPLE_HD_DATA가 모든 유저에게 적용 중. v3에서 사주+서베이 충돌이 핵심이라 영향은 적지만 한계 존재

#### 💡 Try (시도할 것)
- **LLM 프롬프트 먼저, 하드코딩 fallback 나중에:** 다음엔 LLM 출력 품질을 먼저 검증하고, 하드코딩은 오프라인 fallback으로만
- **사주 도메인 크로스체크 필수:** 오행/십신/대운 해석은 반드시 유저에게 확인 후 적용
- **다국어 v3 카드 테스트:** 현재 en only — ko/id에서도 전문용어 차단 + 품질 유지되는지 검증 필요
- **HD API 구매 판단:** v3 검증 후 실제 유저별 HD 데이터로 behavior_translator 정확도 향상

#### 📦 산출물
- `client/src/pages/ResultsV3.tsx`: 13장 카드뉴스 (HookCard, InsightCard×3, EnergyCard, EvidenceCard, CostCard×3, ChapterCard(세로 타임라인), YearCard(zoom-in), ActionCard(zoom-in), ClosingCard)
- `lib/gemini_client.ts`: generateV3Cards() + V3CardContent interface (충돌 프레이밍 few-shot 프롬프트, 전문용어 차단, 타임라인)
- `lib/behavior_translator.ts`: getTenGod(), buildDaYunInfo(), ZHI_MAIN_QI, calculateLuckCycle() 확장 (prev/current/next 대운 + 십신)
- `server/routes.ts`: GET /api/results/:reportId/v3-cards (대운/세운 계산 포함)
- `client/src/App.tsx`: /results/:reportId/v3 라우트
- `scripts/test_v3_cards_diff.ts`: User B 차별화 검증
- `scripts/test_dayun.ts`: 대운/십신 검증
- `.ai-workflow/plans/2026-02-09-report-v3-card-prototype.md`: 기획 문서 (현재 상태 + 다음 단계)

---

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
- `client/src/pages/Survey.tsx`: 수동 입력 UI (City Input 제거, Combobox Country/Timezone Selection)
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