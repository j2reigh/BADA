import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, Unlock, Sparkles, ArrowRight, Check, Download } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateReportPDF } from "@/lib/pdfExport";

interface Page1Identity {
  title: string;
  sub_headline: string;
  visual_concept: {
    background_id: string;
    overlay_id: string;
  };
}

interface PageSection {
  section_name: string;
  locked?: boolean;
  blueprint_summary?: string;
  core_insight?: string[];
  diagnosis_summary?: string;
  analysis_points?: string[];
  insight_title?: string;
  conflict_explanation?: string[];
  goal?: string;
  protocol_name?: string;
  steps?: Array<{ step: number; action: string }>;
  closing_message?: string;
}

interface ResultsData {
  reportId: string;
  userInput: {
    name: string;
    surveyScores: {
      typeKey: string;
      typeName: string;
    };
  };
  sajuData: any;
  isPaid: boolean;
  createdAt: string;
  page1_identity: Page1Identity | null;
  page2_hardware: PageSection | null;
  page3_os: PageSection | null;
  page4_mismatch: PageSection | null;
  page5_solution: PageSection | null;
}

const BACKGROUND_GRADIENTS: Record<string, string> = {
  bg_type_01: "from-cyan-400 via-blue-500 to-indigo-600",
  bg_type_02: "from-orange-400 via-red-500 to-purple-600",
  bg_type_03: "from-emerald-400 via-teal-500 to-cyan-600",
  bg_type_04: "from-rose-400 via-pink-500 to-purple-600",
  bg_type_05: "from-slate-400 via-gray-500 to-zinc-600",
  bg_type_06: "from-violet-400 via-purple-500 to-indigo-600",
  bg_type_07: "from-stone-400 via-neutral-500 to-gray-600",
  bg_type_08: "from-amber-400 via-orange-500 to-red-600",
};

