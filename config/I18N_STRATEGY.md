# 🌍 BADA 국제화(i18n) 전략 - 쉽고 저렴한 방법

**작성일:** 2026-01-13
**목표:** 최소 비용으로 한국어, 영어, 기타 언어 지원

---

## 📊 현재 상황 분석

### 번역이 필요한 영역

1. **프론트엔드 UI** (59개 컴포넌트)
   - 설문조사 질문 (8개)
   - 버튼, 라벨, 폼 필드
   - 에러 메시지
   - 비용: 낮음 (한 번만 번역)

2. **AI 생성 리포트** (가장 중요!)
   - 5페이지 Life Blueprint
   - Gemini API로 생성
   - **비용: 높음** (매 사용자마다 생성)

3. **이메일 템플릿**
   - 인증 이메일
   - 비용: 낮음

4. **PDF 리포트**
   - 폰트 지원 필요 (한글/중문)
   - 비용: 중간

---

## 💡 추천 전략: 3단계 접근법

### ✅ Phase 1: 프론트엔드만 (가장 쉽고 저렴)

**비용:** 거의 무료
**시간:** 2-3일
**효과:** 사용자 경험 70% 개선

#### 구현 방법

**1. react-i18next 설치**
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**2. 번역 파일 구조**
```
client/src/locales/
  ├── en/
  │   └── translation.json
  ├── ko/
  │   └── translation.json
  └── ja/
      └── translation.json
```

**3. 번역 파일 예시**
```json
// locales/ko/translation.json
{
  "survey": {
    "question1": "당신은 위협을 얼마나 명확하게 인식합니까?",
    "submit": "제출",
    "next": "다음"
  },
  "results": {
    "unlock": "전체 리포트 잠금 해제",
    "download": "PDF 다운로드"
  }
}
```

**4. 컴포넌트에서 사용**
```tsx
import { useTranslation } from 'react-i18next';

function Survey() {
  const { t } = useTranslation();
  return (
    <button>{t('survey.submit')}</button>
  );
}
```

**5. 언어 선택기 추가**
```tsx
// components/LanguageSelector.tsx
function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="ko">한국어</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

**비용 분석:**
- 라이브러리: 무료 (오픈소스)
- 번역 비용:
  - AI 번역 (DeepL API): $5-10 for 500k characters
  - 또는 ChatGPT: 직접 번역 무료
  - 또는 Google Translate API: $20/1M characters

---

### ✅ Phase 2: AI 리포트 다국어화 — 네이티브 품질 확보

**비용:** 사용자당 동일 (추가 API 콜 없음)
**효과:** 직역체 제거, 네이티브 수준 리포트

#### 현재 문제 진단 (2026-01-30)

비영어 리포트에서 "영어를 그대로 옮긴 듯한" 직역체가 발생:

| 원인 | 영향 | 심각도 |
|------|------|--------|
| 프롬프트 전체가 영어 | Gemini가 영어로 사고 후 번역 | 높음 |
| 예시가 전부 영어 (`"A Silent Volcano"`) | 영어식 어순/표현이 출력에 전이 | 높음 |
| 언어 지시가 1줄뿐 | "Write ALL content in Korean" 만으로는 톤/스타일 제어 불가 | 중간 |
| Archetype 데이터가 영어 전용 | title/definition이 영어로 덮어써짐 | 높음 |
| DAY_MASTER_MAP 값이 영어 | 입력 데이터가 영어 → 출력도 영어 패턴 따라감 | 중간 |

#### 해결: `getLanguageInstruction()` 강화

**핵심 원칙:** 프롬프트 구조는 영어로 유지하되, **언어 지시 블록을 풍부하게** 확장하여 Gemini가 해당 언어의 네이티브 화자처럼 쓰도록 유도.

```typescript
function getLanguageInstruction(language: string): string {
  if (language === 'en') {
    return `LANGUAGE: Simple, evocative English (B1-B2 level). No jargon.`;
  }

  const langName = LANGUAGE_NAMES[language] || language;

  return `LANGUAGE & WRITING STYLE:
Write ALL content in ${langName}. You are a native ${langName} writer, NOT a translator.

CRITICAL — ANTI-TRANSLATION RULES:
- Write as if this content was ORIGINALLY conceived in ${langName}
- Do NOT translate English phrases in your head — think directly in ${langName}
- Use sentence structures, idioms, and rhythms natural to ${langName}
- Avoid calque (loan-translation) patterns from English
- Metaphors should feel native: adapt cultural references to the target audience
  e.g., English "A Forest Fire in Winter" → Korean "한겨울 산불" (not "겨울에 있는 숲 화재")
- Tone: warm, poetic, conversational (equivalent to B1-B2 native reading level)
- For neuroscience terms only: keep English term + native explanation
  e.g., "Amygdala(뇌의 경보 시스템)" / "Amygdala(sistem alarm otak)"`;
}
```

**변경 포인트:**
1. **"native writer, NOT a translator"** — Gemini의 역할 프레이밍 변경
2. **"think directly in {language}"** — 영어 거치지 않는 사고 유도
3. **anti-calque 명시** — 직역 패턴 금지
4. **네이티브 메타포 예시** — 영어 예시를 번역하지 말고 해당 언어에서 자연스러운 표현 사용

#### Archetype 영어 데이터 처리

현재 `archetype.identityTitle` ("The Rooted Volcanic Mountain")과 `archetype.natureMetaphor`가 영어 전용.

**수정 방식:** override 제거, 프롬프트 힌트로 전환

```typescript
// AS-IS: 영어로 강제 덮어쓰기
if (archetype) {
  data.title = archetype.identityTitle;
  data.nature_snapshot.definition = archetype.natureMetaphor;
}

