import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, ChevronDown, Zap, Code2 } from "lucide-react";
import { ResultsData } from "@/components/report-v2/types";
import { queryClient } from "@/lib/queryClient";

// ─── Helpers ───

function firstSentences(text: string | undefined, count: number): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, count).join(" ").trim();
}

// ─── V3 Content Derivation: "Collision" Framing ───

interface V3CardContent {
  hookQuestion: string;
  mirrorQuestion: string;
  mirrorText: string;
  mirrorAccent: string;
  blueprintQuestion: string;
  blueprintText: string;
  blueprintAccent: string;
  collisionQuestion: string;
  collisionText: string;
  collisionAccent: string;
  evidenceQuestion: string;
  evidence: string[];
  costCareerQuestion: string;
  costCareer: { title: string; text: string };
  costRelationshipQuestion: string;
  costRelationship: { title: string; text: string };
  costMoneyQuestion: string;
  costMoney: { title: string; text: string };
  brainScan: {
    question: string;
    alarm: number;
    drive: number;
    stability: number;
    remaining: number;
    insight: string;
  };
  // Timeline cards
  chapter: {
    question: string;
    previousLabel: string;
    previousText: string;
    currentLabel: string;
    currentText: string;
    nextLabel: string;
    nextText: string;
    accent: string;
  };
  yearQuestion: string;
  yearText: string;
  yearAccent: string;
  actionQuestion: string;
  actionNeuro: string;
  shift: { name: string; text: string; when: string };
  closingLine: string;
}

