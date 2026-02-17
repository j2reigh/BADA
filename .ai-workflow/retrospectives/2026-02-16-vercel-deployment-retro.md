# Retrospective: Vercel Deployment (2026-02-16)

## 1. Overview
**Objective:** Deploy BADA Report (Express + TypeScript) to Vercel as a Serverless Function.
**Result:** 6회 시도 끝에 배포 성공 (커밋 f70548b).
**Duration:** ~4시간 (배포 전략 수립 → DNS 설정 → 함수 디버깅)

## 2. What Went Well
- 정적 파일(클라이언트) 배포는 1회에 성공 — `buildCommand` + `outputDirectory` 설정만으로 동작
- 커스텀 도메인 `bada.one` DNS 설정 (Namecheap A + CNAME) 한 번에 성공
- SSL 자동 프로비저닝 정상 작동

## 3. Timeline of Failures (API Serverless Function)

| # | 시도 | 에러 | 원인 |
|---|------|------|------|
| 1 | `api/index.ts` → `import "../server/app"` | `ERR_MODULE_NOT_FOUND: server/app` | Vercel Lambda에 `server/` 디렉토리 미포함. nft가 `api/` 외부 파일을 패키징하지 못함 |
| 2 | `server/vercel.ts` 생성 + esbuild로 `api/index.mjs` 사전 번들링 | 같은 에러 (`api/index.js`에서 발생) | Vercel이 `.mjs` 확장자를 무시하고 캐시된 이전 `api/index.js`를 실행 |
| 3 | `.mjs` → `.js` (CJS 포맷) + `external: []` | 같은 에러 | `package.json`에 `"type": "module"` → `.js`가 ESM으로 로드됨 → CJS 포맷 충돌 |
| 4 | ESM 포맷으로 변경 + git에서 `api/index.js` 제외 (`.gitignore`) | `pattern doesn't match any Serverless Functions` | Vercel이 빌드 전에 `functions` 패턴 검증 → `.gitignore`된 파일은 찾을 수 없음 |
| 5 | `.gitignore`에서 제거 + 번들 파일 git 커밋 | `SyntaxError: Invalid or unexpected token` | Gemini가 빌드 스크립트를 수정하며 **3가지 문제** 동시 발생 (아래 상세) |
| 6 | 빌드 스크립트 정리 + 정상 번들 커밋 | **성공** | — |

## 4. Root Cause Analysis

### A. Vercel 함수 탐지는 빌드 전에 실행됨
- `vercel.json`의 `functions` 패턴은 **git 소스 기준**으로 검증
- 빌드 시점에 생성되는 파일은 패턴 매칭 대상이 아님
- **해결:** 번들된 `api/index.js`를 git에 직접 커밋

### B. `"type": "module"` 충돌
- `package.json`에 `"type": "module"` → 모든 `.js`가 ESM으로 로드
- CJS(`format: "cjs"`)로 번들하면 `require()`가 ESM 컨텍스트에서 실패
- **해결:** `format: "esm"` + `createRequire` 배너

### C. 멀티 에이전트 충돌 (Claude + Gemini 동시 수정)
시도 5의 `SyntaxError`는 Gemini가 빌드 스크립트를 독립적으로 수정하며 발생:
1. **중복 빌드 단계** — esbuild 호출이 2개 존재, 두 번째(`external: allDeps`, `minify: false`)가 첫 번째(`external: []`, `minify: true`)를 덮어씀
2. **배너 줄바꿈 오류** — `.join("\\n")` → 리터럴 `\n` (줄바꿈 아님) → 출력 파일에 유효하지 않은 토큰 삽입
3. **플레이스홀더 커밋** — 빌드 결과물 대신 `res.send("Building...")` 플레이스홀더가 git에 커밋됨

### D. Express-on-Vercel 구조적 제약
- Vercel Lambda는 `api/` 디렉토리 내 파일만 자동 패키징
- `server/` 디렉토리의 Express 앱을 참조하려면 사전 번들링 필수
- `external: []`로 모든 의존성을 인라인하면 1.9MB지만, 네이티브 모듈이 없으면 정상 동작

## 5. Final Architecture

```
[Git Source]
  server/vercel_entry.ts  ─── import app from "./app" ── export default app
  server/app.ts           ─── Express app (middleware + routes)
  script/build.ts         ─── esbuild: server/vercel_entry.ts → api/index.js

[Build Output (committed to git)]
  api/index.js            ─── 1.9MB self-contained ESM bundle (external: [])

[Vercel Runtime]
  /api/*  → api/index.js  ─── Express handler (모든 의존성 인라인)
  /*      → dist/public/   ─── Static SPA (Vite build)
```

## 6. Lessons Learned