// TO-BE: 비영어일 때는 프롬프트에서 번역 지시
// 프롬프트 내:
// STANDARDIZED IDENTITY (MUST USE):
// - IDENTITY TITLE: "The Rooted Volcanic Mountain"
// - NATURE METAPHOR: "A master builder whose serene permanence..."
// - TRANSLATE these to {language} naturally. Keep the meaning, adapt the expression.

// 영어일 때만 override 유지
if (archetype && language === 'en') {
  data.title = archetype.identityTitle;
  data.nature_snapshot.definition = archetype.natureMetaphor;
}
```

**결과:** 같은 archetype 의미를 유지하면서 해당 언어에 맞는 자연스러운 표현 생성.
- EN: "The Rooted Volcanic Mountain" (archetype 그대로)
- KO: "뿌리 깊은 화산" (Gemini가 의미 보존하며 한국어로)
- ID: "Gunung Api yang Berakar" (Gemini가 인도네시아어로)

#### 프롬프트 내 영어 예시 처리

각 페이지 프롬프트에 영어 예시가 하드코딩되어 있음:
```
GOOD: "A Silent Volcano", "The Midnight Ocean", "A Forest Fire in Winter"
BAD: "The Warrior", "The King", "The Leader"
```

**수정:** 비영어일 때 예시 블록에 번역 지시 추가
```
GOOD examples (translate to {language} naturally, do not use these English phrases):
"A Silent Volcano", "The Midnight Ocean", "A Forest Fire in Winter"
```

#### 구현 체크리스트

- [ ] `getLanguageInstruction()` 강화 (anti-translation rules)
- [ ] Archetype override → 비영어일 때 프롬프트 힌트로 전환
- [ ] Page 1-5 프롬프트의 영어 예시에 번역 지시 추가
- [ ] QA: 같은 유저 데이터로 EN/KO/ID 3개 리포트 생성, 네이티브 품질 비교

---

### ✅ Phase 3: PDF & 이메일

#### PDF 한글 폰트 지원

```bash
npm install @pdf-lib/fontkit
```

```typescript
// lib/pdfExport.ts
import fontkit from '@pdf-lib/fontkit';

// 무료 한글 폰트
const fonts = {
  ko: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2',
  ja: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP'
};

