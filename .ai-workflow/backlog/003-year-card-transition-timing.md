# 003: YearCard 연도 전환 타이밍

**작성일:** 2026-02-18
**상태:** Draft
**우선순위:** Low — 2026년 10월쯤 착수
**예상 착수:** 2026-10

---

## 1. 문제

YearCard에서 `new Date().getFullYear()` 사용 중. 12월에 "2026년 이렇게 살아라"는 유저에게 무의미.

## 2. 제안

- **11월 1일부터** 다음 해 세운 기반으로 전환
- 10월까지: "2026 — WHAT TO DO NOW"
- 11월부터: "2027 — WHAT'S COMING"
- Gemini 프롬프트에도 다음 해 세운 데이터 전달
- 사주 입춘(立春, ~2월 3-4일) 기준 vs 양력 11월 전환은 별개: 계산은 입춘 기준, 표시는 11월 전환

## 3. 수정 대상

- `client/src/pages/ResultsV3.tsx`: YearCard 연도 라벨
- `lib/gemini_client.ts`: 프롬프트에 전달하는 세운 연도
- `lib/behavior_translator.ts`: `calculateLuckCycle()` 세운 계산 연도

## 4. 참고

- 점술/운세 서비스 대부분 11~12월에 내년 운세로 전환
- $29 프리미엄 리포트 출시 시점과 맞물릴 수 있음 (연말 = 내년 계획 수요)
