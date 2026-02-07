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
    'landing.solution.desc': 'BADA uses a 1,200-year-old algorithm called "The 60-Year Cycle" to map your innate energy pattern.',
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

    // Survey Questions (Q1-Q8) - matches scoring.ts QUESTIONS
    'survey.q1.text': 'When things get intense or chaotic, what happens first?',
    'survey.q1.A': 'I become more alert and focused',
    'survey.q1.B': 'I feel overwhelmed or emotional',
    'survey.q1.C': 'I try to escape the situation',
    'survey.q1.D': 'It depends, but usually A or B',

    'survey.q2.text': 'In crisis situations, people often say I am:',
    'survey.q2.A': 'Calm and clear-headed',
    'survey.q2.B': 'Emotional but expressive',
    'survey.q2.C': 'Quiet or frozen',
    'survey.q2.D': 'Not sure',

    'survey.q3.text': 'I feel most "alive" when:',
    'survey.q3.A': "I'm pushed beyond my limits",
    'survey.q3.B': 'Things feel safe and predictable',
    'survey.q3.C': "I'm emotionally connected",
    'survey.q3.D': "I don't know",

    'survey.q4.text': 'Growing up, my environment felt:',
    'survey.q4.A': 'Safe and predictable',
    'survey.q4.B': 'Unstable or unclear',
    'survey.q4.C': 'Mixed',
    'survey.q4.D': "I don't remember clearly",

    'survey.q5.text': 'I feel most stressed when:',
    'survey.q5.A': 'Nothing changes',
    'survey.q5.B': "I don't know what's coming",
    'survey.q5.C': "People don't say what they really think",
    'survey.q5.D': 'I feel watched or judged',

    'survey.q6.text': 'When something feels wrong in my life, I usually:',
    'survey.q6.A': 'Try to redesign my situation',
    'survey.q6.B': 'Adjust myself',
    'survey.q6.C': 'Wait and see',
    'survey.q6.D': 'Talk to others first',

    'survey.q7.text': 'I believe that my current state is:',
    'survey.q7.A': 'Something I can actively shape',
    'survey.q7.B': 'Mostly decided by circumstances',
    'survey.q7.C': 'A mix of both',
    'survey.q7.D': "I'm not sure",

    'survey.q8.text': 'If nothing changed for the next year, I would feel:',
    'survey.q8.A': 'Very uncomfortable',
    'survey.q8.B': 'Mostly okay',
    'survey.q8.C': 'Relieved',
    'survey.q8.D': 'Confused',

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
    'birth.time.placeholder': 'Select time',
    'birth.time.modal.title': 'What time were you born?',
    'birth.time.modal.subtitle': 'This helps improve accuracy',
    'birth.time.hour': 'Hour',
    'birth.time.minute': 'Min',
    'birth.time.confirm': 'Confirm',
    'birth.time_unknown': "I don't know my exact birth time",
    'birth.location': 'Birth Timezone',
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

    // FAQ
    'faq.title': 'FAQ',
    'faq.q1.q': 'What is this?',
    'faq.q1.a': 'A personal analysis based on your birth data.\n\nWe use a time-based system called the Four Pillars (사주) — one of the oldest pattern frameworks in East Asia — combined with AI to generate a report about how you operate.\n\nNot fortune telling. Not personality typing.\nA structural map of your tendencies, timing, and energy.',
    'faq.q2.q': 'Is this fortune telling?',
    'faq.q2.a': 'No.\n\nNothing is predicted. No "good" or "bad" outcomes.\nWe don\'t tell you what will happen.\n\nWe show how your energy tends to move — so you can work with it, not against it.',
    'faq.q3.q': 'What is it based on?',
    'faq.q3.a': 'Your birth date, time, and location.\n\nThese are converted into a Four Pillars chart — a system used across East Asia for centuries to map repeating time-energy cycles. The same inputs always produce the same chart. There\'s no randomness.\n\nAI then reads the chart and writes your report in plain language.',
    'faq.q4.q': 'Is this like MBTI?',
    'faq.q4.a': 'No.\n\nMBTI is based on how you answer questions.\nThis is based on when and where you were born. You don\'t choose anything.\n\nIt maps structure — how your energy is distributed — not which "type" you are.',
    'faq.q5.q': 'Is this astrology?',
    'faq.q5.a': 'No planets. No horoscopes. No zodiac signs.\n\nThe Four Pillars system uses a different framework entirely — based on time cycles (year, month, day, hour) and elemental balance (wood, fire, earth, metal, water).\n\nThe overlap with astrology is that both use birth data. The method is completely different.',
    'faq.q6.q': 'Why does AI work well with this?',
    'faq.q6.a': 'Because the Four Pillars system is rule-based.\n\nFixed inputs. Consistent logic. No interpretation ambiguity.\nThat\'s exactly what AI handles well — reading structured data and generating clear analysis at scale.',
    'faq.q7.q': 'Why mention neuroscience?',
    'faq.q7.a': 'Because your behavior isn\'t fixed — it shifts with context.\n\nNeuroscience shows that energy, timing, and environment change how you think and act. The Four Pillars system maps those same shifts from a different angle.\n\nWe\'re not claiming scientific proof. We\'re saying the frameworks point in the same direction.',
    'faq.q8.q': 'What do I actually get?',
    'faq.q8.a': 'A multi-page personal report covering:\n\n• Your core operating pattern (how you\'re wired)\n• Your current energy phase (what\'s active now)\n• Where tension builds (what drains you)\n• Actionable direction (what to adjust)\n\nThe first section is free. The full report is unlocked with payment.',
    'faq.q9.q': 'How long does it take?',
    'faq.q9.a': 'About 3 minutes to complete the survey.\nYour report is generated and delivered by email within minutes.',
    'faq.q10.q': 'Is my data safe?',
    'faq.q10.a': 'Your birth data is used to generate your report. That\'s it.\n\nWe don\'t sell data. We don\'t share it with third parties.\nEmail is used only for report delivery.',
    'faq.q11.q': 'Does this define me?',
    'faq.q11.a': 'No.\n\nIt doesn\'t tell you who to be.\nIt shows what conditions tend to support you — and which ones don\'t.\n\nWhat you do with that is up to you.',
    'faq.contact.title': 'Contact',
    'faq.contact.desc': 'Questions, feedback, or just want to say hi?',
    'faq.cta': 'Start your analysis',

    // Element names (radar chart)
    'element.wood': 'Wood',
    'element.fire': 'Fire',
    'element.earth': 'Earth',
    'element.metal': 'Metal',
    'element.water': 'Water',
    'element.balance.title': 'Your Element Balance',
    'element.missing': 'Missing',
    'element.excess': 'Excess',
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
    'landing.solution.desc': 'BADA는 1,200년 된 알고리즘인 "60갑자 사이클"을 사용해 당신의 타고난 에너지 패턴을 매핑합니다.',
    'landing.solution.tooltip': '한국에서는 이것을 "사주(四柱)"라고 부르죠',
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

    // Survey Questions (Q1-Q8)
    'survey.q1.text': '긴장되거나 혼란스러울 때, 가장 먼저 어떤 반응이 나오나요?',
    'survey.q1.A': '더 또렷하고 집중하게 된다',
    'survey.q1.B': '압도당하거나 감정적이 된다',
    'survey.q1.C': '그 상황을 피하려고 한다',
    'survey.q1.D': '상황에 따라 다르지만, 보통 A나 B',

    'survey.q2.text': '위기 상황에서 주변 사람들은 나를 이렇게 평가해요:',
    'survey.q2.A': '침착하고 명료하다',
    'survey.q2.B': '감정적이지만 솔직하다',
    'survey.q2.C': '조용하거나 얼어붙는다',
    'survey.q2.D': '잘 모르겠다',

    'survey.q3.text': '나는 이럴 때 가장 "살아있다"고 느껴요:',
    'survey.q3.A': '한계를 넘어설 때',
    'survey.q3.B': '안전하고 예측 가능할 때',
    'survey.q3.C': '감정적으로 연결될 때',
    'survey.q3.D': '잘 모르겠다',

    'survey.q4.text': '자라면서 내 환경은 어땠나요?',
    'survey.q4.A': '안전하고 예측 가능했다',
    'survey.q4.B': '불안정하거나 불확실했다',
    'survey.q4.C': '섞여 있었다',
    'survey.q4.D': '잘 기억나지 않는다',

    'survey.q5.text': '나는 이럴 때 가장 스트레스를 받아요:',
    'survey.q5.A': '아무것도 변하지 않을 때',
    'survey.q5.B': '무슨 일이 일어날지 모를 때',
    'survey.q5.C': '사람들이 속마음을 말하지 않을 때',
    'survey.q5.D': '누군가 나를 지켜보거나 판단할 때',

    'survey.q6.text': '내 삶에서 뭔가 잘못됐다고 느끼면, 보통:',
    'survey.q6.A': '상황을 바꾸려고 한다',
    'survey.q6.B': '나 자신을 조정한다',
    'survey.q6.C': '지켜보며 기다린다',
    'survey.q6.D': '다른 사람들에게 먼저 이야기한다',

    'survey.q7.text': '내 현재 상태는:',
    'survey.q7.A': '내가 적극적으로 만들어갈 수 있다',
    'survey.q7.B': '대부분 환경에 의해 결정된다',
    'survey.q7.C': '둘 다 섞여 있다',
    'survey.q7.D': '잘 모르겠다',

    'survey.q8.text': '만약 앞으로 1년간 아무것도 변하지 않는다면:',
    'survey.q8.A': '매우 불편할 것이다',
    'survey.q8.B': '대체로 괜찮을 것이다',
    'survey.q8.C': '안도할 것이다',
    'survey.q8.D': '혼란스러울 것이다',

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
    'birth.time.placeholder': '시간 선택',
    'birth.time.modal.title': '몇 시에 태어나셨나요?',
    'birth.time.modal.subtitle': '정확도 향상에 도움이 됩니다',
    'birth.time.hour': '시',
    'birth.time.minute': '분',
    'birth.time.confirm': '확인',
    'birth.time_unknown': '정확한 출생 시간을 모릅니다',
    'birth.location': '출생 시간대',
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

    // FAQ
    'faq.title': '자주 묻는 질문',
    'faq.q1.q': '이게 뭔가요?',
    'faq.q1.a': '출생 데이터를 기반으로 한 개인 분석입니다.\n\n동아시아에서 가장 오래된 패턴 프레임워크 중 하나인 사주(四柱)를 AI와 결합하여 당신의 작동 방식에 대한 리포트를 생성합니다.\n\n점술이 아닙니다. 성격 유형 분류도 아닙니다.\n당신의 경향성, 타이밍, 에너지에 대한 구조적 지도입니다.',
    'faq.q2.q': '점술인가요?',
    'faq.q2.a': '아닙니다.\n\n아무것도 예측하지 않습니다. "좋은" 결과도 "나쁜" 결과도 없습니다.\n무슨 일이 일어날지 말해주지 않습니다.\n\n당신의 에너지가 어떻게 움직이는 경향이 있는지 보여줍니다 — 그래서 그것에 맞서지 않고 함께 할 수 있도록.',
    'faq.q3.q': '무엇을 기반으로 하나요?',
    'faq.q3.a': '생년월일, 시간, 장소입니다.\n\n이 정보는 사주 차트로 변환됩니다 — 동아시아에서 수백 년간 반복되는 시간-에너지 사이클을 매핑하는 데 사용된 시스템입니다. 같은 입력은 항상 같은 차트를 만듭니다. 무작위성이 없습니다.\n\nAI가 차트를 읽고 리포트를 쉬운 언어로 작성합니다.',
    'faq.q4.q': 'MBTI랑 비슷한 건가요?',
    'faq.q4.a': '아닙니다.\n\nMBTI는 질문에 대한 답변을 기반으로 합니다.\n이것은 태어난 시간과 장소를 기반으로 합니다. 아무것도 선택하지 않습니다.\n\n어떤 "유형"인지가 아닌, 에너지가 어떻게 분포되어 있는지 — 구조를 매핑합니다.',
    'faq.q5.q': '점성술인가요?',
    'faq.q5.a': '행성 없음. 별자리 운세 없음. 황도대 없음.\n\n사주 시스템은 완전히 다른 프레임워크를 사용합니다 — 시간 사이클(년, 월, 일, 시)과 오행의 균형(목, 화, 토, 금, 수)에 기반합니다.\n\n점성술과의 공통점은 둘 다 출생 데이터를 사용한다는 것뿐입니다. 방법론은 완전히 다릅니다.',
    'faq.q6.q': 'AI가 왜 이것과 잘 맞나요?',
    'faq.q6.a': '사주 시스템이 규칙 기반이기 때문입니다.\n\n고정된 입력. 일관된 논리. 해석의 모호함 없음.\nAI가 가장 잘하는 것이 바로 이것입니다 — 구조화된 데이터를 읽고 명확한 분석을 대규모로 생성하는 것.',
    'faq.q7.q': '왜 신경과학을 언급하나요?',
    'faq.q7.a': '행동은 고정된 것이 아니라 맥락에 따라 변하기 때문입니다.\n\n신경과학은 에너지, 타이밍, 환경이 생각과 행동 방식을 바꾼다는 것을 보여줍니다. 사주 시스템은 다른 각도에서 같은 변화를 매핑합니다.\n\n과학적 증명을 주장하는 것이 아닙니다. 프레임워크들이 같은 방향을 가리킨다는 것입니다.',
    'faq.q8.q': '실제로 무엇을 받나요?',
    'faq.q8.a': '다음을 다루는 다중 페이지 개인 리포트:\n\n• 핵심 작동 패턴 (어떻게 설계되었는지)\n• 현재 에너지 단계 (지금 활성화된 것)\n• 긴장이 쌓이는 곳 (에너지를 소모하는 것)\n• 실행 가능한 방향 (조정할 것)\n\n첫 번째 섹션은 무료입니다. 전체 리포트는 결제 후 잠금 해제됩니다.',
    'faq.q9.q': '얼마나 걸리나요?',
    'faq.q9.a': '설문 완료까지 약 3분.\n리포트는 생성 후 몇 분 내에 이메일로 전달됩니다.',
    'faq.q10.q': '데이터는 안전한가요?',
    'faq.q10.a': '출생 데이터는 리포트 생성에만 사용됩니다. 그뿐입니다.\n\n데이터를 판매하지 않습니다. 제3자와 공유하지 않습니다.\n이메일은 리포트 전달에만 사용됩니다.',
    'faq.q11.q': '이게 나를 규정하나요?',
    'faq.q11.a': '아닙니다.\n\n누가 되어야 하는지 말하지 않습니다.\n어떤 조건이 당신을 지지하고 어떤 조건이 그렇지 않은지 보여줄 뿐입니다.\n\n그것을 어떻게 활용할지는 당신에게 달려 있습니다.',
    'faq.contact.title': '연락처',
    'faq.contact.desc': '질문, 피드백, 또는 그냥 인사하고 싶으신가요?',
    'faq.cta': '분석 시작하기',

    // Element names (radar chart)
    'element.wood': '목(木)',
    'element.fire': '화(火)',
    'element.earth': '토(土)',
    'element.metal': '금(金)',
    'element.water': '수(水)',
    'element.balance.title': '오행 밸런스',
    'element.missing': '부족',
    'element.excess': '과다',
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
    'landing.solution.desc': 'BADA menggunakan algoritma berusia 1.200 tahun yang disebut "Siklus 60 Tahun" untuk memetakan pola energi bawaanmu.',
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

    // Survey Questions (Q1-Q8) - matches scoring.ts QUESTIONS
    'survey.q1.text': 'Saat sesuatu terasa intens atau kacau, apa yang terjadi pertama kali?',
    'survey.q1.A': 'Aku jadi lebih waspada dan fokus',
    'survey.q1.B': 'Aku merasa kewalahan atau emosional',
    'survey.q1.C': 'Aku mencoba melarikan diri dari situasi itu',
    'survey.q1.D': 'Tergantung, tapi biasanya A atau B',

    'survey.q2.text': 'Dalam situasi krisis, orang-orang biasanya bilang aku:',
    'survey.q2.A': 'Tenang dan berpikir jernih',
    'survey.q2.B': 'Emosional tapi ekspresif',
    'survey.q2.C': 'Diam atau membeku',
    'survey.q2.D': 'Tidak yakin',

    'survey.q3.text': 'Aku merasa paling "hidup" saat:',
    'survey.q3.A': 'Aku didorong melampaui batasku',
    'survey.q3.B': 'Semuanya terasa aman dan terprediksi',
    'survey.q3.C': 'Aku terhubung secara emosional',
    'survey.q3.D': 'Aku tidak tahu',

    'survey.q4.text': 'Saat tumbuh dewasa, lingkunganku terasa:',
    'survey.q4.A': 'Aman dan terprediksi',
    'survey.q4.B': 'Tidak stabil atau tidak jelas',
    'survey.q4.C': 'Campuran',
    'survey.q4.D': 'Aku tidak ingat dengan jelas',

    'survey.q5.text': 'Aku paling stres saat:',
    'survey.q5.A': 'Tidak ada yang berubah',
    'survey.q5.B': 'Aku tidak tahu apa yang akan terjadi',
    'survey.q5.C': 'Orang-orang tidak mengatakan apa yang sebenarnya mereka pikirkan',
    'survey.q5.D': 'Aku merasa diawasi atau dinilai',

    'survey.q6.text': 'Saat sesuatu terasa salah dalam hidupku, aku biasanya:',
    'survey.q6.A': 'Mencoba mendesain ulang situasiku',
    'survey.q6.B': 'Menyesuaikan diriku sendiri',
    'survey.q6.C': 'Menunggu dan melihat',
    'survey.q6.D': 'Berbicara dengan orang lain dulu',

    'survey.q7.text': 'Aku percaya bahwa kondisiku saat ini adalah:',
    'survey.q7.A': 'Sesuatu yang bisa kubentuk secara aktif',
    'survey.q7.B': 'Sebagian besar ditentukan oleh keadaan',
    'survey.q7.C': 'Campuran keduanya',
    'survey.q7.D': 'Aku tidak yakin',

    'survey.q8.text': 'Jika tidak ada yang berubah selama setahun ke depan, aku akan merasa:',
    'survey.q8.A': 'Sangat tidak nyaman',
    'survey.q8.B': 'Sebagian besar baik-baik saja',
    'survey.q8.C': 'Lega',
    'survey.q8.D': 'Bingung',

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
    'birth.time.placeholder': 'Pilih waktu',
    'birth.time.modal.title': 'Jam berapa kamu lahir?',
    'birth.time.modal.subtitle': 'Ini membantu meningkatkan akurasi',
    'birth.time.hour': 'Jam',
    'birth.time.minute': 'Menit',
    'birth.time.confirm': 'Konfirmasi',
    'birth.time_unknown': 'Saya tidak tahu waktu lahir saya',
    'birth.location': 'Zona Waktu Kelahiran',
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

    // FAQ
    'faq.title': 'FAQ',
    'faq.q1.q': 'Apa ini?',
    'faq.q1.a': 'Analisis personal berdasarkan data kelahiranmu.\n\nKami menggunakan sistem berbasis waktu yang disebut Four Pillars (사주) — salah satu kerangka pola tertua di Asia Timur — dikombinasikan dengan AI untuk menghasilkan laporan tentang cara kerjamu.\n\nBukan ramalan. Bukan pengelompokan kepribadian.\nPeta struktural tentang kecenderungan, waktu, dan energimu.',
    'faq.q2.q': 'Apakah ini ramalan?',
    'faq.q2.a': 'Tidak.\n\nTidak ada yang diprediksi. Tidak ada hasil "baik" atau "buruk".\nKami tidak memberitahu apa yang akan terjadi.\n\nKami menunjukkan bagaimana energimu cenderung bergerak — agar kamu bisa bekerja bersamanya, bukan melawannya.',
    'faq.q3.q': 'Berdasarkan apa?',
    'faq.q3.a': 'Tanggal lahir, waktu, dan lokasimu.\n\nIni dikonversi menjadi bagan Four Pillars — sistem yang digunakan di seluruh Asia Timur selama berabad-abad untuk memetakan siklus waktu-energi yang berulang. Input yang sama selalu menghasilkan bagan yang sama. Tidak ada keacakan.\n\nAI kemudian membaca bagan dan menulis laporanmu dalam bahasa yang mudah dipahami.',
    'faq.q4.q': 'Apakah ini seperti MBTI?',
    'faq.q4.a': 'Tidak.\n\nMBTI berdasarkan cara kamu menjawab pertanyaan.\nIni berdasarkan kapan dan di mana kamu lahir. Kamu tidak memilih apa pun.\n\nIni memetakan struktur — bagaimana energimu terdistribusi — bukan "tipe" apa kamu.',
    'faq.q5.q': 'Apakah ini astrologi?',
    'faq.q5.a': 'Tidak ada planet. Tidak ada horoskop. Tidak ada zodiak.\n\nSistem Four Pillars menggunakan kerangka yang sama sekali berbeda — berdasarkan siklus waktu (tahun, bulan, hari, jam) dan keseimbangan elemen (kayu, api, tanah, logam, air).\n\nKesamaan dengan astrologi hanya bahwa keduanya menggunakan data kelahiran. Metodenya sama sekali berbeda.',
    'faq.q6.q': 'Kenapa AI cocok dengan ini?',
    'faq.q6.a': 'Karena sistem Four Pillars berbasis aturan.\n\nInput tetap. Logika konsisten. Tidak ada ambiguitas interpretasi.\nItulah yang AI tangani dengan baik — membaca data terstruktur dan menghasilkan analisis yang jelas dalam skala besar.',
    'faq.q7.q': 'Kenapa menyebut neurosains?',
    'faq.q7.a': 'Karena perilakumu tidak tetap — berubah sesuai konteks.\n\nNeurosains menunjukkan bahwa energi, waktu, dan lingkungan mengubah cara berpikir dan bertindak. Sistem Four Pillars memetakan perubahan yang sama dari sudut berbeda.\n\nKami tidak mengklaim bukti ilmiah. Kami mengatakan kerangka-kerangka ini menunjuk ke arah yang sama.',
    'faq.q8.q': 'Apa yang sebenarnya saya dapat?',
    'faq.q8.a': 'Laporan personal multi-halaman yang mencakup:\n\n• Pola operasi inti (bagaimana kamu terhubung)\n• Fase energi saat ini (apa yang aktif sekarang)\n• Di mana ketegangan menumpuk (apa yang menguras)\n• Arah yang bisa ditindaklanjuti (apa yang perlu disesuaikan)\n\nBagian pertama gratis. Laporan lengkap dibuka dengan pembayaran.',
    'faq.q9.q': 'Berapa lama prosesnya?',
    'faq.q9.a': 'Sekitar 3 menit untuk menyelesaikan survei.\nLaporanmu dibuat dan dikirim lewat email dalam hitungan menit.',
    'faq.q10.q': 'Apakah data saya aman?',
    'faq.q10.a': 'Data kelahiranmu digunakan untuk membuat laporanmu. Itu saja.\n\nKami tidak menjual data. Kami tidak membagikannya dengan pihak ketiga.\nEmail hanya digunakan untuk pengiriman laporan.',
    'faq.q11.q': 'Apakah ini mendefinisikan saya?',
    'faq.q11.a': 'Tidak.\n\nIni tidak memberitahu siapa yang harus kamu jadi.\nIni menunjukkan kondisi apa yang cenderung mendukungmu — dan mana yang tidak.\n\nApa yang kamu lakukan dengan itu terserah kamu.',
    'faq.contact.title': 'Kontak',
    'faq.contact.desc': 'Pertanyaan, masukan, atau sekadar ingin menyapa?',
    'faq.cta': 'Mulai analisismu',

    // Element names (radar chart)
    'element.wood': 'Kayu',
    'element.fire': 'Api',
    'element.earth': 'Tanah',
    'element.metal': 'Logam',
    'element.water': 'Air',
    'element.balance.title': 'Keseimbangan Elemen',
    'element.missing': 'Kurang',
    'element.excess': 'Berlebih',
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
