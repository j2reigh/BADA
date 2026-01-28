import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

type TranslateFn = (key: string, params?: Record<string, any>) => string;

interface Props {
  t: TranslateFn;
}

export default function EmbeddedDiagnosticCard({ t }: Props) {
  const [, setLocation] = useLocation();

  // Use actual Survey Q1 options (A, B, C, D)
  const Q1_OPTIONS = [
    { value: "A", label: t('survey.q1.A') },
    { value: "B", label: t('survey.q1.B') },
    { value: "C", label: t('survey.q1.C') },
    { value: "D", label: t('survey.q1.D') },
  ];

  const handleOptionClick = (value: string) => {
    // Save first answer to localStorage
    localStorage.setItem("bada_first_answer", JSON.stringify({ q1: value }));
    // Navigate to survey starting from Q2
    setLocation("/survey?start=1");
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {/* Question */}
      <div className="mb-6">
        <span className="text-[10px] font-mono text-[#233F64]/50 uppercase tracking-widest mb-2 block">
          Q1
        </span>
        <h3 className="text-lg md:text-xl font-medium text-[#182339] leading-snug">
          {t('survey.q1.text')}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {Q1_OPTIONS.map((option, idx) => (
          <motion.button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            className="w-full text-left p-3 rounded-xl border border-[#233F64]/10 hover:border-[#233F64]/30 hover:bg-[#ABBBD5]/10 transition-all duration-200 group flex items-center justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + idx * 0.08 }}
            whileHover={{ x: 4 }}
          >
            <span className="text-sm text-[#402525] group-hover:text-[#233F64] transition-colors">
              {option.label}
            </span>
            <ArrowRight className="w-4 h-4 text-[#233F64]/0 group-hover:text-[#233F64] transition-all" />
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#233F64]/10 flex items-center justify-between text-xs text-[#402525]/50">
        <span>{t('landing.sticky.progress', { percent: 0 })}</span>
        <span>~5 min</span>
      </div>
    </motion.div>
  );
}
