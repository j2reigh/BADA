# 001: 만료 후 이메일 리마인더

**작성일:** 2026-01-17
**상태:** Draft
**우선순위:** TBD

---

## 1. 기능 설명

리포트 유효기간 만료 **1주 후** 재측정 권유 이메일 발송

```
Subject: Your Blueprint has expired - time for a fresh look?

Hi {name},

Your BADA Blueprint was created on {surveyDate} and has now expired.

A lot can change in {validityWeeks} weeks. Your circumstances,
energy levels, and life direction may have shifted.

Ready to see where you stand now?

[Take the Survey Again →]

---
Why re-assess?
• Your Operating Level may have improved (or needs attention)
• Life changes affect your Hardware-OS alignment
• Fresh insights for your current chapter

Best,
BADA Team
```

---

## 2. 왜 필요한가?

### Problem
- 유저가 리포트 받고 잊어버림
- 재방문 동기 없음
- 상태 변화 tracking 불가

### Solution
- 만료 후 자연스러운 재참여 유도
- "지금 상태"에 대한 호기심 자극
- 장기 관계 구축

---

## 3. 예상 임팩트

### Retention
- 재방문율 증가 (추정 +15~25%)
- 리포트 2회차 이상 유저 확보
- 장기 engagement 데이터 수집

### Revenue (간접)
- 재방문 → 추가 결제 기회
- "비교 리포트" 프리미엄 가능성
- 친구 추천 trigger

### Data
- 시간에 따른 변화 tracking
- 모델 검증 데이터 확보
- "어떤 유저가 개선되는가" 패턴 발견

---

## 4. RICE 평가

| 항목 | 점수 | 근거 |
|------|------|------|
| **Reach** | High | 모든 paid 유저 대상 |
| **Impact** | Medium (1) | 재방문 유도, 직접 수익 아님 |
| **Confidence** | Medium (80%) | 이메일 리마인더는 검증된 패턴 |
| **Effort** | 0.5 week | Resend 이미 연동됨, cron job 추가 |

```
RICE = (High × 1 × 0.8) / 0.5
     = (3 × 1 × 0.8) / 0.5
     = 4.8 (높음)
```

---

## 5. 구현 범위

### MVP
- [ ] 만료 1주 후 이메일 1회 발송
- [ ] 기본 템플릿
- [ ] Survey 링크 포함

### v2 (Optional)
- [ ] A/B 테스트 (제목, 발송 시점)
- [ ] 이전 리포트 vs 새 리포트 비교 기능
- [ ] "변화 리포트" 프리미엄 상품

---

## 6. 기술 요구사항

### 필요
- Cron job (daily check)
- Resend API (이미 연동됨)
- `sajuResults` 테이블에 `validUntil` 컬럼 추가

### 로직
```typescript
// Daily cron job
async function sendExpiryReminders() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const expiredReports = await db.query(`
    SELECT * FROM saju_results
    WHERE valid_until <= $1
    AND expiry_reminder_sent = false
    AND is_paid = true
  `, [oneWeekAgo]);

  for (const report of expiredReports) {
    await sendReminderEmail(report);
    await markReminderSent(report.id);
  }
}
```

---

## 7. 의존성

- [x] Resend 이메일 연동 (완료)
- [ ] Operating Rate v2.3 구현 (유효기간 계산)
- [ ] `valid_until` 컬럼 추가

---

## 8. 리스크

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| 스팸으로 분류 | Low | Medium | SPF/DKIM 설정, 빈도 제한 |
| 유저 짜증 | Low | Low | Unsubscribe 링크 포함 |
| 기술 실패 | Low | Low | 로깅, 재시도 로직 |

---

## Changelog

| 날짜 | 변경 |
|------|------|
| 2026-01-17 | 초안 작성 |