async function generateReportPDF(data: ReportData, language: string) {
  const pdf = new jsPDF();

  // 한글 폰트 로드
  if (language === 'ko') {
    const fontBytes = await fetch(fonts.ko).then(r => r.arrayBuffer());
    pdf.addFont(fontBytes, 'Pretendard', 'normal');
    pdf.setFont('Pretendard');
  }

  // ... PDF 생성
}
```

**무료 한글 폰트:**
- Pretendard (추천)
- Noto Sans KR
- Spoqa Han Sans

#### 이메일 템플릿

```typescript
// lib/email.ts
const EMAIL_TEMPLATES = {
  en: {
    subject: 'Verify Your Email - BADA Assessment Results Ready',
    body: 'Thank you for completing...'
  },
  ko: {
    subject: '이메일 인증 - BADA 평가 결과 준비 완료',
    body: '평가를 완료해 주셔서 감사합니다...'
  }
};

export async function sendVerificationEmail(
  email: string,
  token: string,
  leadId: string,
  language: string = 'en'
) {
  const template = EMAIL_TEMPLATES[language];
  // ...
}
```

---

## 💰 비용 비교

### 옵션 1: react-i18next만 (UI만)
- **초기 비용:** $0
- **번역 비용:** $10-50 (AI 번역)
- **운영 비용:** $0/월
- **품질:** ⭐⭐⭐

### 옵션 2: UI + AI 리포트 (언어별 프롬프트)
- **초기 비용:** $0
- **번역 비용:** $20-100 (프롬프트 번역)
- **운영 비용:** +5-10% Gemini API 비용
- **품질:** ⭐⭐⭐⭐⭐

### 옵션 3: 후처리 번역 (DeepL)
- **초기 비용:** $0
- **번역 비용:** $0
- **운영 비용:** $20/1M characters (~$0.05/리포트)
- **품질:** ⭐⭐⭐

---

## 🚀 가장 쉬운 시작 방법 (1시간 내 구현)

### Step 1: 언어 선택 저장

```typescript
// client/src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from '@/locales/en/translation.json';
import koTranslations from '@/locales/ko/translation.json';

i18n
  .use(LanguageDetector) // 자동 언어 감지
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ko: { translation: koTranslations }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### Step 2: 설문조사 페이지 번역

```typescript
// client/src/pages/Survey.tsx
import { useTranslation } from 'react-i18next';

export default function Survey() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('survey.title')}</h2>
      <button>{t('survey.submit')}</button>
    </div>
  );
}
```

### Step 3: API에 언어 전달

```typescript
// client/src/pages/Survey.tsx
const handleSubmit = async () => {
  const { i18n } = useTranslation();

  const payload = {
    ...formData,
    language: i18n.language // 'ko', 'en', etc.
  };

  await fetch('/api/assessment/submit', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
```

### Step 4: 백엔드에서 언어별 리포트 생성

```typescript
// server/routes.ts
app.post("/api/assessment/submit", async (req, res) => {
  const { language = 'en', ...input } = req.body;

  // Generate report in user's language
  reportData = await generateLifeBlueprintReport(
    sajuData,
    surveyScores,
    input.name,
    language // Pass language here
  );

  // Send email in user's language
  await sendVerificationEmail(
    lead.email,
    lead.verificationToken,
    lead.id,
    language
  );
});
```

---

## 📝 번역 우선순위

### High Priority (먼저 번역)
1. ✅ 설문조사 질문 (8개) - 사용자가 가장 먼저 보는 것
2. ✅ 버튼 & 액션 (제출, 다음, 잠금 해제 등)
3. ✅ AI 리포트 System Prompt
4. ✅ 이메일 제목 & 본문

### Medium Priority
5. Landing 페이지
6. Results 페이지 UI 텍스트
7. 에러 메시지

### Low Priority
8. Coming Soon 페이지
9. Footer & 법적 텍스트

---

## 🤖 AI를 활용한 빠른 번역

### ChatGPT/Claude로 무료 번역

```
프롬프트:
아래 JSON 파일을 한국어로 번역해주세요.
키는 그대로 두고, 값만 번역하세요.
전문적이고 친근한 톤으로 번역해주세요.

{
  "survey": {
    "question1": "How clearly do you perceive threats?",
    "submit": "Submit"
  }
}
```

### DeepL API (가장 정확)

