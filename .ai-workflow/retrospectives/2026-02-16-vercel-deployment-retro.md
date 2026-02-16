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
- [ ] Vercel 배포 후 E2E 검증: 설문 제출 → 리포트 생성 → LockCard 표시 → Gumroad 결제
