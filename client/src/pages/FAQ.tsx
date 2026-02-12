import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useTranslation, type UILanguage } from "@/lib/simple-i18n";

function Header({ t }: { t: (key: string) => string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold tracking-tight mix-blend-difference text-white">
          BADA
        </a>
        <nav className="hidden md:flex items-center gap-8 mix-blend-difference text-white">
          <Link href="/" className="text-sm hover:opacity-70 transition-opacity">Home</Link>
          <Link href="/faq" className="text-sm hover:opacity-70 transition-opacity">{t('faq.title')}</Link>
        </nav>
      </div>
    </header>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="py-10 border-b border-white/10">
      <h2 className="text-xl md:text-2xl font-medium text-white mb-4">{question}</h2>
      <div className="text-base text-white/60 leading-relaxed whitespace-pre-line">{answer}</div>
    </div>
  );
}

function Footer({ language, setLanguage }: { language: UILanguage; setLanguage: (lang: UILanguage) => void }) {
  const languages: { code: UILanguage; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ko', label: '한' },
    { code: 'id', label: 'ID' },
  ];

  return (
    <footer className="relative z-10 border-t border-white/10 py-8 px-6">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">
            BADA © {new Date().getFullYear()}
          </span>
          <Link href="/privacy" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            Terms
          </Link>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                language === lang.code
                  ? 'bg-white text-[#182339] font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function FAQ() {
  const { t, language, setLanguage } = useTranslation();

  const questions = Array.from({ length: 11 }, (_, i) => ({
    question: t(`faq.q${i + 1}.q`),
    answer: t(`faq.q${i + 1}.a`),
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
          <FAQItem key={i} question={item.question} answer={item.answer} />
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

      <Footer language={language} setLanguage={setLanguage} />
    </main>
  );
}
