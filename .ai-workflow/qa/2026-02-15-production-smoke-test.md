# QA Report: 상용 배포 후 Smoke Test 시나리오

**Date:** 2026-02-15
**Tester:** [ ] Claude / [ ] Human
**Plan Reference:** [plans/2026-01-31-[INFRA]-deployment-strategy.md](../plans/2026-01-31-[INFRA]-deployment-strategy.md)
**QA Status:** [ ] Pass / [ ] Pass with Issues / [ ] Fail

---

## 테스트 환경

| 항목 | 값 |
|------|-----|
| 배포 URL | `https://{production-domain}` |
| 브라우저 | Chrome (latest), Safari (latest), Mobile Safari |
| DB | Supabase PostgreSQL (ap-southeast-1) |
| NODE_ENV | `production` |

---

## Phase 1: 인프라 & 기본 접근성

> 배포 직후 가장 먼저 확인. 여기서 실패하면 이후 테스트 무의미.

### 1-1. 프론트엔드 정적 파일 서빙

- **URL:** `GET /`
- **Expected:** 랜딩 페이지 정상 렌더링, Vite 빌드 에셋 로드 완료
- **확인 포인트:**
  - [ ] HTML 로드 (빈 화면 아닌지)
  - [ ] CSS 적용됨 (스타일 깨짐 없는지)
  - [ ] JS 번들 로드 (콘솔에 chunk 404 없는지)
  - [ ] 폰트/이미지 정상 표시
- **Status:** [ ] Pass / [ ] Fail

### 1-2. API 헬스 체크

- **URL:** `GET /api/debug/reports`
- **Expected:** DB 연결 정상이면 JSON 응답 반환
- **확인 포인트:**
  - [ ] 200 응답 (500이면 DB 연결 실패)
  - [ ] JSON 파싱 가능
- **Status:** [ ] Pass / [ ] Fail

### 1-3. 보안 헤더 확인

