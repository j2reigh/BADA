import { useState, useEffect } from "react";
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
  email: string;
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
  bg_type_01: "from-[#2492FF] via-[#1a7ae0] to-[#0d5dba]",
  bg_type_02: "from-[#E45B06] via-[#c44f05] to-[#9a3d04]",
  bg_type_03: "from-[#2492FF] via-[#5ba8ff] to-[#8dc4ff]",
  bg_type_04: "from-[#E45B06] via-[#ff7d3d] to-[#ffa070]",
  bg_type_05: "from-[#2F3034] via-[#4a4b50] to-[#6b6d73]",
  bg_type_06: "from-[#2492FF] to-[#E45B06]",
  bg_type_07: "from-[#2F3034] via-[#2492FF] to-[#2F3034]",
  bg_type_08: "from-[#E45B06] via-[#2492FF] to-[#E45B06]",
};

const ELEMENT_COLORS: Record<string, string> = {
  overlay_wood: "text-green-300",
  overlay_fire: "text-orange-300",
  overlay_earth: "text-amber-300",
  overlay_metal: "text-slate-200",
  overlay_water: "text-blue-300",
};

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your Life Blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Unable to load results</h1>
          <p className="text-muted-foreground text-sm">Please verify your email to access your report.</p>
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
    <div className="min-h-screen depth-gradient-bg">
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center"
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
                <Unlock className="w-20 h-20 text-primary mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-background">Unlocking Your Blueprint...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative min-h-[60vh] bg-gradient-to-br ${bgGradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/20" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 text-center px-6 max-w-2xl"
        >
          <p className="text-white/70 text-sm mb-2">Hello, {userInput.name}</p>
          <h1 
            className={`text-4xl md:text-5xl font-semibold text-white mb-4 ${elementColor}`}
            data-testid="text-identity-title"
          >
            {page1_identity?.title || "Your Life Blueprint"}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed" data-testid="text-sub-headline">
            {page1_identity?.sub_headline || "Discover your unique operating pattern"}
          </p>
          
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 text-sm">
            <span className="text-white font-mono">
              Pattern: {userInput.surveyScores?.typeName || "Unknown"}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="animate-bounce">
            <ArrowRight className="w-5 h-5 text-white/50 rotate-90" />
          </div>
        </motion.div>
      </motion.section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <LockedSection
            page={page2_hardware}
            pageNumber={2}
            isPaid={isPaid}
            color="primary"
          />
          
          <LockedSection
            page={page3_os}
            pageNumber={3}
            isPaid={isPaid}
            color="accent"
          />
          
          <LockedSection
            page={page4_mismatch}
            pageNumber={4}
            isPaid={isPaid}
            color="primary"
          />
          
          <LockedSection
            page={page5_solution}
            pageNumber={5}
            isPaid={isPaid}
            color="accent"
          />

          {!isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-10"
            >
              <Card className="max-w-sm mx-auto p-6 bg-card border border-border">
                <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />

                <div className="mb-4">
                  <div className="inline-block bg-accent/10 text-accent px-3 py-1 text-xs font-semibold mb-2">
                    BETA LAUNCH - 85% OFF
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Unlock Your Full Blueprint
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get your complete Life Architecture analysis including your natural blueprint,
                  OS diagnosis, core tensions, and personalized action plan.
                </p>

                <div className="mb-5">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl font-semibold text-primary">$2.99</span>
                    <span className="text-muted-foreground line-through text-sm">$19.99</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Limited time beta pricing</p>
                </div>

                <a
                  href={`https://gumroad.com/l/bada-full-report?wanted=true&report_id=${reportId}&email=${encodeURIComponent(data.email || "")}`}
                  className="block w-full py-3 px-6 text-center bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                  data-gumroad-single-product="true"
                  data-gumroad-overlay="true"
                >
                  Unlock Full Report - $2.99
                </a>

                <p className="text-xs text-muted-foreground mt-4">
                  Secure payment via Gumroad
                </p>

                {process.env.NODE_ENV === 'development' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => unlockMutation.mutate()}
                    disabled={unlockMutation.isPending}
                  >
                    {unlockMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Unlock className="w-4 h-4 mr-2" />
                    )}
                    Test Unlock (Dev Only)
                  </Button>
                )}
              </Card>
            </motion.div>
          )}

          {isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6 space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm">
                <Check className="w-4 h-4" />
                <span className="font-medium">Full Report Unlocked</span>
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

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>Report generated on {new Date(data.createdAt).toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

interface LockedSectionProps {
  page: PageSection | null;
  pageNumber: number;
  isPaid: boolean;
  color: string;
}

function LockedSection({ page, pageNumber, color }: LockedSectionProps) {
  if (!page) return null;

  const colorClasses: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    primary: { bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", accent: "bg-primary" },
    accent: { bg: "bg-accent/5", border: "border-accent/20", text: "text-accent", accent: "bg-accent" },
  };

  const colors = colorClasses[color] || colorClasses.primary;
  const isLocked = page.locked === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: pageNumber * 0.1 }}
    >
      <Card className={`relative overflow-hidden border ${isLocked ? 'border-border' : colors.border}`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${colors.accent}`} />
        
        <div className={`p-5 md:p-6 ${isLocked ? 'relative' : ''}`}>
          {isLocked && (
            <>
              <div className="absolute inset-0 bg-card/90 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm font-medium">Unlock to view</p>
                </div>
              </div>
              <div className="blur-sm select-none">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                    Page {pageNumber}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {page.section_name}
                </h3>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="h-3 bg-muted rounded w-4/6" />
                </div>
              </div>
            </>
          )}

          {!isLocked && (
            <div className={colors.bg + " -m-5 md:-m-6 p-5 md:p-6"}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                  Page {pageNumber}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {page.section_name}
              </h3>

              {page.blueprint_summary && (
                <p className="text-foreground leading-relaxed mb-3">
                  {page.blueprint_summary}
                </p>
              )}

              {page.core_insight && page.core_insight.length > 0 && (
                <ul className="space-y-2">
                  {page.core_insight.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 ${colors.text} mt-0.5 shrink-0`} />
                      <span className="text-foreground text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              )}

              {page.diagnosis_summary && (
                <p className="text-foreground leading-relaxed mb-3">
                  {page.diagnosis_summary}
                </p>
              )}

              {page.analysis_points && page.analysis_points.length > 0 && (
                <ul className="space-y-2">
                  {page.analysis_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 ${colors.text} mt-0.5 shrink-0`} />
                      <span className="text-foreground text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {page.insight_title && (
                <div className="mb-3 mt-4">
                  <h4 className={`text-base font-semibold ${colors.text} mb-2`}>
                    {page.insight_title}
                  </h4>
                  {page.conflict_explanation && page.conflict_explanation.length > 0 && (
                    <ul className="space-y-2">
                      {page.conflict_explanation.map((exp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`${colors.text} font-semibold text-sm`}>{i + 1}.</span>
                          <span className="text-foreground text-sm">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {page.protocol_name && (
                <div className="mt-4">
                  <div className="mb-3">
                    <h4 className={`text-base font-semibold ${colors.text}`}>
                      {page.protocol_name}
                    </h4>
                    {page.goal && (
                      <p className="text-muted-foreground text-sm mt-1">{page.goal}</p>
                    )}
                  </div>
                  
                  {page.steps && page.steps.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {page.steps.map((step) => (
                        <div key={step.step} className="flex items-start gap-3 p-3 bg-card border border-border">
                          <span className={`w-6 h-6 ${colors.accent} text-white flex items-center justify-center font-semibold text-xs shrink-0`}>
                            {step.step}
                          </span>
                          <p className="text-foreground text-sm pt-0.5">{step.action}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {page.closing_message && (
                    <div className={`p-3 ${colors.bg} border ${colors.border}`}>
                      <p className={`${colors.text} text-sm italic`}>
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
