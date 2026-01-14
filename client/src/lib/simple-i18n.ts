/**
 * Simple i18n implementation - No external dependencies
 * 가장 빠르게 시작할 수 있는 방법
 */

export const translations = {
  en: {
    // Landing Page
    'landing.title': 'Discover Your Life Blueprint',
    'landing.subtitle': 'Unlock your unique operating pattern',
    'landing.cta': 'Start Assessment',

    // Survey
    'survey.title': 'Operating Pattern Assessment',
    'survey.progress': 'Question {{current}} of {{total}}',
    'survey.next': 'Next Question',
    'survey.back': 'Back',
    'survey.submit': 'Complete Assessment',

    // Birth Info
    'birth.title': 'Complete Your Birth Pattern',
    'birth.name': 'What do you want to be called?',
    'birth.gender': 'Gender',
    'birth.date': 'Birth Date',
    'birth.time': 'Birth Time',
    'birth.time_unknown': "I don't know my birth time",
    'birth.location': 'Place of Birth (City)',
    'birth.email': 'Email Address',
    'birth.consent': 'I agree to the terms and conditions',
    'birth.marketing': 'I would like to receive updates',

    // Results
    'results.unlock': 'Unlock Full Report',
    'results.unlocked': 'Full Report Unlocked',
    'results.download': 'Download PDF Report',
    'results.pattern': 'Pattern',

    // Wait
    'wait.title': 'Check Your Email',
    'wait.subtitle': 'We sent a verification link to',
    'wait.instructions': 'Click the link in the email to view your results',
    'wait.resend': 'Resend Email',
    'wait.wrong_email': 'Wrong email?',

    // Errors
    'error.submission': 'Error submitting information',
    'error.try_again': 'Please try again',
    'error.email_not_verified': 'Email not verified',

    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
  },

  ko: {
    // Landing Page
    'landing.title': '당신의 인생 설계도를 발견하세요',
    'landing.subtitle': '당신만의 독특한 운영 패턴을 찾아보세요',
    'landing.cta': '평가 시작하기',

    // Survey
    'survey.title': '운영 패턴 평가',
    'survey.progress': '질문 {{current}} / {{total}}',
    'survey.next': '다음 질문',
    'survey.back': '이전',
    'survey.submit': '평가 완료',

    // Birth Info
    'birth.title': '출생 정보 입력',
    'birth.name': '어떻게 불러드릴까요?',
    'birth.gender': '성별',
    'birth.date': '생년월일',
    'birth.time': '출생 시간',
    'birth.time_unknown': '출생 시간을 모릅니다',
    'birth.location': '출생 장소 (도시)',
    'birth.email': '이메일 주소',
    'birth.consent': '약관에 동의합니다',
    'birth.marketing': '업데이트 소식을 받고 싶습니다',

    // Results
    'results.unlock': '전체 리포트 잠금 해제',
    'results.unlocked': '전체 리포트 잠금 해제됨',
    'results.download': 'PDF 리포트 다운로드',
    'results.pattern': '패턴',

    // Wait
    'wait.title': '이메일을 확인하세요',
    'wait.subtitle': '인증 링크를 보냈습니다',
    'wait.instructions': '이메일의 링크를 클릭하여 결과를 확인하세요',
    'wait.resend': '이메일 재전송',
    'wait.wrong_email': '이메일이 잘못되었나요?',

    // Errors
    'error.submission': '정보 제출 중 오류가 발생했습니다',
    'error.try_again': '다시 시도해주세요',
    'error.email_not_verified': '이메일이 인증되지 않았습니다',

    // Common
    'common.loading': '로딩 중...',
    'common.cancel': '취소',
    'common.confirm': '확인',
  },
};

export type Language = 'en' | 'ko';

// Browser language detection
export function detectLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'ko' ? 'ko' : 'en';
}

// Simple translation function
export function t(key: string, lang: Language = 'en', params?: Record<string, any>): string {
  const langTrans = translations[lang] as Record<string, string>;
  const enTrans = translations.en as Record<string, string>;
  let text = langTrans?.[key] || enTrans?.[key] || key;

  // Simple template replacement {{variable}}
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, String(v));
    });
  }

  return text;
}

// Hook for React components
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('language') as Language;
    return saved || detectLanguage();
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const translate = (key: string, params?: Record<string, any>) => {
    return t(key, language, params);
  };

  return {
    t: translate,
    language,
    setLanguage,
  };
}
