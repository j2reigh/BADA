import React, { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { generateReportPDF } from "@/lib/pdfExport";
import { ResultsData } from "@/components/report-v2/types";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// Text Along Path Footer Component with Scroll Animation
function TextAlongPathFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startOffset, setStartOffset] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Update startOffset based on scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setStartOffset(latest * -50);
  });

  const baseText = "FLOW WITH YOUR NATURE · BADA · ";
  const repeatedText = baseText.repeat(20);

  return (
    <footer ref={containerRef} className="relative py-10 overflow-hidden z-30 bg-[#402525]">
      <div className="relative w-full overflow-hidden" style={{ height: "80px" }}>
        <svg
          width="3000"
          height="80"
          viewBox="0 0 3000 80"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ minWidth: "3000px" }}
        >
          <defs>
            <path
              id="curve-path"
              d="M0,40
                 Q150,0 300,40 Q450,80 600,40
                 Q750,0 900,40 Q1050,80 1200,40
                 Q1350,0 1500,40 Q1650,80 1800,40
                 Q1950,0 2100,40 Q2250,80 2400,40
                 Q2550,0 2700,40 Q2850,80 3000,40"
              fill="none"
            />
          </defs>
          <text
            className="uppercase font-medium"
            style={{
              fontSize: "15px",
              fill: "#ABBBD5",
              letterSpacing: "0.2em"
            }}
          >
            <textPath
              href="#curve-path"
              startOffset={`${startOffset}%`}
            >
              {repeatedText}
            </textPath>
          </text>
        </svg>
      </div>
    </footer>
  );
}

// Lerp function for smooth interpolation
const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

// Blend Mode Cursor Component with Hover State & Delayed Movement
function BlendModeCursor({ isHovering }: { isHovering: boolean }) {
  const size = isHovering ? 80 : 20;
  const circleRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const delayedMouse = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const manageMouseMove = (e: MouseEvent) => {
    mouse.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const animate = () => {
    const { x, y } = delayedMouse.current;

    // Lerp towards mouse position (0.1 = smooth delay)
    delayedMouse.current = {
      x: lerp(x, mouse.current.x, 0.1),
      y: lerp(y, mouse.current.y, 0.1)
    };

    // Move the circle
    if (circleRef.current) {
      circleRef.current.style.transform = `translate(${delayedMouse.current.x - size / 2}px, ${delayedMouse.current.y - size / 2}px)`;
    }

    rafId.current = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    window.addEventListener("mousemove", manageMouseMove);

    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [isHovering, size]);

  return (
    <div
      ref={circleRef}
      className="fixed top-0 left-0 rounded-full mix-blend-difference pointer-events-none z-[9999] hidden md:block"
      style={{
        width: size,
        height: size,
        backgroundColor: isHovering ? "#182339" : "#ABBBD5",
        filter: isHovering ? "blur(20px)" : "blur(0px)",
        transition: "width 0.3s ease-out, height 0.3s ease-out, filter 0.3s ease-out, background-color 0.3s ease-out",
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
import ChangeCardSection from "@/components/report-v2/ChangeCardSection";
import TableOfContents from "@/components/report-v2/TableOfContents";

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [isCursorHovering, setIsCursorHovering] = useState(false);

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

  // Cursor hover - detect heading elements via event delegation
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Expand cursor when hovering over headings (h1, h2, h3, h4)
      if (target.matches('h1, h2, h3, h4, [data-cursor-hover]')) {
        setIsCursorHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('h1, h2, h3, h4, [data-cursor-hover]')) {
        setIsCursorHovering(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#233F64] animate-spin" />
          <p className="text-[#233F64]/50 text-xs uppercase tracking-widest animate-pulse">Accessing Core System...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#402525] px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-[#402525] mb-6" />
        <h2 className="text-2xl font-light mb-2">Sequence Loading Failed</h2>
        <p className="text-[#402525]/50 font-mono text-sm max-w-md">
          Unable to retrieve blueprint data for ID: {reportId}. The link may be invalid or expired.
        </p>
      </div>
    );
  }

  // Cast to V2 Types (Assuming API response matches schema)
  const resultsData = report as unknown as ResultsData;

  // Report data is empty (generation failed or birth time unknown)
  if (!resultsData.page1_identity) {
    const hasError = (resultsData as any).reportData?.error || (resultsData as any).sajuData?.error;
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-[#402525] px-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#879DC6]/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#879DC6]" />
          </div>
          <h2 className="text-2xl font-light">
            {hasError ? "Report Generation Failed" : "Report Unavailable"}
          </h2>
          <p className="text-[#402525]/50 text-sm leading-relaxed">
            {hasError
              ? "Something went wrong while generating your report. Please try submitting your assessment again."
              : "Your report could not be generated. This may happen when birth time is unknown. Please try again with your birth time included."}
          </p>
          <button
            onClick={() => window.location.href = "/survey"}
            className="px-8 py-3 bg-[#233F64] text-white rounded-full text-sm font-medium hover:bg-[#182339] transition-colors"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-[#402525] font-sans overflow-x-hidden cursor-none md:cursor-none">
      {/* Blend Mode Cursor */}
      <BlendModeCursor isHovering={isCursorHovering} />

      <TableOfContents />

      <div id="part1">
        <HeroSection data={resultsData} />
      </div>
      <div id="part2">
        <BlueprintSection data={resultsData} />
      </div>
      <div id="part3">
        <DiagnosticsSection data={resultsData} />
      </div>
      <div id="part4">
        <GlitchSection data={resultsData} />
      </div>
      <div id="part5">
        <ProtocolSection data={resultsData} />
      </div>

      <ChangeCardSection data={resultsData} />

      {/* Text Along Path Footer */}
      <TextAlongPathFooter />

      {/* Floating Action Button (Autohide) */}
      <AnimatePresence>
        {showButton && resultsData.isPaid && (
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
              className="bg-[#233F64] hover:bg-[#182339] text-white border border-[#233F64] rounded-full px-6 py-6 h-auto shadow-lg transition-all hover:scale-105 group"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Download className="w-5 h-5 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
              )}
              <span className="text-xs uppercase tracking-widest font-medium">
                {isGeneratingPDF ? "Exporting..." : "Save Report"}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
