import { useState } from "react";
import { useLocation } from "wouter";
import { X, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

export default function GiftCodeModal({ isOpen, onClose, t }: GiftCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setError("");
    setIsValidating(true);

    try {
      const res = await fetch("/api/codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (data.valid) {
        setLocation(`/survey?giftCode=${encodeURIComponent(trimmed)}`);
      } else {
        const errorKey =
          data.error === "ALREADY_USED"
            ? "gift.modal.error.used"
            : "gift.modal.error.invalid";
        setError(t(errorKey));
      }
    } catch {
      setError(t("gift.modal.error.network"));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop — light dim, no blur so page is visible */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="relative bg-[#182339]/95 backdrop-blur-md border-t border-white/10 rounded-t-3xl px-6 pb-8 pt-5 w-full max-w-lg shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-5 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon + Title row */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 shrink-0">
                <Gift className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="text-xl font-display font-medium text-white">
                {t("gift.modal.title")}
              </h3>
            </div>
            <p className="text-sm text-white/50 mb-5">
              {t("gift.modal.subtitle")}
            </p>

            {/* Code input */}
            <div className="space-y-3">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder={t("gift.modal.placeholder")}
                maxLength={20}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-wider placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                autoFocus
              />

              {error && (
                <p className="text-red-400/80 text-sm">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!code.trim() || isValidating}
                className="w-full bg-white text-[#182339] font-bold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isValidating
                  ? t("gift.modal.validating")
                  : t("gift.modal.apply")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
