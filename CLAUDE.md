# BADA Project Context

## Session Routine

### 세션 시작 시
1. 이 파일(CLAUDE.md) 읽기 (자동)
2. `.ai-workflow/retrospectives/CURRENT_SPRINT.md` 최근 회고 읽기 — 이전 세션 교훈 확인
3. `git status`, `git log --oneline -5` — 현재 상태 파악
4. Vercel 배포 상태 인식 (main push = 프로덕션 배포)

### 작업 중
- 🔴🟡🟢 신호등 규칙 준수 (아래 참조)
- push는 유저 요청 시에만

### 커밋 후
- `.ai-workflow/retrospectives/CURRENT_SPRINT.md`에 세션 회고 업데이트
  - Keep / Problem / Try / 산출물 / 커밋 이력
- 기획 문서가 있으면 완료 항목 체크

---

## Stack
- Express monolith (API + React SPA), TypeScript, Vite, Drizzle ORM
- DB: Supabase PostgreSQL (ap-southeast-1)
- AI: Gemini 2.5 Flash (report generation)
- Email: Resend (bada.one verified, ap-northeast-1)
- Payment: Gumroad (webhook → report unlock)
- Hosting: Vercel (serverless)
- HD API: humandesignapi.nl

## Git Branch Strategy (신호등 규칙)

🔴 **무조건 브랜치** — 서버가 안 켜질 수 있는 작업:
- 빌드 설정: vercel.json, package.json, tsconfig.json, vite.config.ts, build.ts
- 패키지 설치/삭제
- 환경 변수 추가/삭제

🟡 **브랜치 권장** — 기능 고장 가능한 작업:
- 백엔드 로직: routes.ts, api/*, lib/email.ts
- 공통 컴포넌트 수정 (버튼, 헤더 등)
- → 유저에게 "브랜치 파서 할까요?" 확인

🟢 **Main 직행** — 망가져도 티만 나는 작업:
- 단순 UI/텍스트/CSS 수정

## Push 규칙
- 커밋까지만 한다. **push는 유저가 직접** 하거나 명시적으로 요청 시에만.

## Key Commands
- Type check: `npx tsc --noEmit`
- Dev server: `npx tsx server/index.ts`
- Build: `npm run build`

## Report Generation Pipeline
```
Saju calculation → HD API fetch → translateToBehaviors → calculateLuckCycle → generateV3Cards (Gemini)
```

## Key Files
- `server/routes.ts` — API endpoints, Gumroad webhook
- `server/app.ts` — Express setup, security, rate limiting
- `lib/gemini_client.ts` — Gemini prompt, V3 card generation
- `lib/behavior_translator.ts` — Saju + HD data → behavior patterns
- `lib/hd_client.ts` — Human Design API client
- `lib/email.ts` — Resend report link email
- `client/src/pages/Landing.tsx` — Landing page
- `client/src/pages/ResultsV3.tsx` — V3 card report viewer
- `client/src/pages/Survey.tsx` — Survey flow
- `client/src/lib/simple-i18n.ts` — i18n (EN/KO/ID)
- `.ai-workflow/plans/` — Planning docs

## Current Email Flow (Option E)
- Survey에서 이메일 수집 → 인증 없이 바로 /results
- 백그라운드: report link email 발송 (non-blocking)
- Gumroad 결제 시 이메일 자동 수집 (결제 검증)

## Paywall
- Free preview: 3 cards (hook, mirror, blueprint)
- Paid: 27 cards full report (isPaid = true)
