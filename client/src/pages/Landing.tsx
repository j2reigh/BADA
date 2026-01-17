import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { ArrowRight, ArrowDown, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";

// --- Components ---

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold tracking-tight mix-blend-difference text-white">
          BADA
        </a>

        <nav className="hidden md:flex items-center gap-8 mix-blend-difference text-white">
          <a href="#system" className="text-sm hover:opacity-70 transition-opacity">Why Lost?</a>
          <a href="#analysis" className="text-sm hover:opacity-70 transition-opacity">The How</a>
          <a href="#report-preview" className="text-sm hover:opacity-70 transition-opacity">Preview</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 mix-blend-difference text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function StickyBottomNav() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsVisible(latest > 100);
    });
  }, [scrollY]);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 md:pb-4 pointer-events-none"
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl flex items-center justify-between pl-6 pr-2">
          <span className="text-sm font-medium text-white mix-blend-difference hidden sm:block">
            Start your self-alignment
          </span>
          <span className="text-sm font-medium text-white mix-blend-difference sm:hidden">
            Begin Analysis
          </span>
          <Link
            href="/survey"
            className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            Start Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Interactive Section Component
function FocusSection({ children, className = "", threshold = 0.5 }: { children: React.ReactNode; className?: string; threshold?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={`transition-opacity duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0.2,
        filter: isInView ? "blur(0px)" : "blur(4px)",
        transform: isInView ? "scale(1)" : "scale(0.97)",
      }}
    >
      {children}
    </motion.div>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen flex flex-col justify-center px-6">
      <motion.div 
        className="max-w-[1400px] mx-auto w-full"
        style={{ y: y1, opacity }}
      >
        <p className="text-sm font-mono mb-6 text-white/60">BADA SELF-ALIGNMENT SYSTEM</p>
        <h1 className="text-6xl md:text-8xl font-display font-medium leading-[1.1] mb-8 text-white">
          Working hard,<br />
          <span className="italic">but feeling empty?</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/70 max-w-2xl leading-relaxed">
          It's not you, it's a system mismatch. In a world of uncertainty, just being busy is not the answer.
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-mono tracking-widest uppercase mb-2 block text-center">Discover Why</span>
        <ArrowDown className="w-5 h-5 mx-auto" />
      </motion.div>
    </section>
  );
}

function AnalysisSection() {
  return (
    <div className="relative z-10">
      {/* Zone 1: The Solution */}
      <section className="h-screen flex items-center px-6">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
          <FocusSection>
             <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 text-white/90">
              The Secret to a Happy Life<br />
              <span className="italic text-white/60">Isn't Just Achievement.</span>
             </h2>
          </FocusSection>
          
          <div className="space-y-32">
             <FocusSection>
               <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                 A landmark 85-year Harvard study found a clear answer: a life aligned with *who you are* is the key to lasting happiness.
               </p>
             </FocusSection>
             
             <FocusSection>
               <div className="border-l-2 border-white/20 pl-8">
                 <p className="text-lg text-white/60 mb-4">We call this</p>
                 <div className="text-3xl text-white font-medium">Self-Alignment</div>
               </div>
             </FocusSection>
          </div>
        </div>
      </section>

      {/* Zone 2: The Pain */}
      <section id="system" className="h-screen flex items-center px-6">
        <div className="max-w-[1400px] mx-auto w-full">
           <FocusSection className="mb-20">
             <span className="inline-block py-1 px-3 rounded-full border border-white/30 text-white/80 text-xs font-mono mb-6">
               WHY WE FEEL LOST
             </span>
             <h2 className="text-4xl md:text-6xl font-display font-medium text-white">
               Why does the "right path" feel wrong?
             </h2>
           </FocusSection>

           <div className="grid md:grid-cols-3 gap-8">
             {[
               { title: "Uncertainty", val: "The Future", desc: `The world is changing fast. Is my career future-proof?` },
               { title: "Burnout", val: "The Routine", desc: `Following self-help gurus and 'proven' routines leaves me tired, not inspired.` },
               { title: "Mismatch", val: "The System", desc: `Am I lazy, or just running on the wrong operating system?` }
             ].map((item, i) => (
               <FocusSection key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl">
                 <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-4">{item.title}</h3>
                 <div className="text-4xl font-display text-white mb-4">{item.val}</div>
                 <p className="text-white/60">{item.desc}</p>
               </FocusSection>
             ))}
           </div>
        </div>
      </section>

      {/* Zone 3: The How */}
      <section id="analysis" className="h-screen flex items-center px-6">
         <div className="max-w-4xl mx-auto w-full">
           <FocusSection>
             <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-12">
               Your Personal<br />Instruction Manual
             </h2>
             <p className="text-xl text-white/70 mb-12 leading-relaxed">
              BADA offers a new kind of analysis. We blend timeless wisdom about natural energy (your **Birth Pattern**) with modern concepts from systems thinking. The result is a detailed map of your internal **Operating System (OS)** — revealing how you're wired to think, act, and connect.
             </p>
             <p className="text-xl text-white/70 leading-relaxed">
              We don't give you a simple label. We show you how your system works: your core drives (Hardware), your current mindset (Software), and the conflicts between them that cause "energy leaks."
             </p>
           </FocusSection>
         </div>
      </section>

      {/* Zone 4: The Report Preview - realfood.gov style list */}
      <section id="report-preview" className="min-h-screen flex items-center px-6 py-20">
         <div className="max-w-4xl mx-auto w-full">
           <FocusSection>
             <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium text-white mb-6 md:mb-12">
               See What's Inside<br />Your Report
             </h2>
             <p className="text-lg md:text-xl text-white/70 mb-10 md:mb-16 leading-relaxed max-w-2xl">
               Get a glimpse of the insights waiting for you. Your report is a comprehensive guide to your inner world.
             </p>

             {/* realfood.gov style list */}
             <div className="space-y-0">
               {[
                 { title: "Your Life Blueprint", desc: "Your core identity and natural strengths" },
                 { title: "Your Natural Blueprint", desc: "How you're wired to think and act" },
                 { title: "Your Current Operating System", desc: "Your learned patterns and behaviors" },
                 { title: "The Core Tension", desc: "Where your nature and nurture conflict" },
                 { title: "Your Action Protocol", desc: "Personalized steps for alignment" }
               ].map((item, i) => (
                 <div
                   key={i}
                   className="group flex items-center justify-between py-5 md:py-6 border-b border-white/10 cursor-default hover:bg-white/5 transition-colors -mx-4 px-4 rounded-lg"
                 >
                   <div className="flex-1 pr-4">
                     <h3 className="text-white text-base md:text-lg font-medium underline underline-offset-4 decoration-white/40 group-hover:decoration-white/80 transition-colors">
                       {item.title}
                     </h3>
                     <p className="text-white/50 text-sm mt-1 hidden md:block">
                       {item.desc}
                     </p>
                   </div>
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                     <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                   </div>
                 </div>
               ))}
             </div>
           </FocusSection>
         </div>
      </section>
    </div>
  );
}

function FinalCTA() {
  return (
    <section id="method" className="h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Abyssal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full">
        <FocusSection>
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <p className="font-mono text-xs text-orange-400 mb-6 tracking-[0.2em] uppercase">
              Stop Guessing. Start Aligning.
            </p>
            
            <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-10 drop-shadow-lg">
              In the age of AI, be<br />more human.
            </h2>

            <p className="text-white/90 mb-12 text-lg">
              The analysis takes 5 minutes. The clarity lasts a lifetime.
            </p>

            <Link href="/survey" className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Analyze My Operating System
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FocusSection>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <main className="relative w-full">
      {/* Long gradient background that scrolls with content */}
      <div 
        className="absolute top-0 left-0 right-0 z-[-1] min-h-[500vh] w-full"
        style={{
          background: `linear-gradient(
            to bottom,
            hsl(210, 20%, 98%) 0%,
            hsl(200, 60%, 90%) 15%,
            hsl(205, 60%, 50%) 30%,
            hsl(215, 70%, 25%) 50%,
            hsl(222, 50%, 10%) 75%,
            hsl(240, 30%, 4%) 100%
          )`
        }}
      />

      <Header />
      
      <div className="relative">
        <HeroSection />
        <AnalysisSection />
        <FinalCTA />
      </div>

      <StickyBottomNav />
    </main>
  );
}