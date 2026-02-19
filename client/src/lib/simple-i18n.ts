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
    'landing.solution.title': 'Beyond',
    'landing.solution.title2': 'personality types.',
    'landing.solution.subtitle': 'We map <em>your patterns</em>.',
    'landing.solution.desc': 'From your birth data, BADA calculates your behavioral operating pattern — how you think, decide, burn out, and recharge.',
    'landing.solution.tooltip': '',
    'landing.solution.tagline': 'Think of it as an operating manual for your mind.',
    'landing.solution.step1': 'Answer',
    'landing.solution.step1.desc': '8 quick questions about your patterns',
    'landing.solution.step2': 'Analyze',
    'landing.solution.step2.desc': 'We calculate your behavioral operating pattern',
    'landing.solution.step3': 'Align',
    'landing.solution.step3.desc': 'Get your collision report and weekly protocol',

    // Landing - Sample Cards
    'landing.samples.tag': 'From Real Reports',
    'landing.samples.title': 'A glimpse into someone else\'s mind.',
    'landing.samples.disclaimer': 'Shared with permission from beta testers.',

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
    'survey.q1.D': 'It depends, but usually I become focused or emotional',

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
    'birth.location': 'Birth Location',
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
    'faq.q1.q': 'What is BADA?',
    'faq.q1.a': 'A personal report that shows how you think, decide, and operate. 3 cards free, full report for $2.9.',
    'faq.q2.q': 'How is this different from MBTI?',
    'faq.q2.a': 'MBTI gives you a type. BADA maps the patterns unique to you — why you burn out, how you make decisions, what you keep repeating. No two reports are the same.',
    'faq.q3.q': 'What data do you use?',
    'faq.q3.a': 'Your birth date, time, and location. From this, we calculate your behavioral operating pattern. Nothing is predicted — we show how you\'re wired, not what will happen.',
    'faq.q4.q': 'What do I get for $2.9?',
    'faq.q4.a': 'The full report: why your patterns exist, what they cost you at work, in relationships, and with money, how you recharge, your 10-year chapter, and one thing to change this week.',
    'faq.q5.q': 'Can I access it again later?',
    'faq.q5.a': 'Yes. Your report link doesn\'t expire. Bookmark it or check your email — we send it when your report is ready.',
    'faq.q6.q': 'Is my data safe?',
    'faq.q6.a': 'Your birth data is used only to generate your report. We don\'t sell or share it.',
    'faq.q7.q': 'I got a free code. How do I use it?',
    'faq.q7.a': 'Start the survey and generate your report first. On the report page, you\'ll see a code input field below the Unlock button. Enter your code there and tap Apply.',
    'faq.q8.q': 'How do I find my report again?',
    'faq.q8.a': 'Check your email — we sent you a link when your report was generated. You can also scroll to the bottom of our homepage and enter your email to get the link resent.',
    'faq.q9.q': 'How do I apply a discount code?',
    'faq.q9.a': 'On your report page, scroll down to the Unlock section. Enter your code in the input field below the payment button and tap Apply.',
    'faq.contact.title': 'How do I reach you?',
    'faq.contact.desc': 'Questions, feedback, or just want to say hi?',
    'faq.cta': 'Start your analysis',

    // Generating Screen
    'generating.step1': 'Reading your birth chart',
    'generating.step2': 'Mapping your energy design',
    'generating.step3': 'Finding the collision points',
    'generating.step4': 'Generating your diagnostic cards',
    'generating.step5': 'Finalizing your report',
    'generating.insight1': 'No two blueprints are alike — yours is being crafted now.',
    'generating.insight2': 'We\'re looking at how your natural wiring meets your current reality.',
    'generating.insight3': 'Your report maps both your strengths and your blind spots.',
    'generating.insight4': 'Over 480 unique archetype combinations exist. Finding yours.',
    'generating.insight5': 'Almost there — preparing your personalized action guide.',
    'generating.label': 'Generating',
    'generating.error.title': 'Something didn\'t work',
    'generating.error.desc': 'We couldn\'t generate your report this time.<br />Your answers are saved — just tap below to try again.',
    'generating.error.retry': 'Try again',
    'generating.error.retrying': 'Retrying...',

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
    'landing.hero.title': 'Stop Guessing.',
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
    'landing.solution.title': '성격 유형을',
    'landing.solution.title2': '넘어서.',
    'landing.solution.subtitle': '<em>당신의 패턴</em>을 매핑합니다.',
    'landing.solution.desc': '생년월일 데이터로 당신의 행동 작동 패턴을 계산합니다 — 어떻게 생각하고, 결정하고, 번아웃되고, 회복하는지.',
    'landing.solution.tooltip': '',
    'landing.solution.tagline': '마음의 사용설명서라고 생각하세요.',
    'landing.solution.step1': '응답',
    'landing.solution.step1.desc': '패턴에 대한 8개 질문',
    'landing.solution.step2': '분석',
    'landing.solution.step2.desc': '행동 작동 패턴을 계산합니다',
    'landing.solution.step3': '정렬',
    'landing.solution.step3.desc': '나만의 충돌 리포트와 주간 프로토콜 확인',

    // Landing - Sample Cards
    'landing.samples.tag': '실제 리포트에서',
    'landing.samples.title': '다른 사람의 마음을 엿보다.',
    'landing.samples.disclaimer': '베타 테스터의 동의 하에 공유됩니다.',

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
    'survey.q1.D': '상황에 따라 다르지만, 보통 집중하거나 감정적이 된다',

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
    'birth.location': '출생 장소',
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
    'faq.q1.q': 'BADA가 뭔가요?',
    'faq.q1.a': '당신이 어떻게 생각하고, 결정하고, 작동하는지 보여주는 개인 리포트입니다. 3장 무료, 풀 리포트 $2.9.',
    'faq.q2.q': 'MBTI랑 뭐가 다른가요?',
    'faq.q2.a': 'MBTI는 유형을 줍니다. BADA는 당신만의 패턴을 매핑합니다 — 왜 번아웃이 오는지, 어떻게 결정하는지, 뭘 반복하는지. 같은 리포트는 없습니다.',
    'faq.q3.q': '어떤 데이터를 쓰나요?',
    'faq.q3.a': '생년월일, 시간, 장소입니다. 이걸로 행동 작동 패턴을 계산합니다. 아무것도 예측하지 않습니다 — 당신이 어떻게 설계되었는지를 보여줍니다.',
    'faq.q4.q': '$2.9으로 뭘 더 보나요?',
    'faq.q4.a': '전체 리포트: 패턴이 왜 존재하는지, 직장·관계·돈에서 치르는 대가, 회복법, 10년 챕터, 이번 주 바꿀 수 있는 한 가지.',
    'faq.q5.q': '나중에 다시 볼 수 있나요?',
    'faq.q5.a': '네. 리포트 링크는 만료되지 않습니다. 북마크하거나 이메일을 확인하세요 — 리포트 완성 시 보내드립니다.',
    'faq.q6.q': '데이터는 안전한가요?',
    'faq.q6.a': '생년월일은 리포트 생성에만 사용됩니다. 판매하거나 공유하지 않습니다.',
    'faq.q7.q': '무료 코드를 받았는데 어떻게 쓰나요?',
    'faq.q7.a': '먼저 서베이를 완료하고 리포트를 생성하세요. 리포트 페이지에서 잠금 해제 버튼 아래에 코드 입력 필드가 있습니다. 코드를 입력하고 적용을 누르세요.',
    'faq.q8.q': '이미 생성한 리포트를 어떻게 다시 볼 수 있나요?',
    'faq.q8.a': '이메일을 확인하세요 — 리포트 생성 시 링크를 보내드렸습니다. 홈페이지 하단에서 이메일을 입력하면 링크를 다시 받을 수 있습니다.',
    'faq.q9.q': '할인 코드는 어떻게 적용하나요?',
    'faq.q9.a': '리포트 페이지에서 잠금 해제 섹션까지 스크롤하세요. 결제 버튼 아래 코드 입력 필드에 코드를 입력하고 적용을 누르세요.',
    'faq.contact.title': '어디로 연락하나요?',
    'faq.contact.desc': '질문, 피드백, 또는 그냥 인사하고 싶으신가요?',
    'faq.cta': '분석 시작하기',

    // Generating Screen
    'generating.step1': '출생 차트 읽는 중',
    'generating.step2': '에너지 설계 매핑 중',
    'generating.step3': '충돌 포인트 탐색 중',
    'generating.step4': '진단 카드 생성 중',
    'generating.step5': '리포트 마무리 중',
    'generating.insight1': '같은 설계도는 없습니다 — 지금 당신만의 것을 만들고 있어요.',
    'generating.insight2': '타고난 배선이 현재 현실과 어떻게 만나는지 분석 중이에요.',
    'generating.insight3': '리포트는 강점과 사각지대를 모두 매핑합니다.',
    'generating.insight4': '480가지 이상의 고유한 조합 중 당신의 것을 찾고 있어요.',
    'generating.insight5': '거의 다 됐어요 — 맞춤 행동 가이드를 준비하고 있습니다.',
    'generating.label': '생성 중',
    'generating.error.title': '문제가 발생했어요',
    'generating.error.desc': '이번에 리포트를 생성하지 못했어요.<br />답변은 저장되어 있어요 — 아래를 눌러 다시 시도하세요.',
    'generating.error.retry': '다시 시도',
    'generating.error.retrying': '재시도 중...',

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
    'landing.solution.title': 'Melampaui',
    'landing.solution.title2': 'tipe kepribadian.',
    'landing.solution.subtitle': 'Kami memetakan <em>polamu</em>.',
    'landing.solution.desc': 'Dari data kelahiranmu, BADA menghitung pola operasi perilakumu — cara kamu berpikir, mengambil keputusan, burnout, dan pulih.',
    'landing.solution.tooltip': '',
    'landing.solution.tagline': 'Anggap saja sebagai manual operasi untuk pikiranmu.',
    'landing.solution.step1': 'Jawab',
    'landing.solution.step1.desc': '8 pertanyaan cepat tentang polamu',
    'landing.solution.step2': 'Analisis',
    'landing.solution.step2.desc': 'Kami menghitung pola operasi perilakumu',
    'landing.solution.step3': 'Selaraskan',
    'landing.solution.step3.desc': 'Dapatkan laporan collision dan protokol mingguanmu',

    // Landing - Sample Cards
    'landing.samples.tag': 'Dari Laporan Nyata',
    'landing.samples.title': 'Mengintip ke dalam pikiran orang lain.',
    'landing.samples.disclaimer': 'Dibagikan dengan izin dari beta tester.',

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
    'survey.q1.D': 'Tergantung, tapi biasanya jadi fokus atau emosional',

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
    'birth.location': 'Lokasi Kelahiran',
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
    'faq.q1.q': 'Apa itu BADA?',
    'faq.q1.a': 'Laporan personal yang menunjukkan cara kamu berpikir, mengambil keputusan, dan beroperasi. 3 kartu gratis, laporan lengkap $2.9.',
    'faq.q2.q': 'Apa bedanya dengan MBTI?',
    'faq.q2.a': 'MBTI memberimu tipe. BADA memetakan pola unikmu — kenapa kamu burnout, bagaimana kamu mengambil keputusan, apa yang terus kamu ulangi. Tidak ada dua laporan yang sama.',
    'faq.q3.q': 'Data apa yang digunakan?',
    'faq.q3.a': 'Tanggal, waktu, dan lokasi kelahiranmu. Dari sini, kami menghitung pola operasi perilakumu. Tidak ada yang diprediksi — kami menunjukkan bagaimana kamu dirancang, bukan apa yang akan terjadi.',
    'faq.q4.q': 'Apa yang saya dapat dengan $2.9?',
    'faq.q4.a': 'Laporan lengkap: kenapa polamu ada, biayanya di kerja, hubungan, dan uang, cara recharge, chapter 10 tahunmu, dan satu hal yang bisa diubah minggu ini.',
    'faq.q5.q': 'Bisa diakses lagi nanti?',
    'faq.q5.a': 'Ya. Link laporanmu tidak kedaluwarsa. Bookmark atau cek emailmu — kami kirim saat laporanmu siap.',
    'faq.q6.q': 'Apakah data saya aman?',
    'faq.q6.a': 'Data kelahiranmu hanya digunakan untuk membuat laporanmu. Kami tidak menjual atau membagikannya.',
    'faq.q7.q': 'Saya dapat kode gratis. Bagaimana cara pakainya?',
    'faq.q7.a': 'Mulai survei dan buat laporanmu dulu. Di halaman laporan, kamu akan lihat kolom kode di bawah tombol Buka. Masukkan kode dan ketuk Terapkan.',
    'faq.q8.q': 'Bagaimana cara menemukan laporan saya lagi?',
    'faq.q8.a': 'Cek emailmu — kami kirim link saat laporanmu dibuat. Kamu juga bisa scroll ke bawah homepage dan masukkan emailmu untuk mendapat link ulang.',
    'faq.q9.q': 'Bagaimana cara pakai kode diskon?',
    'faq.q9.a': 'Di halaman laporanmu, scroll ke bagian Buka. Masukkan kode di kolom input di bawah tombol pembayaran dan ketuk Terapkan.',
    'faq.contact.title': 'Bagaimana cara menghubungi?',
    'faq.contact.desc': 'Pertanyaan, masukan, atau sekadar ingin menyapa?',
    'faq.cta': 'Mulai analisismu',

    // Generating Screen
    'generating.step1': 'Membaca chart kelahiranmu',
    'generating.step2': 'Memetakan desain energimu',
    'generating.step3': 'Menemukan titik collision',
    'generating.step4': 'Membuat kartu diagnostikmu',
    'generating.step5': 'Menyelesaikan laporanmu',
    'generating.insight1': 'Tidak ada dua blueprint yang sama — milikmu sedang dibuat sekarang.',
    'generating.insight2': 'Kami melihat bagaimana pola alami bertemu realitasmu saat ini.',
    'generating.insight3': 'Laporanmu memetakan kekuatan dan titik butamu.',
    'generating.insight4': 'Ada lebih dari 480 kombinasi unik. Menemukan milikmu.',
    'generating.insight5': 'Hampir selesai — menyiapkan panduan aksi personalmu.',
    'generating.label': 'Membuat',
    'generating.error.title': 'Ada yang tidak berjalan',
    'generating.error.desc': 'Kami tidak bisa membuat laporanmu kali ini.<br />Jawabanmu tersimpan — ketuk di bawah untuk coba lagi.',
    'generating.error.retry': 'Coba lagi',
    'generating.error.retrying': 'Mencoba lagi...',

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