1. **Vercel 함수 = git에 파일이 있어야 한다** — 빌드 생성 파일로는 `functions` 패턴 매칭 불가
2. **`"type": "module"` 확인 필수** — 번들 포맷(ESM/CJS)은 package.json의 `type` 필드와 일치해야 함
3. **멀티 에이전트 작업 시 빌드 스크립트 변경 충돌 주의** — 같은 파일을 두 AI가 수정하면 의미적 충돌 발생 가능
4. **`external: []` vs `external: allDeps`** — Serverless 환경에서는 모든 의존성 번들링이 안전 (node_modules 의존 불가)
5. **로컬에서 `npm run build` 후 `api/index.js` 내용 검증** — 배포 전 `grep "server/app"`, `head -c 200` 등으로 확인

## 7. Action Items
- [x] 빌드 스크립트 중복 제거 + 정상 번들 커밋 (f70548b)
- [ ] 서버 코드 변경 시 `npm run build` → `api/index.js` 재커밋 워크플로우 문서화
- [ ] `registerRoutes(app)`가 async인데 await 없이 호출 — 잠재적 race condition 확인 필요
- [x] Vercel 배포 후 E2E 검증: 설문 제출 → 리포트 생성 → LockCard 표시 → Gumroad 결제

---

## 8. Post-Deployment Session (2026-02-16 C)

### 산출물
| 커밋 | 내용 |
|------|------|
| `249d449` | fix: 헤더 BADA 텍스트 → badaone logo SVG (Survey, Wait, VerificationFailed, GeneratingScreen) |
| `c201b71` | fix: JSON 파싱 강화 + JSON_PARSE_ERROR 재시도 제거 |

### Keep
- 🟢 UI/텍스트 수정은 main 직행 — 로고 교체 4개 파일 안전하게 완료
- FAQ 페이지가 이미 로고를 쓰고 있어서 패턴 참고 가능했음

### Problem
- **Gemini JSON 파싱 실패 → 60초 타임아웃 장애**
  - 원인: Gemini 응답에 BOM/zero-width 등 보이지 않는 유니코드 문자 포함 가능
  - `JSON_PARSE_ERROR`가 retryable로 분류되어 같은 실패를 3회 반복
  - 1회 API 호출 ~15-20초 × 3회 + 백오프 = Vercel 60초 초과
- `parseJSON`이 markdown fence 제거만 했고, 보이지 않는 문자 처리가 없었음

### Try
- Gemini 응답의 raw bytes를 hex dump로 로깅하는 디버그 모드 추가 고려 — 파싱 실패 시 정확한 원인 파악 가능
- Vercel `maxDuration` 60초는 빠듯함 — 향후 리포트 생성이 더 복잡해지면 비동기 처리(큐) 전환 검토
- retryable errors 목록은 보수적으로 관리 — 네트워크/서버 에러만 재시도, 데이터 에러는 즉시 실패

---

## 9. Post-Deployment Session (2026-02-17)

### 산출물
| 커밋 | 내용 |
|------|------|
| `8024e14` | feat: V3 리포트 repair 엔드포인트 (truncated JSON 복구) |
| `c9e3ba7` | chore: APP_URL 환경변수 추가를 위한 재배포 트리거 |
| `2c56bb7` | fix: results/unlock 엔드포인트에서 이메일 인증 체크 제거 |

### Keep
- 문제 원인을 API 응답(`curl`)으로 즉시 확인 — DB에 리포트 존재 확인 + 403 원인 특정
- 기획 문서(Option E)를 참조해 방향성 빠르게 확인 → 불필요한 인증 로직 제거 결정

### Problem
- **프로덕션에서 리포트 접근 불가 (친구 테스트 실패)**
  - 원인 1: `isVerified` 체크가 results API에 남아있었음 — Option E(인증 제거) 기획은 있었으나 구현 시 results 엔드포인트의 체크를 제거하지 않음
  - 원인 2: 프론트엔드(`ResultsV3.tsx`)가 403을 "Report not found"로 표시 — 유저에게 잘못된 에러 메시지
- **이메일에 localhost 링크 포함**
  - 원인: `APP_URL` 환경변수가 Vercel에 미설정 → `getBaseUrl()` fallback이 `http://localhost:5001`
  - 이메일 받은 유저가 링크 클릭 → localhost로 이동 → 작동 안 함
- **V3 리포트 closingLine 누락** (이전 세션 이슈의 연장)
  - 원인: JSON 잘림 + repair가 뒤쪽 필드(closingLine, shifts) 없이 유효한 JSON 생성 → 불완전 데이터 DB 저장
  - repair 엔드포인트(`POST /api/results/:id/repair`) 추가로 해결