function deriveV3Content(report: ResultsData): V3CardContent {
  const survey = report.userInput?.surveyScores;
  const saju = report.sajuData;
  const p2 = report.page2_hardware;
  const p4 = report.page4_mismatch;
  const p5 = report.page5_solution;

  const highAgency = survey?.agencyActive === 1;
  const highThreat = survey?.threatClarity === 1;
  const stableEnv = survey?.environmentStable === 1;
  const fire = saju?.elementCounts?.fire || 0;
  const wood = saju?.elementCounts?.wood || 0;
  const water = saju?.elementCounts?.water || 0;
  const alignment = saju?.operatingAnalysis?._internal?.alignmentType || "";
  const isOverdriven = alignment === "overdriven";

  // ── Mirror: What survey says about self-perception ──
  const mirrorTraits: string[] = [];
  if (highAgency) mirrorTraits.push("someone who takes action");
  if (highThreat) mirrorTraits.push("someone who catches problems before they happen");
  if (stableEnv) mirrorTraits.push("someone who performs well under any conditions");

  const mirrorText = mirrorTraits.length > 0
    ? `You see yourself as ${mirrorTraits.join(", and ")}. The reliable one. The one who gets things done.`
    : "You see yourself as someone who handles life well. Steady, capable, in control.";

  const mirrorAccent = highAgency && highThreat
    ? "In your mind, your strength is your ability to spot danger AND act on it immediately."
    : highAgency
    ? "In your mind, your strength is your bias toward action. You don't wait around."
    : "In your mind, your strength is your patience. You observe before you act.";

  // ── Blueprint: What saju says about born design ──
  const dayMasterEl = saju?.fourPillars?.day?.ganElement || "earth";

  const elementPersonality: Record<string, string> = {
    earth: "You were designed to be a mountain. Patient. Immovable. Deliberate. Your power comes from staying still while everything else moves around you.",
    fire: "You were designed to be a flame. Expressive, passionate, illuminating. Your power comes from burning bright, not from burning long.",
    water: "You were designed to be a river. Flowing, adaptive, finding the path of least resistance. Your power comes from flexibility, not force.",
    wood: "You were designed to be a tree. Growing upward, bending without breaking. Your power comes from steady growth, not sudden leaps.",
    metal: "You were designed to be a blade. Precise, decisive, cutting through noise. Your power comes from sharpness, not volume.",
  };

  const blueprintText = elementPersonality[dayMasterEl] || elementPersonality.earth;

  const blueprintAccents: string[] = [];
  if (fire >= 3 && water === 0) blueprintAccents.push("Your internal fire is extreme, but you have zero cooling mechanism.");
  else if (fire >= 3) blueprintAccents.push("Your internal fire runs hot. You burn through energy faster than you replenish it.");
  if (wood === 0) blueprintAccents.push("You have no flexibility element. Adapting to change doesn't come naturally.");
  if (isOverdriven) blueprintAccents.push("Your system is overdriven. You're spending more energy than your design intended.");

  const blueprintAccent = blueprintAccents.length > 0
    ? blueprintAccents.join(" ")
    : "Your element balance shapes how you naturally operate.";

  // ── Hook: The core tension as a question ──
  let hookQuestion = "What pattern keeps repeating in your life?";

  if (highAgency && dayMasterEl === "earth" && fire >= 3) {
    hookQuestion = "Why does the person who catches every problem still feel like they're falling behind?";
  } else if (highAgency && isOverdriven) {
    hookQuestion = "Why are you exhausted when you're doing everything right?";
  } else if (highThreat && !highAgency) {
    hookQuestion = "Why can you see the solution clearly but never pull the trigger?";
  } else if (fire >= 3 && water === 0) {
    hookQuestion = "Why do you start on fire but never see things through?";
  } else if (highAgency && highThreat) {
    hookQuestion = "Why does the person who handles everything still feel like it's never enough?";
  }

  // ── Collision: The gap between mirror and blueprint ──
  let collisionText = "";
  let collisionAccent = "";

  if (highAgency && dayMasterEl === "earth") {
    collisionText = "You think speed is your strength. Your design says it's your biggest leak. You were built to be a mountain, not a sprinter. Every time you rush to fix something, you're overriding the system that gives you your actual power: patience.";
    collisionAccent = "The gap: you act like fire, but you were built from earth. That mismatch is where your energy disappears.";
  } else if (highAgency && isOverdriven) {
    collisionText = "You believe more effort equals more results. Your system says you passed that threshold a long time ago. You're at 59% efficiency not because you're lazy, but because you're running a machine at 120% that was designed for 80%.";
    collisionAccent = "The gap: your self-image says 'push harder.' Your design says 'you're already breaking.'";
  } else if (highThreat && !highAgency) {
    collisionText = "You see every problem coming but you wait for someone else to act. It's not hesitation. Your alarm system fires at full power, but your drive stays in conservation mode. You're built to warn, not to lead the charge.";
    collisionAccent = "The gap: your radar is set to max, but your engine is in park.";
  } else {
    collisionText = "Your self-perception and your design are pulling in opposite directions. What you think makes you strong is actually costing you the most energy.";
    collisionAccent = "Understanding this gap is the first step to stopping the leak.";
  }

  // ── Evidence: Behavioral proof (derived from tension) ──
  const evidence: string[] = [];

  if (highAgency && highThreat) {
    evidence.push("You scan every room for problems before you've even sat down. By the time the meeting starts, you've already drafted three contingency plans.");
    evidence.push("You say yes before checking your capacity. Not because you want to help. Because saying no feels like failing.");
    evidence.push("You finish other people's tasks 'because it's faster.' Then resent that no one does the same for you.");
  } else if (highThreat && !highAgency) {
    evidence.push("You draft the email, re-read it four times, then save it as a draft. You know what to say. You just don't hit send.");
    evidence.push("You give advice to friends that you never follow yourself. You can see the answer for everyone but you.");
    evidence.push("You prepare for meetings that don't require preparation. Not because it helps, but because not preparing feels reckless.");
  } else {
    evidence.push(p2?.core_insights?.[0] || "You prepare more than you need to, then call it being thorough.");
    evidence.push(p2?.core_insights?.[1] || "You know the answer but wait for someone else to say it first.");
    evidence.push(p2?.core_insights?.[2] || "You start strong but lose interest once the challenge is gone.");
  }

  // ── Costs: Reframe from collision, not generic ──
  const costCareer = {
    title: p4?.career_friction?.title || "At work",
    text: highAgency && highThreat
      ? "You become indispensable, then trapped. You built the system, now you're the only one who can maintain it. That's not success. That's a cage you constructed yourself."
      : firstSentences(p4?.career_friction?.description, 2) || "",
  };

  const costRelationship = {
    title: p4?.relationship_friction?.title || "In relationships",
    text: highAgency && highThreat
      ? "You show up as the strong one. Always capable, never needing. People stop asking if you're okay because you trained them not to. The fortress works. That's the problem."
      : firstSentences(p4?.relationship_friction?.description, 2) || "",
  };

  const costMoney = {
    title: p4?.money_friction?.title || "With money",
    text: fire >= 3 && isOverdriven
      ? "You earn and spend in the same motion. Money comes in through effort, leaks out through the constant maintenance of problems you anticipated but didn't need to solve."
      : firstSentences(p4?.money_friction?.description, 2) || "",
  };

  // ── Shift: One concrete action ──
  const ritual = p5?.daily_rituals?.[0];
  const shift = {
    name: ritual?.name || "The Pause Protocol",
    text: highAgency && dayMasterEl === "earth"
      ? "Before any decision this week, wait 10 minutes. Not to think. To let the first impulse pass. Your mountain doesn't need to respond to every tremor. The right answer comes after the shaking stops."
      : firstSentences(ritual?.description, 2) || "Pick one recurring task. Do it at 70% effort instead of 100%. Notice what actually changes.",
    when: ritual?.when || "Starting tomorrow. 7 days.",
  };

  // ── Q&A Questions for each card ──
  const mirrorQuestion = highAgency && highThreat
    ? "You think you know exactly who you are. But do you?"
    : highAgency
    ? "You define yourself by action. But is that the full picture?"
    : "How would you describe yourself in one sentence?";

  const blueprintQuestion = dayMasterEl === "earth" && fire >= 3
    ? "What if you were never meant to move this fast?"
    : isOverdriven
    ? "What happens when hardware runs software it wasn't designed for?"
    : "What does your original design actually say?";

  const collisionQuestion = highAgency && dayMasterEl === "earth"
    ? "So what breaks when a mountain tries to sprint?"
    : highAgency && isOverdriven
    ? "What's the real cost of running at 120%?"
    : "Where does the mismatch show up?";

  const evidenceQuestion = highAgency && highThreat
    ? "Sound familiar?"
    : "Recognize any of these?";

  const costCareerQuestion = highAgency
    ? "Why do you keep hitting the same ceiling?"
    : "Why does work feel heavier than it should?";

  const costRelationshipQuestion = highThreat
    ? "Why do the people closest to you seem distant?"
    : "What is this pattern doing to your relationships?";

  const costMoneyQuestion = fire >= 3
    ? "Why does money come in and leave just as fast?"
    : "Where does the money actually go?";

  // ── Energy Allocation: Survey raw scores → deterministic percentages ──
  const threatRaw = survey?.threatScore || 0;   // 0-3
  const agencyRaw = survey?.agencyScore || 0;   // 0-3
  const envRaw = survey?.environmentScore || 0; // 0-2

  const threatBurn = Math.round((threatRaw / 3) * 80 + 15);    // 15-95%
  const driveBurn = Math.round((agencyRaw / 3) * 80 + 15);     // 15-95%
  const stabilityBurn = Math.round((envRaw / 2) * 60 + 20);    // 20-80%
  const avgBurn = Math.round((threatBurn + driveBurn + stabilityBurn) / 3);
  const remainingPercent = Math.max(5, 100 - avgBurn);

  const brainScanQuestion = threatBurn >= 60 && driveBurn >= 60
    ? "Where is all your energy actually going?"
    : threatBurn >= 60
    ? "Why are you always running on empty?"
    : driveBurn >= 60
    ? "Why does rest never feel like enough?"
    : "How is your energy being spent?";

  // Neuroscience interpretation of the allocation
  let brainInsight = "";
  if (threatBurn >= 60 && driveBurn >= 60) {
    brainInsight = `${threatBurn}% on scanning for threats (amygdala in overdrive), ${driveBurn}% on pushing to act (dopamine loop). Only ${remainingPercent}% left for rest, creativity, or connection.`;
  } else if (threatBurn >= 60) {
    brainInsight = `${threatBurn}% allocated to threat detection. Your amygdala flags normal situations as emergencies, keeping cortisol elevated even when you're safe. ${remainingPercent}% left for everything else.`;
  } else if (driveBurn >= 60) {
    brainInsight = `${driveBurn}% allocated to drive output. Your dopamine circuit rewards starting but not finishing, keeping you in perpetual pursuit mode. ${remainingPercent}% left for recovery.`;
  } else {
    brainInsight = `Your energy allocation is moderate across all axes. ${remainingPercent}% remains available. The question is whether that energy is going where you actually need it.`;
  }

  const brainScan = {
    question: brainScanQuestion,
    alarm: threatBurn,
    drive: driveBurn,
    stability: stabilityBurn,
    remaining: remainingPercent,
    insight: brainInsight,
  };

  // ── Action: Neuroscience mechanism ──
  const actionQuestion = "Can your brain actually rewire this?";
  let actionNeuro = "";
  if (highThreat && highAgency) {
    actionNeuro = "Your amygdala triggers threat responses 3x above baseline. Your prefrontal cortex compensates by staying in control mode. This is why you crash by 3pm. The protocol below interrupts this loop at the neural level.";
  } else if (highThreat) {
    actionNeuro = "Your amygdala is hyperactive, flagging normal situations as threats and keeping cortisol elevated. The protocol below targets the gap between alarm response and executive function.";
  } else if (highAgency && isOverdriven) {
    actionNeuro = "Your dopamine system is stuck in pursuit mode. It rewards starting, not finishing. Your prefrontal cortex can't keep up with the volume. The protocol below resets the reward threshold.";
  } else {
    actionNeuro = "Your default mode network is overactive, cycling through unresolved patterns on repeat. The protocol below creates a deliberate interrupt in this loop.";
  }

  // ── Closing ──
  const closingLine = isOverdriven
    ? "Your system isn't broken. It's overclocked. Dial it back 30% and watch what happens."
    : "Your system isn't broken. It's miscalibrated. Now you know where the dial is.";

  return {
    hookQuestion,
    mirrorQuestion,
    mirrorText,
    mirrorAccent,
    blueprintQuestion,
    blueprintText,
    blueprintAccent,
    collisionQuestion,
    collisionText,
    collisionAccent,
    evidenceQuestion,
    evidence,
    costCareerQuestion,
    costCareer,
    costRelationshipQuestion,
    costRelationship,
    costMoneyQuestion,
    costMoney,
    brainScan,
    chapter: {
      question: "What chapter of your life are you actually in?",
      previousLabel: "Previous decade",
      previousText: "Switch to LLM mode to see your personalized timeline.",
      currentLabel: "Current decade",
      currentText: "Your 10-year chapter data will appear here when generated via LLM.",
      nextLabel: "Next decade",
      nextText: "Switch to LLM mode to see what's coming.",
      accent: "",
    },
    yearQuestion: `What is ${new Date().getFullYear()} actually asking of you?`,
    yearText: "Your annual energy reading will appear here when generated via LLM.",
    yearAccent: "",
    actionQuestion,
    actionNeuro,
    shift,
    closingLine,
  };
}

