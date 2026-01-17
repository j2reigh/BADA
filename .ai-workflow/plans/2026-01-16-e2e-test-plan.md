# E2E User Flow Test Plan

**작성일:** 2026-01-16
**목적:** 전체 사용자 플로우 테스트 케이스 정의
**상태:** Active

---

## 1. 실제 사용자 플로우 (정확한 순서)

```
Landing → Survey (8문항) → Birth Info 입력 →
Submit → [Saju 계산 + AI 리포트 생성] →
Wait 화면 → 이메일 인증 클릭 → Results 페이지 →
[무료: Page 1만] → 결제 or 코드 입력 → [전체 5페이지]
```

---

## 2. 테스트 환경

| 환경 | URL | 특이사항 |
|------|-----|----------|
| Local Dev | http://localhost:5001 | 이메일 인증 필수, 결제 필수 |
| Production | (TBD) | 모든 기능 활성화 |

### 개발 모드 우회 (주의)
- ❌ 이메일 인증 우회 없음 (실제 이메일 필요)
- ❌ 결제 우회 없음 (코드 사용 or Gumroad)
- ✅ Test Unlock 버튼 (NODE_ENV=development일 때만)

---

## 3. 테스트 케이스

### TC-01: Landing → Survey 진입 [P0]
**전제조건:** 서버 실행 중

| Step | Action | Expected |
|------|--------|----------|
| 1 | http://localhost:5001 접속 | 랜딩페이지 로드 |
| 2 | CTA 버튼 클릭 | /survey로 이동 |
| 3 | Survey 페이지 확인 | 첫 번째 질문 표시 |

---

### TC-02: Survey 8문항 완료 [P0]
**전제조건:** TC-01 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | Q1 답변 선택 | Q2로 이동 |
| 2 | Q2~Q7 답변 선택 | 순차 진행 |
| 3 | Q8 답변 선택 | Birth Info 입력 화면 표시 |

**검증 포인트:**
- [ ] 뒤로가기 시 이전 답변 유지
- [ ] 진행률 표시 정확

---

### TC-03: Birth Info 입력 & 제출 [P0]
**전제조건:** TC-02 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | 이름 입력 | "홍길동" |
| 2 | 성별 선택 | Male/Female/Other |
| 3 | 생년월일 입력 | 1990-05-15 |
| 4 | 출생시간 입력 (선택) | 14:30 또는 "모름" 체크 |
| 5 | 출생도시 검색 | "Seoul" 검색 → 선택 |
| 6 | 이메일 입력 | 실제 수신 가능한 이메일 |
| 7 | 마케팅 동의 체크 | 선택 |
| 8 | Submit 클릭 | 로딩 → Wait 페이지 이동 |

**검증 포인트:**
- [ ] 필수 필드 빈칸 시 에러 메시지
- [ ] 잘못된 이메일 형식 검증
- [ ] 도시 자동완성 작동

---

### TC-04: 리포트 생성 대기 [P0]
**전제조건:** TC-03 제출 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | Wait 페이지 표시 | 로딩 애니메이션 |
| 2 | 터미널 로그 확인 | Saju 계산 로그 |
| 3 | Gemini API 호출 | Page 1~5 순차 생성 |
| 4 | 완료 후 | 이메일 발송 안내 or 자동 이동 |

**터미널 예상 로그:**
```
[Assessment] Starting submission...
[Assessment] Converting to KST...
[Assessment] Calculating Saju...
[Gemini] Generating Page 1: Identity...
[Gemini] Generating Page 2: Hardware...
...
[Email] Verification email sent
```

**예상 소요 시간:** 30초~2분

---

### TC-05: 이메일 인증 [P0]
**전제조건:** TC-04 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | 이메일 수신 확인 | 제목: "Verify your email" |
| 2 | 인증 링크 클릭 | /verify?token=xxx |
| 3 | 인증 완료 | Results 페이지로 리다이렉트 |

**검증 포인트:**
- [ ] 스팸함 확인 필요할 수 있음
- [ ] 토큰 만료 시 재발송 가능 여부

---

