# 배포 환경 및 버전 관리 전략 (Vercel)

**Date:** 2026-01-31
**Agent:** Claude
**Related Issue:** 첫 배포 준비 & 이후 운영 전략

---

## 📌 작업 목적

BADA-Report를 Vercel에 배포하면서, 개발/상용 환경 분리 및 버전 관리 전략을 정리한다.

---

## 🏗️ 현재 상태

| 항목 | 현황 |
|------|------|
| 앱 구조 | Express 모놀리스 (API + React 프론트 한 서버) |
| DB | Supabase PostgreSQL (ap-southeast-1) |
| 빌드 | Vite(클라이언트) + esbuild(서버) → `dist/` |
| 세션/WS | 없음 (Serverless 호환 OK) |
| CI/CD | 없음 |
| 환경 분리 | 없음 (`.env` 1개) |
| Git 브랜치 | `main` 1개 |

---

## ⚠️ Vercel 배포 시 핵심 이슈

현재 앱은 **Express 서버 1개**가 API + 프론트를 동시에 서빙한다.
Vercel은 전통적 서버가 아니라 **프론트 = CDN, 백엔드 = Serverless Function** 구조다.

### Vercel에서 잘 되는 것
- React 프론트엔드 → Vercel CDN (빠르고 무료)
- 단순 API (GET/POST, 빠른 응답) → Serverless Function

### Vercel에서 주의할 것
- **`/api/assessment/submit`**: Gemini AI 리포트 생성에 **10~30초+** 소요
  - Vercel Free: **10초** 타임아웃
  - Vercel Pro ($20/월): **60초** 타임아웃
  - → **Pro 플랜 필수** 또는 생성 로직을 비동기로 분리

---

## 🎯 배포 아키텍처

### 구성: Vercel (프론트 + API)

```
┌──── Vercel ─────────────────────────┐
│                                      │
│  CDN (정적 파일)    Serverless Fn    │
│  ┌────────────┐    ┌──────────────┐  │
│  │ React App  │    │ Express API  │  │
│  │ (Vite빌드) │    │ (/api/*)     │  │
│  └────────────┘    └──────┬───────┘  │
│                           │          │
└───────────────────────────┼──────────┘
                            │
                            ▼
                    Supabase PostgreSQL
```

### 필요한 작업: Express → Vercel Serverless 어댑터

```
프로젝트 루트에 추가:
api/
 └── index.ts       ← Express 앱을 Serverless Function으로 래핑
vercel.json         ← 라우팅 설정
```

**`api/index.ts`** (Vercel이 인식하는 엔트리포인트):
```typescript
import app from '../server/app';  // Express app export 필요
export default app;
```

**`vercel.json`**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 60
    }
  }
}
```

### 서버 코드 변경 사항

현재 `server/index.ts`는 `httpServer.listen()`으로 직접 서버를 띄운다.
Vercel에서는 Express app 인스턴스를 **export**만 하면 된다.

```
변경 전: server/index.ts → app 생성 + listen()
변경 후: server/app.ts   → app 생성 + export (listen 없음)
         server/index.ts → app import + listen() (로컬 개발용)
         api/index.ts    → app import + export default (Vercel용)
