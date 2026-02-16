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

### 브랜치 vs Main 직통 기준 (Preview URL 찍먹 전략)

> Main 보호 = 내 멘탈 보호. 유저 없어도 배포 터지면 몰입 깨진다.

| 작업 종류 | 방식 | 이유 |
|-----------|------|------|
| **Config 수정** (vercel.json, package.json, 빌드 스크립트) | **무조건 브랜치** | 배포 터질 확률 99%. Preview URL에서 먼저 확인 |
| **큰 기능 추가** | **브랜치 권장** | 코드 꼬였을 때 브랜치 버리는 게 reset보다 빠름 |
| **UI/텍스트/CSS 수정** | **Main 직통** | 에러 날 확률 적음. 바로 커밋 & 푸시 |

### 작업 흐름

**브랜치 작업 (Config/큰 기능):**
```bash
# 1. 브랜치 생성
git switch -c feat/bundling-fix

# 2. 작업 & 커밋 & 푸시
git push origin feat/bundling-fix
# → Vercel이 Preview URL 자동 생성. 들어가서 확인.

# 3. 잘 되면 바로 합치기
git switch main
git merge feat/bundling-fix
git push origin main
# → Production 자동 재배포

# 4. 브랜치 정리
git branch -d feat/bundling-fix
```

**Main 직통 (UI/텍스트):**
```bash
git add <files> && git commit -m "fix: ..."
git push origin main
# → Production 바로 반영
```

### Claude 작업 규칙

- 커밋까지만 한다. **push는 유저가 직접** 하거나 명시적으로 요청했을 때만.
- Config/빌드 수정이 포함되면 **먼저 브랜치 생성** 후 진행.
- UI/텍스트 수정은 main에 바로 커밋 OK.

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

## 8. Contingency Plan (배포 장애 대응)

> **최종 업데이트:** 2026-02-15 (배포 직전 점검)

### 8-1. 배포 실패 시 즉시 롤백

| 시나리오 | 대응 | 소요 시간 |
|----------|------|-----------|
| Vercel 빌드 실패 | 이전 Production 배포가 유지됨 (자동). 빌드 로그 확인 후 수정 | 0분 (무중단) |
| 배포 성공했지만 런타임 에러 | Vercel Dashboard → Deployments → 직전 배포 "Promote to Production" | ~1분 |
| 환경 변수 누락/오설정 | Vercel Dashboard → Settings → Environment Variables에서 수정 후 Redeploy | ~2분 |
| DB 스키마 불일치 | 롤백 불가 → 아래 DB 섹션 참고 | 상황별 |

**롤백 절차:**
```
1. 장애 감지 (모니터링 or 수동 확인)
2. Vercel Dashboard → Deployments 탭
3. 마지막 정상 배포 찾기 (초록색 ✓)
4. ··· 메뉴 → "Promote to Production"
5. 30초 내 이전 버전으로 복원
6. 원인 분석 후 핫픽스 브랜치에서 수정
```

### 8-2. 외부 서비스 장애 대응

#### Gemini AI API 장애 (리포트 생성 불가)

| 증상 | `POST /api/assessment/submit` 500 에러, 타임아웃 |
|------|--------------------------------------------------|
| 영향 | 신규 리포트 생성 완전 중단 (핵심 기능) |
| 감지 | 서버 로그 `[Assessment]` 에러, Gemini API 상태 페이지 확인 |
| 즉시 대응 | 사용자에게 "잠시 후 다시 시도해주세요" 안내 표시 |
| 단기 대응 | Gemini API 키 로테이션 시도 (할당량 초과인 경우) |
| 중기 대응 | 대체 모델 엔드포인트 준비 (gemini-2.0-flash → gemini-1.5-pro 폴백) |

```
현재 코드 위치: lib/gemini_client.ts
모니터링: https://status.cloud.google.com/
```

#### Supabase DB 장애

| 증상 | 전체 API 500 에러, DB 연결 타임아웃 |
|------|--------------------------------------|
| 영향 | 서비스 전체 중단 (모든 읽기/쓰기 불가) |
| 감지 | Supabase Dashboard → Health, 서버 로그 connection refused |
| 즉시 대응 | Supabase 상태 페이지 확인 → 인프라 장애면 대기 |
| 단기 대응 | DB connection pool 재시작 (Vercel 함수 재배포로 해결) |
| 복구 불가 시 | Supabase 프로젝트 재생성 + 백업 복원 |

```
DB 리전: ap-southeast-1
모니터링: https://status.supabase.com/
백업: Supabase Dashboard → Database → Backups (자동 일일 백업)
```

#### Resend 이메일 장애

| 증상 | 인증 이메일 미발송, `sendVerificationEmail` 에러 |
|------|--------------------------------------------------|
| 영향 | 신규 유저 이메일 인증 불가 (리포트 열람은 가능) |
| 감지 | 서버 로그 이메일 발송 에러, Resend Dashboard 확인 |
| 즉시 대응 | 현재 코드에서 이메일 실패가 submit을 블로킹하지 않음 → 리포트 생성은 계속 작동 |
| 단기 대응 | Resend API 키 확인, 발신 도메인 DNS 상태 확인 |
| 대안 | `RESEND_FROM_EMAIL`을 `onboarding@resend.dev`(무료 테스트용)로 임시 전환 |

```
현재 코드 위치: lib/email.ts
현재 폴백: noreply-verify@bada.one → onboarding@resend.dev
모니터링: https://resend.com/overview (Dashboard)
```

#### Gumroad 웹훅 장애

