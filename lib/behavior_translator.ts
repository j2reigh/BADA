/**
 * Behavior Translator
 * Converts HD/Saju/Survey data into plain-language behavioral patterns
 *
 * RULE: All technical terms stay here. Output is plain language only.
 */

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

export function translateToBehaviors(
  saju: SajuResult,
  hd: HumanDesignData,
  survey: SurveyScores,
  birthDate: string
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

  // Age Context
  let ageContext = '';
  if (age < 25) {
    ageContext = `At ${age}, you are in the experimentation phase. This is the time to try things, fail, and learn what does not work. Mistakes are not setbacks. They are data.`;
  } else if (age < 30) {
    ageContext = `At ${age}, you are transitioning out of pure experimentation. The lessons from your early twenties are starting to crystallize. Time to observe patterns, not just react to them.`;
  } else if (age < 35) {
    ageContext = `At ${age}, you are entering a more observational phase. Less trial and error, more strategic watching. The chaos of your twenties should start making sense now.`;
  } else if (age < 40) {
    ageContext = `At ${age}, you have enough experience to see patterns others miss. Your role is shifting from student to guide. People are starting to look to you for direction.`;
  } else if (age < 50) {
    ageContext = `At ${age}, you are in your authority years. The experiments are done. You know what works for you. Now it is about depth, not breadth.`;
  } else {
    ageContext = `At ${age}, your accumulated wisdom is your biggest asset. You have lived through enough cycles to see the long game. Share what you have learned.`;
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
};