const ELEMENT_COLORS: Record<string, string> = {
  overlay_wood: "text-green-400",
  overlay_fire: "text-orange-400",
  overlay_earth: "text-amber-400",
  overlay_metal: "text-slate-300",
  overlay_water: "text-blue-400",
};

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!data) return;
    setIsGeneratingPDF(true);
    try {
      await generateReportPDF(data);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const { data, isLoading, error, refetch } = useQuery<ResultsData>({
    queryKey: ["/api/results", reportId],
    retry: false,
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/results/${reportId}/unlock`);
    },
    onSuccess: () => {
      setShowUnlockAnimation(true);
      setTimeout(() => {
        setShowUnlockAnimation(false);
        queryClient.invalidateQueries({ queryKey: ["/api/results", reportId] });
        refetch();
      }, 1500);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#0800FF] mx-auto" />
          <p className="text-gray-600">Loading your Life Blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Unable to load results</h1>
          <p className="text-gray-600">Please verify your email to access your report.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { userInput, isPaid, page1_identity, page2_hardware, page3_os, page4_mismatch, page5_solution } = data;
  const bgGradient = BACKGROUND_GRADIENTS[page1_identity?.visual_concept?.background_id || "bg_type_01"];
  const elementColor = ELEMENT_COLORS[page1_identity?.visual_concept?.overlay_id || "overlay_water"];

  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Unlock className="w-24 h-24 text-[#0800FF] mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Unlocking Your Blueprint...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative min-h-[70vh] bg-gradient-to-br ${bgGradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 text-center px-6 max-w-3xl"
        >
          <p className="text-white/80 text-lg mb-2">Hello, {userInput.name}</p>
          <h1 
            className={`text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg ${elementColor}`}
            data-testid="text-identity-title"
          >
            {page1_identity?.title || "Your Life Blueprint"}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed" data-testid="text-sub-headline">
            {page1_identity?.sub_headline || "Discover your unique operating pattern"}
          </p>
          
          <div className="mt-8 inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-white font-mono text-sm">
              Pattern: {userInput.surveyScores?.typeName || "Unknown"}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="animate-bounce">
            <ArrowRight className="w-6 h-6 text-white/60 rotate-90" />
          </div>
        </motion.div>
      </motion.section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <LockedSection
            page={page2_hardware}
            pageNumber={2}
            isPaid={isPaid}
            icon="leaf"
            color="green"
          />
          
          <LockedSection
            page={page3_os}
            pageNumber={3}
            isPaid={isPaid}
            icon="cpu"
            color="blue"
          />
          
          <LockedSection
            page={page4_mismatch}
            pageNumber={4}
            isPaid={isPaid}
            icon="zap"
            color="amber"
          />
          
          <LockedSection
            page={page5_solution}
            pageNumber={5}
            isPaid={isPaid}
            icon="target"
            color="violet"
          />

          {!isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto p-8 bg-white border-2 border-[#0800FF]/20 shadow-xl shadow-[#0800FF]/5">
                <Sparkles className="w-12 h-12 text-[#0800FF] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Unlock Your Full Blueprint
                </h3>
                <p className="text-gray-600 mb-6">
                  Get your complete Life Architecture analysis including your natural blueprint, 
                  OS diagnosis, core tensions, and personalized action plan.
                </p>
                <Button
                  size="lg"
                  className="w-full bg-[#0800FF] hover:bg-[#0600CC] text-white rounded-full shadow-lg shadow-[#0800FF]/30"
                  onClick={() => unlockMutation.mutate()}
                  disabled={unlockMutation.isPending}
                  data-testid="button-unlock-report"
                >
                  {unlockMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Unlock className="w-5 h-5 mr-2" />
                  )}
                  Unlock Full Report
                </Button>
                <p className="text-xs text-gray-400 mt-4">
                  Test mode: Click to unlock without payment
                </p>
              </Card>
            </motion.div>
          )}

          {isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Full Report Unlocked</span>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="gap-2"
                  data-testid="button-download-pdf"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-500">
        <p>Report generated on {new Date(data.createdAt).toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

interface LockedSectionProps {
  page: PageSection | null;
  pageNumber: number;
  isPaid: boolean;
  icon: string;
  color: string;
}

function LockedSection({ page, pageNumber, isPaid, color }: LockedSectionProps) {
  if (!page) return null;

  const colorClasses: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", accent: "bg-green-500" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", accent: "bg-blue-500" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "bg-amber-500" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", accent: "bg-violet-500" },
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const isLocked = page.locked === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: pageNumber * 0.1 }}
    >
      <Card className={`relative overflow-hidden border-2 ${isLocked ? 'border-gray-200' : colors.border}`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${colors.accent}`} />
        
        <div className={`p-6 md:p-8 ${isLocked ? 'relative' : ''}`}>
          {isLocked && (
            <>
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Unlock to view</p>
                </div>
              </div>
              <div className="blur-sm select-none">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-sm font-bold ${colors.text} uppercase tracking-wider`}>
                    Page {pageNumber}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {page.section_name}
                </h3>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
            </>
          )}

          {!isLocked && (
            <div className={colors.bg + " -m-6 md:-m-8 p-6 md:p-8"}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-bold ${colors.text} uppercase tracking-wider`}>
                  Page {pageNumber}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {page.section_name}
              </h3>

              {page.blueprint_summary && (
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {page.blueprint_summary}
                </p>
              )}

              {page.core_insight && page.core_insight.length > 0 && (
                <ul className="space-y-2">
                  {page.core_insight.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 ${colors.text} mt-0.5 shrink-0`} />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              )}

              {page.diagnosis_summary && (
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {page.diagnosis_summary}
                </p>
              )}

              {page.analysis_points && page.analysis_points.length > 0 && (
                <ul className="space-y-2">
                  {page.analysis_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 ${colors.text} mt-0.5 shrink-0`} />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {page.insight_title && (
                <div className="mb-4">
                  <h4 className={`text-xl font-bold ${colors.text} mb-3`}>
                    {page.insight_title}
                  </h4>
                  {page.conflict_explanation && page.conflict_explanation.length > 0 && (
                    <ul className="space-y-2">
                      {page.conflict_explanation.map((exp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`${colors.text} font-bold`}>{i + 1}.</span>
                          <span className="text-gray-700">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {page.protocol_name && (
                <div>
                  <div className="mb-4">
                    <h4 className={`text-xl font-bold ${colors.text}`}>
                      {page.protocol_name}
                    </h4>
                    {page.goal && (
                      <p className="text-gray-600 mt-1">{page.goal}</p>
                    )}
                  </div>
                  
                  {page.steps && page.steps.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {page.steps.map((step) => (
                        <div key={step.step} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
                          <span className={`w-8 h-8 rounded-full ${colors.accent} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                            {step.step}
                          </span>
                          <p className="text-gray-700 pt-1">{step.action}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {page.closing_message && (
                    <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                      <p className={`${colors.text} font-medium italic`}>
                        "{page.closing_message}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
