/**
 * Behavior Translator
 * Converts HD/Saju/Survey data into plain-language behavioral patterns
 *
 * RULE: All technical terms stay here. Output is plain language only.
 */

import { Solar } from "lunar-typescript";
import type { SajuResult } from "./saju_calculator";

export interface HumanDesignData {
  type: string;
  profile: string;
  strategy: string;
  authority: string;
  centers: string[];
  definition: string;
  signature: string;
  not_self_theme: string;
  environment: string;
  channels_long: string[];
  cognition?: string;
  determination?: string;
  incarnation_cross?: string;
  variables?: string;
  motivation?: string;
  transference?: string;
  perspective?: string;
  distraction?: string;
  circuitries?: string;
  gates?: string[];
  channels_short?: string[];
  activations?: { design: Record<string, string>; personality: Record<string, string> };
}

export interface SurveyScores {
  threatScore: number;
  threatClarity: number;
  environmentScore: number;
  environmentStable: number;
  agencyScore: number;
  agencyActive: number;
  typeKey: string;
  typeName: string;
}

export interface BehaviorPatterns {
  decisionStyle: string;
  decisionWarning: string;
  energyPattern: string;
  vulnerabilities: string[];
  strengths: string[];
  warningSignal: string;
  optimalEnvironment: string;
  ageContext: string;
  designVsPerception: string[];
}

const ALL_CENTERS = ['Head', 'Ajna', 'Throat', 'G Center', 'Heart', 'Solar Plexus', 'Sacral', 'Spleen', 'Root'];

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export interface DaYunInfo {
  ganZhi: string;
  startAge: number;
  endAge: number;
  ganElement: string;
  zhiElement: string;
  ganMeaning: string;
  zhiMeaning: string;
  tenGodGan: string;   // 십신: 천간 vs 일간
  tenGodZhi: string;   // 십신: 지지 본기 vs 일간
}

export interface LuckCycleInfo {
  dayMaster: string;                   // 일간 (e.g. "戊")
  currentDaYun: DaYunInfo;
  previousDaYun: DaYunInfo | null;
  nextDaYun: DaYunInfo | null;
  currentSeUn: { year: number; ganZhi: string; ganElement: string; zhiElement: string; ganMeaning: string; tenGodGan: string; tenGodZhi: string };
  isForward: boolean;
  cyclePhase: string;
}

// 干支 to Element mapping
const GAN_ELEMENT: Record<string, string> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

// 干支 energy meaning (plain language)
const GANZHI_MEANING: Record<string, string> = {
  '甲': 'pioneering growth energy',
  '乙': 'flexible adaptation energy',
  '丙': 'bold outward expression',
  '丁': 'warm inner illumination',
  '戊': 'stable grounding force',
  '己': 'nurturing receptive force',
  '庚': 'decisive cutting energy',
  '辛': 'refined precision energy',
  '壬': 'flowing expansive wisdom',
  '癸': 'deep intuitive knowing',
};

// 지지 본기 (Main Qi of Earthly Branches) — the primary hidden stem
const ZHI_MAIN_QI: Record<string, string> = {
  '子': '癸', '丑': '己', '寅': '甲', '卯': '乙',
  '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
  '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬',
};

// Yin/Yang polarity of 天干
const GAN_POLARITY: Record<string, 'yang' | 'yin'> = {
  '甲': 'yang', '乙': 'yin',
  '丙': 'yang', '丁': 'yin',
  '戊': 'yang', '己': 'yin',
  '庚': 'yang', '辛': 'yin',
  '壬': 'yang', '癸': 'yin',
};

// Five-element production cycle: wood→fire→earth→metal→water→wood
const PRODUCTION_CYCLE: Record<string, string> = {
  'wood': 'fire', 'fire': 'earth', 'earth': 'metal', 'metal': 'water', 'water': 'wood',
};

// Five-element control cycle: wood→earth→water→fire→metal→wood
const CONTROL_CYCLE: Record<string, string> = {
  'wood': 'earth', 'earth': 'water', 'water': 'fire', 'fire': 'metal', 'metal': 'wood',
};

