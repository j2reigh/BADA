import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { t as translate, type UILanguage } from "@/lib/simple-i18n";

interface GeneratingScreenProps {
  isComplete: boolean;
  isError?: boolean;
  errorMessage?: string;
  retryCount?: number;
  language?: UILanguage;
  onFinished: () => void;
  onRetry?: () => void;
}

const STEP_DURATIONS = [2000, 2500, 3000, 5000, 5000];

export default function GeneratingScreen({ isComplete, isError, errorMessage, retryCount, language = "en", onFinished, onRetry }: GeneratingScreenProps) {
  const lang = language;
  const steps = STEP_DURATIONS.map((duration, i) => ({
    label: translate(`generating.step${i + 1}`, lang),
    duration,
  }));
  const insights = Array.from({ length: 5 }, (_, i) =>
    translate(`generating.insight${i + 1}`, lang)
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Reset internal state on retry (retryCount changes)
  useEffect(() => {
    if (retryCount && retryCount > 0) {
      setCurrentStep(0);
      setProgress(0);
      setIsDone(false);
      setIsRetrying(false);
    }
  }, [retryCount]);

  // Step progression (timer-based simulation)
  useEffect(() => {
    if (isDone) return;

    let elapsed = 0;
    for (let i = 0; i < currentStep; i++) {
      elapsed += steps[i].duration;
    }

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep((s) => s + 1);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isDone]);

  // Progress bar simulation (0 → 90% over 25s)
  useEffect(() => {
    if (isDone) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p + (99 - p) * 0.005; // Asymptotic crawl toward 99%, never stops
        return p + (90 / 150); // Reach 90% in ~15s (100ms intervals)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isDone]);

  // Insight rotation (every 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((i) => (i + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // When API response arrives, animate to 100% then call onFinished
  useEffect(() => {
    if (isComplete && !isDone) {
      setIsDone(true);
      setCurrentStep(steps.length - 1);

      // Animate progress to 100%
      let p = progress;
      const fill = setInterval(() => {
        p += 2;
        if (p >= 100) {
          p = 100;
          clearInterval(fill);
          // Brief pause at 100%, then navigate
          setTimeout(onFinished, 600);
        }
        setProgress(p);
      }, 20);

      return () => clearInterval(fill);
    }
  }, [isComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#182339" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 w-full max-w-md px-8">
        {/* BADA Logo */}
        <div className="text-center mb-16">
          <img src="/logo-badaone.svg" alt="bada.one" className="h-5 mx-auto" />
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: i <= currentStep ? 1 : 0.2,
                x: 0,
              }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Status indicator */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {i < currentStep || (i === currentStep && isDone) ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white/80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                ) : i === currentStep ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm tracking-wide transition-colors duration-300 ${
                  i < currentStep || (i === currentStep && isDone)
                    ? "text-white/60"
                    : i === currentStep
                    ? "text-white"
                    : "text-white/20"
                }`}
              >
                {step.label}
                {i === currentStep && !isDone && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ...
                  </motion.span>
                )}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="h-px w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{translate('generating.label', lang)}</span>
            <span className="text-[10px] text-white/30 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Rotating insight */}
        <div className="text-center h-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={insightIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-xs text-white/40 italic leading-relaxed"
            >
              {insights[insightIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Error overlay */}
      {isError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#182339]/90 backdrop-blur-sm">
          <div className="text-center px-8 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
              <svg className="w-7 h-7 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-white/90 text-lg font-medium mb-3">
              {translate('generating.error.title', lang)}
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-10"
               dangerouslySetInnerHTML={{ __html: translate('generating.error.desc', lang) }}
            />
            {onRetry && (
              <button
                onClick={() => {
                  setIsRetrying(true);
                  onRetry();
                }}
                disabled={isRetrying}
                className="px-10 py-3.5 rounded-full bg-white text-[#182339] font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? translate('generating.error.retrying', lang) : translate('generating.error.retry', lang)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Decorative circle */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-white rounded-full" />
      </div>
    </motion.div>
  );
}