### TC-06: Results 페이지 (무료) [P0]
**전제조건:** TC-05 인증 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | Results 페이지 로드 | /results/{reportId} |
| 2 | Page 1 (Identity) 확인 | 제목, 스냅샷 카드 표시 |
| 3 | Page 2~5 확인 | 🔒 잠금 상태 |
| 4 | CTA 섹션 확인 | $2.99 결제 버튼 + 코드 입력 필드 |

**Desktop (>768px) 레이아웃:**
- [ ] 좌측 60%: 스크롤 콘텐츠
- [ ] 우측 40%: 고정 패럴랙스 배경

**Mobile (<768px) 레이아웃:**
- [ ] 상단 40vh: 고정 비주얼
- [ ] 하단: 스크롤 콘텐츠

---

### TC-07: 코드로 잠금 해제 [P1]
**전제조건:** TC-06 완료, 유효한 코드 보유

| Step | Action | Expected |
|------|--------|----------|
| 1 | 코드 입력 필드에 입력 | "SHINE7190" |
| 2 | Apply 버튼 클릭 | 로딩 표시 |
| 3 | 성공 시 | 페이지 새로고침, 전체 5페이지 표시 |

**에러 케이스:**

| Input | Expected Error |
|-------|----------------|
| 빈 값 | 버튼 비활성화 |
| "WRONG123" | "Invalid code" |
| 이미 사용된 코드 | "This code has already been used" |

---

### TC-08: Gumroad 결제 [P1]
**전제조건:** TC-06 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | "Unlock Full Report - $2.99" 클릭 | Gumroad 오버레이 |
| 2 | 테스트 결제 진행 | 결제 완료 |
| 3 | Webhook 수신 | 터미널 로그 확인 |
| 4 | 페이지 새로고침 | 전체 5페이지 표시 |

---

### TC-09: PDF 다운로드 [P2]
**전제조건:** 결제 or 코드로 잠금 해제 완료

| Step | Action | Expected |
|------|--------|----------|
| 1 | "Download PDF" 버튼 클릭 | 로딩 표시 |
| 2 | PDF 생성 완료 | 파일 다운로드 |
| 3 | PDF 열기 | 5페이지 내용 포함 확인 |

---

## 4. 부정 테스트 (Negative Tests)

### TC-N01: 중복 제출 방지 [P1]
| Step | Action | Expected |
|------|--------|----------|
| 1 | 같은 이메일로 재제출 | 기존 리포트 반환 (24시간 내) |

### TC-N02: 잘못된 Report ID [P2]
| Step | Action | Expected |
|------|--------|----------|
| 1 | /results/invalid-id 접속 | 에러 페이지 표시 |

### TC-N03: 미인증 상태 Results 접근 [P1]
| Step | Action | Expected |
|------|--------|----------|
| 1 | 인증 전 Results URL 접속 | 에러 또는 인증 요청 |

---

## 5. 우선순위 정의

| Priority | 의미 | 테스트 시점 |
|----------|------|-------------|
| P0 | Critical Path | 매 배포 전 |
| P1 | Important | 주요 변경 시 |
| P2 | Nice to have | 여유 있을 때 |

---

## 6. 테스트 데이터

### 기본 테스트 유저
```json
{
  "name": "테스트유저",
  "gender": "male",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "city": "Seoul, South Korea",
  "email": "[실제 수신 가능한 이메일]"
}
```

### 생성된 테스트 코드 (50개 중 일부)
```
SHINE7190, BLOOM6355, DREAM2889, CROWN7799, MAGIC7290
OCEAN8356, POWER2610, THRIVE6391, WONDER9328, SPARK4135
```

---

## 7. 알려진 이슈

| 이슈 | 상태 | 비고 |
|------|------|------|
| routes.ts:593 타입 에러 | Open | db null 체크 관련, 기능 영향 없음 |

---

## 8. 자동화 로드맵

### Phase 1: API 테스트 (Vitest)
- [ ] /api/assessment/submit 엔드포인트
- [ ] /api/codes/redeem 엔드포인트
- [ ] /api/verify 엔드포인트

### Phase 2: E2E 테스트 (Playwright)
- [ ] TC-01 ~ TC-03 자동화
- [ ] TC-06 ~ TC-07 자동화

### Phase 3: CI/CD 연동
- [ ] GitHub Actions에 테스트 추가
- [ ] PR 머지 전 필수 통과

---

## Changelog

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-01-16 | 초기 작성 (기존 문서 전면 재작성) |