/**
 * Calculate the Ten God (십신) relationship between day master and a target stem.
 * Returns Korean ten god name (e.g. "편관", "정인").
 */
function getTenGod(dayMasterGan: string, targetGan: string): string {
  if (dayMasterGan === targetGan) return '비견'; // same stem = 비견

  const dmElement = GAN_ELEMENT[dayMasterGan];
  const tgElement = GAN_ELEMENT[targetGan];
  const dmPolarity = GAN_POLARITY[dayMasterGan];
  const tgPolarity = GAN_POLARITY[targetGan];
  const samePolarity = dmPolarity === tgPolarity;

  if (!dmElement || !tgElement) return 'unknown';

  // Same element, different stem → 비견 or 겁재
  if (dmElement === tgElement) {
    return samePolarity ? '비견' : '겁재';
  }
  // I produce target (생) → 식신 or 상관
  if (PRODUCTION_CYCLE[dmElement] === tgElement) {
    return samePolarity ? '식신' : '상관';
  }
  // Target produces me (인) → 편인 or 정인
  if (PRODUCTION_CYCLE[tgElement] === dmElement) {
    return samePolarity ? '편인' : '정인';
  }
  // I control target (극) → 편재 or 정재
  if (CONTROL_CYCLE[dmElement] === tgElement) {
    return samePolarity ? '편재' : '정재';
  }
  // Target controls me (관) → 편관 or 정관
  if (CONTROL_CYCLE[tgElement] === dmElement) {
    return samePolarity ? '편관' : '정관';
  }

  return 'unknown';
}

/**
 * Build a DaYunInfo object from a daYun entry and the day master stem.
 */
function buildDaYunInfo(daYun: any, dayMasterGan: string): DaYunInfo {
  const ganZhi = daYun.getGanZhi();
  const gan = ganZhi.charAt(0);
  const zhi = ganZhi.charAt(1);
  const zhiMainQi = ZHI_MAIN_QI[zhi] || '';

  return {
    ganZhi,
    startAge: daYun.getStartAge(),
    endAge: daYun.getEndAge(),
    ganElement: GAN_ELEMENT[gan] || 'unknown',
    zhiElement: GAN_ELEMENT[ZHI_MAIN_QI[zhi]] ? GAN_ELEMENT[ZHI_MAIN_QI[zhi]] : 'unknown',
    ganMeaning: GANZHI_MEANING[gan] || 'transitional energy',
    zhiMeaning: GANZHI_MEANING[zhiMainQi] || 'transitional energy',
    tenGodGan: getTenGod(dayMasterGan, gan),
    tenGodZhi: getTenGod(dayMasterGan, zhiMainQi),
  };
}

