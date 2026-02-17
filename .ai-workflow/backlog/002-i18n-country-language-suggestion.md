# 002: 국가 선택 시 언어 전환 제안

**작성일:** 2026-02-17
**상태:** Draft
**우선순위:** High — 인도네시아 유저가 영어로 리포트 생성하는 문제 확인됨

---

## 1. 문제

인도네시아 유저 대부분이 **영어 디바이스/브라우저** 사용 → `navigator.language`가 `"en"` 반환 → 전체 경험이 영어로 진행됨.

- 랜딩 페이지: 영어
- 서베이 질문: 영어
- 리포트 언어 기본값: English
- 리포트 생성: 영어

언어 토글은 Landing/FAQ **푸터에만** 존재해서 발견이 거의 불가능.

### 영향 범위
- 인도네시아 등 **영어 디바이스를 쓰는 비영어권 국가** (동남아 전반)
- 한국 유저는 대부분 한국어 디바이스 사용 → 문제 없음

---

## 2. 제안: 국가 선택 시 언어 전환 제안

### 핵심 아이디어
서베이 Birth Info 단계에서 **출생 국가를 선택하면**, 해당 국가의 언어와 현재 UI 언어가 다를 때 **전환 제안 토스트/배너** 표시.

### 플로우
```
유저가 Birth Country에서 "Indonesia" 선택
  ↓
현재 UI 언어 = English, 인도네시아 매핑 언어 = Indonesian
  ↓
배너/토스트 표시:
  "Ganti ke Bahasa Indonesia? / Switch to Indonesian?"
  [Ya / Yes]  [No thanks]
  ↓
"Ya" 클릭 시:
  1. UI 언어 → Indonesian (localStorage 저장)
  2. 리포트 언어 기본값 → Indonesian
  3. 서베이 질문이 인도네시아어로 전환
```

### 국가 → 언어 매핑 (초안)
```typescript
const COUNTRY_LANGUAGE_MAP: Record<string, UILanguage> = {
  ID: 'id',  // Indonesia
  MY: 'id',  // Malaysia (Malay ≈ Indonesian)
  KR: 'ko',  // South Korea
  // 기타 국가는 매핑 없음 → 제안 안 함
};
```

- 지원하는 UI 언어(EN/KO/ID)에 매핑되는 국가만 제안
- 매핑 없는 국가 → 아무것도 안 함 (현재 동작 유지)

---

## 3. 추가 개선 (선택)

### A. 리포트 언어 셀렉터 위치 조정
- 현재: 이메일 필드 밑에 묻혀있음
- 개선: 국가/도시 선택 바로 아래로 이동 → 국가 선택 직후 자연스럽게 인지

### B. 리포트 언어도 국가 기반 자동 매핑
- 국가 → 리포트 언어 기본값 변경 (UI 언어와 별개)
- 예: Indonesia 선택 → 리포트 언어 기본값 Indonesian
- REPORT_LANGUAGES에 있는 언어만 매핑

### C. Survey/Results 페이지에도 언어 토글 추가
- 현재 Landing/FAQ 푸터에만 존재
- Survey 상단이나 Results 페이지에도 간소한 토글 배치

---

## 4. 구현 범위

### MVP
- [ ] 국가 → UI 언어 매핑 테이블
- [ ] 국가 선택 시 언어 불일치 감지
- [ ] 전환 제안 토스트/배너 UI
- [ ] 수락 시 UI 언어 + 리포트 언어 기본값 동시 변경

### v2 (Optional)
- [ ] 리포트 언어 셀렉터 위치 조정
- [ ] Survey/Results 언어 토글 추가
- [ ] 국가 → 리포트 언어 매핑 확장 (일본, 중국 등)

---

## 5. 기술 요구사항

### 수정 파일
- `client/src/pages/Survey.tsx` — 국가 선택 onChange에 언어 제안 로직
- `client/src/lib/simple-i18n.ts` — 국가→언어 매핑 테이블 추가

### 난이도
- 프론트엔드 only (서버 변경 없음)
- 예상 작업량: 0.5일

---

## Changelog

| 날짜 | 변경 |
|------|------|
| 2026-02-17 | 초안 작성 — 인도네시아 유저 영어 리포트 생성 문제에서 발견 |