### Try
- **환경변수 체크리스트**: 배포 시 필수 환경변수 목록 관리 (APP_URL, RESEND_API_KEY 등) — 누락 방지
- **기획 → 구현 매핑**: 기획 문서의 "구현 시 변경 범위" 테이블을 체크리스트로 활용, 빠진 항목 없는지 확인
- **에러 메시지 구분**: 프론트엔드에서 404/403/500을 구분 표시 — 디버깅 시간 단축

---

## 10. Deployment Incidents (2026-02-17 C) — feat/true-solar-time 머지 후

### 타임라인
| 시각 | 이벤트 |
|------|--------|
| T+0 | `feat/true-solar-time` → `main` 머지 + 푸시. TST(진태양시), slug URL, UI 폴리시 등 포함 |
| T+5m | 프로덕션 서베이 제출 → **500 에러** (리포트 생성 실패) |
| T+10m | 원인 파악: Gemini JSON premature close 버그 수정(`fixPrematureClose`)이 feature 브랜치에만 있었음 → 머지로 해결 |
| T+15m | 재배포 후 서베이 다시 테스트 → 리포트 생성 성공 |
| T+20m | 유저가 "타임존 인풋 아직 남아있다" 신고 → 확인 결과 **드롭다운은 제거됐지만 라벨이 "Birth Timezone"으로 남아있음** |
| T+25m | i18n 라벨 수정 (`birth.location`: "Birth Location" / "출생 장소" / "Lokasi Kelahiran") → 커밋 + 푸시 |
| T+35m | 프로덕션 리포트 생성 재시도 → **500 크래시**: `ReferenceError: __dirname is not defined in ES module scope` |
| T+40m | 원인 파악: `geo-tz` 라이브러리가 내부에서 `__dirname` 사용 → Vercel ESM 번들에서 미정의 |
| T+45m | `script/build.ts`에 `__filename`/`__dirname` ESM shim 추가 → 재빌드 + 커밋 + 푸시 |
| T+50m | 프로덕션 정상 동작 확인 |

### 장애 1: Gemini JSON Premature Close

**증상:** 서베이 제출 → 500 `Unexpected non-whitespace character after JSON at position 3216`

**원인:**
- Gemini가 JSON 객체 중간에 `}`를 출력한 뒤 `, "nextField": ...`로 계속하는 버그가 간헐적으로 발생
- 이를 수정하는 `fixPrematureClose()` 함수가 feature 브랜치(`lib/gemini_client.ts`)에만 존재
- main 브랜치에는 이전 세션의 기본 `parseJSON()`만 있었음
- 머지 시 `gemini_client.ts`에 충돌이 없어서 자동 머지됐지만, 이미 main에 배포된 코드에는 없었던 상태

**수정:** feature 브랜치 머지로 자동 해결

**교훈:**
- 프로덕션 크리티컬 버그 수정은 **즉시 main에도 cherry-pick**해야 함
- feature 브랜치에서만 수정하고 "나중에 머지하면 되지"는 위험

### 장애 2: "Birth Timezone" 라벨 미수정

**증상:** 타임존 드롭다운은 제거했는데, 서베이에 "Birth Timezone" 텍스트가 여전히 보임

**원인:**
- Survey.tsx에서 timezone `<select>` 요소와 관련 state/validation은 모두 제거함
- 그러나 도시 선택 필드의 라벨이 i18n 키 `birth.location`을 사용하는데, 이 키의 값이:
  - EN: `"Birth Timezone"` (잘못된 값)
  - KO: `"출생 시간대"` (잘못된 값)
  - ID: `"Zona Waktu Kelahiran"` (잘못된 값)
- 라벨은 `simple-i18n.ts`에 정의되어 있어서 Survey.tsx만 보면 발견 불가

**수정:** `simple-i18n.ts`에서 3개 언어 모두 수정:
- EN: `"Birth Location"`, KO: `"출생 장소"`, ID: `"Lokasi Kelahiran"`

**교훈:**
- UI 요소 제거 시 **연관 i18n 키 값도 함께 검증**해야 함
- 컴포넌트 코드만 수정하고 i18n 파일을 놓치기 쉬움
- "제거 완료" 확인 시 브라우저에서 직접 눈으로 확인하는 것이 가장 확실

### 장애 3: `__dirname` ESM 미정의 크래시

**증상:** `ReferenceError: __dirname is not defined in ES module scope` — 프로덕션 서버리스 함수 즉시 크래시