export function calculateLuckCycle(
  birthDate: string,
  birthTime: string,
  gender: 'M' | 'F',
  coordinates?: { latitude: number; longitude: number },
): LuckCycleInfo | null {
  try {
    let year: number, month: number, day: number, hour: number, minute: number;

    if (coordinates) {
      // Use True Solar Time for accurate pillar calculation
      const { calculateTrueSolarTime } = require('./time_utils');
      const tst = calculateTrueSolarTime(birthDate, birthTime || '12:00', coordinates.latitude, coordinates.longitude);
      year = tst.year;
      month = tst.month;
      day = tst.day;
      hour = tst.hour;
      minute = tst.minute;
    } else {
      [year, month, day] = birthDate.split('-').map(Number);
      [hour, minute] = (birthTime || '12:00').split(':').map(Number);
    }

    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    // gender: 1=male, 0=female
    const genderNum = gender === 'M' ? 1 : 0;
    const yun = eightChar.getYun(genderNum);

    const currentYear = new Date().getFullYear();
    const age = calculateAge(birthDate);

    // Day master stem (일간)
    const dayMasterGan = eightChar.getDayGan();

    // Get 대운 list
    const daYunList = yun.getDaYun(10);
    let currentIdx = -1;
    for (let i = 0; i < daYunList.length; i++) {
      const dy = daYunList[i];
      if (dy.getStartAge() <= age && dy.getEndAge() >= age) {
        currentIdx = i;
        break;
      }
    }

    if (currentIdx < 0) return null;

    const currentDaYun = daYunList[currentIdx];
    const currentDaYunInfo = buildDaYunInfo(currentDaYun, dayMasterGan);

    // Previous 대운
    const previousDaYunInfo = currentIdx > 0
      ? buildDaYunInfo(daYunList[currentIdx - 1], dayMasterGan)
      : null;

    // Next 대운
    const nextDaYunInfo = currentIdx < daYunList.length - 1
      ? buildDaYunInfo(daYunList[currentIdx + 1], dayMasterGan)
      : null;

    // Get 세운 for current year
    const liuNianList = currentDaYun.getLiuNian(10);
    const currentSeUn = liuNianList.find(ln => ln.getYear() === currentYear);

    const seUnGanZhi = currentSeUn?.getGanZhi() || '';
    const seUnGan = seUnGanZhi.charAt(0);
    const seUnZhi = seUnGanZhi.charAt(1);
    const seUnZhiMainQi = ZHI_MAIN_QI[seUnZhi] || '';

    // Determine cycle phase based on position in 대운
    const yearsIntoDaYun = age - currentDaYun.getStartAge();
    let cyclePhase = '';
    if (yearsIntoDaYun <= 2) {
      cyclePhase = 'entering a new 10-year chapter. The energy is shifting. Give yourself time to adjust.';
    } else if (yearsIntoDaYun >= 8) {
      cyclePhase = 'approaching a transition point. The current chapter is closing. Prepare for what comes next.';
    } else {
      cyclePhase = 'in the middle of a stable chapter. This is the time to build and consolidate.';
    }

    return {
      dayMaster: dayMasterGan,
      currentDaYun: currentDaYunInfo,
      previousDaYun: previousDaYunInfo,
      nextDaYun: nextDaYunInfo,
      currentSeUn: {
        year: currentYear,
        ganZhi: seUnGanZhi,
        ganElement: GAN_ELEMENT[seUnGan] || 'unknown',
        zhiElement: GAN_ELEMENT[seUnZhiMainQi] || 'unknown',
        ganMeaning: GANZHI_MEANING[seUnGan] || 'transitional energy',
        tenGodGan: getTenGod(dayMasterGan, seUnGan),
        tenGodZhi: getTenGod(dayMasterGan, seUnZhiMainQi),
      },
      isForward: yun.isForward(),
      cyclePhase,
    };
  } catch (e) {
    console.error('Luck cycle calculation failed:', e);
    return null;
  }
}

