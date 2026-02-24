import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation, type UILanguage } from "@/lib/simple-i18n";
import LanguageDropdown from "@/components/LanguageDropdown";

function Header({ t }: { t: (key: string) => string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="mix-blend-difference">
          <img src="/logo-badaone.svg" alt="bada.one" className="h-5" />
        </a>
        <nav className="hidden md:flex items-center gap-8 mix-blend-difference text-white">
          <Link href="/" className="text-sm hover:opacity-70 transition-opacity">{t('nav.home')}</Link>
          <Link href="/faq" className="text-sm hover:opacity-70 transition-opacity">{t('faq.title')}</Link>
        </nav>
      </div>
    </header>
  );
}

function FAQItem({ question, answer, footer }: { question: string; answer: string; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left"
      >
        <h2 className="text-lg md:text-xl font-medium text-white pr-4">{question}</h2>
        <ChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-6 text-base text-white/60 leading-relaxed whitespace-pre-line">
          {answer}
          {footer}
        </div>
      )}
    </div>
  );
}

function Footer({ language, setLanguage, t }: { language: UILanguage; setLanguage: (lang: UILanguage) => void; t: (key: string) => string }) {
  return (
    <footer className="relative z-10 border-t border-white/10 py-6 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <span className="text-white/40 text-xs md:text-sm whitespace-nowrap">
            bada.one © {new Date().getFullYear()}
          </span>
          <Link href="/privacy" className="text-white/40 text-xs md:text-sm hover:text-white/70 transition-colors whitespace-nowrap">
            {t('footer.privacy')}
          </Link>
          <Link href="/terms" className="text-white/40 text-xs md:text-sm hover:text-white/70 transition-colors whitespace-nowrap">
            {t('footer.terms')}
          </Link>
        </div>
        <LanguageDropdown language={language} setLanguage={setLanguage} variant="footer" />
      </div>
    </footer>
  );
}

export default function FAQ() {
  const { t, language, setLanguage } = useTranslation();

  const [, setLocation] = useLocation();

  const questions = Array.from({ length: 9 }, (_, i) => ({
    question: t(`faq.q${i + 1}.q`),
    answer: t(`faq.q${i + 1}.a`),
    footer: i === 7 ? (
      <a
        href="/#find-report"
        onClick={(e) => {
          e.preventDefault();
          setLocation("/");
          // Wait for Landing to mount, then scroll to section
          const poll = setInterval(() => {
            const el = document.getElementById("find-report");
            if (el) {
              clearInterval(poll);
              el.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
          setTimeout(() => clearInterval(poll), 3000);
        }}
        className="inline-block mt-3 text-sm text-white/70 hover:text-white transition-colors underline underline-offset-4"
      >
        {t('find.report.label')} →
      </a>
    ) : undefined,
  }));

  return (
    <main className="relative w-full min-h-screen">
      {/* Gradient Background */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `linear-gradient(
            to bottom,
            #ABBBD5 0%,
            #879DC6 25%,
            #233F64 50%,
            #182339 75%,
            #402525 100%
          )`,
        }}
      />

      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <Header t={t} />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">
          {t('faq.title')}
        </h1>
        <div className="border-b border-white/10" />

        {/* Q&A Items */}
        {questions.map((item, i) => (
          <FAQItem key={i} question={item.question} answer={item.answer} footer={item.footer} />
        ))}

        {/* Contact Section */}
        <div className="py-10 border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-medium text-white mb-4">
            {t('faq.contact.title')}
          </h2>
          <p className="text-base text-white/60 mb-4">{t('faq.contact.desc')}</p>
          <div className="text-base text-white/60 space-y-1">
            <p>
              → Instagram:{" "}
              <a
                href="https://www.instagram.com/badathebrand"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                @badathebrand
              </a>
            </p>
            <p>
              → Email:{" "}
              <a
                href="mailto:badathebrand@gmail.com"
                className="text-white/80 hover:text-white transition-colors"
              >
                badathebrand@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-16 pb-8 text-center">
          <Link
            href="/survey"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#182339] rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            {t('faq.cta')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer language={language} setLanguage={setLanguage} t={t} />
    </main>
  );
}
