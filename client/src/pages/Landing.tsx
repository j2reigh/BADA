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
          <a href="#system" className="text-sm hover:opacity-70 transition-opacity">System</a>
          <a href="#analysis" className="text-sm hover:opacity-70 transition-opacity">Analysis</a>
          <a href="#method" className="text-sm hover:opacity-70 transition-opacity">Method</a>
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
            Start your deep dive
          </span>
          <span className="text-sm font-medium text-white mix-blend-difference sm:hidden">
            Begin Analysis
          </span>
          <Link
            href="/survey"
            className="bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"
          >
            Start Test <ArrowRight className="w-4 h-4" />
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
        opacity: isInView ? 1 : 0.3,
        filter: isInView ? "blur(0px)" : "blur(2px)",
        transform: isInView ? "scale(1)" : "scale(0.98)",
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
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-20">
      <motion.div 
        className="max-w-[1400px] mx-auto w-full"
        style={{ y: y1, opacity }}
      >
        <p className="text-sm font-mono mb-6 text-slate-600">BADA NAVIGATION SYSTEM</p>
        <h1 className="text-6xl md:text-8xl font-display font-medium leading-[1.1] mb-8 text-slate-900">
          The Surface is<br />
          <span className="italic">Just the Beginning</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed">
          Most navigation happens on the surface. We take you deeper to find the currents that actually drive you.
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-400"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-mono tracking-widest uppercase mb-2 block text-center">Dive Deeper</span>
        <ArrowDown className="w-5 h-5 mx-auto" />
      </motion.div>
    </section>
  );
}

function AnalysisSection() {
  return (
    <div className="relative z-10">
      {/* Zone 1: The Transition */}
      <section className="min-h-screen flex items-center px-6 py-24">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
          <FocusSection>
             <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 text-white/90">
              Turbulence<br />
              <span className="italic text-white/60">vs. Alignment</span>
             </h2>
          </FocusSection>
          
          <div className="space-y-32">
             <FocusSection>
               <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                 Surface waves are chaotic. But deep currents are steady. 
                 When you align with your deep currents, resistance disappears.
               </p>
             </FocusSection>
             
             <FocusSection>
               <div className="border-l-2 border-white/20 pl-8">
                 <p className="text-lg text-white/60 mb-4">Current Status</p>
                 <div className="text-3xl text-white font-medium">High Friction</div>
               </div>
             </FocusSection>
          </div>
        </div>
      </section>

      {/* Zone 2: The Data */}
      <section id="system" className="min-h-screen flex items-center px-6 py-24">
        <div className="max-w-[1400px] mx-auto w-full">
           <FocusSection className="mb-20">
             <span className="inline-block py-1 px-3 rounded-full border border-white/30 text-white/80 text-xs font-mono mb-6">
               SONAR DATA
             </span>
             <h2 className="text-4xl md:text-6xl font-display font-medium text-white">
               What lies beneath?
             </h2>
           </FocusSection>

           <div className="grid md:grid-cols-3 gap-8">
             {[
               { title: "Threat", val: "High", desc: "Hidden fears driving decisions" },
               { title: "Environment", val: "Stable", desc: "External conditions" },
               { title: "Agency", val: "Low", desc: "Internal locus of control" }
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

      {/* Zone 3: The Blueprint */}
      <section id="analysis" className="min-h-screen flex items-center px-6 py-24">
         <div className="max-w-4xl mx-auto w-full text-center">
           <FocusSection>
             <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-12">
               Your Navigation<br />Chart
             </h2>
             <p className="text-xl text-white/70 mb-12 leading-relaxed">
               We don't just show you the map. We give you the compass calibrated to your specific magnetic north.
             </p>
             
             <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-xl p-8 max-w-lg mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="h-full border border-white/5 rounded-lg flex items-center justify-center">
                   <div className="text-center">
                     <div className="w-16 h-16 rounded-full border-2 border-white/20 mx-auto mb-6 flex items-center justify-center">
                       <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                     </div>
                     <p className="font-mono text-xs text-white/40">CALIBRATING...</p>
                   </div>
                </div>
             </div>
           </FocusSection>
         </div>
      </section>
    </div>
  );
}

function FinalCTA() {
  return (
    <section id="method" className="min-h-[80vh] flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Abyssal Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl text-center">
        <FocusSection>
          <p className="font-mono text-xs text-orange-500 mb-6 tracking-[0.2em] uppercase">
            Initialize Sequence
          </p>
          
          <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-10">
            Ready to<br />Dive?
          </h2>

          <p className="text-white/60 mb-12 text-lg">
            The descent takes 5 minutes. The clarity lasts forever.
          </p>

          <Link href="/survey" className="group relative inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Start Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
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
        className="absolute top-0 left-0 right-0 z-[-1] min-h-[400vh] w-full"
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