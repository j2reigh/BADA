import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "wouter";
import { useTranslation, type UILanguage } from "@/lib/simple-i18n";
import LanguageDropdown from "@/components/LanguageDropdown";
import BlendModeCursor from "@/components/BlendModeCursor";

type TranslateFn = (key: string, params?: Record<string, any>) => string;

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

function Header({ t, language, setLanguage }: { t: TranslateFn; language: UILanguage; setLanguage: (lang: UILanguage) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 transition-colors duration-500 ${menuOpen ? 'z-[60]' : 'z-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="mix-blend-difference">
            <img src="/logo-badaone.svg" alt="bada.one" className="h-5" />
          </a>

          <nav className="hidden md:flex items-center gap-8 mix-blend-difference text-white">
            <Link href="/" className="text-sm hover:opacity-70 transition-opacity whitespace-nowrap">{t('about.nav.home')}</Link>
            <Link href="/about" className="text-sm hover:opacity-70 transition-opacity whitespace-nowrap">About</Link>
            <Link href="/faq" className="text-sm hover:opacity-70 transition-opacity whitespace-nowrap">{t('faq.title')}</Link>
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden mix-blend-difference text-white p-1"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[55] bg-[#182339]/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              {t('about.nav.home')}
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              {t('faq.title')}
            </Link>

            <Link
              href="/#find-report"
              onClick={() => setMenuOpen(false)}
              className="text-lg text-white/80 hover:text-white transition-colors"
            >
              {t('find.report.label')}
            </Link>

            <LanguageDropdown language={language} setLanguage={setLanguage} variant="mobile" />
          </div>
        </div>
      )}
    </>
  );
}

