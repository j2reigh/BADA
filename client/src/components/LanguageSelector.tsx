/**
 * Language Selector Component
 * 언어 선택기
 */

import { useTranslation } from '@/lib/simple-i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ko')}
        className="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white shadow-sm hover:border-primary focus:border-primary focus:outline-none transition-colors"
      >
        <option value="en">🇺🇸 English</option>
        <option value="ko">🇰🇷 한국어</option>
      </select>
    </div>
  );
}