| 증상 | 결제 완료 후 리포트 잠금 해제 안 됨 |
|------|--------------------------------------|
| 영향 | 결제한 유저가 리포트를 볼 수 없음 (매출 직결) |
| 감지 | 유저 클레임, Gumroad Sales 로그 vs DB `isPaid` 불일치 |
| 즉시 대응 | DB에서 수동 잠금 해제 (아래 쿼리) |
| 단기 대응 | Gumroad Dashboard → Ping 재전송 시도 |
| 재발 방지 | 웹훅 수신 로그 테이블 추가, 일일 정산 크로스체크 스크립트 |

```sql
-- 긴급 수동 잠금 해제 (Supabase SQL Editor)
UPDATE saju_results
SET is_paid = true, updated_at = NOW()
WHERE id = '{report_id}';
```

#### HD (Human Design) API 장애

| 증상 | HD 차트 데이터 조회 실패 |
|------|--------------------------|
| 영향 | 리포트에 HD 데이터 누락 (부분 장애) |
| 감지 | 서버 로그 HD API 에러 |
| 즉시 대응 | HD 데이터 없이 사주 기반 리포트만 생성되는지 확인 |
| 단기 대응 | HD API 키 상태 확인, 요청 형식 검증 |

```
현재 코드 위치: lib/hd_client.ts
```

### 8-3. Vercel 특화 장애

#### Serverless Function 타임아웃 (10초/60초)

| 시나리오 | 대응 |
|----------|------|
| Free 플랜 10초 초과 | **즉시 Pro 플랜 전환** ($20/월, 60초 한도) |
| Pro 플랜 60초 초과 | Gemini 모델을 더 빠른 모델로 전환 (flash → flash-lite) |
| 지속적 타임아웃 | 리포트 생성을 비동기 처리로 전환 (큐 기반) |

#### Cold Start 지연

| 증상 | 첫 요청이 2~5초 느림 |
|------|------------------------|
| 대응 | Vercel Cron으로 5분마다 `/api/health` ping (워밍업) |
| vercel.json 추가 | `"crons": [{ "path": "/api/health", "schedule": "*/5 * * * *" }]` |

### 8-4. 데이터 복구

#### DB 백업 & 복원

```
Supabase 자동 백업:
- Free: 일일 백업 7일 보관
- Pro: 일일 백업 30일 보관 + Point-in-Time Recovery

복원 절차:
1. Supabase Dashboard → Database → Backups
2. 복원 시점 선택
3. "Restore" 클릭 (다운타임 수분 발생)
```

#### 리포트 데이터 유실 시

```sql
-- 최근 생성된 리포트 확인
SELECT id, lead_id, created_at, is_paid
FROM saju_results
ORDER BY created_at DESC
LIMIT 20;

-- 특정 유저 리포트 복구 확인
SELECT l.email, s.id as report_id, s.created_at
FROM leads l
JOIN saju_results s ON l.id = s.lead_id
WHERE l.email = '{user_email}';
```

### 8-5. 보안 인시던트 대응

| 시나리오 | 즉시 대응 |
|----------|-----------|
| API 키 노출 | 해당 서비스에서 키 즉시 로테이션 → Vercel 환경 변수 업데이트 → Redeploy |
| DB 크레덴셜 노출 | Supabase에서 DB 패스워드 변경 → `DATABASE_URL` 업데이트 → Redeploy |
| 웹훅 악용 (가짜 결제) | 웹훅 엔드포인트 임시 비활성화 → 비정상 `isPaid` 레코드 롤백 → 서명 검증 구현 |
| DDoS/과다 트래픽 | Vercel 자체 DDoS 보호 + Rate Limiting 임계치 하향 조정 |

**키 로테이션 체크리스트:**
```
[ ] Gemini API Key → Google AI Studio에서 재발급
[ ] Resend API Key → Resend Dashboard에서 재발급
[ ] HD API Key → HD API 서비스에서 재발급
[ ] Supabase DB Password → Supabase Dashboard → Settings → Database
[ ] Vercel 환경 변수 전부 업데이트
[ ] Redeploy 트리거
```

### 8-6. 커뮤니케이션 플랜

| 장애 등급 | 기준 | 대응 |
|-----------|------|------|
| P0 (긴급) | 서비스 완전 중단, 결제 유저 영향 | 15분 내 대응 시작, 유저 개별 안내 |
| P1 (높음) | 리포트 생성 불가 (Gemini 장애 등) | 1시간 내 대응, 서비스 공지 |
| P2 (보통) | 이메일 미발송, Preview 배포 실패 | 당일 내 대응 |
| P3 (낮음) | UI 깨짐, 비핵심 기능 오류 | 다음 배포 사이클에 수정 |

### 8-7. 배포 전 최종 체크리스트 (Go/No-Go)

```
배포 판단 기준 — 모두 ✓ 여야 Go:

[ ] 로컬 빌드 성공 (npm run build 에러 없음)
[ ] 로컬 테스트 통과 (서베이 제출 → 리포트 생성 → 이메일)
[ ] 환경 변수 Vercel에 전부 등록 확인
[ ] .env 파일 .gitignore에 포함 확인
[ ] Git history에 시크릿 미노출 확인
[ ] Supabase DB 접속 정상 확인
[ ] Gemini API 할당량 여유 확인
[ ] Resend 발신 도메인 DNS 정상 확인
[ ] 롤백 절차 숙지 완료
```

---

## ✋ Human Review Required

**승인 상태:** [ ] 대기 중 / [ ] 승인됨 / [ ] 수정 필요

**승인자 의견:**
```
```
