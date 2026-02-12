import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, ChevronDown, ExternalLink } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

// ─── Helpers ───

function firstSentences(text: string | undefined, count: number): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, count).join(" ").trim();
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
  collisionQuestion?: string;
  collisionText?: string;
  collisionAccent?: string;
  evidenceQuestion?: string;
  evidence?: string[];
  costCareerQuestion?: string;
  costCareer?: { title: string; text: string };
  costRelationshipQuestion?: string;
  costRelationship?: { title: string; text: string };
  costMoneyQuestion?: string;
  costMoney?: { title: string; text: string };
  brainScan?: {
    question: string;
    alarm: number;
    drive: number;
    stability: number;
    remaining: number;
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
  };
  yearQuestion?: string;
  yearText?: string;
  yearAccent?: string;
  actionQuestion?: string;
  actionNeuro?: string;
  shift?: { name: string; text: string; when: string };
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
      className={`h-[100dvh] w-full flex-shrink-0 snap-start flex flex-col justify-center items-center px-8 relative ${bg} ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
      {/* Watermark — visible in screenshots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 opacity-25 pointer-events-none">
        <img src="/logowhite.svg" alt="" className="h-3.5" />
        <span className="text-[10px] text-white/80 font-light tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>bada.one</span>
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.3em] text-white/50 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
}: {
  label: string;
  question?: string;
  emoji: string;
  title: string;
  description: string;
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
}: {
  question: string;
  neuroExplanation: string;
  ritualName: string;
  description: string;
  when: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1e2a45]">
      <div className="relative flex flex-col items-center text-center w-full max-w-sm">
        <CardLabel>this week</CardLabel>

        {/* Zoom-in breadcrumb */}
        <div className="flex items-center gap-2 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-xs text-white/30 uppercase tracking-wider">Decade</span>
          <span className="text-white/25">›</span>
          <span className="text-xs text-white/30 uppercase tracking-wider">{new Date().getFullYear()}</span>
          <span className="text-white/25">›</span>
          <span className="text-xs text-[#ABBBD5] uppercase tracking-wider font-medium">This week</span>
        </div>

        <p className="text-lg text-[#ABBBD5] font-light mb-6 leading-relaxed">
          {question}
        </p>
        <div className="w-8 h-px bg-white/15 mb-6" />
        <p className="text-sm text-white/60 font-light leading-relaxed mb-8">
          {neuroExplanation}
        </p>
        <div className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <h3 className="text-lg font-medium text-white/90 mb-3">{ritualName}</h3>
          <p className="text-sm font-light text-white/70 leading-relaxed">
            {firstSentences(description, 2)}
          </p>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-[#ABBBD5]/70 font-light" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{when}</p>
        </div>

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
        <span className="text-xs text-white/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}%</span>
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
}: {
  question: string;
  alarm: number;
  drive: number;
  stability: number;
  remaining: number;
  insight: string;
}) {
  return (
    <Card bg="bg-gradient-to-b from-[#182339] to-[#1a2840]">
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
          <span className="text-xs uppercase tracking-[0.2em] text-[#879DC6]/40 block mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Neuroscience
          </span>
          <p className="text-xs text-white/60 font-light leading-relaxed">
            {insight}
          </p>
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
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
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
                      : "text-sm text-white/60"
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

      </div>
    </Card>
  );
}

function YearCard({
  question,
  text,
  accent,
}: {
  question: string;
  text: string;
  accent: string;
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
  const marqueeText = "FLOW WITH YOUR NATURE · BADA · ".repeat(12);
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

      {/* Marquee wave — "FLOW WITH YOUR NATURE · BADA" */}
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
              fontFamily: "'Inter', sans-serif",
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
    <Card bg="bg-gradient-to-b from-[#182339] via-[#1a2240] to-[#182339]">
      <div className="flex flex-col items-center text-center w-full max-w-sm">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <Lock className="w-5 h-5 text-white/40" />
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-lg text-white/60 font-light">거울</span>
          <span className="text-2xl text-[#879DC6]">≠</span>
          <span className="text-lg text-white/60 font-light">설계도</span>
        </div>

        <p className="text-base text-white/70 font-light leading-relaxed mb-2">
          이 간극이 만드는
        </p>
        <p className="text-xl text-white/90 font-light mb-10">
          반복 패턴 <span className="text-[#879DC6]">{remainingCount}장</span>
        </p>

        <button
          onClick={() => window.open(checkoutUrl, "_blank", "noopener")}
          className="w-full max-w-xs py-4 rounded-full bg-white text-[#182339] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors mb-4"
        >
          Unlock Full Report — $2.9
        </button>

        <div className="flex items-center gap-3 my-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>or</span>
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
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm uppercase tracking-wider text-white/70 placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
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

  const { data: report, isLoading, error } = useQuery<ResultsApiResponse>({
    queryKey: [`/api/results/${reportId}`],
  });

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#182339]">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#182339]">
        <p className="text-white/50 text-sm">Report not found.</p>
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
        <InsightCard label="Your blueprint" question={v3.blueprintQuestion} text={v3.blueprintText} accent={v3.blueprintAccent} />
      ),
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
        <EnergyCard question={v3.brainScan.question} alarm={v3.brainScan.alarm} drive={v3.brainScan.drive} stability={v3.brainScan.stability} remaining={v3.brainScan.remaining} insight={v3.brainScan.insight} />
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
        <CostCard label="At work" question={v3.costCareerQuestion || ""} emoji="💼" title={v3.costCareer.title} description={v3.costCareer.text} />
      ) : null,
    },
    {
      key: "cost-relationship",
      render: () => v3.costRelationship ? (
        <CostCard label="In relationships" question={v3.costRelationshipQuestion || ""} emoji="💬" title={v3.costRelationship.title} description={v3.costRelationship.text} />
      ) : null,
    },
    {
      key: "cost-money",
      render: () => v3.costMoney ? (
        <CostCard label="With money" question={v3.costMoneyQuestion || ""} emoji="💰" title={v3.costMoney.title} description={v3.costMoney.text} />
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
        <YearCard question={v3.yearQuestion} text={v3.yearText} accent={v3.yearAccent || ""} />
      ) : null,
    },
    {
      key: "action",
      render: () => v3.shift ? (
        <ActionCard question={v3.actionQuestion || ""} neuroExplanation={v3.actionNeuro || ""} ritualName={v3.shift.name} description={v3.shift.text} when={v3.shift.when} />
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
        {visibleCards.map((card) => (
          <div key={card.key}>{card.render()}</div>
        ))}

        {/* Lock card for unpaid users */}
        {!isPaid && (
          <LockCard
            reportId={reportId || ""}
            email={report.email || ""}
            remainingCount={paidCards.length}
          />
        )}
      </div>
    </div>
  );
}
