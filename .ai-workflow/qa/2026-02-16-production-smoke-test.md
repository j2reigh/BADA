# QA Report: 상용 Smoke Test (2026-02-16)

**Date:** 2026-02-16
**Tester:** [x] Claude / [ ] Human
**QA Status:** [x] Pass with Issues

---

## 테스트 환경

| 항목 | 값 |
|------|-----|
| 배포 URL | `https://www.bada.one` (bada.one → www 307 redirect) |
| 테스트 방법 | CLI (curl) — 브라우저 테스트는 Human 필요 |
| 최신 커밋 | `b137fd7` (FAQ redesign + session retro) |

---

## Phase 1: 인프라 & 기본 접근성

### 1-1. 프론트엔드 정적 파일 서빙
- [x] HTML 로드: `GET /` → HTTP 200, 2,349 bytes
- [x] JS 번들 로드: `/assets/index-B5DHlfwM.js` → HTTP 200, 9.3MB
- [x] CSS 로드: `/assets/index-40A_mgfD.css` → HTTP 200, 120KB
- [x] GA4 스크립트 포함: `G-7J946D2YP4` 확인
- **Status:** PASS

### 1-2. API 헬스 체크
- [ ] `GET /api/debug/reports` → **HTTP 404**
- ⚠️ 디버그 엔드포인트 미존재 또는 API 번들 미갱신
- **Status:** WARN — 디버그용이라 서비스 영향 없음. 별도 health 엔드포인트 없음.

### 1-3. 보안 헤더
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: SAMEORIGIN`
- [x] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [x] `Content-Security-Policy: default-src 'none'`
- [x] `X-XSS-Protection: 0` (modern best practice)
- **Status:** PASS

### 1-4. CORS 설정
- [x] 외부 origin (`https://evil.com`) → CORS 헤더 없음 (차단됨)
- **Status:** PASS

### 1-5. 정적 페이지 라우팅
- [x] `/faq` → 200
- [x] `/privacy` → 200
- [x] `/terms` → 200
- [x] `/survey` → 200
- [x] `/this-does-not-exist` → 200 (SPA fallback 정상)
- **Status:** PASS

---

## Phase 2: 핵심 유저 플로우

### 2-1 ~ 2-4. 랜딩 → 서베이 → 리포트 생성
- ⏸️ **Human 테스트 필요** — 브라우저에서 실제 서베이 완료 + 리포트 생성 확인

### 2-5. 리포트 링크 이메일 (Option E)
- ⏸️ **Human 테스트 필요** — Submit 후 이메일 수신 확인
- 확인 항목:
  - [ ] 이메일 수신됨 (발신: `BADA <noreply@bada.one>`)
  - [ ] Subject: "Your BADA Report is Ready"
  - [ ] 리포트 링크 포함, 클릭 시 `/results/:id` 이동
  - [ ] HTML 렌더링 정상 (다크 테마)

### 2-6. 무료 리포트 열람
- ⏸️ **Human 테스트 필요** — 기존 리포트 URL 접속하여 확인
- 확인 항목:
  - [ ] Hook/Mirror/Blueprint 3장 정상 표시
  - [ ] 카드 스크롤 스냅 동작
  - [ ] LockCard 새 카피 표시 ("what you see ≠ what's there" / "보이는 나 ≠ 진짜 나")
  - [ ] 결제 버튼 → Gumroad 열림

### 2-7. 결제 & 잠금 해제
- ⏸️ **Human 테스트 필요** — 실제 결제 또는 코드 사용

---

## Phase 3: 엣지 케이스

### 3-5. 코드 입력
- [x] 무효 코드 → `{"success":false,"error":"INVALID_CODE","message":"Invalid code. Please check and try again."}` HTTP 400
- **Status:** PASS (에러 처리 정상)

### 3-7. 존재하지 않는 리포트
- [x] `/api/results/nonexistent-uuid-12345` → `{"message":"Failed to get results"}`
- ⚠️ 에러 메시지가 generic ("Failed to get results"). "Report not found" 가 더 명확하겠지만 동작은 정상.
- **Status:** PASS

### 삭제된 테스트 (더 이상 해당 없음)
- ~~3-3: 이메일 주소 수정~~ — Wait 페이지 삭제됨
- ~~3-4: 인증 링크 만료~~ — 인증 플로우 삭제됨
- ~~3-6: 미인증 접근 차단~~ — 인증 게이트 삭제됨

---

## Phase 4: 외부 서비스 연동

### 4-4. 삭제된 인증 엔드포인트 확인
- [x] `GET /api/verification/resend` → HTTP 404 (정상 삭제됨)
- **Status:** PASS

### 4-1 ~ 4-3. Gemini / HD API / Gumroad webhook
- ⏸️ **Human 테스트 필요** — 리포트 생성 + 결제로 간접 확인

---

## Phase 5: 성능 (Production 전용)

### 8-2. Gumroad 테스트 엔드포인트 차단
- [x] `POST /api/webhooks/gumroad/test` → HTTP 404 (차단됨)
- **Status:** PASS

---

## 결과 요약

| 항목 | 결과 |
|------|------|
| 1-1. 프론트엔드 서빙 | ✅ PASS |
| 1-2. API 헬스 체크 | ⚠️ WARN (debug endpoint 404) |
| 1-3. 보안 헤더 | ✅ PASS |
| 1-4. CORS | ✅ PASS |
| 1-5. 페이지 라우팅 | ✅ PASS |
| 3-5. 코드 입력 에러 처리 | ✅ PASS |
| 3-7. 존재하지 않는 리포트 | ✅ PASS |
| 4-4. 삭제된 인증 엔드포인트 | ✅ PASS |
| 8-2. 테스트 엔드포인트 차단 | ✅ PASS |
| GA4 스크립트 | ✅ PASS |

**CLI 테스트: 9/10 PASS, 1 WARN**

---

## Human 테스트 필요 항목

| 우선순위 | 항목 | 확인 방법 |
|----------|------|-----------|
| 1 | 서베이 → 리포트 생성 | 실제 Submit, 30초 내 완료 확인 |
| 2 | 리포트 링크 이메일 수신 | 실제 이메일 확인 (noreply@bada.one) |
| 3 | 무료 3장 + LockCard 카피 | 기존 리포트 URL 열어서 확인 |
| 4 | FAQ 6개 + Contact | /faq 페이지 확인 |
| 5 | 결제 → 잠금 해제 | Gumroad 결제 or 코드 사용 |
| 6 | 모바일 레이아웃 | iOS Safari에서 전체 플로우 |

---

## 발견된 이슈

### Warning
- `/api/debug/reports` 404 — API 번들이 최신 서버 코드를 반영하지 않을 가능성. `npm run build` → `api/index.js` 재커밋 필요할 수 있음.

### Info
- `bada.one` → `www.bada.one` 307 리다이렉트 정상 동작
- 비존재 리포트 에러 메시지가 generic ("Failed to get results") — 개선 가능하나 기능상 문제 없음
