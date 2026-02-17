import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, ChevronDown, ExternalLink } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// ─── Helpers ───

function firstSentences(text: string | undefined, count: number): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, count).join(" ").trim();
}

/** Render DO / DON'T strategy as fixed-label bullet points */
function StrategyBlock({ doText, dontText, legacy }: { doText?: string; dontText?: string; legacy?: string }) {
  // New split fields available
  if (doText && dontText) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 items-start">
          <span className="text-[#6BCB77] text-xs font-mono mt-0.5 shrink-0">DO</span>
          <p className="text-[15px] text-white/80 font-light leading-relaxed text-left">{doText}</p>
        </div>
        <div className="flex gap-2 items-start">
          <span className="text-[#FF6B6B] text-xs font-mono mt-0.5 shrink-0">DON'T</span>
          <p className="text-[15px] text-white/80 font-light leading-relaxed text-left">{dontText}</p>
        </div>
      </div>
    );
  }

  // Backward compat: try to parse legacy single-string format
  if (legacy) {
    const dontSplit = legacy.split(/(?:DON'T:|피해야 할 일:|피하세요:)\s*/i);
    if (dontSplit.length >= 2) {
      const parsedDo = dontSplit[0].replace(/^(?:DO:|수행해야 할 일:|실행하세요:)\s*/i, '').trim();
      const parsedDont = dontSplit[1].trim();
      return (
        <div className="space-y-3">
          <div className="flex gap-2 items-start">
            <span className="text-[#6BCB77] text-xs font-mono mt-0.5 shrink-0">DO</span>
            <p className="text-[15px] text-white/80 font-light leading-relaxed text-left">{parsedDo}</p>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-[#FF6B6B] text-xs font-mono mt-0.5 shrink-0">DON'T</span>
            <p className="text-[15px] text-white/80 font-light leading-relaxed text-left">{parsedDont}</p>
          </div>
        </div>
      );
    }
    return <p className="text-[15px] text-white/80 font-light leading-relaxed">{legacy}</p>;
  }

  return null;
}

// ─── V3 Card Content Type ───

interface V3CardContent {
  hookQuestion: string;
  mirrorQuestion: string;
  mirrorText: string;
  mirrorAccent: string;
  blueprintQuestion: string;
  blueprintText: string;
  blueprintAccent: string;
  blueprintFacets?: Array<{ label: string; text: string }>;
  decisionQuestion?: string;
  decisionText?: string;
  decisionAccent?: string;
  collisionQuestion?: string;
  collisionText?: string;
  collisionAccent?: string;
  evidenceQuestion?: string;
  evidence?: string[];
  costCareerQuestion?: string;
  costCareer?: { title: string; text: string; tip?: string };
  costRelationshipQuestion?: string;
  costRelationship?: { title: string; text: string; tip?: string };
  costMoneyQuestion?: string;
  costMoney?: { title: string; text: string; tip?: string };
  rechargeQuestion?: string;
  rechargeText?: string;
  rechargeTip?: string;
  brainScan?: {
    question: string;
    insight: string;
  };
  chapter?: {
    question: string;
    previousLabel: string;
    previousText: string;
    currentLabel: string;
    currentText: string;
    nextLabel: string;
    nextText: string;
    accent: string;
    strategy?: string;        // legacy single-string
    strategyDo?: string;
    strategyDont?: string;
  };
  yearQuestion?: string;
  yearText?: string;
  yearAccent?: string;
  yearStrategy?: string;      // legacy single-string
  yearStrategyDo?: string;
  yearStrategyDont?: string;
  actionQuestion?: string;
  actionNeuro?: string;
  shift?: { name: string; text: string; when: string };  // legacy
  shifts?: Array<{ name: string; text: string; when: string }>;
  closingLine?: string;
}

interface ResultsApiResponse {
  reportId: string;
  email: string;
  userInput: any;
  sajuData: any;
  isPaid: boolean;
  createdAt: string;
  v3Cards?: V3CardContent;
  isLegacy?: boolean;
  language?: string;
}

// ─── Card Shell ───

function Card({
  children,
  bg = "bg-[#182339]",
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}) {
  return (
    <div
      className={`h-[100dvh] w-full flex-shrink-0 snap-start relative ${bg} ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="h-full overflow-y-auto flex flex-col justify-center items-center px-5 sm:px-8 py-12">
        {children}
      </div>
      {/* Watermark — visible in screenshots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 opacity-25 pointer-events-none">
        <img src="/logo-badaone.svg" alt="bada.one" className="h-3.5" />
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.3em] text-white/60 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </span>
  );
}

// ─── Card Types ───

function HookCard({
  name,
  question,
}: {
  name: string;
  question: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1e2a40]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <span className="text-xs uppercase tracking-[0.4em] text-[#879DC6]/60 mb-12" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          BADA
        </span>
        <h1 className="text-3xl font-light text-white/90 mb-8 leading-tight">
          {name}
        </h1>
        <p className="text-lg text-[#879DC6] font-light leading-relaxed">
          {question}
        </p>
        <div className="mt-16 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>

      </div>
    </Card>
  );
}

function InsightCard({
  label,
  question,
  text,
  accent,
}: {
  label: string;
  question?: string;
  text: string;
  accent?: string;
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
          <p className="mt-6 text-sm text-[#ABBBD5]/70 font-light leading-relaxed">
            {accent}
          </p>
        )}

      </div>
    </Card>
  );
}

/** Blueprint page 1: identity summary (question + text + accent) */
function BlueprintCard({
  question,
  text,
  accent,
}: {
  question: string;
  text: string;
  accent?: string;
}) {
  return (
    <Card>
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>your blueprint</CardLabel>
        <p className="text-xl text-[#879DC6] font-light mb-6 leading-relaxed">{question}</p>
        <div className="w-8 h-px bg-white/10 mb-6" />
        <p className="text-lg font-light text-white/90 leading-relaxed">{text}</p>
        {accent && (
          <p className="mt-6 text-base text-[#ABBBD5]/80 font-light leading-relaxed">{accent}</p>
        )}
      </div>
    </Card>
  );
}

/** Blueprint page 2: facets carousel (Core Drive / Hidden Talent / Blind Spot) */
const FACET_LABELS = ["Core Drive", "Hidden Talent", "Blind Spot"];
function BlueprintFacetsCard({
  facets,
}: {
  facets: Array<{ label: string; text: string }>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Card>
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>your blueprint</CardLabel>

        {/* Slide indicators with swipe hint */}
        <div className="flex items-center gap-3 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-white/20 text-xs">‹</span>
          {facets.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: "smooth" });
              }}
              className={`text-xs uppercase tracking-wider transition-all duration-300 px-3 py-1.5 rounded-full ${
                activeSlide === i
                  ? "text-[#ABBBD5] font-medium bg-[#ABBBD5]/10"
                  : "text-white/35"
              }`}
            >
              {FACET_LABELS[i] || f.label}
            </button>
          ))}
          <span className="text-white/20 text-xs">›</span>
        </div>

        {/* Horizontal carousel */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", touchAction: "pan-x" }}
        >
          <div className="flex w-[300%]">
            {facets.map((f, i) => (
              <div key={i} className="w-1/3 snap-center flex-shrink-0 px-2">
                <div className={`rounded-2xl px-5 py-6 border transition-all duration-300 ${
                  activeSlide === i
                    ? "bg-[#ABBBD5]/8 border-[#ABBBD5]/20"
                    : "bg-white/3 border-white/8"
                }`}>
                  <p className="text-base font-light leading-relaxed text-left text-white/85">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function EvidenceCard({
  label,
  question,
  items,
}: {
  label: string;
  question?: string;
  items: string[];
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
              <span className="text-[#879DC6]/50 text-sm mt-1 shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-base font-light text-white/85 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>

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
  tip,
}: {
  label: string;
  question?: string;
  emoji: string;
  title: string;
  description: string;
  tip?: string;
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
        <p className="text-base font-light text-white/80 leading-relaxed">
          {firstSentences(description, 2)}
        </p>
        {tip && (
          <div className="mt-6 w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <span className="text-xs uppercase tracking-[0.2em] text-[#ABBBD5]/50 block mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              try this
            </span>
            <p className="text-sm text-white/80 font-light leading-relaxed">{tip}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function RechargeCard({
  question,
  text,
  tip,
}: {
  question: string;
  text: string;
  tip?: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1a2840]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>recharge</CardLabel>
        <p className="text-xl text-[#879DC6] font-light mb-6 leading-relaxed">
          {question}
        </p>
        <div className="w-8 h-px bg-white/10 mb-6" />
        <p className="text-base font-light text-white/90 leading-relaxed">
          {text}
        </p>
        {tip && (
          <div className="mt-6 w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <span className="text-xs uppercase tracking-[0.2em] text-[#ABBBD5]/50 block mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              try this
            </span>
            <p className="text-sm text-white/80 font-light leading-relaxed">{tip}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ActionCard({
  question,
  neuroExplanation,
  shifts,
}: {
  question: string;
  neuroExplanation: string;
  shifts: Array<{ name: string; text: string; when: string }>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1e2a45]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>this week</CardLabel>

        <p className="text-lg text-[#ABBBD5] font-light mb-4 leading-relaxed">
          {question}
        </p>
        <p className="text-sm text-white/50 font-light leading-relaxed mb-6">
          {neuroExplanation}
        </p>

        {/* Protocol tab indicators */}
        <div className="flex items-center gap-2 mb-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-white/20 text-xs">‹</span>
          {shifts.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: "smooth" });
              }}
              className={`text-[10px] uppercase tracking-wider transition-all duration-300 px-2 py-1 rounded-full ${
                activeSlide === i
                  ? "text-[#ABBBD5] font-medium bg-[#ABBBD5]/10"
                  : "text-white/30"
              }`}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
          <span className="text-white/20 text-xs">›</span>
        </div>

        {/* Protocol carousel */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", touchAction: "pan-x" }}
        >
          <div className="flex w-[300%]">
            {shifts.map((s, i) => (
              <div key={i} className="w-1/3 snap-center flex-shrink-0 px-2">
                <div className={`rounded-2xl px-5 py-6 border transition-all duration-300 text-left ${
                  activeSlide === i
                    ? "bg-white/5 border-white/15"
                    : "bg-white/3 border-white/8"
                }`}>
                  <h3 className="text-base font-medium text-white/90 mb-3">{s.name}</h3>
                  <p className="text-sm font-light text-white/80 leading-relaxed mb-3">{s.text}</p>
                  <p className="text-xs text-[#ABBBD5]/50 font-mono">{s.when}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function EnergyCard({
  question,
  insight,
}: {
  question: string;
  insight: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1a2840]">
      <div className="relative flex flex-col items-center w-full max-w-sm">
        <CardLabel>your brain</CardLabel>
        <p className="text-lg text-[#879DC6] font-light mb-8 leading-relaxed text-center">
          {question}
        </p>
        <div className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10">
          <span className="text-xs uppercase tracking-[0.2em] text-[#879DC6]/50 block mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Neuroscience
          </span>
          <div className="space-y-3 text-left">
            {insight.split(/(?<=[.!?。])\s+/).filter(Boolean).map((sentence, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[#879DC6]/30 text-xs mt-1 shrink-0 font-mono">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm text-white/80 font-light leading-relaxed">{sentence}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ChapterData {
  question: string;
  previousLabel: string;
  previousText: string;
  currentLabel: string;
  currentText: string;
  nextLabel: string;
  nextText: string;
  accent: string;
  strategy?: string;
  strategyDo?: string;
  strategyDont?: string;
}

function ChapterCard({
  chapter,
}: {
  chapter: ChapterData;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(1); // start at current (index 1)

  // Scroll to "current" slide on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Each slide is 100% width — scroll to index 1
    requestAnimationFrame(() => {
      el.scrollLeft = el.clientWidth;
    });
  }, []);

  // Track active slide
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveSlide(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const slides = [
    { label: chapter.previousLabel, text: chapter.previousText, period: "past" as const },
    { label: chapter.currentLabel, text: chapter.currentText, period: "current" as const },
    { label: chapter.nextLabel, text: chapter.nextText, period: "next" as const },
  ];

  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1e2a45]">
      <div className="relative flex flex-col items-center w-full max-w-sm">
        <CardLabel>your chapter</CardLabel>
        <p className="text-xl text-[#ABBBD5] font-light mb-6 leading-relaxed text-center">
          {chapter.question}
        </p>

        {/* Slide indicators */}
        <div className="flex items-center gap-3 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: "smooth" });
              }}
              className={`text-xs uppercase tracking-wider transition-all duration-300 ${
                activeSlide === i
                  ? i === 1
                    ? "text-[#ABBBD5] font-medium"
                    : "text-white/70 font-medium"
                  : "text-white/30"
              }`}
            >
              {i === 1 ? (
                <span className="flex items-center gap-1.5">
                  {s.label}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ABBBD5]/15 text-[#ABBBD5]/80 border border-[#ABBBD5]/20">
                    NOW
                  </span>
                </span>
              ) : s.label}
            </button>
          ))}
        </div>

        {/* Horizontal carousel */}
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", touchAction: "pan-x" }}
        >
          <div className="flex w-[300%]">
            {slides.map((s, i) => (
              <div key={i} className="w-1/3 snap-center flex-shrink-0 px-2">
                <div className={`rounded-2xl px-5 py-6 border transition-all duration-300 ${
                  i === 1
                    ? "bg-[#ABBBD5]/8 border-[#ABBBD5]/20"
                    : "bg-white/3 border-white/8"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`rounded-full ${
                      i === 1
                        ? "w-3 h-3 bg-[#ABBBD5] shadow-[0_0_10px_rgba(171,187,213,0.4)]"
                        : "w-2 h-2 bg-white/25"
                    }`} />
                    <span className={`text-xs uppercase tracking-[0.2em] font-medium ${
                      i === 1 ? "text-[#ABBBD5]" : "text-white/40"
                    }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {s.label}
                    </span>
                  </div>
                  <p className={`font-light leading-relaxed ${
                    i === 1
                      ? "text-base text-white/90"
                      : "text-sm text-white/70"
                  }`}>
                    {s.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transition insight */}
        {chapter.accent && (
          <p className="mt-6 text-sm text-[#ABBBD5]/70 font-light leading-relaxed text-center px-2">
            {chapter.accent}
          </p>
        )}

        {(chapter.strategyDo || chapter.strategy) && (
          <div className="mt-4 w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#ABBBD5]/50 block mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              your move
            </span>
            <StrategyBlock doText={chapter.strategyDo} dontText={chapter.strategyDont} legacy={chapter.strategy} />
          </div>
        )}

      </div>
    </Card>
  );
}

function YearCard({
  question,
  text,
  accent,
  strategy,
  strategyDo,
  strategyDont,
}: {
  question: string;
  text: string;
  accent: string;
  strategy?: string;
  strategyDo?: string;
  strategyDont?: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1e2a45]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>this year</CardLabel>

        {/* Zoom-in breadcrumb */}
        <div className="flex items-center gap-2 mb-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-xs text-white/30 uppercase tracking-wider">Decade</span>
          <span className="text-white/25">›</span>
          <span className="text-xs text-[#ABBBD5] uppercase tracking-wider font-medium">{new Date().getFullYear()}</span>
          <span className="text-white/25">›</span>
          <span className="text-xs text-white/30 uppercase tracking-wider">This week</span>
        </div>

        <p className="text-xl text-[#ABBBD5] font-light mb-6 leading-relaxed">
          {question}
        </p>
        <div className="w-8 h-px bg-white/15 mb-6" />
        <p className="text-base font-light text-white/90 leading-relaxed">
          {text}
        </p>
        {accent && (
          <div className="mt-6 px-4 py-3 rounded-xl bg-[#ABBBD5]/8 border border-[#ABBBD5]/15">
            <p className="text-sm text-[#ABBBD5]/80 font-light leading-relaxed">
              {accent}
            </p>
          </div>
        )}
        {(strategyDo || strategy) && (
          <div className="mt-4 w-full px-4 py-4 rounded-xl bg-[#ABBBD5]/8 border border-[#ABBBD5]/15">
            <span className="text-xs uppercase tracking-[0.2em] text-[#ABBBD5]/50 block mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              your move
            </span>
            <StrategyBlock doText={strategyDo} dontText={strategyDont} legacy={strategy} />
          </div>
        )}

      </div>
    </Card>
  );
}

function ClosingCard({
  message,
  reportId,
}: {
  message: string;
  reportId: string;
}) {
  const shareUrl = `${window.location.origin}/results/${reportId}`;
  const marqueeText = "CLARITY IS THE NEW HIGH · BADA · ".repeat(12);
  return (
    <Card bg="bg-gradient-to-b from-[#182339] via-[#233F64] to-[#402525]">
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
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-sm text-white/70 hover:bg-white/15 transition-colors"
        >
          Share this report
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Marquee wave — "CLARITY IS THE NEW HIGH · BADA" */}
      <div className="absolute bottom-8 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: "60px" }}>
        <svg
          width="3000"
          height="60"
          viewBox="0 0 3000 60"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ minWidth: "3000px" }}
        >
          <defs>
            <path
              id="v3-curve"
              d="M0,30 Q150,0 300,30 Q450,60 600,30 Q750,0 900,30 Q1050,60 1200,30 Q1350,0 1500,30 Q1650,60 1800,30 Q1950,0 2100,30 Q2250,60 2400,30 Q2550,0 2700,30 Q2850,60 3000,30"
              fill="none"
            />
          </defs>
          <text
            className="uppercase"
            style={{
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 400,
              fill: "#ABBBD5",
              opacity: 0.35,
              letterSpacing: "0.2em",
            }}
          >
            <textPath href="#v3-curve">
              {marqueeText}
            </textPath>
          </text>
        </svg>
      </div>
    </Card>
  );
}

// ─── Lock Card ───

function LockCard({
  reportId,
  email,
  remainingCount,
  language = "en",
}: {
  reportId: string;
  email: string;
  remainingCount: number;
  language?: string;
}) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const translations = {
    en: {
      headline: "what you see ≠ what's there",
      line1: "If those cards felt accurate,",
      line2: "the next 11 explain why — and what to do about it.",
      cta: "Unlock",
      or: "or",
      placeholder: "Enter code",
      apply: "Apply",
      faq: [
        { key: "q2", q: "How is this different from MBTI?", a: "MBTI gives you a type. BADA maps the patterns unique to you — why you burn out, how you make decisions, what you keep repeating. No two reports are the same." },
        { key: "q4", q: "What do I get for $2.9?", a: "11 more cards: why your patterns exist, what they cost you at work · relationships · money, how you recharge, your 10-year chapter, and one thing to change this week." },
        { key: "q6", q: "Is my data safe?", a: "Your birth data is used only to generate your report. We don't sell or share it." },
        { key: "contact", q: "How do I reach you?", a: "Questions, feedback, or just want to say hi?" },
      ],
    },
    ko: {
      headline: "보이는 나 ≠ 진짜 나",
      line1: "여기까지 공감되셨다면,",
      line2: "나머지 11장은 왜 그런지, 그리고 어떻게 바꿀 수 있는지 알려줍니다.",
      cta: "잠금 해제",
      or: "또는",
      placeholder: "코드 입력",
      apply: "적용",
      faq: [
        { key: "q2", q: "MBTI랑 뭐가 다른가요?", a: "MBTI는 유형을 줍니다. BADA는 당신만의 패턴을 매핑합니다 — 왜 번아웃이 오는지, 어떻게 결정하는지, 뭘 반복하는지. 같은 리포트는 없습니다." },
        { key: "q4", q: "$2.9으로 뭘 더 보나요?", a: "11장 추가: 패턴이 왜 존재하는지, 직장·관계·돈에서 치르는 대가, 회복법, 10년 챕터, 이번 주 바꿀 수 있는 한 가지." },
        { key: "q6", q: "데이터는 안전한가요?", a: "생년월일은 리포트 생성에만 사용됩니다. 판매하거나 공유하지 않습니다." },
        { key: "contact", q: "어디로 연락하나요?", a: "질문, 피드백, 또는 그냥 인사하고 싶으신가요?" },
      ],
    },
    id: {
      headline: "yang kamu lihat ≠ yang sebenarnya",
      line1: "Kalau kartu tadi terasa pas,",
      line2: "11 kartu berikutnya menjelaskan kenapa — dan apa yang bisa kamu ubah.",
      cta: "Buka",
      or: "atau",
      placeholder: "Masukkan kode",
      apply: "Terapkan",
      faq: [
        { key: "q2", q: "Apa bedanya dengan MBTI?", a: "MBTI memberimu tipe. BADA memetakan pola unikmu — kenapa kamu burnout, bagaimana kamu mengambil keputusan, apa yang terus kamu ulangi. Tidak ada dua laporan yang sama." },
        { key: "q4", q: "Apa yang saya dapat dengan $2.9?", a: "11 kartu lagi: kenapa polamu ada, biayanya di kerja · hubungan · uang, cara recharge, chapter 10 tahunmu, dan satu hal yang bisa diubah minggu ini." },
        { key: "q6", q: "Apakah data saya aman?", a: "Data kelahiranmu hanya digunakan untuk membuat laporanmu. Kami tidak menjual atau membagikannya." },
        { key: "contact", q: "Bagaimana cara menghubungi?", a: "Pertanyaan, masukan, atau sekadar ingin menyapa?" },
      ],
    },
  };
  const t = translations[language as keyof typeof translations] || translations.en;

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
    <Card bg="bg-gradient-to-b from-[#182339] via-[#233F64] to-[#402525]">
      <div className="flex flex-col items-center text-center w-full max-w-sm">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5 flex-shrink-0">
          <Lock className="w-5 h-5 text-white/40" />
        </div>

        <p className="text-lg text-white/60 font-light tracking-wide mb-5">
          {t.headline}
        </p>

        <p className="text-sm text-white/70 font-light leading-relaxed mb-1">
          {t.line1}
        </p>
        <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
          {t.line2}
        </p>

        <p className="text-3xl text-white font-light mb-3">$2.9</p>

        <button
          onClick={() => window.open(checkoutUrl, "_blank", "noopener")}
          className="w-full max-w-xs py-3.5 rounded-full bg-white text-[#182339] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors mb-3"
        >
          {t.cta}
        </button>

        <div className="flex items-center gap-3 my-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.or}</span>
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
            placeholder={t.placeholder}
            maxLength={20}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm uppercase tracking-wider text-white/70 placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            onClick={handleRedeem}
            disabled={!code.trim() || isRedeeming}
            className="px-5 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/15 disabled:opacity-30 transition-colors"
          >
            {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : t.apply}
          </button>
        </div>
        {codeError && (
          <p className="text-xs text-red-400 mt-2">{codeError}</p>
        )}

        {/* FAQ toggles */}
        <div className="w-full max-w-xs mt-6 space-y-0 border-t border-white/5">
          {t.faq.map((item) => (
            <div key={item.key} className="border-b border-white/5">
              <button
                onClick={() => setOpenFaq(openFaq === item.key ? null : item.key)}
                className="w-full flex items-center justify-between py-2.5 text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openFaq === item.key ? "rotate-180" : ""}`} />
              </button>
              {openFaq === item.key && (
                <div className="pb-2.5 text-xs text-white/40 text-left leading-relaxed whitespace-pre-line">
                  {item.key === "contact" ? (
                    <div className="space-y-1">
                      <p>{item.a}</p>
                      <p>→ Instagram: <a href="https://www.instagram.com/badathebrand" target="_blank" rel="noopener noreferrer" className="text-[#879DC6] hover:text-[#879DC6]/70 transition-colors">@badathebrand</a></p>
                      <p>→ Email: <a href="mailto:badathebrand@gmail.com" className="text-[#879DC6] hover:text-[#879DC6]/70 transition-colors">badathebrand@gmail.com</a></p>
                    </div>
                  ) : item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Marquee wave */}
      <div className="absolute bottom-8 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: "60px" }}>
        <svg
          width="3000"
          height="60"
          viewBox="0 0 3000 60"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ minWidth: "3000px" }}
        >
          <defs>
            <path
              id="v3-lock-curve"
              d="M0,30 Q150,0 300,30 Q450,60 600,30 Q750,0 900,30 Q1050,60 1200,30 Q1350,0 1500,30 Q1650,60 1800,30 Q1950,0 2100,30 Q2250,60 2400,30 Q2550,0 2700,30 Q2850,60 3000,30"
              fill="none"
            />
          </defs>
          <text
            className="uppercase"
            style={{
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 400,
              fill: "#ABBBD5",
              opacity: 0.35,
              letterSpacing: "0.2em",
            }}
          >
            <textPath href="#v3-lock-curve">
              {"CLARITY IS THE NEW HIGH · BADA · ".repeat(12)}
            </textPath>
          </text>
        </svg>
      </div>
    </Card>
  );
}

// ─── Main Page ───

export default function ResultsV3() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: report, isLoading, error } = useQuery<ResultsApiResponse>({
    queryKey: [`/api/results/${reportId}`],
  });

  // Handle 403 (email not verified) → redirect to wait page
  useEffect(() => {
    if (error?.message?.includes("403")) {
      setLocation(`/wait/${reportId}`);
    }
  }, [error, reportId, setLocation]);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#182339]">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    const errMsg = error?.message || "No data received";
    const isNotFound = errMsg.includes("404");
    const is403 = errMsg.includes("403");  // should redirect, but fallback
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#182339] px-8 gap-4">
        <p className="text-white/50 text-sm">
          {isNotFound
            ? "Report not found."
            : is403
              ? "Access denied."
              : "Failed to load report."}
        </p>
        {!isNotFound && !is403 && (
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/results/${reportId}`] })}
            className="px-6 py-2 rounded-full bg-white/10 border border-white/15 text-white/60 text-sm hover:bg-white/15 transition-colors"
          >
            Retry
          </button>
        )}
        <p className="text-[10px] text-white/15 mt-4 max-w-xs text-center break-all">{errMsg}</p>
      </div>
    );
  }

  // Legacy report fallback
  if (report.isLegacy || !report.v3Cards) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#182339] px-8">
        <div className="text-center max-w-sm">
          <p className="text-white/70 text-base mb-2">This report was generated with a previous version.</p>
          <p className="text-white/40 text-sm">Please take a new assessment to get your V3 card report.</p>
        </div>
      </div>
    );
  }

  const isPaid = report.isPaid;
  const name = report.userInput?.name || "Friend";
  const v3 = report.v3Cards;

  // Build card list
  const freeCards = [
    {
      key: "hook",
      render: () => (
        <HookCard name={name} question={v3.hookQuestion} />
      ),
    },
    {
      key: "mirror",
      render: () => (
        <InsightCard label="Your mirror" question={v3.mirrorQuestion} text={v3.mirrorText} accent={v3.mirrorAccent} />
      ),
    },
    {
      key: "blueprint",
      render: () => (
        <BlueprintCard
          question={v3.blueprintQuestion}
          text={v3.blueprintText}
          accent={v3.blueprintAccent}
        />
      ),
    },
    {
      key: "blueprint-facets",
      render: () => v3.blueprintFacets && v3.blueprintFacets.length > 0 ? (
        <BlueprintFacetsCard facets={v3.blueprintFacets} />
      ) : null,
    },
    {
      key: "decision",
      render: () => v3.decisionQuestion ? (
        <InsightCard label="Your decisions" question={v3.decisionQuestion} text={v3.decisionText || ""} accent={v3.decisionAccent} />
      ) : null,
    },
  ];

  const paidCards = [
    {
      key: "collision",
      render: () => (
        <InsightCard label="The collision" question={v3.collisionQuestion || ""} text={v3.collisionText || ""} accent={v3.collisionAccent} />
      ),
    },
    {
      key: "brain-scan",
      render: () => v3.brainScan ? (
        <EnergyCard question={v3.brainScan.question} insight={v3.brainScan.insight} />
      ) : null,
    },
    {
      key: "evidence",
      render: () => (
        <EvidenceCard label="Proof" question={v3.evidenceQuestion || ""} items={v3.evidence || []} />
      ),
    },
    {
      key: "cost-career",
      render: () => v3.costCareer ? (
        <CostCard label="In your org" question={v3.costCareerQuestion || ""} emoji="💼" title={v3.costCareer.title} description={v3.costCareer.text} tip={v3.costCareer.tip} />
      ) : null,
    },
    {
      key: "cost-relationship",
      render: () => v3.costRelationship ? (
        <CostCard label="In relationships" question={v3.costRelationshipQuestion || ""} emoji="💬" title={v3.costRelationship.title} description={v3.costRelationship.text} tip={v3.costRelationship.tip} />
      ) : null,
    },
    {
      key: "cost-money",
      render: () => v3.costMoney ? (
        <CostCard label="With money" question={v3.costMoneyQuestion || ""} emoji="💰" title={v3.costMoney.title} description={v3.costMoney.text} tip={v3.costMoney.tip} />
      ) : null,
    },
    {
      key: "recharge",
      render: () => v3.rechargeQuestion ? (
        <RechargeCard question={v3.rechargeQuestion} text={v3.rechargeText || ""} tip={v3.rechargeTip} />
      ) : null,
    },
    {
      key: "chapter",
      render: () => v3.chapter ? (
        <ChapterCard chapter={v3.chapter} />
      ) : null,
    },
    {
      key: "year",
      render: () => (v3.yearQuestion && v3.yearText) ? (
        <YearCard question={v3.yearQuestion} text={v3.yearText} accent={v3.yearAccent || ""} strategy={v3.yearStrategy} strategyDo={v3.yearStrategyDo} strategyDont={v3.yearStrategyDont} />
      ) : null,
    },
    {
      key: "action",
      render: () => (v3.shifts || v3.shift) ? (
        <ActionCard
          question={v3.actionQuestion || ""}
          neuroExplanation={v3.actionNeuro || ""}
          shifts={v3.shifts || (v3.shift ? [v3.shift] : [])}
        />
      ) : null,
    },
    {
      key: "closing",
      render: () => (
        <ClosingCard message={v3.closingLine || ""} reportId={reportId || ""} />
      ),
    },
  ];

  const visibleCards = isPaid
    ? [...freeCards, ...paidCards]
    : freeCards;


  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {visibleCards.map((card) => {
          const content = card.render();
          if (!content) return null;
          return <div key={card.key}>{content}</div>;
        })}

        {/* Lock card for unpaid users */}
        {!isPaid && (
          <LockCard
            reportId={reportId || ""}
            email={report.email || ""}
            remainingCount={paidCards.length}
            language={report.language || "en"}
          />
        )}

        {/* Spacer — prevents iOS snap-mandatory from bouncing back on last card */}
        <div className="h-1 flex-shrink-0" />
      </div>
    </div>
  );
}
