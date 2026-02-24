import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { UI_LANGUAGES, type UILanguage } from "@/lib/simple-i18n";

interface LanguageDropdownProps {
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
  variant?: "header" | "footer" | "mobile";
}

export default function LanguageDropdown({ language, setLanguage, variant = "footer" }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const current = UI_LANGUAGES.find((l) => l.code === language) || UI_LANGUAGES[0];

  const isMobile = variant === "mobile";
  const dropdownPosition = isMobile
    ? "absolute left-1/2 -translate-x-1/2 bottom-full mb-2"
    : "absolute right-0 bottom-full mb-2";

  return (
    <div ref={ref} className={`relative ${isMobile ? "mt-4" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-all bg-white/5 hover:bg-white/10 text-white/60 hover:text-white ${isMobile ? "px-5 py-2.5" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="font-medium">{current.code.toUpperCase()}</span>
        <span className="text-white/40">{current.native}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`${dropdownPosition} w-52 max-h-[320px] overflow-y-auto rounded-xl bg-[#182339]/95 backdrop-blur-md border border-white/10 shadow-xl z-50 py-1`}
          role="listbox"
        >
          {UI_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={language === lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                language === lang.code
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{lang.native}</span>
              <span className="text-white/30 text-xs">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
