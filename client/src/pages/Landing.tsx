import { Link } from "wouter";
import { Button } from "@/components/Button";
import { ArrowRight, Zap, Layout, Compass, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import logoSvg from "@assets/logo.svg";

// Scroll-based section reveal hook
function useScrollReveal() {
  const [visibleSections, setVisibleSections] = useState(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return visibleSections;
}

// Sticky CTA Navigation
function StickyBottomNav({ showOnScroll = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (!showOnScroll) return;
    
    return scrollY.onChange((latest) => {
      setIsVisible(latest > 100);
    });
  }, [scrollY, showOnScroll]);

  if (!showOnScroll && !isVisible) return null;

  return (
    <motion.div
      className="sticky-bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: isVisible || showOnScroll ? 0 : 100 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-sm mx-auto">
        <Link href="/survey">
          <Button size="lg" className="w-full group text-base h-12 shadow-lg" data-testid="sticky-start">
            Start Your Journey
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const visibleSections = useScrollReveal();
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <>
      {/* Dynamic Gradient Background */}
      <div className="depth-gradient-bg" />
      
      <div ref={containerRef} className="relative">
        {/* Hero Section - Sky Level */}
        <section className="depth-section flex flex-col items-center justify-center p-6" data-reveal id="hero">
          <motion.div
            style={{ y: y1 }}
            className={`max-w-2xl w-full text-center space-y-8 z-10 scroll-reveal ${
              visibleSections.has('hero') ? 'revealed' : ''
            }`}
          >
            <div className="inline-flex items-center justify-center mb-6">
              <img src={logoSvg} alt="BADA" className="h-8" />
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1] drop-shadow-lg">
              Discover Your <br />
              <span className="text-blue-200">Operating Pattern</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-lg mx-auto leading-relaxed drop-shadow">
              Understand how you respond to chaos, environment, and agency.
            </p>

            <div className="pt-6">
              <Link href="/survey">
                <Button size="lg" className="group text-base px-10 h-14 bg-white/90 text-blue-900 hover:bg-white shadow-xl hover:shadow-2xl border-0" data-testid="button-start">
                  Start Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
              className="flex justify-center pt-16"
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - Ocean Surface */}
        <section className="depth-section flex items-center justify-center p-6" data-reveal id="features">
          <motion.div
            style={{ y: y2 }}
            className={`max-w-4xl w-full scroll-reveal ${
              visibleSections.has('features') ? 'revealed' : ''
            }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 drop-shadow-lg">
                Three Dimensions of You
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto drop-shadow">
                Dive deep into the patterns that shape how you navigate life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={visibleSections.has('features') ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="p-6 bg-white/10 backdrop-blur-md border border-white/20 hover-elevate rounded-lg"
              >
                <Zap className="w-8 h-8 text-yellow-300 mb-4 drop-shadow" />
                <h3 className="text-xl font-semibold mb-3 text-white">Threat Response</h3>
                <p className="text-blue-100">How you react when things get intense and chaotic.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={visibleSections.has('features') ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="p-6 bg-white/10 backdrop-blur-md border border-white/20 hover-elevate rounded-lg"
              >
                <Layout className="w-8 h-8 text-green-300 mb-4 drop-shadow" />
                <h3 className="text-xl font-semibold mb-3 text-white">Environment</h3>
                <p className="text-blue-100">What surroundings help you thrive and perform.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={visibleSections.has('features') ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="p-6 bg-white/10 backdrop-blur-md border border-white/20 hover-elevate rounded-lg"
              >
                <Compass className="w-8 h-8 text-orange-300 mb-4 drop-shadow" />
                <h3 className="text-xl font-semibold mb-3 text-white">Agency</h3>
                <p className="text-blue-100">How you shape and control your own destiny.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section - Deep Ocean */}
        <section className="depth-section depth-deep flex items-center justify-center p-6" data-reveal id="cta">
          <motion.div
            style={{ y: y3 }}
            className={`max-w-2xl w-full text-center space-y-8 scroll-reveal ${
              visibleSections.has('cta') ? 'revealed' : ''
            }`}
          >
            <h2 className="text-3xl md:text-5xl font-semibold text-white leading-tight drop-shadow-lg">
              Ready to Discover <br />
              <span className="text-accent">Your Blueprint?</span>
            </h2>
            
            <p className="text-lg text-white/80 max-w-lg mx-auto leading-relaxed drop-shadow">
              Take the assessment and unlock insights about your unique operating pattern.
            </p>

            <div className="pt-8">
              <Link href="/survey">
                <Button size="lg" className="group text-base px-12 h-16 bg-accent text-white hover:bg-accent/90 shadow-2xl border-0 text-lg font-semibold">
                  Begin Assessment
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Sticky Bottom Navigation */}
      <StickyBottomNav showOnScroll />
    </>
  );
}
