# BADA Legal Documents Strategy
> 작성일: 2026-02-09
> 목표: Terms of Service & Privacy Policy 핵심 고려사항 정의

## 1. Privacy Policy (개인정보 처리방침)
BADA는 **"생년월일시 + 출생지"**라는 민감한 개인정보를 다루므로 투명성이 핵심입니다.

### 1.1 수집하는 데이터 (Data Collection)
- **필수**: 이메일 (계정 및 리포트 발송), 비밀번호 (암호화 저장)
- **서비스**: 생년월일, 태어난 시간, 출생 국가/도시 (사주/점성술 차트 생성용)
- **자동수집**: 접속 로그, 쿠키 (로그인 세션 유지)

### 1.2 데이터의 사용 목적 (Usage)
- **차트 계산**: 위도/경도 및 시간대 계산 (내부 로직)
- **AI 리포트 생성**: **Google Gemini API**로 익명화된 데이터를 전송하여 해석 생성
  - *중요: Google에 전송됨을 명시해야 함*
- **서비스 알림**: 리포트 완료 및 업데이트 알림 (Resend 사용)

### 1.3 데이터 공유 및 제3자 제공 (Third Parties)
| 서비스명 | 역할 | 제공 데이터 |
|---|---|---|
| **Google Gemini** | AI 텍스트 생성 | 사주/차트 구조 데이터 (개인식별정보 제외 가능하면 제외) |
| **Resend** | 이메일 발송 | 이메일 주소, 이름 |
| **Neon/Supabase** | 데이터베이스 | 암호화된 유저 정보 |
| **Gumroad** | 결제 처리 | 이메일, 결제 정보 (BADA 서버에 저장 안 함) |

### 1.4 데이터 보관 및 삭제 (Retention)
- 회원 탈퇴 시 즉시 파기 여부
- 미결제 유저 데이터 보관 기간 등

---

## 2. Terms of Conditions (이용약관)
운세/AI 서비스 특성상 **"면책 조항"**이 가장 중요합니다.

### 2.1 서비스의 성격 (Disclaimer)
- **Entertainment Purpose**: 본 서비스는 엔터테인먼트 및 자기성찰(Self-reflection) 목적입니다.
- **Not Professional Advice**: 법률, 의학, 금융 투자의 전문 조언을 대체하지 않습니다.
- **AI Limitations**: AI가 생성한 내용의 100% 정확성을 보장하지 않으며, 환각(Hallucination) 가능성이 있습니다.

### 2.2 결제 및 환불 (Payments & Refunds)
- **Digital Goods**: 디지털 콘텐츠 특성상 **"리포트 생성(열람) 후 환불 불가"** 원칙을 명시해야 합니다.
- **예외**: 시스템 오류로 리포트가 생성되지 않은 경우 등

### 2.3 지적 재산권 (Intellectual Property)
- **BADA의 권리**: 서비스 로고, UI, 분석 알고리즘, 프롬프트 엔지니어링 등
- **유저의 권리**: 구매한 개인 리포트의 소유권 (개인적 용도 사용)

---

## 3. Action Plan
1. **Footer 링크 추가**: 모든 페이지 하단에 T&C / Privacy 링크 추가
2. **동의 절차**: 회원가입(Sign up) 시 "약관에 동의합니다" 체크박스 또는 문구 추가
3. **Draft 작성**: 템플릿을 기반으로 BADA에 맞는 초안 작성

## 4. 참고 템플릿 (Standard)
- **Privacy**: "GDPR Compliant Privacy Policy Generator" 참고
- **Terms**: "SaaS Terms of Service Template" 참고
