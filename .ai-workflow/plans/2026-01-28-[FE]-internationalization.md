# Internationalization (i18n) Implementation Plan

**Date:** 2026-01-28
**Goal:** 다국어 지원 - UI는 EN/KO/ID, 리포트는 모든 언어

---

## Architecture Summary

| 항목 | 방식 |
|------|------|
| **UI 텍스트** | 번역 dictionary (EN/KO/ID) |
| **Survey 질문** | 번역 dictionary (EN/KO/ID) |
| **리포트 생성** | Gemini - 모든 언어 지원 |
| **톤/스타일** | 표준화 (문화권 차등 없음) |

---

## Report Language: Any Language

Gemini가 모든 언어 지원. 프롬프트에 언어만 지정:

```typescript
function getLanguageInstruction(language: string): string {
  if (language === 'en') {
    return `LANGUAGE: Simple, evocative English (B1-B2 level). No jargon.`;
  }

  return `LANGUAGE: Write ALL content in ${getLanguageName(language)}.
- Use natural, conversational tone (equivalent to B1-B2 level)
- Keep it warm, specific, and relatable
- For technical terms (neuroscience), keep English term + explain in target language
  e.g., "Amygdala (뇌의 경보 시스템)" or "Amygdala (sistem alarm otak)"`;
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    ko: 'Korean (한국어)',
    id: 'Indonesian (Bahasa Indonesia)',
    ja: 'Japanese (日本語)',
    zh: 'Chinese (中文)',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    pt: 'Portuguese (Português)',
    ar: 'Arabic (العربية)',
    th: 'Thai (ภาษาไทย)',
    vi: 'Vietnamese (Tiếng Việt)',
  };
  return names[code] || code;
}
```

---

## User Flow

### Landing → Survey → Report

```
1. Landing 접속
   └─ 브라우저 언어 감지 → UI 언어 자동 설정 (EN/KO/ID만)

2. Survey 진행
   └─ UI 언어로 질문 표시

3. Birth Info (마지막 단계)
   ┌───────────────────────────────────────┐
   │ 📝 Report Language                    │
   │                                       │
   │ [  🌐 한국어 (Korean)           ▾  ] │
   │     ├─ English                        │
   │     ├─ 한국어                         │
   │     ├─ Bahasa Indonesia               │
   │     ├─ 日本語                         │
   │     ├─ 中文                           │
   │     ├─ Español                        │
   │     └─ More...                        │
   │                                       │
   │ * Based on your browser setting       │
   │ * Cannot be changed after generation  │
   └───────────────────────────────────────┘

4. Submit → Gemini가 선택된 언어로 리포트 생성

5. Results 페이지
   └─ UI: 브라우저 언어 (EN/KO/ID)
   └─ 리포트 내용: 선택된 언어
```

### Language Toggle (Footer)

```
┌─────────────────────────────────────────────────────────────┐
│  BADA © 2026          EN | 한 | ID          Privacy Terms  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Schema & Backend
- [ ] `shared/schema.ts` - leads에 language 필드 추가
- [ ] `server/storage.ts` - language 저장/조회
- [ ] `server/routes.ts` - assessment submit에 language 전달

### Phase 2: Gemini
- [ ] `lib/gemini_client.ts`
  - [ ] `generateLifeBlueprintReport`에 language 파라미터 추가
  - [ ] `getLanguageInstruction()` 헬퍼 추가
  - [ ] 모든 page 프롬프트에 언어 instruction 적용

### Phase 3: UI Translations
- [ ] `simple-i18n.ts` 업데이트
  - [ ] Landing 번역 (EN/KO/ID)
  - [ ] Survey 질문 번역 (EN/KO/ID)
  - [ ] 공통 UI 번역

### Phase 4: Components
- [ ] `Survey.tsx` - 리포트 언어 선택 UI 추가
- [ ] `Landing.tsx` - useTranslation 적용
- [ ] Footer에 언어 토글 추가

---

## Files to Modify

```
shared/schema.ts          # language field
server/storage.ts         # save/get language
server/routes.ts          # pass language to gemini
lib/gemini_client.ts      # language in prompts
client/src/lib/simple-i18n.ts    # translations
client/src/pages/Landing.tsx     # apply translations
client/src/pages/Survey.tsx      # language selector
client/src/pages/Results.tsx     # UI translations
client/src/pages/Wait.tsx        # UI translations
```