// ─── Card Shell ───

function Card({
  children,
  bg = "bg-[#0f1729]",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={`h-[100dvh] w-full flex-shrink-0 snap-start flex flex-col justify-center items-center px-8 ${bg} ${className}`}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] uppercase tracking-[0.3em] text-white/30 mb-6">
      {children}
    </span>
  );
}

function CardProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-white/60"
              : i < current
              ? "w-1.5 bg-white/20"
              : "w-1.5 bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Card Types ───

function HookCard({
  name,
  question,
  index,
  total,
}: {
  name: string;
  question: string;
  index: number;
  total: number;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#161d2e]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#879DC6]/60 mb-12">
          BADA
        </span>
        <h1 className="text-3xl font-light text-white/90 mb-8 leading-tight">
          {name}
        </h1>
        <p className="text-lg text-[#879DC6] font-light leading-relaxed">
          {question}
        </p>
        <div className="mt-16 flex flex-col items-center gap-2 text-white/20">
          <span className="text-[10px] tracking-widest uppercase">scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function InsightCard({
  label,
  question,
  text,
  accent,
  index,
  total,
}: {
  label: string;
  question?: string;
  text: string;
  accent?: string;
  index: number;
  total: number;
}) {
  return (
    <Card>
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>{label}</CardLabel>
        {question && (
          <>
            <p className="text-xl text-[#879DC6] font-light mb-6 leading-relaxed">
              {question}
            </p>
            <div className="w-8 h-px bg-white/10 mb-6" />
          </>
        )}
        <p className={`${question ? "text-base" : "text-xl"} font-light text-white/90 leading-relaxed`}>
          {text}
        </p>
        {accent && (
          <p className="mt-6 text-sm text-[#879DC6]/80 font-light leading-relaxed">
            {accent}
          </p>
        )}
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function EvidenceCard({
  label,
  question,
  items,
  index,
  total,
}: {
  label: string;
  question?: string;
  items: string[];
  index: number;
  total: number;
}) {
  return (
    <Card>
      <div className="relative flex flex-col w-full max-w-sm">
        <CardLabel>{label}</CardLabel>
        {question && (
          <p className="text-lg text-[#879DC6] font-light mb-6 leading-relaxed text-center">
            {question}
          </p>
        )}
        <div className="space-y-6 mt-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="text-[#879DC6]/40 font-mono text-sm mt-1 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-base font-light text-white/80 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function CostCard({
  label,
  question,
  emoji,
  title,
  description,
  index,
  total,
}: {
  label: string;
  question?: string;
  emoji: string;
  title: string;
  description: string;
  index: number;
  total: number;
}) {
  return (
    <Card>
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>{label}</CardLabel>
        {question && (
          <>
            <p className="text-lg text-[#879DC6] font-light mb-6 leading-relaxed">
              {question}
            </p>
            <div className="w-8 h-px bg-white/10 mb-4" />
          </>
        )}
        <span className="text-3xl mb-4">{emoji}</span>
        <h3 className="text-lg font-medium text-white/90 mb-4">{title}</h3>
        <p className="text-base font-light text-white/70 leading-relaxed">
          {firstSentences(description, 2)}
        </p>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function ActionCard({
  question,
  neuroExplanation,
  ritualName,
  description,
  when,
  index,
  total,
}: {
  question: string;
  neuroExplanation: string;
  ritualName: string;
  description: string;
  when: string;
  index: number;
  total: number;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#0d2137]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>this week</CardLabel>

        {/* Zoom-in breadcrumb — matching YearCard flow */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] text-white/20 uppercase tracking-wider">Decade</span>
          <span className="text-white/15">›</span>
          <span className="text-[10px] text-white/20 uppercase tracking-wider">{new Date().getFullYear()}</span>
          <span className="text-white/15">›</span>
          <span className="text-[10px] text-[#879DC6] uppercase tracking-wider font-medium">This week</span>
        </div>

        <p className="text-lg text-[#879DC6] font-light mb-6 leading-relaxed">
          {question}
        </p>
        <div className="w-8 h-px bg-white/10 mb-6" />
        <p className="text-sm text-white/50 font-light leading-relaxed mb-8">
          {neuroExplanation}
        </p>
        <div className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <h3 className="text-lg font-medium text-white/90 mb-3">{ritualName}</h3>
          <p className="text-sm font-light text-white/60 leading-relaxed">
            {firstSentences(description, 2)}
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-[#879DC6]/60 font-light">{when}</p>
        </div>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function ScanBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs text-white/70 font-medium">{label}</span>
        <span className="text-xs text-white/50 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function EnergyCard({
  question,
  alarm,
  drive,
  stability,
  remaining,
  insight,
  index,
  total,
}: {
  question: string;
  alarm: number;
  drive: number;
  stability: number;
  remaining: number;
  insight: string;
  index: number;
  total: number;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#0d1a2d]">
      <div className="relative flex flex-col items-center w-full max-w-sm">
        <CardLabel>energy allocation</CardLabel>
        <p className="text-lg text-[#879DC6] font-light mb-8 leading-relaxed text-center">
          {question}
        </p>
        <div className="w-full space-y-5 mb-6">
          <ScanBar label="Threat Response" value={alarm} color="from-red-500/60 to-red-400/40" />
          <ScanBar label="Drive Output" value={drive} color="from-amber-500/60 to-amber-400/40" />
          <ScanBar label="Stability Load" value={stability} color="from-blue-500/60 to-blue-400/40" />
          <div className="pt-3 border-t border-white/5">
            <ScanBar label="Available" value={remaining} color="from-emerald-500/60 to-emerald-400/40" />
          </div>
        </div>
        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#879DC6]/30 block mb-2">
            Neuroscience
          </span>
          <p className="text-xs text-white/50 font-light leading-relaxed">
            {insight}
          </p>
        </div>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function ChapterCard({
  chapter,
  index,
  total,
}: {
  chapter: V3CardContent["chapter"];
  index: number;
  total: number;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#1a1525]">
      <div className="relative flex flex-col items-center w-full max-w-sm">
        <CardLabel>your chapter</CardLabel>
        <p className="text-xl text-[#c4a0e8] font-light mb-8 leading-relaxed text-center">
          {chapter.question}
        </p>

        {/* Vertical timeline */}
        <div className="w-full space-y-0">
          {/* Previous */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center shrink-0 w-5">
              <div className="w-2 h-2 rounded-full bg-white/15" />
              <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-white/15 to-white/30" />
            </div>
            <div className="pb-5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">
                {chapter.previousLabel}
              </span>
              <p className="text-sm text-white/35 font-light leading-relaxed mt-1">
                {chapter.previousText}
              </p>
            </div>
          </div>

          {/* Current — highlighted */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center shrink-0 w-5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#c4a0e8] shadow-[0_0_12px_rgba(196,160,232,0.4)]" />
              <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-[#c4a0e8]/40 to-white/15" />
            </div>
            <div className="pb-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c4a0e8] font-medium">
                  {chapter.currentLabel}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#c4a0e8]/15 text-[#c4a0e8]/80 border border-[#c4a0e8]/20">
                  NOW
                </span>
              </div>
              <p className="text-base text-white/90 font-light leading-relaxed mt-1.5">
                {chapter.currentText}
              </p>
            </div>
          </div>

          {/* Next */}
          <div className="flex gap-4 items-start">
            <div className="flex flex-col items-center shrink-0 w-5">
              <div className="w-2 h-2 rounded-full bg-white/15" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">
                {chapter.nextLabel}
              </span>
              <p className="text-sm text-white/35 font-light leading-relaxed mt-1">
                {chapter.nextText}
              </p>
            </div>
          </div>
        </div>

        {/* Transition insight */}
        {chapter.accent && (
          <p className="mt-6 text-sm text-[#c4a0e8]/60 font-light leading-relaxed text-center px-2">
            {chapter.accent}
          </p>
        )}
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function YearCard({
  question,
  text,
  accent,
  index,
  total,
}: {
  question: string;
  text: string;
  accent: string;
  index: number;
  total: number;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#152025]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>this year</CardLabel>

        {/* Zoom-in breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[10px] text-white/20 uppercase tracking-wider">Decade</span>
          <span className="text-white/15">›</span>
          <span className="text-[10px] text-[#7ec8b8] uppercase tracking-wider font-medium">{new Date().getFullYear()}</span>
          <span className="text-white/15">›</span>
          <span className="text-[10px] text-white/20 uppercase tracking-wider">This week</span>
        </div>

        <p className="text-xl text-[#7ec8b8] font-light mb-6 leading-relaxed">
          {question}
        </p>
        <div className="w-8 h-px bg-white/10 mb-6" />
        <p className="text-base font-light text-white/90 leading-relaxed">
          {text}
        </p>
        {accent && (
          <div className="mt-6 px-4 py-3 rounded-xl bg-[#7ec8b8]/5 border border-[#7ec8b8]/10">
            <p className="text-sm text-[#7ec8b8]/80 font-light leading-relaxed">
              {accent}
            </p>
          </div>
        )}
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

function ClosingCard({
  message,
  reportId,
  index,
  total,
}: {
  message: string;
  reportId: string;
  index: number;
  total: number;
}) {
  const shareUrl = `${window.location.origin}/results/${reportId}/v3`;
  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] to-[#1a1012]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>closing</CardLabel>
        <p className="text-xl font-light text-white/90 leading-relaxed mb-10">
          {firstSentences(message, 2)}
        </p>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ url: shareUrl });
            } else {
              navigator.clipboard.writeText(shareUrl);
            }
          }}
          className="px-8 py-3 rounded-full bg-white/10 border border-white/20 text-sm text-white/70 hover:bg-white/15 transition-colors"
        >
          Share this report
        </button>
        <CardProgress current={index} total={total} />
      </div>
    </Card>
  );
}

// ─── Lock Card ───

function LockCard({
  reportId,
  email,
  remainingCount,
}: {
  reportId: string;
  email: string;
  remainingCount: number;
}) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const checkoutUrl = `https://gumroad.com/l/bada-full-report?wanted=true&report_id=${reportId}&email=${encodeURIComponent(email || "")}`;

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setCodeError("");
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, reportId }),
      });
      const data = await res.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: [`/api/results/${reportId}`] });
      } else {
        setCodeError(data.message || "Invalid code");
      }
    } catch {
      setCodeError("Network error");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <Card bg="bg-gradient-to-b from-[#0f1729] via-[#131a2b] to-[#0f1729]">
      <div className="flex flex-col items-center text-center w-full max-w-sm">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <Lock className="w-5 h-5 text-white/40" />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-lg text-white/50 font-light">거울</span>
          <span className="text-2xl text-[#879DC6]">≠</span>
          <span className="text-lg text-white/50 font-light">설계도</span>
        </div>

        <p className="text-base text-white/60 font-light leading-relaxed mb-2">
          이 간극이 만드는
        </p>
        <p className="text-xl text-white/90 font-light mb-10">
          반복 패턴 <span className="text-[#879DC6]">{remainingCount}장</span>
        </p>

        <button
          onClick={() => window.open(checkoutUrl, "_blank", "noopener")}
          className="w-full max-w-xs py-4 rounded-full bg-white text-[#0f1729] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors mb-4"
        >
          Unlock Full Report — $2.9
        </button>

        <div className="flex items-center gap-3 my-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex gap-2 w-full max-w-xs">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            placeholder="Enter code"
            maxLength={20}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center font-mono text-sm uppercase tracking-wider text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            onClick={handleRedeem}
            disabled={!code.trim() || isRedeeming}
            className="px-5 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/15 disabled:opacity-30 transition-colors"
          >
            {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        </div>
        {codeError && (
          <p className="text-xs text-red-400 mt-2">{codeError}</p>
        )}
      </div>
    </Card>
  );
}

// ─── Main Page ───

export default function ResultsV3() {
  const { reportId } = useParams<{ reportId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [source, setSource] = useState<"hardcoded" | "llm">("hardcoded");

  const { data: report, isLoading, error } = useQuery<ResultsData>({
    queryKey: [`/api/results/${reportId}`],
  });

  // LLM-generated v3 cards (fetched on demand)
  const { data: llmCards, isLoading: llmLoading, refetch: fetchLlm, isFetched: llmFetched } = useQuery<V3CardContent>({
    queryKey: [`/api/results/${reportId}/v3-cards`],
    enabled: false, // manual trigger only
  });

  // Track current card via scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      setCurrentCard(idx);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#0f1729]">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#0f1729]">
        <p className="text-white/50 text-sm">Report not found.</p>
      </div>
    );
  }

  const isPaid = report.isPaid;
  const name = report.userInput?.name || "Friend";

  // Derive collision-framed content from raw data (hardcoded fallback)
  const hardcoded = deriveV3Content(report);

  // Use LLM content if available and selected, otherwise hardcoded
  const v3 = (source === "llm" && llmCards) ? llmCards : hardcoded;

  // Build card list
  const freeCards = [
    {
      key: "hook",
      render: (idx: number, total: number) => (
        <HookCard name={name} question={v3.hookQuestion} index={idx} total={total} />
      ),
    },
    {
      key: "mirror",
      render: (idx: number, total: number) => (
        <InsightCard label="Your mirror" question={v3.mirrorQuestion} text={v3.mirrorText} accent={v3.mirrorAccent} index={idx} total={total} />
      ),
    },
    {
      key: "blueprint",
      render: (idx: number, total: number) => (
        <InsightCard label="Your blueprint" question={v3.blueprintQuestion} text={v3.blueprintText} accent={v3.blueprintAccent} index={idx} total={total} />
      ),
    },
  ];

  const paidCards = [
    {
      key: "collision",
      render: (idx: number, total: number) => (
        <InsightCard label="The collision" question={v3.collisionQuestion} text={v3.collisionText} accent={v3.collisionAccent} index={idx} total={total} />
      ),
    },
    {
      key: "brain-scan",
      render: (idx: number, total: number) => (
        <EnergyCard question={v3.brainScan.question} alarm={v3.brainScan.alarm} drive={v3.brainScan.drive} stability={v3.brainScan.stability} remaining={v3.brainScan.remaining} insight={v3.brainScan.insight} index={idx} total={total} />
      ),
    },
    {
      key: "evidence",
      render: (idx: number, total: number) => (
        <EvidenceCard label="Proof" question={v3.evidenceQuestion} items={v3.evidence} index={idx} total={total} />
      ),
    },
    {
      key: "cost-career",
      render: (idx: number, total: number) => (
        <CostCard label="At work" question={v3.costCareerQuestion} emoji="💼" title={v3.costCareer.title} description={v3.costCareer.text} index={idx} total={total} />
      ),
    },
    {
      key: "cost-relationship",
      render: (idx: number, total: number) => (
        <CostCard label="In relationships" question={v3.costRelationshipQuestion} emoji="💬" title={v3.costRelationship.title} description={v3.costRelationship.text} index={idx} total={total} />
      ),
    },
    {
      key: "cost-money",
      render: (idx: number, total: number) => (
        <CostCard label="With money" question={v3.costMoneyQuestion} emoji="💰" title={v3.costMoney.title} description={v3.costMoney.text} index={idx} total={total} />
      ),
    },
    {
      key: "chapter",
      render: (idx: number, total: number) => (
        <ChapterCard chapter={v3.chapter} index={idx} total={total} />
      ),
    },
    {
      key: "year",
      render: (idx: number, total: number) => (
        <YearCard question={v3.yearQuestion} text={v3.yearText} accent={v3.yearAccent} index={idx} total={total} />
      ),
    },
    {
      key: "action",
      render: (idx: number, total: number) => (
        <ActionCard question={v3.actionQuestion} neuroExplanation={v3.actionNeuro} ritualName={v3.shift.name} description={v3.shift.text} when={v3.shift.when} index={idx} total={total} />
      ),
    },
    {
      key: "closing",
      render: (idx: number, total: number) => (
        <ClosingCard message={v3.closingLine} reportId={reportId || ""} index={idx} total={total} />
      ),
    },
  ];

  const visibleCards = isPaid
    ? [...freeCards, ...paidCards]
    : freeCards;

  const totalCards = isPaid ? freeCards.length + paidCards.length : freeCards.length + 1; // +1 for lock card

  return (
    <div className="relative">
      {/* Source toggle (dev only) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => {
            if (source === "hardcoded") {
              if (!llmFetched) fetchLlm();
              setSource("llm");
            } else {
              setSource("hardcoded");
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors ${
            source === "llm"
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          {source === "llm" ? <Zap className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
          {source === "llm"
            ? llmLoading
              ? "generating..."
              : "LLM"
            : "hardcoded"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* LLM loading overlay */}
        {source === "llm" && llmLoading && (
          <Card>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-6 h-6 text-emerald-400/60 animate-spin" />
              <p className="text-sm text-white/40 font-light">Generating with Gemini...</p>
            </div>
          </Card>
        )}

        {!(source === "llm" && llmLoading) && (
          <>
            {visibleCards.map((card, i) => (
              <div key={card.key}>{card.render(i, totalCards)}</div>
            ))}

            {/* Lock card for unpaid users */}
            {!isPaid && (
              <LockCard
                reportId={reportId || ""}
                email={report.email || ""}
                remainingCount={paidCards.length}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