```

---

## 1. Git 브랜치 전략

### Vercel 자동 배포 연동

Vercel은 GitHub 연동 시 브랜치별 자동 배포를 지원한다.

```
main ──────→ Production 배포 (https://bada.xyz)
  │
  └── feature/xxx ──→ Preview 배포 (https://feature-xxx-bada.vercel.app)
```

| 브랜치 | Vercel 동작 | URL |
|--------|-------------|-----|
| `main` | **Production** 자동 배포 | 커스텀 도메인 |
| `feature/*` | **Preview** 자동 배포 | `*.vercel.app` 임시 URL |

**이게 사실상 스테이징 역할을 한다.** 별도 스테이징 환경 안 만들어도 됨.

### 작업 흐름

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/payment-flow

# 2. 작업 & 커밋 & 푸시
git push origin feature/payment-flow
# → Vercel이 자동으로 Preview 배포 (테스트용 URL 생성)

# 3. Preview URL에서 확인

# 4. main에 머지 (GitHub PR 또는 로컬 머지)
git checkout main && git merge feature/payment-flow
git push origin main
# → Vercel이 자동으로 Production 재배포

# 5. 브랜치 정리
git branch -d feature/payment-flow
```

---

## 2. 환경 변수 관리

### Vercel Dashboard → Settings → Environment Variables

```
                    Development    Preview       Production
                    (로컬)         (feature/*)   (main)
────────────────────────────────────────────────────────────
NODE_ENV            development    preview       production
DATABASE_URL        dev DB URL     dev DB URL    prod DB URL
GEMINI_API_KEY      xxx            xxx           xxx
RESEND_API_KEY      xxx            xxx           xxx
RESEND_FROM_EMAIL   onboard@...    onboard@...   실제 도메인
```

Vercel은 환경별로 변수를 다르게 설정할 수 있다:
- **Production**: `main` 브랜치 배포에만 적용
- **Preview**: `feature/*` 브랜치 Preview 배포에 적용
- **Development**: `vercel dev` 로컬 실행 시 적용

### 환경별 달라지는 동작

| 기능 | Development/Preview | Production |
|------|---------------------|------------|
| 이메일 인증 | 바이패스 가능 | 필수 |
| 결제 체크 | 바이패스 가능 | 필수 |
| Gumroad 웹훅 테스트 | 사용 가능 | 실제 웹훅만 |
| API 타임아웃 | - | 60초 (Pro) |

---

## 3. DB 관리 전략

### 베타 단계: DB 1개 공유

```
로컬 / Preview  ──→  Supabase (ap-southeast-1)  ←──  Production
```

### 유저 유입 이후: DB 2개 분리

```
로컬 / Preview  ──→  Supabase (dev 프로젝트)
Production      ──→  Supabase (prod 프로젝트)
```

Vercel 환경 변수에서 Preview/Production에 다른 `DATABASE_URL`을 설정하면 자동 분리.

### 스키마 변경 시

```bash
# 1. shared/schema.ts 수정
# 2. 로컬에서 먼저 적용 & 테스트
npm run db:push
# 3. Production DB에도 적용 (배포 전)
DATABASE_URL=prod_url npm run db:push
```

---

## 4. Vercel 배포 순서

### 첫 배포

```
1. GitHub에 리포 push (이미 되어 있으면 skip)
2. vercel.com → New Project → GitHub 리포 연결
3. Framework Preset: Other
4. Build Command: npm run build
5. Output Directory: dist/public
6. Environment Variables 설정
7. Deploy 클릭
```

### 코드 변경 필요 (Serverless 어댑터)

| 순서 | 파일 | 변경 |
|------|------|------|
| 1 | `server/app.ts` | Express app 생성 + export (신규) |
| 2 | `server/index.ts` | app import + listen (로컬용) |
| 3 | `api/index.ts` | app import + export default (Vercel용, 신규) |
| 4 | `vercel.json` | 라우팅 + function 설정 (신규) |

### 배포 후 체크리스트

- [ ] `https://{도메인}/` 접속 확인
- [ ] Survey 제출 → 리포트 생성 확인 (타임아웃 안 나는지)
- [ ] 이메일 발송 확인
- [ ] Gumroad Ping URL 등록: `https://{도메인}/api/webhooks/gumroad`
- [ ] Gumroad 테스트 결제 → 잠금해제 확인
- [ ] PDF 다운로드 확인
- [ ] Preview 배포 동작 확인 (feature 브랜치 push 시)

---

## 5. 배포 이후 코드 변경 플로우

```
feature 브랜치 push
    │
    ▼
Vercel Preview 자동 배포 (임시 URL)
    │
    ▼
Preview URL에서 테스트
    │
    ▼
main에 머지 (PR merge 또는 직접)
    │
    ▼
Vercel Production 자동 재배포
    │
    ▼
상용 반영 확인
```

**롤백**: Vercel Dashboard → Deployments → 이전 배포 선택 → "Promote to Production"

---

## 6. 비용

| 항목 | Free | Pro ($20/월) |
|------|------|-------------|
| 빌드 | 6000분/월 | 24000분/월 |
| Serverless 실행 | 100GB-시간 | 1000GB-시간 |
| **Function 타임아웃** | **10초** | **60초** |
| 대역폭 | 100GB | 1TB |
| Preview 배포 | 무제한 | 무제한 |

**AI 리포트 생성(10~30초)** 때문에 **Pro 플랜이 사실상 필수**.
Free로 시작하되, assessment submit에서 타임아웃 나면 즉시 Pro 전환.

---

## 7. 보안 체크리스트 (배포 전 필수)

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] Git history에 시크릿이 노출되지 않았는지 확인
- [ ] Vercel 환경 변수에 시크릿 등록 (Dashboard에서만 관리)
- [ ] Gumroad 웹훅 서명 검증 고려
- [ ] HTTPS 강제 (Vercel은 기본 제공)

---

## 📎 요약: 지금 당장 할 것

| 순서 | 할 일 |
|------|-------|
| 1 | 서버 코드 리팩토링 (`app.ts` 분리, `api/index.ts` 생성) |
| 2 | `vercel.json` 생성 |
| 3 | GitHub에 push |
| 4 | Vercel에서 프로젝트 생성 & GitHub 연결 |
| 5 | Vercel 환경 변수 설정 |
| 6 | 배포 & 동작 확인 |
| 7 | Gumroad Ping URL 등록 |
| 8 | (선택) 커스텀 도메인 연결 |

---

## ✋ Human Review Required

**승인 상태:** [ ] 대기 중 / [ ] 승인됨 / [ ] 수정 필요

**승인자 의견:**
```
```