```typescript
import deepl from 'deepl-node';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

async function translateStrings(texts: string[], targetLang: string) {
  const results = await translator.translateText(
    texts,
    null,
    targetLang
  );
  return results.map(r => r.text);
}
```

**DeepL 가격:**
- Free: 500k characters/month
- Pro: $5.49/month for 100k characters

---

## 🎯 최종 추천 방안

### 단계별 구현 (비용 최소화)

**Week 1: UI 국제화 ($0-10)**
```
1. react-i18next 설치
2. 핵심 페이지만 번역 (Survey, Results)
3. 언어 선택기 추가
4. ChatGPT로 무료 번역
```

**Week 2: AI 리포트 다국어화 ($20-50)**
```
1. System prompt 한국어 버전 작성
2. JSON schema 한국어 키 추가
3. 테스트 & 품질 확인
4. 필요시 일본어 추가
```

**Week 3: 완성도 향상 ($10-30)**
```
1. PDF 한글 폰트 추가
2. 이메일 템플릿 다국어화
3. URL 파라미터로 언어 전환 지원
4. SEO 메타태그 다국어화
```

**총 비용: $30-90**
**총 시간: 2-3주 (파트타임)**

---

## 💎 프리미엄 기능 아이디어

### 언어별 요금제
```typescript
const PRICING = {
  en: { free: 1_page, paid: 5_pages },
  ko: { free: 1_page, paid: 5_pages },
  ja: { free: 1_page, paid: 5_pages },
  zh: { free: 0_pages, paid: 5_pages } // 중국어는 프리미엄만
};
```

### 언어 품질 차별화
- 영어/한국어: 고품질 Gemini Pro
- 기타 언어: 자동 번역 (DeepL)

---

## 📊 ROI 분석

### 한국 시장 진출 시
- 인구: 5천만
- 타겟: 20-40대 (약 2천만)
- 전환율 1%: 20만 사용자
- ARPU $10: **$2M 매출**

**번역 투자 $100 → $2M 매출 = 20,000x ROI** 🚀

### 일본 시장 추가 시
- 인구: 1.2억
- 타겟: 25-45대 (약 4천만)
- 전환율 0.5%: 20만 사용자
- ARPU $15: **$3M 추가 매출**

---

## 🛠️ 실전 코드 템플릿

### 번역 파일 생성 스크립트

```typescript
// scripts/generate-translations.ts
import * as fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI();

async function translateFile(
  sourceFile: string,
  targetLang: string
) {
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

  const prompt = `Translate this JSON to ${targetLang}.
  Keep keys in English, translate only values:
  ${JSON.stringify(source, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const translated = JSON.parse(response.choices[0].message.content);

  fs.writeFileSync(
    `locales/${targetLang}/translation.json`,
    JSON.stringify(translated, null, 2)
  );
}

// 사용
translateFile('locales/en/translation.json', 'ko');
translateFile('locales/en/translation.json', 'ja');
```

**비용:** GPT-4o - $5/1M input tokens (거의 무료)

---

## 🔥 즉시 적용 가능한 간단 버전

### 가장 빠른 방법 (30분 내):

```typescript
// client/src/lib/translations.ts
export const translations = {
  en: {
    submit: "Submit",
    next: "Next",
    unlock: "Unlock Full Report"
  },
  ko: {
    submit: "제출",
    next: "다음",
    unlock: "전체 리포트 잠금 해제"
  }
};

export function t(key: string, lang: string = 'en') {
  return translations[lang]?.[key] || translations.en[key];
}
```

```tsx
// 사용
import { t } from '@/lib/translations';

function Survey() {
  const [lang, setLang] = useState('en');

  return (
    <button>{t('submit', lang)}</button>
  );
}
```

**완벽하진 않지만 30분 내 다국어 지원 가능!**

---

## 📌 참고 자료

- react-i18next: https://react.i18next.com/
- DeepL API: https://www.deepl.com/pro-api
- Google Translate API: https://cloud.google.com/translate
- Pretendard Font: https://github.com/orioncactus/pretendard
- i18next Scanner: 하드코딩된 문자열 자동 추출

---

**End of Strategy Document**

다음 단계: 구현 우선순위를 정하고 시작하세요! 🚀