- **URL:** 아무 페이지 응답 헤더
- **Expected:** Helmet이 적용한 보안 헤더 존재
- **확인 포인트:**
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options` 존재
  - [ ] `Strict-Transport-Security` 존재 (HTTPS)
- **방법:** 브라우저 DevTools → Network → Response Headers
- **Status:** [ ] Pass / [ ] Fail

### 1-4. CORS 설정

- **Expected:** 허용된 origin만 API 접근 가능
- **확인 포인트:**
  - [ ] 프론트엔드 → API 호출 시 CORS 에러 없음
  - [ ] 외부 origin에서 API 호출 시 차단됨
- **Status:** [ ] Pass / [ ] Fail

### 1-5. 정적 페이지 라우팅

- **확인 포인트:**
  - [ ] `/faq` 정상 렌더링
  - [ ] `/privacy` 정상 렌더링
  - [ ] `/terms` 정상 렌더링
  - [ ] `/coming-soon` 정상 렌더링
  - [ ] 존재하지 않는 경로 → SPA fallback (index.html 반환, 404 페이지 없어도 OK)
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 2: 핵심 유저 플로우 (Happy Path)

> 실제 유저 여정 전체를 순서대로 테스트.

### 2-1. 랜딩 → 서베이 진입

- **시작:** `/` (랜딩 페이지)
- **액션:** CTA 버튼 클릭
- **Expected:** `/survey`로 이동, 첫 번째 질문 표시
- **확인 포인트:**
  - [ ] CTA 버튼 클릭 가능
  - [ ] `/survey` 페이지 정상 렌더링
  - [ ] Q1 질문 + 4개 선택지 표시
- **Status:** [ ] Pass / [ ] Fail

### 2-2. 서베이 8문항 완료

- **액션:** Q1~Q8 모두 응답
- **Expected:** 각 질문 전환 애니메이션 정상, 진행률 표시
- **확인 포인트:**
  - [ ] 선택지 클릭 시 다음 질문으로 전환
  - [ ] 프로그레스 바 업데이트
  - [ ] 뒤로가기 가능 (이전 질문으로)
  - [ ] Q8 완료 후 생년월일 입력 폼으로 전환
- **Status:** [ ] Pass / [ ] Fail

### 2-3. 생년월일 & 개인정보 입력

- **액션:** 이름, 성별, 이메일, 생년월일, 출생시간, 출생지, 언어 입력
- **테스트 데이터:**
  ```
  이름: Test User
  성별: female
  이메일: (실제 수신 가능한 이메일)
  생년월일: 1996-09-18
  출생시간: 14:30
  출생도시: Seoul
  국가: South Korea
  Timezone: Asia/Seoul
  언어: ko
  ```
- **확인 포인트:**
  - [ ] 모든 필수 필드 입력 가능
  - [ ] 날짜 범위 제한 동작 (1900~2025)
  - [ ] 출생시간 "모름" 체크 가능
  - [ ] 도시 입력 시 자동완성/검색 동작 (있다면)
  - [ ] Submit 버튼 활성화
- **Status:** [ ] Pass / [ ] Fail

### 2-4. 리포트 생성 (핵심)

- **액션:** Submit 클릭
- **Expected:** 로딩 화면 표시 → 완료 후 `/wait/:reportId`로 이동
- **확인 포인트:**
  - [ ] 로딩/생성 중 화면(GeneratingScreen) 표시
  - [ ] 10~30초 내 완료 (타임아웃 안 남)
  - [ ] 서버 로그에 `[Assessment]` 단계별 로그 정상 출력
  - [ ] 완료 후 wait 페이지로 리다이렉트
  - [ ] 에러 시 에러 메시지 + 재시도 버튼 표시
- **Status:** [ ] Pass / [ ] Fail
- **소요 시간:** ____초

### 2-5. 이메일 수신 & 인증

- **Expected:** 입력한 이메일로 인증 메일 도착
- **확인 포인트:**
  - [ ] 이메일 수신됨 (스팸함도 확인)
  - [ ] 발신자: `noreply-verify@bada.one` (또는 폴백 주소)
  - [ ] 인증 링크 포함
  - [ ] 링크 클릭 시 `/results/:reportId`로 리다이렉트
  - [ ] 이메일 HTML 렌더링 정상 (깨짐 없음)
- **Status:** [ ] Pass / [ ] Fail
- **수신 소요 시간:** ____초

### 2-6. Wait 페이지 동작

- **URL:** `/wait/:reportId`
- **Expected:** 인증 대기 UI, 폴링 동작
- **확인 포인트:**
  - [ ] "이메일 확인해주세요" 안내 표시
  - [ ] 이메일 주소 마스킹 표시
  - [ ] "재전송" 버튼 존재
  - [ ] 재전송 클릭 시 60초 쿨다운 타이머 표시
  - [ ] 다른 탭에서 인증 완료 → 이 탭 자동 리다이렉트 (5초 폴링)
- **Status:** [ ] Pass / [ ] Fail

### 2-7. 무료 리포트 열람

- **URL:** `/results/:reportId`
- **Expected:** V3 카드 형식, 무료 3장 + 잠금 카드 표시
- **확인 포인트:**
  - [ ] Hook 카드 (질문) 정상 표시
  - [ ] Mirror 카드 정상 표시
  - [ ] Blueprint 카드 정상 표시
  - [ ] 카드 간 스크롤 스냅 동작
  - [ ] 잠금 카드에 결제 버튼 표시
  - [ ] 리포트 언어가 요청한 언어(ko)로 생성됨
- **Status:** [ ] Pass / [ ] Fail

### 2-8. 결제 & 전체 리포트 잠금 해제

- **액션:** "Unlock Full Report" 클릭 → Gumroad 결제
- **Expected:** 결제 완료 → 웹훅 → 잠금 해제 → 전체 카드 표시
- **확인 포인트:**
  - [ ] Gumroad 체크아웃 페이지/오버레이 정상 열림
  - [ ] `report_id`가 URL 파라미터로 전달됨
  - [ ] 결제 완료 후 웹훅 수신 (서버 로그 확인)
  - [ ] DB에 `isPaid = true` 반영
  - [ ] 페이지 새로고침 시 전체 10장 카드 표시
  - [ ] Collision, Evidence, Energy, Cost 카드들 정상 렌더링
  - [ ] Chapter, Year, Action, Closing 카드 정상 렌더링
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 3: 대체 경로 & 엣지 케이스

### 3-1. 출생시간 모름으로 제출

- **Input:** `birthTimeUnknown: true`, 출생시간 미입력
- **Expected:** 리포트 정상 생성 (시주 제외)
- **확인 포인트:**
  - [ ] Submit 성공
  - [ ] 리포트에 시간 관련 데이터 "모름" 처리됨
  - [ ] HD API에 12:00 기본값으로 전달 (서버 로그)
  - [ ] 리포트 내용에 시간 미상 반영
- **Status:** [ ] Pass / [ ] Fail

### 3-2. 동일 이메일 재제출

- **Input:** 이미 리포트가 있는 이메일로 다시 서베이 제출
- **Expected:** 새 리포트 생성 (현재 중복 방지 없음)
- **확인 포인트:**
  - [ ] 두 번째 리포트 정상 생성
  - [ ] 기존 리포트 접근 가능 여부 확인
  - [ ] 이메일 인증 상태 유지됨 (이미 인증된 경우)
- **Status:** [ ] Pass / [ ] Fail

### 3-3. 이메일 주소 수정 (오타 수정)

- **시작:** `/wait/:reportId` 페이지
- **액션:** "이메일 수정" 클릭 → 새 이메일 입력
- **Expected:** 새 이메일로 인증 메일 재발송
- **확인 포인트:**
  - [ ] 이메일 수정 UI 표시
  - [ ] 새 이메일 입력 후 제출
  - [ ] 새 이메일로 인증 메일 수신
  - [ ] 기존 토큰 무효화 (새 토큰 발급)
- **Status:** [ ] Pass / [ ] Fail

### 3-4. 인증 링크 만료/무효

- **Input:** 잘못된 token 값으로 `/api/verify?token=invalid&id=xxx` 접근
- **Expected:** `/verification-failed` 페이지로 리다이렉트
- **확인 포인트:**
  - [ ] 에러 사유 표시 (`expired` 또는 `invalid`)
  - [ ] 홈으로 돌아가기 버튼 동작
- **Status:** [ ] Pass / [ ] Fail

### 3-5. 코드 입력으로 잠금 해제

- **시작:** `/results/:reportId` 잠금 카드
- **Input:** 유효한 코드 입력
- **Expected:** 즉시 잠금 해제
- **확인 포인트:**
  - [ ] 코드 입력 필드 존재
  - [ ] 유효한 코드 → 잠금 해제, 전체 카드 표시
  - [ ] 무효한 코드 → `INVALID_CODE` 에러 메시지
  - [ ] 이미 사용된 코드 → `ALREADY_USED` 에러 메시지
  - [ ] 이미 결제된 리포트 → `ALREADY_UNLOCKED` 메시지
- **Status:** [ ] Pass / [ ] Fail

### 3-6. 미인증 상태에서 결과 URL 직접 접근

- **Input:** 이메일 인증 전 `/results/:reportId` 직접 접근
- **Expected:** `/wait/:reportId`로 리다이렉트 (production에서는 인증 필수)
- **확인 포인트:**
  - [ ] 403 응답 또는 wait 페이지로 리다이렉트
  - [ ] 리포트 내용 노출 안 됨
- **Status:** [ ] Pass / [ ] Fail

### 3-7. 존재하지 않는 리포트 접근

- **Input:** `/results/nonexistent-uuid`
- **Expected:** 404 에러 처리
- **확인 포인트:**
  - [ ] "리포트를 찾을 수 없습니다" 메시지 표시
  - [ ] 500 에러가 아닌 적절한 에러 처리
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 4: 외부 서비스 연동 검증

### 4-1. Gemini AI 응답 품질

- **확인 포인트:**
  - [ ] 리포트 텍스트가 요청 언어로 생성됨
  - [ ] 10장 카드 모두 내용 존재 (빈 카드 없음)
  - [ ] 할루시네이션 없음 (이름, 생년월일 정확히 반영)
  - [ ] 카드 간 내용 일관성 (모순 없음)
- **Status:** [ ] Pass / [ ] Fail

### 4-2. HD API 데이터 정합성

- **확인 포인트:**
  - [ ] HD 타입 정보 리포트에 반영 (Generator, Projector 등)
  - [ ] 프로필 번호 정확
  - [ ] 전략/권위 정보 포함
- **Status:** [ ] Pass / [ ] Fail

### 4-3. Gumroad 웹훅 수신

- **방법:** 실제 테스트 결제 후 확인
- **확인 포인트:**
  - [ ] 웹훅 엔드포인트 `/api/webhooks/gumroad` 도달 (서버 로그)
  - [ ] `report_id` 파라미터 정상 전달
  - [ ] DB `isPaid` 즉시 업데이트
  - [ ] Gumroad Dashboard에서 Ping URL 정상 등록 확인
- **Status:** [ ] Pass / [ ] Fail

### 4-4. Resend 이메일 발신 도메인

- **확인 포인트:**
  - [ ] 발신자 주소가 커스텀 도메인 (`@bada.one`)
  - [ ] SPF/DKIM 인증 통과 (스팸함 안 가는지)
  - [ ] Gmail, Naver, Outlook 등 주요 메일 서비스에서 수신 확인
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 5: 성능 & 안정성

### 5-1. 리포트 생성 소요 시간

- **측정 방법:** Submit 시점 ~ 완료 시점 (서버 로그 타임스탬프)
- **기준:**
  - [ ] 30초 이내 완료 (Vercel Pro 60초 한도 대비 여유)
  - [ ] 타임아웃 에러 없음
- **실측:** ____초
- **Status:** [ ] Pass / [ ] Fail

### 5-2. 결과 페이지 로드 성능

- **측정 방법:** DevTools → Network → 전체 로드 시간
- **기준:**
  - [ ] 초기 로드 3초 이내
  - [ ] API 응답 (`/api/results/:id`) 1초 이내
- **실측:** ____초
- **Status:** [ ] Pass / [ ] Fail

### 5-3. Rate Limiting 동작

- **테스트:** `/api/assessment` 15분 내 11회 요청
- **Expected:** 11번째 요청에서 429 응답
- **확인 포인트:**
  - [ ] 10회까지 정상 응답
  - [ ] 11회째 `Too many requests` 메시지
  - [ ] 일반 API는 100회 한도 별도 적용
- **Status:** [ ] Pass / [ ] Fail

### 5-4. Cold Start 지연 (Vercel Serverless)

- **테스트:** 30분 이상 유휴 후 첫 API 요청
- **기준:**
  - [ ] Cold start 포함 5초 이내 응답
  - [ ] 이후 요청은 1초 이내
- **실측 (cold):** ____초
- **실측 (warm):** ____초
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 6: 모바일 & 크로스 브라우저

### 6-1. 모바일 (iOS Safari)

- **확인 포인트:**
  - [ ] 랜딩 페이지 레이아웃 정상
  - [ ] 서베이 선택지 터치 반응 정상
  - [ ] 생년월일 입력 (모바일 date picker)
  - [ ] 리포트 카드 세로 스크롤 스냅 동작
  - [ ] 결제 버튼 터치 → Gumroad 이동
- **Status:** [ ] Pass / [ ] Fail

### 6-2. 모바일 (Android Chrome)

- **확인 포인트:**
  - [ ] 위 iOS 항목과 동일하게 확인
  - [ ] 안드로이드 특화 키보드/입력 이슈 없는지
- **Status:** [ ] Pass / [ ] Fail

### 6-3. 데스크탑 Safari

- **확인 포인트:**
  - [ ] 전체 플로우 동작
  - [ ] Framer Motion 애니메이션 정상
  - [ ] 스크롤 스냅 동작
- **Status:** [ ] Pass / [ ] Fail

### 6-4. 데스크탑 Firefox

- **확인 포인트:**
  - [ ] 전체 플로우 동작
  - [ ] 레이아웃 깨짐 없음
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 7: 다국어 리포트

### 7-1. 한국어 (ko) 리포트

- **Input:** `language: "ko"`
- **확인 포인트:**
  - [ ] 10장 카드 모두 한국어
  - [ ] 자연스러운 한국어 (기계 번역 느낌 아닌지)
  - [ ] 사주 용어 한국어로 표기
- **Status:** [ ] Pass / [ ] Fail

### 7-2. 영어 (en) 리포트

- **Input:** `language: "en"`
- **확인 포인트:**
  - [ ] 10장 카드 모두 영어
  - [ ] 문법/스펠링 이상 없음
- **Status:** [ ] Pass / [ ] Fail

### 7-3. 인도네시아어 (id) 리포트

- **Input:** `language: "id"`
- **확인 포인트:**
  - [ ] 10장 카드 모두 인도네시아어
- **Status:** [ ] Pass / [ ] Fail

---

## Phase 8: Production 전용 동작 확인

> Development 모드와 달라지는 동작들.

### 8-1. 이메일 인증 강제 (dev bypass 비활성화)

- **Expected:** `NODE_ENV=production`에서는 인증 없이 결과 접근 불가
- **확인 포인트:**
  - [ ] 미인증 유저 `/results/:id` 접근 → 403/리다이렉트
  - [ ] Wait 페이지에서 dev bypass 작동 안 함
- **Status:** [ ] Pass / [ ] Fail

### 8-2. Gumroad 테스트 엔드포인트 비활성화

- **Input:** `POST /api/webhooks/gumroad/test` 호출
- **Expected:** production에서 접근 불가 또는 무응답
- **확인 포인트:**
  - [ ] 테스트 웹훅 엔드포인트 차단됨
  - [ ] 실제 Gumroad 웹훅만 동작
- **Status:** [ ] Pass / [ ] Fail

### 8-3. 환경 변수 확인

- **방법:** 서버 로그 또는 `/api/debug/reports` 응답으로 간접 확인
- **확인 포인트:**
  - [ ] DB 연결 정상 (Supabase production)
  - [ ] Gemini API 키 유효
  - [ ] HD API 키 유효
  - [ ] Resend API 키 유효 + 커스텀 도메인 발신
  - [ ] 시크릿이 클라이언트에 노출되지 않음 (소스/네트워크 탭 확인)
- **Status:** [ ] Pass / [ ] Fail

---

## 발견된 이슈

### Critical
- [ ] _(테스트 후 기록)_

### Warning
- [ ] _(테스트 후 기록)_

### Info
- [ ] _(테스트 후 기록)_

---

## QA 결과 요약

| Category | Pass | Fail | Total |
|----------|------|------|-------|
| Phase 1: 인프라 | 0 | 0 | 5 |
| Phase 2: Happy Path | 0 | 0 | 8 |
| Phase 3: 엣지 케이스 | 0 | 0 | 7 |
| Phase 4: 외부 서비스 | 0 | 0 | 4 |
| Phase 5: 성능 | 0 | 0 | 4 |
| Phase 6: 모바일/브라우저 | 0 | 0 | 4 |
| Phase 7: 다국어 | 0 | 0 | 3 |
| Phase 8: Production 전용 | 0 | 0 | 3 |
| **Total** | **0** | **0** | **38** |

---

## 테스트 우선순위 (시간 부족 시)

빠르게 끝내야 할 경우 아래 순서로 최소한 확인:

| 순위 | 시나리오 | 사유 |
|------|----------|------|
| 1 | 1-1, 1-2 | 페이지/API 접근 자체가 안 되면 전부 실패 |
| 2 | 2-4 | 리포트 생성 (타임아웃 여부 = Vercel 플랜 결정) |
| 3 | 2-5 | 이메일 발송 (Resend 도메인 인증 상태) |
| 4 | 2-7, 2-8 | 무료 열람 + 결제 잠금 해제 (매출 직결) |
| 5 | 8-1 | Production 인증 강제 (보안) |

---

## Human Review Required

**검토 상태:** [ ] 대기 중 / [ ] 승인됨 / [ ] 재작업 필요

**Human 의견:**
```
```

---

## 스크린샷 / 로그

```
(테스트 실행 후 여기에 첨부)
```
