import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { generateReportPDF } from "@/lib/pdfExport";
import { ResultsData } from "@/components/report-v2/types";

// V2 Sections
import HeroSection from "@/components/report-v2/HeroSection";
import BlueprintSection from "@/components/report-v2/BlueprintSection";
import DiagnosticsSection from "@/components/report-v2/DiagnosticsSection";
import GlitchSection from "@/components/report-v2/GlitchSection";
import ProtocolSection from "@/components/report-v2/ProtocolSection";

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: report, isLoading, error } = useQuery({
    queryKey: [`/api/results/${reportId}`],
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
    <div className="bg-black min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      <HeroSection data={resultsData} />
      <BlueprintSection data={resultsData} />
      <DiagnosticsSection data={resultsData} />
      <GlitchSection data={resultsData} />
      <ProtocolSection data={resultsData} />

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-black/50 backdrop-blur-xl hover:bg-emerald-900/50 text-white border border-white/10 hover:border-emerald-500/50 rounded-full px-6 py-6 h-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 group"
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-500" />
          ) : (
            <Download className="w-5 h-5 mr-2 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          )}
          <span className="text-xs uppercase tracking-widest font-medium group-hover:text-emerald-400 transition-colors">
            {isGeneratingPDF ? "Exporting..." : "Download Blueprint"}
          </span>
        </Button>
      </div>
    </div>
  )
}