**원인:**
- TST(진태양시) 기능에서 위도/경도 기반 타임존 계산을 위해 `geo-tz` 라이브러리 추가
- `geo-tz`는 내부적으로 `__dirname`을 사용하여 데이터 파일 경로를 resolve
- Vercel 서버리스 번들은 `format: "esm"` → ESM에서 `__dirname`은 정의되지 않음
- 기존 esbuild 배너에 `require` shim(`createRequire`)만 있었고, `__dirname`/`__filename` shim은 없었음

**수정:** `script/build.ts`의 Vercel 핸들러 esbuild 배너에 추가:
```javascript
import { fileURLToPath as __esm_fileURLToPath } from "url";
import { dirname as __esm_dirname } from "path";
const __filename = __esm_fileURLToPath(import.meta.url);
const __dirname = __esm_dirname(__filename);
```

**근본 원인:**
- 기능 개발 시 새 패키지(`geo-tz`) 추가 → Vercel ESM 번들 호환성 체크를 하는 워크플로우 자체가 없었음
- 로컬(`npx tsx`)은 CJS 호환이라 `__dirname`이 원래 존재 → 개발/테스트 전 과정에서 문제가 드러나지 않음
- esbuild `banner` 설정은 프로젝트 초기에 `require` shim만 넣고 잊혀진 상태 → 새 라이브러리가 `__dirname`을 쓰는지 확인할 계기가 없었음

**교훈:**
- 라이브러리 추가 시 "Vercel ESM 번들에서 돌아가나?" 체크가 워크플로우에 없으면 반드시 재발함
- **재발 방지:** `CLAUDE.md`에 "Vercel 배포 호환성 체크" 섹션 추가 — 새 패키지 추가 시 CJS 글로벌 사용 여부 확인 + esbuild banner shim 확인을 필수 체크리스트로 등록

### 종합 교훈

1. **Feature 브랜치 수정 ≠ 프로덕션 수정** — 크리티컬 버그 수정은 main에도 즉시 반영
2. **UI 제거 = 코드 + i18n + 시각 확인** 3단계 체크리스트 필요
3. **워크플로우에 없으면 까먹는다** — 새 패키지 추가 시 Vercel ESM 호환성 체크를 `CLAUDE.md` 체크리스트에 등록하여 자동 참조되게 함
4. **로컬 ≠ Vercel** — `npx tsx`(CJS 호환)와 Vercel Lambda(ESM)는 런타임이 다름. 로컬 성공이 프로덕션 성공을 보장하지 않음

---

## 11. Gumroad Webhook Slug Crash (2026-02-17 D)

### 증상
Gumroad 결제 후 webhook 호출 → **500 에러**: `invalid input syntax for type uuid: "spark-from-within-3a93"`

유저가 결제했는데 리포트가 잠금 해제되지 않음.

### 원인

**ID 스키마 변경 시 전체 소비 지점을 누락:**

- 이전 세션에서 리포트 URL을 UUID → slug로 전환 (`resolveReport()` 도입)
- 결과 조회/잠금해제/V3카드 엔드포인트는 `resolveReport()`로 변경함
- **Gumroad webhook 핸들러는 누락** — 여전히 `getSajuResultById(targetReportId)` 사용
- Gumroad이 `url_params[report_id]`에 slug(`spark-from-within-3a93`)를 전달 → UUID-only 함수에 주입 → PostgreSQL `uuid` 타입 파싱 실패

### 수정

`server/routes.ts` Gumroad webhook에서 3곳 변경:
```typescript
// Before (broken):
const exists = await storage.getSajuResultById(targetReportId);
const sajuResult = await storage.getSajuResultById(targetReportId);
await storage.unlockReport(targetReportId);  // slug 전달 → 실패

// After (fixed):
const exists = await resolveReport(targetReportId);
const sajuResult = await resolveReport(targetReportId);
await storage.unlockReport(sajuResult.id);   // 항상 UUID
```

### 근본 원인

**"grep 안 하고 눈으로 찾았다"**

ID 스키마를 변경할 때, `getSajuResultById` 호출 지점을 코드베이스 전체에서 grep하지 않고 "결과 관련 엔드포인트"만 수동으로 찾아 수정함. Gumroad webhook은 결제 로직이라 "결과"라는 멘탈 모델에서 빠져있었음.

### 영향
- 결제한 유저의 리포트가 잠금 해제되지 않음
- Gumroad 자체 재시도 메커니즘이 있어 수정 배포 후 자동 복구 기대 가능
- 금전적 피해는 없으나 유저 경험 손상

### 재발 방지
- **CLAUDE.md에 "ID 스키마 변경 체크리스트" 추가** — ID/slug/UUID 관련 함수 변경 시 `grep`으로 전체 호출 지점 검색 필수
- 특정 함수를 대체할 때는 `grep -r "기존함수명"` 결과가 0건이 될 때까지 전환 완료하지 않음
