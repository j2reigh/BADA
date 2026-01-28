/**
 * Simple i18n implementation - No external dependencies
 * UI: EN/KO/ID only
 * Reports: Any language (Gemini handles generation)
 */

export const translations = {
  en: {
    // Landing - Header
    'landing.nav.problem': 'The Problem',
    'landing.nav.solution': 'How It Works',
    'landing.nav.community': 'Community',

    // Landing - Hero
    'landing.hero.tag': 'Self-Discovery Analysis',
    'landing.hero.title': 'Stop Guessing.',
    'landing.hero.rolling1': 'Why you are burnt out.',
    'landing.hero.rolling2': 'Why your brain is foggy.',
    'landing.hero.rolling3': 'Who you really are.',
    'landing.hero.subtitle': 'A 5-minute analysis that reveals how your mind actually works.',
    'landing.hero.scroll': 'Scroll to learn more',

    // Landing - Q1 Card
    'landing.q1.prompt': 'Right now, which feels more true?',
    'landing.q1.option1': 'Something feels off',
    'landing.q1.option2': 'Things are stable',

    // Landing - Problem Section
    'landing.problem.title': 'Why does hard work',
    'landing.problem.title2': 'feel empty?',
    'landing.problem.lead': "It's not your lack of effort.",
    'landing.problem.desc': 'The problem is an <em>Energy Mismatch</em> — your mind is running patterns that weren\'t designed for you.',
    'landing.problem.card1.title': 'The Burnout',
    'landing.problem.card1.desc': "Following 'proven' routines that drain instead of energize you.",
    'landing.problem.card2.title': 'The Fog',
    'landing.problem.card2.desc': 'Making decisions without knowing your natural thinking style.',
    'landing.problem.card3.title': 'The Loop',
    'landing.problem.card3.desc': 'Repeating the same patterns and expecting different results.',

    // Landing - Solution Section
    'landing.solution.tag': 'How It Works',
    'landing.solution.title': "We don't do",
    'landing.solution.title2': 'fortune telling.',
    'landing.solution.subtitle': 'We analyze <em>Time-Data</em>.',
    'landing.solution.desc': 'BADA uses a 2,000-year-old algorithm called "The 60-Year Cycle" to map your innate energy pattern.',
    'landing.solution.tooltip': 'In Korea, we call this "Saju" (四柱)',
    'landing.solution.tagline': 'Think of it as DNA profiling for your mind.',
    'landing.solution.step1': 'Answer',
    'landing.solution.step1.desc': '8 quick questions about your patterns',
    'landing.solution.step2': 'Analyze',
    'landing.solution.step2.desc': 'We map your natural rhythm using Time-Data',
    'landing.solution.step3': 'Align',
    'landing.solution.step3.desc': 'Get your personalized guide to flow',

    // Landing - Community Section
    'landing.community.tag': 'Join the Ritual',
    'landing.community.title': 'Real People, Real Grounding.',

    // Landing - Final CTA
    'landing.cta.tag': 'Stop Guessing. Start Aligning.',
    'landing.cta.title': 'In the age of AI,',
    'landing.cta.title2': 'be more human.',
    'landing.cta.desc': 'The analysis takes 5 minutes.',
    'landing.cta.desc2': 'The clarity lasts a lifetime.',
    'landing.cta.button': 'Start My Analysis',

    // Landing - Sticky Bar
    'landing.sticky.progress': '{{percent}}% complete',
    'landing.sticky.continue': 'Continue',
    'landing.sticky.continue.mobile': 'Continue Diagnosis',

    // Survey Questions
    'survey.q1.question': 'Right now, which feels more true?',
    'survey.q1.option1': 'Something feels off—I sense a threat I can\'t quite name',
    'survey.q1.option2': 'Things are stable—no major worries on my radar',

    'survey.q2.question': 'When life gets chaotic, you tend to...',
    'survey.q2.option1': 'Slow down and observe before acting',
    'survey.q2.option2': 'Speed up and try multiple solutions fast',

    'survey.q3.question': 'Your default approach to goals is...',
    'survey.q3.option1': 'Conserve energy until the right moment',
    'survey.q3.option2': 'Push forward even when uncertain',

    // Survey UI
    'survey.title': 'Operating Pattern Assessment',
    'survey.progress': 'Question {{current}} of {{total}}',
    'survey.next': 'Next',
    'survey.back': 'Back',
    'survey.submit': 'See My Results',

    // Birth Info
    'birth.title': 'One more thing...',
    'birth.subtitle': 'Your birth data adds depth to your reading.',
    'birth.name': 'What should we call you?',
    'birth.name.placeholder': 'Your name',
    'birth.gender': 'Gender',
    'birth.gender.male': 'Male',
    'birth.gender.female': 'Female',
    'birth.gender.other': 'Other',
    'birth.date': 'Birth Date',
    'birth.time': 'Birth Time',
    'birth.time_unknown': "I don't know my birth time",
    'birth.location': 'Birth City',
    'birth.location.placeholder': 'Start typing a city...',
    'birth.email': 'Email',
    'birth.email.placeholder': 'your@email.com',
    'birth.consent': 'I agree to the privacy policy',
    'birth.marketing': 'Send me insights & updates',
    'birth.report_language': 'Report Language',
    'birth.report_language.note': 'Cannot be changed after generation',

    // Results
    'results.unlock': 'Unlock Full Report',
    'results.unlocked': 'Full Report Unlocked',
    'results.download': 'Download PDF',
    'results.pattern': 'Your Pattern',
    'results.locked.title': 'This section is locked',
    'results.locked.cta': 'Unlock to read more',

    // Wait
    'wait.title': 'Check Your Email',
    'wait.subtitle': 'We sent a verification link to',
    'wait.instructions': 'Click the link to view your results',
    'wait.resend': 'Resend Email',
    'wait.wrong_email': 'Wrong email?',
    'wait.update_email': 'Update Email',

    // Errors
    'error.submission': 'Something went wrong',
    'error.try_again': 'Please try again',
    'error.email_not_verified': 'Email not verified yet',

    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.or': 'or',

    // Footer
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
  },

  ko: {
    // Landing - Header
    'landing.nav.problem': '문제점',
    'landing.nav.solution': '작동 방식',
    'landing.nav.community': '커뮤니티',

    // Landing - Hero
    'landing.hero.tag': '셀프 디스커버리 분석',
    'landing.hero.title': '그만 추측하세요.',
    'landing.hero.rolling1': '왜 번아웃이 오는지.',
    'landing.hero.rolling2': '왜 머리가 안 돌아가는지.',
    'landing.hero.rolling3': '진짜 나는 누구인지.',
    'landing.hero.subtitle': '당신의 마음이 실제로 어떻게 작동하는지 5분 만에 알 수 있습니다.',
    'landing.hero.scroll': '스크롤해서 더 알아보기',

    // Landing - Q1 Card
    'landing.q1.prompt': '지금 이 순간, 어느 쪽이 더 와닿나요?',
    'landing.q1.option1': '뭔가 불안하다',
    'landing.q1.option2': '안정적이다',

    // Landing - Problem Section
    'landing.problem.title': '왜 열심히 해도',
    'landing.problem.title2': '공허할까?',
    'landing.problem.lead': '노력이 부족해서가 아닙니다.',
    'landing.problem.desc': '문제는 <em>에너지 불일치</em>입니다 — 당신에게 맞지 않는 패턴으로 살고 있는 거예요.',
    'landing.problem.card1.title': '번아웃',
    'landing.problem.card1.desc': '나를 지치게 하는 "검증된" 루틴을 따르고 있어요.',
    'landing.problem.card2.title': '브레인 포그',
    'landing.problem.card2.desc': '내 고유의 사고방식을 모른 채 결정을 내리고 있어요.',
    'landing.problem.card3.title': '무한 루프',
    'landing.problem.card3.desc': '같은 패턴을 반복하면서 다른 결과를 기대하고 있어요.',

    // Landing - Solution Section
    'landing.solution.tag': '작동 방식',
    'landing.solution.title': '점술이',
    'landing.solution.title2': '아닙니다.',
    'landing.solution.subtitle': '<em>시간 데이터</em>를 분석합니다.',
    'landing.solution.desc': 'BADA는 2,000년 된 알고리즘인 "60갑자 사이클"을 사용해 당신의 타고난 에너지 패턴을 매핑합니다.',
    'landing.solution.tooltip': '한국에서는 이것을 "사주(四柱)"라고 부릅니다',
    'landing.solution.tagline': '마음의 DNA 프로파일링이라고 생각하세요.',
    'landing.solution.step1': '응답',
    'landing.solution.step1.desc': '패턴에 대한 8개 질문',
    'landing.solution.step2': '분석',
    'landing.solution.step2.desc': '시간 데이터로 자연스러운 리듬 매핑',
    'landing.solution.step3': '정렬',
    'landing.solution.step3.desc': '맞춤형 흐름 가이드 제공',

    // Landing - Community Section
    'landing.community.tag': '리추얼에 참여하세요',
    'landing.community.title': '진짜 사람들, 진짜 그라운딩.',

    // Landing - Final CTA
    'landing.cta.tag': '추측 그만. 정렬 시작.',
    'landing.cta.title': 'AI 시대에,',
    'landing.cta.title2': '더 인간답게.',
    'landing.cta.desc': '분석은 5분.',
    'landing.cta.desc2': '명료함은 평생.',
    'landing.cta.button': '분석 시작하기',

    // Landing - Sticky Bar
    'landing.sticky.progress': '{{percent}}% 완료',
    'landing.sticky.continue': '계속하기',
    'landing.sticky.continue.mobile': '진단 계속하기',

    // Survey Questions
    'survey.q1.question': '지금 이 순간, 어느 쪽이 더 와닿나요?',
    'survey.q1.option1': '뭔가 불안하다—정확히 뭔지 모르겠지만 위협을 느낀다',
    'survey.q1.option2': '안정적이다—당장 큰 걱정거리는 없다',

    'survey.q2.question': '삶이 혼란스러울 때, 당신은...',
    'survey.q2.option1': '천천히 관찰한 후 행동한다',
    'survey.q2.option2': '빠르게 여러 해결책을 시도한다',

    'survey.q3.question': '목표를 향한 당신의 기본 방식은...',
    'survey.q3.option1': '적절한 순간까지 에너지를 아낀다',
    'survey.q3.option2': '불확실해도 일단 밀고 나간다',

    // Survey UI
    'survey.title': '운영 패턴 진단',
    'survey.progress': '질문 {{current}} / {{total}}',
    'survey.next': '다음',
    'survey.back': '이전',
    'survey.submit': '결과 보기',

    // Birth Info
    'birth.title': '마지막 한 가지...',
    'birth.subtitle': '출생 정보가 더 깊은 분석을 가능하게 합니다.',
    'birth.name': '어떻게 불러드릴까요?',
    'birth.name.placeholder': '이름',
    'birth.gender': '성별',
    'birth.gender.male': '남성',
    'birth.gender.female': '여성',
    'birth.gender.other': '기타',
    'birth.date': '생년월일',
    'birth.time': '출생 시간',
    'birth.time_unknown': '출생 시간을 모릅니다',
    'birth.location': '출생 도시',
    'birth.location.placeholder': '도시 이름 입력...',
    'birth.email': '이메일',
    'birth.email.placeholder': 'your@email.com',
    'birth.consent': '개인정보 처리방침에 동의합니다',
    'birth.marketing': '인사이트 및 업데이트 수신',
    'birth.report_language': '리포트 언어',
    'birth.report_language.note': '생성 후 변경 불가',

    // Results
    'results.unlock': '전체 리포트 열기',
    'results.unlocked': '전체 리포트',
    'results.download': 'PDF 다운로드',
    'results.pattern': '당신의 패턴',
    'results.locked.title': '이 섹션은 잠겨 있습니다',
    'results.locked.cta': '잠금 해제하고 더 보기',

    // Wait
    'wait.title': '이메일을 확인하세요',
    'wait.subtitle': '인증 링크를 보냈습니다',
    'wait.instructions': '링크를 클릭하면 결과를 볼 수 있습니다',
    'wait.resend': '이메일 재전송',
    'wait.wrong_email': '이메일이 잘못되었나요?',
    'wait.update_email': '이메일 수정',

    // Errors
    'error.submission': '문제가 발생했습니다',
    'error.try_again': '다시 시도해주세요',
    'error.email_not_verified': '아직 이메일이 인증되지 않았습니다',

    // Common
    'common.loading': '로딩 중...',
    'common.cancel': '취소',
    'common.confirm': '확인',
    'common.or': '또는',

    // Footer
    'footer.privacy': '개인정보',
    'footer.terms': '이용약관',
  },

  id: {
    // Landing - Header
    'landing.nav.problem': 'Masalah',
    'landing.nav.solution': 'Cara Kerja',
    'landing.nav.community': 'Komunitas',

    // Landing - Hero
    'landing.hero.tag': 'Analisis Penemuan Diri',
    'landing.hero.title': 'Berhenti Menebak.',
    'landing.hero.rolling1': 'Kenapa kamu burnout.',
    'landing.hero.rolling2': 'Kenapa otakmu berkabut.',
    'landing.hero.rolling3': 'Siapa dirimu sebenarnya.',
    'landing.hero.subtitle': 'Analisis 5 menit yang mengungkap cara kerja pikiranmu.',
    'landing.hero.scroll': 'Gulir untuk lebih lanjut',

    // Landing - Q1 Card
    'landing.q1.prompt': 'Saat ini, mana yang lebih terasa benar?',
    'landing.q1.option1': 'Ada yang tidak beres',
    'landing.q1.option2': 'Semuanya stabil',

    // Landing - Problem Section
    'landing.problem.title': 'Kenapa kerja keras',
    'landing.problem.title2': 'terasa hampa?',
    'landing.problem.lead': 'Bukan karena kurang usaha.',
    'landing.problem.desc': 'Masalahnya adalah <em>Ketidakcocokan Energi</em> — pikiranmu menjalankan pola yang tidak dirancang untukmu.',
    'landing.problem.card1.title': 'Burnout',
    'landing.problem.card1.desc': 'Mengikuti rutinitas "terbukti" yang menguras daripada mengisi energi.',
    'landing.problem.card2.title': 'Kabut Otak',
    'landing.problem.card2.desc': 'Membuat keputusan tanpa tahu gaya berpikir alami.',
    'landing.problem.card3.title': 'Lingkaran Setan',
    'landing.problem.card3.desc': 'Mengulangi pola yang sama dan mengharapkan hasil berbeda.',

    // Landing - Solution Section
    'landing.solution.tag': 'Cara Kerja',
    'landing.solution.title': 'Kami tidak',
    'landing.solution.title2': 'meramal.',
    'landing.solution.subtitle': 'Kami menganalisis <em>Data-Waktu</em>.',
    'landing.solution.desc': 'BADA menggunakan algoritma berusia 2.000 tahun yang disebut "Siklus 60 Tahun" untuk memetakan pola energi bawaanmu.',
    'landing.solution.tooltip': 'Di Korea, ini disebut "Saju" (四柱)',
    'landing.solution.tagline': 'Anggap saja profil DNA untuk pikiranmu.',
    'landing.solution.step1': 'Jawab',
    'landing.solution.step1.desc': '8 pertanyaan cepat tentang polamu',
    'landing.solution.step2': 'Analisis',
    'landing.solution.step2.desc': 'Kami petakan ritme alami menggunakan Data-Waktu',
    'landing.solution.step3': 'Selaraskan',
    'landing.solution.step3.desc': 'Dapatkan panduan personal untuk flow',

    // Landing - Community Section
    'landing.community.tag': 'Bergabung dengan Ritual',
    'landing.community.title': 'Orang Nyata, Grounding Nyata.',

    // Landing - Final CTA
    'landing.cta.tag': 'Berhenti Menebak. Mulai Menyelaraskan.',
    'landing.cta.title': 'Di era AI,',
    'landing.cta.title2': 'jadilah lebih manusiawi.',
    'landing.cta.desc': 'Analisis butuh 5 menit.',
    'landing.cta.desc2': 'Kejelasan bertahan seumur hidup.',
    'landing.cta.button': 'Mulai Analisis',

    // Landing - Sticky Bar
    'landing.sticky.progress': '{{percent}}% selesai',
    'landing.sticky.continue': 'Lanjut',
    'landing.sticky.continue.mobile': 'Lanjut Diagnosis',

    // Survey Questions
    'survey.q1.question': 'Saat ini, mana yang lebih terasa benar?',
    'survey.q1.option1': 'Ada yang tidak beres—aku merasakan ancaman yang tidak bisa kujelaskan',
    'survey.q1.option2': 'Semuanya stabil—tidak ada kekhawatiran besar',

    'survey.q2.question': 'Saat hidup kacau, kamu cenderung...',
    'survey.q2.option1': 'Melambat dan mengamati sebelum bertindak',
    'survey.q2.option2': 'Mempercepat dan mencoba berbagai solusi',

    'survey.q3.question': 'Pendekatanmu terhadap tujuan biasanya...',
    'survey.q3.option1': 'Menyimpan energi sampai momen yang tepat',
    'survey.q3.option2': 'Terus maju meski tidak yakin',

    // Survey UI
    'survey.title': 'Tes Pola Operasi',
    'survey.progress': 'Pertanyaan {{current}} dari {{total}}',
    'survey.next': 'Lanjut',
    'survey.back': 'Kembali',
    'survey.submit': 'Lihat Hasil',

    // Birth Info
    'birth.title': 'Satu hal lagi...',
    'birth.subtitle': 'Data kelahiranmu menambah kedalaman analisis.',
    'birth.name': 'Siapa namamu?',
    'birth.name.placeholder': 'Namamu',
    'birth.gender': 'Gender',
    'birth.gender.male': 'Pria',
    'birth.gender.female': 'Wanita',
    'birth.gender.other': 'Lainnya',
    'birth.date': 'Tanggal Lahir',
    'birth.time': 'Waktu Lahir',
    'birth.time_unknown': 'Saya tidak tahu waktu lahir saya',
    'birth.location': 'Kota Kelahiran',
    'birth.location.placeholder': 'Ketik nama kota...',
    'birth.email': 'Email',
    'birth.email.placeholder': 'email@kamu.com',
    'birth.consent': 'Saya setuju dengan kebijakan privasi',
    'birth.marketing': 'Kirim saya insight & update',
    'birth.report_language': 'Bahasa Laporan',
    'birth.report_language.note': 'Tidak bisa diubah setelah dibuat',

    // Results
    'results.unlock': 'Buka Laporan Lengkap',
    'results.unlocked': 'Laporan Lengkap',
    'results.download': 'Unduh PDF',
    'results.pattern': 'Polamu',
    'results.locked.title': 'Bagian ini terkunci',
    'results.locked.cta': 'Buka untuk membaca lebih lanjut',

    // Wait
    'wait.title': 'Cek Emailmu',
    'wait.subtitle': 'Kami mengirim link verifikasi ke',
    'wait.instructions': 'Klik link untuk melihat hasilmu',
    'wait.resend': 'Kirim Ulang Email',
    'wait.wrong_email': 'Email salah?',
    'wait.update_email': 'Ubah Email',

    // Errors
    'error.submission': 'Terjadi kesalahan',
    'error.try_again': 'Silakan coba lagi',
    'error.email_not_verified': 'Email belum diverifikasi',

    // Common
    'common.loading': 'Memuat...',
    'common.cancel': 'Batal',
    'common.confirm': 'Konfirmasi',
    'common.or': 'atau',

    // Footer
    'footer.privacy': 'Privasi',
    'footer.terms': 'Ketentuan',
  },
};