export function translateToBehaviors(
  saju: SajuResult,
  hd: HumanDesignData,
  survey: SurveyScores,
  birthDate: string,
  gender: string = "female",
  coordinates?: { latitude: number; longitude: number },
): BehaviorPatterns {

  const age = calculateAge(birthDate);

  // Decision Style
  const decisionStyles: Record<string, string> = {
    'Emotional': 'You need to sleep on big decisions. Your clarity comes after the initial wave passes. Not during the high, not during the low. After.',
    'Sacral': 'Your body knows before your brain does. That instant gut response (yes or no) is more reliable than hours of thinking.',
    'Splenic': 'Your first instinct is usually right. But it comes once and fast. If you miss it or override it with logic, it is gone.',
    'Ego': 'Ask yourself: "Do I actually want this? Is it worth my energy?" If the answer is not a clear yes, it is a no.',
    'Self-Projected': 'You figure things out by talking. Find someone you trust and think out loud. The answer comes through your own voice.',
    'Mental': 'You need multiple perspectives. Discuss with different people, visit different places. Clarity comes from variety, not isolation.',
    'Lunar': 'Major decisions need about a month. Seriously. Let a full cycle pass before committing to anything big.',
  };

  const decisionWarnings: Record<string, string> = {
    'Emotional': 'Deciding while excited or upset? You will likely regret it within 72 hours.',
    'Sacral': 'Overthinking kills your accuracy. The more you analyze, the more confused you get.',
    'Splenic': 'Second-guessing your gut? That is when you make mistakes.',
    'Ego': 'Saying yes to prove yourself? That leads to resentment.',
    'Self-Projected': 'Deciding alone in your head? You will miss something important.',
    'Mental': 'Rushing because others pressure you? Bad idea.',
    'Lunar': 'Deciding in the first week? You only have partial information.',
  };

  // Energy Pattern
  const fireCount = saju.elementCounts.fire;
  const waterCount = saju.elementCounts.water;
  const metalCount = saju.elementCounts.metal;
  let energyPattern = '';

  if (hd.type.includes('Generator')) {
    energyPattern = 'You have deep, sustainable energy when you are doing something you actually care about. ';
    if (fireCount >= 3 && waterCount === 0) {
      energyPattern += 'But you run hot with no cooling system. You say yes too fast, take on too much, and crash hard. Your engine is powerful but the brakes are weak.';
    } else if (fireCount >= 3) {
      energyPattern += 'Your tendency is to move fast and commit before thinking it through. The enthusiasm is real, but so is the burnout that follows.';
    } else if (metalCount === 0) {
      energyPattern += 'You struggle to cut things off. Projects, relationships, commitments. Everything lingers longer than it should.';
    } else {
      energyPattern += 'When aligned with the right work, you can go all day. When forcing yourself through the wrong work, you drain fast.';
    }
  } else if (hd.type === 'Projector') {
    energyPattern = 'Your energy is not designed for 8-hour workdays. You work in focused bursts, then need real rest. ';
    energyPattern += 'Trying to keep up with others will burn you out. Your power is in guiding, not grinding.';
  } else if (hd.type === 'Manifestor') {
    energyPattern = 'You move in bursts. Intense action, then rest. Trying to maintain steady output exhausts you. ';
    energyPattern += 'You need freedom to start things your way, and people get frustrated when you do not explain yourself.';
  } else if (hd.type === 'Reflector') {
    energyPattern = 'Your energy shifts constantly based on your environment. Some days you feel unstoppable, other days empty. ';
    energyPattern += 'This is not inconsistency. You are reflecting what is around you.';
  }

  // Vulnerabilities from Open Centers
  const openCenters = ALL_CENTERS.filter(c => !hd.centers.includes(c));
  const vulnerabilities: string[] = [];

  if (openCenters.includes('Heart')) {
    vulnerabilities.push('You feel pressure to prove your worth. You take on more than you should just to show you are valuable. This leads to overcommitment and resentment.');
  }
  if (openCenters.includes('G Center')) {
    vulnerabilities.push('You sometimes feel lost about who you are or where you are going. Your sense of identity shifts depending on who you are with or where you are.');
  }
  if (openCenters.includes('Head')) {
    vulnerabilities.push('Other people\'s ideas and questions hijack your attention. You get distracted trying to answer questions that are not even yours to solve.');
  }
  if (openCenters.includes('Ajna')) {
    vulnerabilities.push('You can see all sides of an argument. This is a strength, but it also means you struggle to feel certain about your own opinions.');
  }
  if (openCenters.includes('Throat')) {
    vulnerabilities.push('You sometimes feel pressure to speak up or prove yourself through words. Timing your expression is tricky. You either hold back too long or blurt things out.');
  }
  if (openCenters.includes('Sacral')) {
    vulnerabilities.push('Your energy is inconsistent. Some days you can go forever, other days you are empty. You do not always know when to stop.');
  }
  if (openCenters.includes('Spleen')) {
    vulnerabilities.push('You hold onto things (people, situations, habits) longer than you should. Fear of letting go keeps you stuck in places that are not good for you.');
  }
  if (openCenters.includes('Root')) {
    vulnerabilities.push('External pressure gets under your skin. Deadlines and urgency from others make you rush even when there is no real emergency.');
  }
  if (openCenters.includes('Solar Plexus')) {
    vulnerabilities.push('You absorb emotions from people around you. Crowded or tense environments drain you fast. You need time alone to discharge.');
  }

  // Strengths from Channels
  const strengths = hd.channels_long.map(ch => translateChannel(ch));

  // Warning Signal
  const warningSignals: Record<string, string> = {
    'Frustration and Anger': 'When frustration or anger builds up for no clear reason, your body is telling you something is off. You are either doing the wrong thing, or doing the right thing the wrong way.',
    'Bitterness': 'Bitterness creeping in means you have been giving without being invited or recognized. Time to step back and wait for people to actually ask for your input.',
    'Disappointment': 'Feeling disappointed often? You are probably initiating when you should be waiting. The right opportunities come to you. You do not have to chase them.',
    'Frustration': 'Frustration signals that you are forcing something. Either wrong work, wrong timing, or wrong approach.',
    'Anger': 'Anger comes when you did not inform people before acting. Or when people blocked you without understanding your intention.',
  };

  // Age Context with Luck Cycle
  const luckCycle = calculateLuckCycle(birthDate, '12:00', gender === 'female' ? 'F' : 'M', coordinates);

  let ageContext = '';

  // Prioritize luck cycle data for age context when available
  if (luckCycle) {
    const phaseContext = `You are ${luckCycle.cyclePhase}`;
    ageContext = `At ${age}, you are in a ${luckCycle.currentDaYun.ganElement} chapter (${luckCycle.currentDaYun.ganMeaning}). ${phaseContext} This chapter runs from age ${luckCycle.currentDaYun.startAge} to ${luckCycle.currentDaYun.endAge}. This year (${luckCycle.currentSeUn.year}) carries ${luckCycle.currentSeUn.ganElement} energy: ${luckCycle.currentSeUn.ganMeaning}.`;
  } else {
    // Fallback: generic age brackets when no luck cycle data
    if (age < 25) {
      ageContext = `At ${age}, you are in the experimentation phase. This is the time to try things, fail, and learn what does not work. Mistakes are not setbacks. They are data.`;
    } else if (age < 30) {
      ageContext = `At ${age}, you are transitioning out of pure experimentation. The lessons from your early twenties are starting to crystallize.`;
    } else if (age < 35) {
      ageContext = `At ${age}, you are entering a more observational phase. Less trial and error, more strategic watching.`;
    } else if (age < 40) {
      ageContext = `At ${age}, you have enough experience to see patterns others miss. Your role is shifting from student to guide.`;
    } else if (age < 50) {
      ageContext = `At ${age}, you are in your authority years. The experiments are done. You know what works for you.`;
    } else {
      ageContext = `At ${age}, your accumulated wisdom is your biggest asset. You have lived through enough cycles to see the long game.`;
    }
  }

  // Design vs Perception Gap
  const gaps = analyzeGaps(survey, hd, saju);

  return {
    decisionStyle: decisionStyles[hd.authority] || 'Take your time with important decisions. Rushing leads to regret.',
    decisionWarning: decisionWarnings[hd.authority] || 'Avoid deciding under pressure.',
    energyPattern,
    vulnerabilities,
    strengths,
    warningSignal: warningSignals[hd.not_self_theme] || warningSignals['Frustration'] || 'Pay attention when frustration builds. It is a signal.',
    optimalEnvironment: translateEnvironment(hd.environment),
    ageContext,
    designVsPerception: gaps,
  };
}

