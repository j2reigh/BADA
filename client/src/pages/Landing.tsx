import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, ArrowDown, ExternalLink, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import TypewriterText from "@/components/landing/TypewriterText";
import EmbeddedDiagnosticCard from "@/components/landing/EmbeddedDiagnosticCard";
import { useTranslation, type UILanguage } from "@/lib/simple-i18n";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// --- Components ---

type TranslateFn = (key: string, params?: Record<string, any>) => string;

function Header({ t, language, setLanguage }: { t: TranslateFn; language: UILanguage; setLanguage: (lang: UILanguage) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const languages: { code: UILanguage; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ko', label: '한' },
    { code: 'id', label: 'ID' },
  ];

  const findReportLabel = { en: "Find my report", ko: "내 리포트 찾기", id: "Cari laporanku" };
  const findLabel = findReportLabel[language] || findReportLabel.en;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 transition-colors duration-500 ${menuOpen ? 'z-[60]' : 'z-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="mix-blend-difference">
            <img src="/logo-badaone.svg" alt="bada.one" className="h-5" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 mix-blend-difference text-white">
            <a href="#problem" className="text-sm hover:opacity-70 transition-opacity">{t('landing.nav.problem')}</a>
            <a href="#solution" className="text-sm hover:opacity-70 transition-opacity">{t('landing.nav.solution')}</a>
            <Link href="/faq" className="text-sm hover:opacity-70 transition-opacity">{t('faq.title')}</Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden mix-blend-difference text-white p-1"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[55] bg-[#182339]/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {/* Nav links */}
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              {t('faq.title')}
            </Link>

            <a
              href="#find-report"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              {findLabel}
            </a>

            {/* Language toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 mt-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMenuOpen(false);
                  }}
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
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
        </div>
      )}
    </>
  );
}

function StickyProgressBar({ t }: { t: TranslateFn }) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      const pastHero = latest > window.innerHeight * 0.7;
      // Hide when near bottom so footer is accessible
      const nearBottom = latest + window.innerHeight > document.body.scrollHeight - 120;
      setIsVisible(pastHero && !nearBottom);
    });
  }, [scrollY]);

  return (
    <>
      {/* Desktop: Top Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] hidden md:block pointer-events-none"
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/95 backdrop-blur-md border-b border-[#233F64]/10 py-3 px-6">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4">
              <div className="w-32 h-1.5 bg-[#233F64]/10 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-[#233F64] rounded-full" />
              </div>
              <span className="text-xs text-[#402525]/60">{t('landing.sticky.progress', { percent: 0 })}</span>
            </div>
            <Link
              href="/survey"
              className="bg-[#233F64] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#182339] transition-colors flex items-center gap-2"
            >
              {t('landing.sticky.continue')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Mobile: Bottom Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[60] md:hidden pointer-events-none"
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-[#233F64]/10 p-4 pb-6 pointer-events-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 h-1.5 bg-[#233F64]/10 rounded-full overflow-hidden">
              <div className="w-0 h-full bg-[#233F64] rounded-full" />
            </div>
            <span className="text-xs text-[#402525]/60">0%</span>
          </div>
          <Link
            href="/survey"
            className="w-full bg-[#233F64] text-white py-3 rounded-full text-sm font-medium hover:bg-[#182339] transition-colors flex items-center justify-center gap-2"
          >
            {t('landing.sticky.continue.mobile')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </>
  );
}

// Focus Section Component for scroll-based reveal
function FocusSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0.15,
        filter: isInView ? "blur(0px)" : "blur(4px)",
        transform: isInView ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </motion.div>
  );
}

// --- Sections ---

function HeroSection({ t }: { t: TranslateFn }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  const rollingPhrases = [
    t('landing.hero.rolling1'),
    t('landing.hero.rolling2'),
    t('landing.hero.rolling3'),
  ];

  return (
    <section className="relative min-h-screen flex items-center px-6 py-20 md:py-0">
      <motion.div
        className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        style={{ opacity, y }}
      >
        {/* Left: The Message */}
        <div className="order-1 lg:order-1">
          <motion.p
            className="text-xs font-mono mb-4 text-white/50 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('landing.hero.tag')}
          </motion.p>

          <motion.h1
            className="text-5xl md:text-7xl font-display font-medium leading-[1.1] mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t('landing.hero.title')}
          </motion.h1>

          <motion.div
            className="text-2xl md:text-3xl text-white/70 font-light mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TypewriterText
              phrases={rollingPhrases}
              typingSpeed={60}
              deletingSpeed={30}
              pauseDuration={2500}
              className="text-white/80"
            />
          </motion.div>

          <motion.p
            className="text-lg text-white/50 max-w-md hidden lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t('landing.hero.subtitle')}
          </motion.p>
        </div>

        {/* Right: Embedded Q1 Card */}
        <div className="order-2 lg:order-2 flex justify-center lg:justify-end">
          <EmbeddedDiagnosticCard t={t} />
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hidden lg:block"
        style={{ opacity }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] font-mono tracking-widest uppercase mb-2 block text-center">
          {t('landing.hero.scroll')}
        </span>
        <ArrowDown className="w-4 h-4 mx-auto" />
      </motion.div>
    </section>
  );
}

function ProblemSection({ t }: { t: TranslateFn }) {
  const cards = [
    { title: t('landing.problem.card1.title'), desc: t('landing.problem.card1.desc') },
    { title: t('landing.problem.card2.title'), desc: t('landing.problem.card2.desc') },
    { title: t('landing.problem.card3.title'), desc: t('landing.problem.card3.desc') },
  ];

  return (
    <section id="problem" className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-4xl mx-auto w-full">
        <FocusSection>
          <div className="text-center mb-16">
            {/* Battery Visual */}
            <motion.div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 mb-8"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-12 h-6 border-2 border-white/40 rounded-sm">
                  <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-1 h-3 bg-white/40 rounded-r-sm" />
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500/60 to-red-500/20"
                    initial={{ width: "80%" }}
                    whileInView={{ width: "15%" }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">
              {t('landing.problem.title')}<br />
              <span className="text-white/60 italic">{t('landing.problem.title2')}</span>
            </h2>
          </div>
        </FocusSection>

        <FocusSection className="max-w-2xl mx-auto text-center">
          <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed mb-8">
            {t('landing.problem.lead')}
          </p>
          <p className="text-lg text-white/50 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('landing.problem.desc').replace('<em>', '<span class="text-white/80 font-medium">').replace('</em>', '</span>') }} />
        </FocusSection>

        <FocusSection className="mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((item, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </FocusSection>
      </div>
    </section>
  );
}

function SolutionSection({ t }: { t: TranslateFn }) {
  const steps = [
    { step: "01", title: t('landing.solution.step1'), desc: t('landing.solution.step1.desc') },
    { step: "02", title: t('landing.solution.step2'), desc: t('landing.solution.step2.desc') },
    { step: "03", title: t('landing.solution.step3'), desc: t('landing.solution.step3.desc') },
  ];

  return (
    <section id="solution" className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-4xl mx-auto w-full">
        <FocusSection>
          <div className="mb-16">
            <span className="inline-block text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              {t('landing.solution.tag')}
            </span>
            <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">
              {t('landing.solution.title')}<br />{t('landing.solution.title2')}
            </h2>
            <p className="text-2xl md:text-3xl text-white/60 font-light" dangerouslySetInnerHTML={{ __html: t('landing.solution.subtitle').replace('<em>', '<span class="text-white/90">').replace('</em>', '</span>') }} />
          </div>
        </FocusSection>

        <FocusSection>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-6">
              {t('landing.solution.desc')}
            </p>
            <p className="text-xl md:text-2xl text-white font-medium">
              {t('landing.solution.tagline')}
            </p>
          </div>
        </FocusSection>

        <FocusSection className="mt-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-display text-white/20 mb-3">{item.step}</div>
                <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </FocusSection>
      </div>
    </section>
  );
}

const SAMPLE_CARDS = [
  {
    label: "YOUR CHAPTER",
    born: "Born 1982. Perth.",
    question: "You're halfway through a decade of dismantling.",
    text: "What you built in your 30s was real. But it was built on borrowed blueprints. This decade isn't about starting over. It's about building from what's actually yours.",
  },
  {
    label: "PROOF",
    born: "Born 1996. Seoul.",
    question: "",
    text: "",
    items: [
      "회의가 시작되기도 전에 이미 발생하지도 않은 문제들에 대한 해결책 세 가지를 머릿속으로 만듭니다.",
      "남들이 하면 답답하다는 이유로 남의 일까지 가져와서 처리하고는, 왜 나만 이렇게 바쁜지 화를 냅니다.",
      "중요한 제안을 받았을 때 그 자리에서 바로 수락하고, 돌아오는 길에 알 수 없는 답답함을 느낍니다.",
    ],
  },
  {
    label: "EVIDENCE",
    born: "Born 1989. Jakarta.",
    question: "Hal yang kamu kira cuma kepribadian:",
    text: "Kamu melatih percakapan sebelum terjadi. Kamu merasa bersalah saat istirahat di hari produktif. Kamu tahu jawabannya tapi menunggu orang lain mengatakannya duluan.",
  },
  {
    label: "MIRROR",
    born: "Born 1993. Boston.",
    question: "The version of you that others see:",
    text: "Calm. Collected. Slightly hard to read. Here's what they miss: you're running 4 simulations of this conversation before you open your mouth.",
  },
  {
    label: "BRAIN SCAN",
    born: "Born 2001. London.",
    question: "What's actually running under the surface?",
    text: "Your prefrontal cortex is competing with your limbic system for bandwidth. You don't lack focus. You have two systems fighting for the steering wheel.",
  },
  {
    label: "CLOSING",
    born: "Born 1988. Tokyo.",
    question: "",
    text: "あなたは何年もかけて、取扱説明書のない心を管理するシステムを作ってきた。",
  },
];

function SampleCardsSection({ t }: { t: TranslateFn }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <FocusSection>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              {t('landing.samples.tag')}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">
              {t('landing.samples.title')}
            </h2>
          </div>
        </FocusSection>

        <FocusSection>
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {SAMPLE_CARDS.map((s, i) => (
                <CarouselItem key={i} className="pl-3 md:pl-4 basis-[85%] md:basis-[48%]">
                  <div className="bg-[#182339] border border-white/10 rounded-xl p-6 md:p-8 min-h-[240px] flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] uppercase tracking-[0.3em] text-white/30"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {s.label}
                      </span>
                      {s.question && (
                        <p
                          className="text-white/90 text-base md:text-lg font-medium mt-4 mb-3"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {s.question}
                        </p>
                      )}
                      {s.items ? (
                        <div className="space-y-4 mt-4">
                          {s.items.map((item, j) => (
                            <div key={j} className="flex gap-3 items-start">
                              <span className="text-white/25 text-xs mt-0.5 shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {String(j + 1).padStart(2, "0")}
                              </span>
                              <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          className="text-white/50 text-sm leading-relaxed mt-3"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {s.text}
                        </p>
                      )}
                    </div>
                    <p
                      className="text-white/20 text-[10px] mt-5 uppercase tracking-wider"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {s.born}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-white/60 w-4" : "bg-white/20 w-1.5"
                }`}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>

          {/* Disclaimer */}
          <p
            className="text-center text-white/20 text-[10px] mt-4 uppercase tracking-wider"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t('landing.samples.disclaimer')}
          </p>
        </FocusSection>
      </div>
    </section>
  );
}

function VibeCheckSection({ t }: { t: TranslateFn }) {
  // Static Instagram images (manual update)
  const instagramPosts = [
    { id: 1, placeholder: true },
    { id: 2, placeholder: true },
    { id: 3, placeholder: true },
    { id: 4, placeholder: true },
    { id: 5, placeholder: true },
    { id: 6, placeholder: true },
  ];

  return (
    <section id="community" className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-5xl mx-auto w-full">
        <FocusSection>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-mono text-white/40 uppercase tracking-widest mb-4">
              {t('landing.community.tag')}
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-white">
              {t('landing.community.title')}
            </h2>
          </div>
        </FocusSection>

        <FocusSection>
          {/* Moodboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {instagramPosts.map((post, i) => (
              <motion.div
                key={post.id}
                className={`aspect-square bg-gradient-to-br from-[#ABBBD5]/20 to-[#233F64]/20 rounded-xl overflow-hidden border border-white/10 ${
                  i === 1 || i === 3 ? "md:row-span-2 md:aspect-auto" : ""
                }`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Placeholder - replace with actual images */}
                <div className="w-full h-full flex items-center justify-center text-white/20">
                  <span className="text-xs font-mono">@badathebrand</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Instagram Link */}
          <motion.a
            href="https://www.instagram.com/badathebrand"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-8 text-white/60 hover:text-white transition-colors"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-sm">@badathebrand</span>
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        </FocusSection>
      </div>
    </section>
  );
}

function FinalCTA({ t }: { t: TranslateFn }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ABBBD5]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full text-center">
        <FocusSection>
          <motion.p
            className="font-mono text-xs text-[#ABBBD5] mb-6 tracking-[0.2em] uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('landing.cta.tag')}
          </motion.p>

          <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-8">
            {t('landing.cta.title')}<br />
            <span className="italic text-white/70">{t('landing.cta.title2')}</span>
          </h2>

          <p className="text-lg text-white/60 mb-12">
            {t('landing.cta.desc')}<br />
            {t('landing.cta.desc2')}
          </p>

          <Link
            href="/survey"
            className="group inline-flex items-center gap-4 px-10 py-5 bg-white text-[#182339] rounded-full font-bold text-lg hover:scale-105 transition-transform"
          >
            {t('landing.cta.button')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FocusSection>
      </div>
    </section>
  );
}

function FindMyReport({ language }: { language: UILanguage }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await fetch("/api/resend-report-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus("sent");
    } catch {
      setStatus("sent"); // Still show success to prevent enumeration
    }
  };

  const labels = {
    en: { title: "Already have a report?", desc: "Enter your email and we'll resend the link.", button: "Send link", sent: "Check your inbox!" },
    ko: { title: "리포트를 잃어버리셨나요?", desc: "이메일을 입력하면 리포트 링크를 다시 보내드려요.", button: "링크 받기", sent: "메일함을 확인하세요!" },
    id: { title: "Sudah punya laporan?", desc: "Masukkan email dan kami akan kirim ulang linknya.", button: "Kirim link", sent: "Cek inbox kamu!" },
  };
  const l = labels[language] || labels.en;

  return (
    <section id="find-report" className="relative z-10 py-12 px-6">
      <div className="max-w-md mx-auto text-center">
        <p className="text-white/40 text-sm mb-2">{l.title}</p>
        {status === "sent" ? (
          <p className="text-[#6BCB77]/80 text-sm">{l.sent}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/15 hover:text-white/80 disabled:opacity-40 transition-colors shrink-0"
            >
              {l.button}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer({ language, setLanguage, t }: { language: UILanguage; setLanguage: (lang: UILanguage) => void; t: TranslateFn }) {
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
          <Link href="/faq" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            {t('faq.title')}
          </Link>
          <Link href="/privacy" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            Terms
          </Link>
        </div>

        {/* Language Toggle - Right Side */}
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

// --- Main ---

export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  return (
    <main className="relative w-full">
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

      <Header t={t} language={language} setLanguage={setLanguage} />

      <div className="relative">
        <HeroSection t={t} />
        <ProblemSection t={t} />
        <SolutionSection t={t} />
        <SampleCardsSection t={t} />
        {/* <VibeCheckSection t={t} /> */}
        <FinalCTA t={t} />
      </div>

      <FindMyReport language={language} />
      <Footer language={language} setLanguage={setLanguage} t={t} />
      <StickyProgressBar t={t} />
    </main>
  );
}