// UI Languages (limited set for translations)
export type UILanguage = 'en' | 'ko' | 'id';

// All supported report languages (Gemini can generate in any language)
export const REPORT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'th', name: 'Thai', native: 'ภาษาไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
] as const;

export type ReportLanguage = typeof REPORT_LANGUAGES[number]['code'];

// Browser language detection (UI only - EN/KO/ID)
export function detectUILanguage(): UILanguage {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  if (browserLang === 'ko') return 'ko';
  if (browserLang === 'id' || browserLang === 'ms') return 'id'; // ms = Malay, similar to Indonesian
  return 'en';
}

// Map UI language to default report language
export function getDefaultReportLanguage(uiLang: UILanguage): ReportLanguage {
  return uiLang; // UI languages are subset of report languages
}

// Simple translation function
export function t(key: string, lang: UILanguage = 'en', params?: Record<string, any>): string {
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
import { useState, useEffect, useCallback } from 'react';

export function useTranslation() {
  const [language, setLanguageState] = useState<UILanguage>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('ui_language') as UILanguage;
    if (saved && ['en', 'ko', 'id'].includes(saved)) return saved;
    return detectUILanguage();
  });

  useEffect(() => {
    localStorage.setItem('ui_language', language);
  }, [language]);

  const setLanguage = useCallback((lang: UILanguage) => {
    setLanguageState(lang);
  }, []);

  const translate = useCallback((key: string, params?: Record<string, any>) => {
    return t(key, language, params);
  }, [language]);

  return {
    t: translate,
    language,
    setLanguage,
  };
}