function translateChannel(channel: string): string {
  const translations: Record<string, string> = {
    'Charisma (20-34)': 'When you are doing what you love, people are drawn to you. Your busyness is magnetic, not exhausting. You get more done before noon than most people do all day.',
    'Judgment (18-58)': 'You see what is broken and how to fix it. Patterns, systems, processes. Your eye for improvement is relentless. Sometimes too relentless for people who did not ask for feedback.',
    'The Wavelength (16-48)': 'When something interests you, you go deep. Surface-level knowledge frustrates you. You need to master things fully or not bother at all.',
    'Acceptance (17-62)': 'You organize chaos. When things are scattered and confusing, you see the structure underneath. People rely on you to make sense of messy situations.',
    'Transitoriness (35-36)': 'You need new experiences to feel alive. Stagnation kills your spirit. You process life by going through different emotional states, not by staying stable.',
  };
  return translations[channel] || `Natural talent: ${channel.split('(')[0].trim()}`;
}

function translateEnvironment(env: string): string {
  const translations: Record<string, string> = {
    'Wide Valleys': 'You think best in open spaces with broad views. High ceilings, big windows, outdoor settings. Cramped spaces literally cramp your thinking.',
    'Mountains': 'You need perspective. Elevated spaces (top floors, overlooks) and big-picture thinking. Getting too close to details suffocates you.',
    'Caves': 'You need your own enclosed space. A room with a door that closes. Privacy is not a luxury for you. It is a requirement.',
    'Markets': 'You thrive in busy, social environments. Cafes, coworking spaces, anywhere with human energy flowing around you.',
    'Kitchens': 'You need warm, nurturing spaces. Comfort matters. The right temperature, the right smells, the right textures.',
    'Shores': 'You do best at edges and transitions. Where water meets land, where inside meets outside. Liminal spaces.',
  };
  return translations[env] || 'Pay attention to which physical spaces help you think clearly. Environment matters more for you than most people.';
}

