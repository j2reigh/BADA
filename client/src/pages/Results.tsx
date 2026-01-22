import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { generateReportPDF } from "@/lib/pdfExport";
import { ResultsData } from "@/components/report-v2/types";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// Blend Mode Cursor Component
function BlendModeCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none z-[100] hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    />
  );
}

// V2 Sections
import HeroSection from "@/components/report-v2/HeroSection";
import BlueprintSection from "@/components/report-v2/BlueprintSection";
import DiagnosticsSection from "@/components/report-v2/DiagnosticsSection";
import GlitchSection from "@/components/report-v2/GlitchSection";
import ProtocolSection from "@/components/report-v2/ProtocolSection";

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const { data: report, isLoading, error } = useQuery({
    queryKey: [`/api/results/${reportId}`],
  });

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    // Hide button when scrolling down, show when scrolling up
    if (latest > previous && latest > 100) {
      setShowButton(false);
    } else {
      setShowButton(true);
    }
  });

  const handleDownloadPDF = async () => {
    if (!report) return;
    setIsGeneratingPDF(true);
    try {
      await generateReportPDF(report);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-emerald-500/50 text-xs uppercase tracking-widest animate-pulse">Accessing Core System...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-6" />
        <h2 className="text-2xl font-light mb-2">Sequence Loading Failed</h2>
        <p className="text-gray-500 font-mono text-sm max-w-md">
          Unable to retrieve blueprint data for ID: {reportId}. The link may be invalid or expired.
        </p>
      </div>
    );
  }

  // Cast to V2 Types (Assuming API response matches schema)
  const resultsData = report as unknown as ResultsData;

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-sky-400 selection:text-black overflow-x-hidden">
      {/* Blend Mode Cursor */}
      <BlendModeCursor />

      {/* Ocean Blue Gradient Background */}
      <div
        className="fixed inset-0 z-[-2]"
        style={{
          background: `linear-gradient(
            to bottom,
            #0A1628 0%,
            #1A2B4A 30%,
            #0A1628 70%,
            #050D18 100%
          )`
        }}
      />

      {/* Contour Line Pattern Overlay */}
      <div
        className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 30 50 50 T100 50' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 70 Q25 50 50 70 T100 70' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 30 Q25 10 50 30 T100 30' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 90 Q25 70 50 90 T100 90' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 10 Q25 -10 50 10 T100 10' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      <HeroSection data={resultsData} />
      <BlueprintSection data={resultsData} />
      <DiagnosticsSection data={resultsData} />
      <GlitchSection data={resultsData} />
      <ProtocolSection data={resultsData} />

      {/* Text Along Path Footer */}
      <footer className="relative py-20 overflow-hidden z-30">
        <svg
          viewBox="0 0 1200 100"
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <path
              id="wave-path"
              d="M0,50 Q300,20 600,50 T1200,50"
              fill="none"
            />
          </defs>
          <text className="text-xs md:text-sm uppercase tracking-[0.5em] fill-white/20">
            <textPath href="#wave-path" startOffset="0%">
              FLOW WITH YOUR NATURE · BADA · FLOW WITH YOUR NATURE · BADA · FLOW WITH YOUR NATURE · BADA ·
            </textPath>
          </text>
        </svg>
        <div className="text-center mt-8 text-white/30 text-xs tracking-widest">
          BADA
        </div>
      </footer>

      {/* Floating Action Button (Autohide) */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            className="fixed bottom-8 right-8 z-50 pointer-events-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              size="lg"
              className="bg-[#0A1628]/80 backdrop-blur-xl hover:bg-[#1A2B4A]/80 text-white border border-white/10 hover:border-sky-400/50 rounded-full px-6 py-6 h-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 group"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-sky-400" />
              ) : (
                <Download className="w-5 h-5 mr-2 text-white/60 group-hover:text-sky-400 transition-colors" />
              )}
              <span className="text-xs uppercase tracking-widest font-medium group-hover:text-sky-400 transition-colors">
                {isGeneratingPDF ? "Exporting..." : "Export Blueprint"}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