function Footer({ language, setLanguage, t }: { language: UILanguage; setLanguage: (lang: UILanguage) => void; t: TranslateFn }) {
  return (
    <footer className="relative z-[55] border-t border-white/10 py-6 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <span className="text-white/40 text-xs md:text-sm whitespace-nowrap">
            BADA &copy; {new Date().getFullYear()}
          </span>
          <Link href="/faq" className="text-white/40 text-xs md:text-sm hover:text-white/70 transition-colors whitespace-nowrap">
            {t('faq.title')}
          </Link>
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

// --- Sections ---

function HeroSection({ t }: { t: TranslateFn }) {
  return (
    <section className="min-h-[90vh] flex flex-col items-center pt-32 pb-20 relative overflow-hidden px-6">
      {/* Organic background abstract shape */}
      <motion.div
        className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#402525]/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-[1200px] mx-auto w-full z-10 flex flex-col items-center">
        <FocusSection>
          <motion.h1
            className="text-6xl md:text-8xl lg:text-[140px] font-display font-medium leading-[0.9] tracking-tighter text-white mb-6 md:mb-12 text-center whitespace-pre-wrap break-keep"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {t('about.hero.title')}
          </motion.h1>
        </FocusSection>

        <FocusSection className="w-full flex justify-center mt-6">
          <motion.p
            className="text-xl md:text-3xl text-white/70 font-light leading-relaxed max-w-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {t('about.hero.desc')}
          </motion.p>
        </FocusSection>
      </div>
    </section>
  );
}

function EcosystemSection({ t }: { t: TranslateFn }) {
  return (
    <section className="px-6 py-32 md:py-48 relative">
      <div className="max-w-[1400px] mx-auto w-full">
        <FocusSection className="mb-24 md:mb-40">
          <span className="inline-block text-xs font-mono text-white/40 uppercase tracking-[0.3em] mb-4">
            {t('about.ecosystem.tag')}
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-display font-medium text-white max-w-4xl tracking-tight">
            {t('about.ecosystem.title')}
          </h2>
        </FocusSection>

        <div className="flex flex-col md:flex-row gap-20 md:gap-12 justify-between items-start relative">
          {/* Organic connecting line */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent hidden md:block" />

          {/* Compass — Digital Protocol (Organic, text-led, no boxes) */}
          <FocusSection className="w-full md:w-[45%] z-10">
            <div className="pl-6 md:pl-12 border-l border-white/20">
              <span className="inline-block w-8 h-8 rounded-full border border-white/30 mb-8 flex items-center justify-center text-white/50 text-xs">01</span>
              <span className="text-xs font-mono text-white/30 uppercase tracking-[0.3em] block mb-2 mt-4">
                {t('about.compass.tag')}
              </span>
              <h3 className="text-4xl md:text-5xl font-display font-medium text-white mb-6 whitespace-pre-wrap break-keep">
                {t('about.compass.title')}
              </h3>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-6 whitespace-pre-wrap break-keep">
                {t('about.compass.desc')}
              </p>
              {t('about.compass.footnote') && (
                <p className="text-xs md:text-sm text-white/40 leading-relaxed whitespace-pre-wrap break-keep">
                  {t('about.compass.footnote')}
                </p>
              )}
              <Link
                href="/survey"
                className="group inline-flex items-center gap-4 px-8 py-4 bg-white text-[#182339] rounded-full font-bold text-lg hover:bg-white/90 transition-colors mt-8"
              >
                {t('about.cta.button')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FocusSection>

          {/* Anchor — Physical Protocol */}
          <FocusSection className="w-full md:w-[45%] md:mt-32 z-10 flex flex-col">
            <div className="pl-6 md:pl-12 border-l border-white/20 mb-12">
              <span className="inline-block w-8 h-8 rounded-full border border-white/30 mb-8 flex items-center justify-center text-white/50 text-xs">02</span>
              <span className="text-xs font-mono text-white/30 uppercase tracking-[0.3em] block mb-2 mt-4">
                {t('about.anchor.tag')}
              </span>
              <h3 className="text-4xl md:text-5xl font-display font-medium text-white mb-6 whitespace-pre-wrap break-keep">
                {t('about.anchor.title')}
              </h3>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-6 whitespace-pre-wrap break-keep">
                {t('about.anchor.desc')}
              </p>
              {t('about.anchor.footnote') && (
                <p className="text-xs md:text-sm text-white/40 leading-relaxed mb-8 whitespace-pre-wrap break-keep">
                  {t('about.anchor.footnote')}
                </p>
              )}
              <a
                href="https://www.instagram.com/badathebrand"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-base text-white hover:text-[#182339] transition-colors px-6 py-3 rounded-full border border-white/30 hover:border-white hover:bg-white w-max"
              >
                @badathebrand <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* The Coffee Dataframe nested inside Physical Protocol */}
            <div className="w-full border border-white/10 rounded-3xl overflow-hidden bg-[#0D1525]/40 backdrop-blur-md p-6 md:p-8 ml-0 md:ml-12">
              <div className="grid grid-cols-3 border-b border-white/10 pb-4 mb-4 gap-2 items-end">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-[9px] md:text-[10px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                  {t('about.table.col1')}
                </div>
                <div className="col-span-1 text-[9px] md:text-[10px] font-mono text-[#ABBBD5] uppercase tracking-widest leading-relaxed">
                  {t('about.table.col2')}
                </div>
              </div>

              <div className="space-y-1">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="grid grid-cols-3 gap-2 group hover:bg-white/5 p-3 -mx-3 rounded-xl transition-colors items-center">
                    <div className="col-span-1 text-white/50 font-light text-xs md:text-sm">
                      {t(`about.table.row${row}.label`)}
                    </div>
                    <div className="col-span-1 text-white/60 font-light text-xs md:text-sm">
                      {t(`about.table.row${row}.val1`)}
                    </div>
                    <div className="col-span-1 text-white font-medium text-xs md:text-sm">
                      {t(`about.table.row${row}.val2`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FocusSection>
        </div>
      </div>
    </section>
  );
}

function WhyBirthDataSection({ t }: { t: TranslateFn }) {
  return (
    <section className="px-6 py-24 md:py-48 bg-[#0D1525]/30">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row gap-16">
        <FocusSection className="md:w-1/3">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium text-white leading-tight sticky top-32">
            {t('about.why.title')}
          </h2>
        </FocusSection>

        <FocusSection className="md:w-2/3">
          <div className="space-y-12">
            <p className="text-2xl md:text-4xl text-white/80 leading-snug font-light whitespace-pre-wrap break-keep">
              {t('about.why.p1')}
            </p>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-light">
              {t('about.why.p2')}
            </p>
            {t('about.why.p3') && (
              <p className="text-lg md:text-xl text-white/50 leading-relaxed italic border-l border-white/20 pl-6">
                {t('about.why.p3')}
              </p>
            )}
          </div>
        </FocusSection>
      </div>
    </section>
  );
}

function TribeSection({ t }: { t: TranslateFn }) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start center", "end center"]
  });

  // Crossfade images based on scroll progress of the container
  const img1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const img1Scale = useTransform(scrollYProgress, [0, 0.35], [1, 1.05]);

  const img2Opacity = useTransform(scrollYProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]);
  const img2Scale = useTransform(scrollYProgress, [0.25, 0.7], [1, 1.05]);

  const img3Opacity = useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1]);
  const img3Scale = useTransform(scrollYProgress, [0.6, 1], [1, 1.05]);

  return (
    <section className="relative w-full bg-[#182339]">
      {/* Background organic wave (Dark Sand / Deep Water textures) */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
        <motion.div
          className="absolute top-[10%] right-0 w-[800px] h-[800px] bg-[#402525]/30 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[80px]"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 70% 40% 60% / 50% 40% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[-10%] w-[1000px] h-[1000px] bg-[#233F64]/40 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-[100px]"
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
            borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 50% 60% 40% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Sticky Scroll Tracking Container */}
      <div ref={container} className="relative w-full max-w-[1400px] mx-auto px-6 py-24 md:py-48 flex flex-col md:flex-row gap-12 md:gap-20 z-10">

        {/* Left: Sticky Image Parallax Display */}
        <div className="w-full md:w-5/12 hidden md:block relative">
          <div className="sticky top-32 w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-[#0D1525]">
            <motion.div style={{ opacity: img1Opacity, scale: img1Scale }} className="absolute inset-0">
              <div className="absolute inset-0 bg-[#233F64] mix-blend-color z-10 pointer-events-none opacity-40" />
              <img src="/waytobada1.png" alt="Path to BADA" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
            </motion.div>
            <motion.div style={{ opacity: img2Opacity, scale: img2Scale }} className="absolute inset-0">
              <div className="absolute inset-0 bg-[#233F64] mix-blend-color z-10 pointer-events-none opacity-40" />
              <img src="/waytobada2.png" alt="BADA Waves" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
            </motion.div>
            <motion.div style={{ opacity: img3Opacity, scale: img3Scale }} className="absolute inset-0">
              <div className="absolute inset-0 bg-[#233F64] mix-blend-color z-10 pointer-events-none opacity-40" />
              <img src="/waytobada3.png" alt="BADA Surfer" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
            </motion.div>
          </div>
        </div>

        {/* Right: Scrolling Text Content */}
        <div className="w-full md:w-7/12 flex flex-col gap-24 md:gap-[30vh] pt-0 md:pt-[10vh] pb-0 md:pb-[20vh]">
          {/* Mobile Only Inline Image 1 */}
          <div className="block md:hidden w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
            <img src="/waytobada1.png" alt="Path" className="w-full h-full object-cover" />
          </div>

          <FocusSection>
            <p className="text-2xl md:text-4xl text-white/80 leading-relaxed font-light cursor-hover-target mix-blend-difference pr-0 md:pr-12">
              {t('about.tribe.p1')}
            </p>
          </FocusSection>

          {/* Mobile Only Inline Image 2 */}
          <div className="block md:hidden w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img src="/waytobada2.png" alt="Waves" className="w-full h-full object-cover" />
          </div>

          <FocusSection className="md:pl-12">
            <p className="text-2xl md:text-4xl text-white/80 leading-relaxed font-light cursor-hover-target mix-blend-difference">
              {t('about.tribe.p2')}
            </p>
          </FocusSection>

          {/* Mobile Only Inline Image 3 */}
          <div className="block md:hidden w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
            <img src="/waytobada3.png" alt="Surfer" className="w-full h-full object-cover" />
          </div>

          <FocusSection className="border-l border-white/20 pl-8 md:pl-16">
            <p className="text-3xl md:text-5xl text-white/90 font-medium leading-relaxed signature-font cursor-hover-target mix-blend-difference">
              {t('about.tribe.p3')}
            </p>
            <div className="mt-12 flex items-center gap-4 text-white/40">
              <div className="w-2 h-2 rounded-full bg-white/40" />
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>
          </FocusSection>
        </div>
      </div>

      {/* Hero Conclusion (Full Width Background with Title) */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden z-20">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-10%" }}
        >
          <img src="/waytobada4.png" alt="BADA Port Bali" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0D1525]/50 mix-blend-multiply" />
        </motion.div>

        <div className="relative z-10 text-center px-6 mt-16 md:mt-32">
          <FocusSection>
            <h2 className="text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-display font-medium text-white mb-6 md:mb-12 tracking-tight drop-shadow-2xl cursor-hover-target">
              A PORT FOR<br />
              INDEPENDENT VOYAGERS
            </h2>
            <span className="inline-block px-6 py-2 border border-white/30 rounded-full text-[10px] md:text-xs font-mono text-white tracking-[0.3em] uppercase backdrop-blur-md">
              COMING TO BALI
            </span>
          </FocusSection>
        </div>
      </div>

    </section>
  );
}



// --- Main ---

export default function About() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <main className="relative w-full cursor-none selection:bg-white/20">
      <BlendModeCursor />
      {/* Gradient Background — same as Landing */}
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
        <EcosystemSection t={t} />
        <WhyBirthDataSection t={t} />
        <TribeSection t={t} />
      </div>

      <Footer language={language} setLanguage={setLanguage} t={t} />
    </main>
  );
}