function analyzeGaps(survey: SurveyScores, hd: HumanDesignData, saju: SajuResult): string[] {
  const gaps: string[] = [];

  // Gap 1: Decision speed mismatch
  const surveyDecidesFast = survey.agencyActive === 1;
  const hdNeedsToWait = hd.authority === 'Emotional' || hd.authority === 'Lunar';

  if (surveyDecidesFast && hdNeedsToWait) {
    gaps.push(
      `You see yourself as a fast decision-maker. Someone who knows what they want and acts on it. ` +
      `But here is what your pattern shows: you are wired to wait. Not forever. Just until the initial rush passes. ` +
      `Those decisions you made when you were "so sure"? The ones you regretted days later? That is the gap. ` +
      `Your speed is real. But your clarity needs time to catch up.`
    );
  }

  // Gap 2: High drive but open heart (proving vs wanting)
  const surveyHighAgency = survey.agencyScore >= 2;
  const hdOpenHeart = !hd.centers.includes('Heart');

  if (surveyHighAgency && hdOpenHeart) {
    gaps.push(
      `You score high on drive and initiative. You get things done. ` +
      `But here is a question worth sitting with: how much of that drive is "I want this" versus "I need to prove I can do this"? ` +
      `You are wired to absorb pressure to prove your worth. That can masquerade as ambition. ` +
      `The test: would you still do it if nobody ever knew?`
    );
  }

  // Gap 3: High threat sensitivity alignment or mismatch
  const surveyHighThreat = survey.threatClarity === 1;
  const hdHasSpleen = hd.centers.includes('Spleen');

  if (surveyHighThreat && hdHasSpleen) {
    gaps.push(
      `Your alertness is not paranoia. It is a real ability. ` +
      `You are wired with strong instincts for sensing what is off. Trust that. ` +
      `When something feels wrong, it usually is. Your job is not to override the signal. It is to act on it faster.`
    );
  }

  // Gap 4: Energy mismatch
  const surveyLowMaintenance = survey.environmentStable === 0;
  const hdIsGenerator = hd.type.includes('Generator');
  const sajuFireHigh = saju.elementCounts.fire >= 3;

  if (hdIsGenerator && surveyLowMaintenance && sajuFireHigh) {
    gaps.push(
      `You have massive energy. The kind that can outwork almost anyone. ` +
      `But your current state shows instability. You are probably burning through energy faster than you are replenishing it. ` +
      `This is not a willpower problem. You are likely spending energy on things that do not actually light you up. ` +
      `The fix is not "rest more." It is "do less of the wrong things."`
    );
  }

  return gaps;
}

// Sample HD Data for Testing (이지윤 데이터)
export const SAMPLE_HD_DATA: HumanDesignData = {
  type: "Manifesting Generator",
  profile: "4/6",
  strategy: "Wait to Respond",
  authority: "Emotional",
  centers: ["Ajna", "Root", "Sacral", "Solar Plexus", "Spleen", "Throat"],
  definition: "Single Definition",
  signature: "Satisfaction and Peace",
  not_self_theme: "Frustration and Anger",
  environment: "Wide Valleys",
  channels_long: [
    "The Wavelength (16-48)",
    "Acceptance (17-62)",
    "Judgment (18-58)",
    "Charisma (20-34)",
    "Transitoriness (35-36)"
  ],
  cognition: "Smell",
  determination: "Open Taste",
  motivation: "Hope",
  transference: "Guilt",
  perspective: "Wanting",
  distraction: "Distraction",
};
