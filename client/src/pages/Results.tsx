import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, Unlock, Sparkles, Check, Download, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { generateReportPDF } from "@/lib/pdfExport";
import ParallaxBackground from "@/components/ParallaxBackground";
import FixedTopVisual from "@/components/FixedTopVisual";

// Types
interface Page1Identity {
  title: string;
  sub_headline: string;
  nature_snapshot: { title: string; definition: string; explanation: string };
  brain_snapshot: { title: string; definition: string; explanation: string };
  efficiency_snapshot: { level?: number; level_name?: string; score?: string; label: string; metaphor: string };
  visual_concept: { background_id: string; overlay_id: string };
}

interface Page2Hardware {
  section_name: string;
  locked?: boolean;
  nature_title?: string;
  nature_description?: string;
  shadow_title?: string;
  shadow_description?: string;
  core_insights?: string[];
}

interface Page3OS {
  section_name: string;
  locked?: boolean;
  os_title?: string;
  threat_axis?: { title: string; level: string; description: string };
  environment_axis?: { title: string; level: string; description: string };
  agency_axis?: { title: string; level: string; description: string };
  os_summary?: string;
}

interface Page4Mismatch {
  section_name: string;
  locked?: boolean;
  friction_title?: string;
  career_friction?: { title: string; description: string; quick_tip: string };
  relationship_friction?: { title: string; description: string; quick_tip: string };
  money_friction?: { title: string; description: string; quick_tip: string };
}

interface Page5Solution {
  section_name: string;
  locked?: boolean;
  transformation_goal?: string;
  protocol_name?: string;
  daily_rituals?: Array<{ name: string; description: string; when: string }>;
  environment_boost?: { element_needed: string; tips: string[] };
  closing_message?: string;
}

interface ResultsData {
  reportId: string;
  email: string;
  userInput: { name: string; surveyScores: { typeKey: string; typeName: string } };
  sajuData: any;
  isPaid: boolean;
  createdAt: string;
  page1_identity: Page1Identity | null;
  page2_hardware: Page2Hardware | null;
  page3_os: Page3OS | null;
  page4_mismatch: Page4Mismatch | null;
  page5_solution: Page5Solution | null;
}

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://gumroad.com/js/gumroad.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
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
    mutationFn: async () => apiRequest("POST", `/api/results/${reportId}/unlock`),
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500">Loading your blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-light text-gray-900">Unable to load results</h1>
          <p className="text-gray-500">Please verify your email to access your report.</p>
          <Button onClick={() => setLocation("/")} variant="outline">Go Home</Button>
        </div>
      </div>
    );
  }

  const { userInput, isPaid, page1_identity, page2_hardware, page3_os, page4_mismatch, page5_solution } = data;

  if (!page1_identity) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <p className="text-gray-500">Report data not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1 }}>
                <Unlock className="w-16 h-16 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-light text-white">Unlocking Your Blueprint...</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP: Split Layout */}
      <div className="hidden md:flex min-h-screen">
        <div className="w-[60%] overflow-y-auto bg-white">
          <div className="max-w-2xl mx-auto px-12 py-16 space-y-20">
            <IdentitySection identity={page1_identity} userName={userInput.name} />
            {page2_hardware && <HardwareSection hardware={page2_hardware} isPaid={isPaid} />}
            {page3_os && <OSSection os={page3_os} isPaid={isPaid} />}
            {page4_mismatch && <MismatchSection mismatch={page4_mismatch} isPaid={isPaid} />}
            {page5_solution && <SolutionSection solution={page5_solution} isPaid={isPaid} />}
            <CTASection
              isPaid={isPaid}
              reportId={reportId}
              email={data.email}
              onDownloadPDF={handleDownloadPDF}
              isGeneratingPDF={isGeneratingPDF}
              onUnlock={() => unlockMutation.mutate()}
              unlocking={unlockMutation.isPending}
              onCodeSuccess={() => refetch()}
            />
          </div>
        </div>
        <ParallaxBackground elementOverlay={page1_identity.visual_concept.overlay_id} />
      </div>

      {/* MOBILE: Fixed Top Visual + Scrolling Content */}
      <div className="md:hidden min-h-screen bg-white">
        <FixedTopVisual elementOverlay={page1_identity.visual_concept.overlay_id} title={page1_identity.title} />
        <div className="mt-[45vh] px-6 py-8 space-y-16">
          <IdentitySectionMobile identity={page1_identity} userName={userInput.name} />
          {page2_hardware && <HardwareSection hardware={page2_hardware} isPaid={isPaid} />}
          {page3_os && <OSSection os={page3_os} isPaid={isPaid} />}
          {page4_mismatch && <MismatchSection mismatch={page4_mismatch} isPaid={isPaid} />}
          {page5_solution && <SolutionSection solution={page5_solution} isPaid={isPaid} />}
          <CTASection
            isPaid={isPaid}
            reportId={reportId}
            email={data.email}
            onDownloadPDF={handleDownloadPDF}
            isGeneratingPDF={isGeneratingPDF}
            onUnlock={() => unlockMutation.mutate()}
            unlocking={unlockMutation.isPending}
            onCodeSuccess={() => refetch()}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================
// SECTION COMPONENTS - Clean, Readable Design
// ============================================================

function IdentitySection({ identity, userName }: { identity: Page1Identity; userName: string }) {
  return (
    <section className="space-y-12">
      {/* Hero Title */}
      <div>
        <p className="text-sm text-gray-400 mb-4 tracking-wide">Prepared for {userName}</p>
        <h1 className="text-5xl md:text-6xl font-light text-gray-900 leading-tight mb-4">
          {identity.title}
        </h1>
        <p className="text-xl text-gray-500 font-light italic">"{identity.sub_headline}"</p>
      </div>

      {/* Snapshots */}
      <div className="space-y-8">
        <SnapshotBlock
          label={identity.nature_snapshot.title}
          title={identity.nature_snapshot.definition}
          description={identity.nature_snapshot.explanation}
          accentColor="emerald"
        />
        <SnapshotBlock
          label={identity.brain_snapshot.title}
          title={identity.brain_snapshot.definition}
          description={identity.brain_snapshot.explanation}
          accentColor="violet"
        />
        <SnapshotBlock
          label={identity.efficiency_snapshot.label}
          title={identity.efficiency_snapshot.level_name || identity.efficiency_snapshot.score || "Generating..."}
          description={identity.efficiency_snapshot.metaphor}
          accentColor="amber"
        />
      </div>
    </section>
  );
}

function IdentitySectionMobile({ identity, userName }: { identity: Page1Identity; userName: string }) {
  return (
    <section className="space-y-8">
      {/* Title already shown in FixedTopVisual, so just show subtitle */}
      <div>
        <p className="text-sm text-gray-400 mb-2">Prepared for {userName}</p>
        <p className="text-lg text-gray-600 font-light italic">"{identity.sub_headline}"</p>
      </div>

      {/* Snapshots */}
      <div className="space-y-6">
        <SnapshotBlock
          label={identity.nature_snapshot.title}
          title={identity.nature_snapshot.definition}
          description={identity.nature_snapshot.explanation}
          accentColor="emerald"
        />
        <SnapshotBlock
          label={identity.brain_snapshot.title}
          title={identity.brain_snapshot.definition}
          description={identity.brain_snapshot.explanation}
          accentColor="violet"
        />
        <SnapshotBlock
          label={identity.efficiency_snapshot.label}
          title={identity.efficiency_snapshot.level_name || identity.efficiency_snapshot.score || "Generating..."}
          description={identity.efficiency_snapshot.metaphor}
          accentColor="amber"
        />
      </div>
    </section>
  );
}

function SnapshotBlock({
  label,
  title,
  description,
  accentColor,
}: {
  label: string;
  title: string;
  description?: string;
  accentColor: "emerald" | "violet" | "amber" | "rose" | "blue";
}) {
  const colors = {
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="border-l-2 border-gray-200 pl-6">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${colors[accentColor]}`} />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-medium text-gray-900 leading-snug">{title}</p>
      {description && <p className="text-base text-gray-600 mt-2 leading-relaxed">{description}</p>}
    </div>
  );
}

function HardwareSection({ hardware, isPaid }: { hardware: Page2Hardware; isPaid: boolean }) {
  if (hardware.locked && !isPaid) return <LockedSection title={hardware.section_name} />;

  return (
    <section className="space-y-10">
      <SectionHeader title={hardware.section_name} />

      <div className="space-y-8">
        {/* Nature Blueprint */}
        <div>
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Nature Blueprint</p>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">{hardware.nature_title}</h3>
          <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{hardware.nature_description}</p>
        </div>

        {/* Shadow */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">The Shadow</p>
          <h3 className="text-xl font-medium text-gray-900 mb-2">{hardware.shadow_title}</h3>
          <p className="text-base text-gray-600 leading-relaxed">{hardware.shadow_description}</p>
        </div>

        {/* Core Insights */}
        {hardware.core_insights && hardware.core_insights.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Core Insights</p>
            <ul className="space-y-3">
              {hardware.core_insights.map((insight, i) => (
                <li key={i} className="flex gap-4 text-base text-gray-700">
                  <span className="text-gray-400 font-light">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function OSSection({ os, isPaid }: { os: Page3OS; isPaid: boolean }) {
  if (os.locked && !isPaid) return <LockedSection title={os.section_name} />;

  return (
    <section className="space-y-10">
      <SectionHeader title={os.section_name} subtitle={os.os_title} />

      <div className="space-y-6">
        <AxisCard
          label="Threat Detection"
          sublabel="Amygdala Response"
          level={os.threat_axis?.level}
          title={os.threat_axis?.title}
          description={os.threat_axis?.description}
          color="rose"
        />
        <AxisCard
          label="Sensory Processing"
          sublabel="Environmental Sensitivity"
          level={os.environment_axis?.level}
          title={os.environment_axis?.title}
          description={os.environment_axis?.description}
          color="emerald"
        />
        <AxisCard
          label="Agency Drive"
          sublabel="Dopamine / PFC"
          level={os.agency_axis?.level}
          title={os.agency_axis?.title}
          description={os.agency_axis?.description}
          color="blue"
        />
      </div>

      {os.os_summary && (
        <blockquote className="border-l-2 border-gray-300 pl-6 text-lg text-gray-600 italic">
          "{os.os_summary}"
        </blockquote>
      )}
    </section>
  );
}

function AxisCard({
  label,
  sublabel,
  level,
  title,
  description,
  color,
}: {
  label: string;
  sublabel: string;
  level?: string;
  title?: string;
  description?: string;
  color: "rose" | "emerald" | "blue";
}) {
  const colors = {
    rose: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{sublabel}</p>
        </div>
        {level && <span className={`text-xs font-medium px-3 py-1 rounded-full ${c.badge}`}>{level}</span>}
      </div>
      {title && <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>}
      {description && <p className="text-base text-gray-600 leading-relaxed">{description}</p>}
    </div>
  );
}

function MismatchSection({ mismatch, isPaid }: { mismatch: Page4Mismatch; isPaid: boolean }) {
  if (mismatch.locked && !isPaid) return <LockedSection title={mismatch.section_name} />;

  const frictions = [mismatch.career_friction, mismatch.relationship_friction, mismatch.money_friction].filter(Boolean);

  return (
    <section className="space-y-10">
      <SectionHeader title={mismatch.section_name} subtitle={mismatch.friction_title} />

      <div className="space-y-8">
        {frictions.map((friction, i) => (
          <div key={i} className="space-y-4">
            <h4 className="text-xl font-medium text-gray-900">{friction!.title}</h4>
            <p className="text-base text-gray-600 leading-relaxed">{friction!.description}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-medium text-amber-800">Quick Tip</p>
              <p className="text-base text-amber-700 mt-1">{friction!.quick_tip}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SolutionSection({ solution, isPaid }: { solution: Page5Solution; isPaid: boolean }) {
  if (solution.locked && !isPaid) return <LockedSection title={solution.section_name} />;

  return (
    <section className="space-y-10">
      <SectionHeader title={solution.section_name} />

      {/* Transformation Goal */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
        <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-2">Transformation Goal</p>
        <p className="text-xl font-medium text-gray-900">{solution.transformation_goal}</p>
      </div>

      {/* Daily Rituals */}
      {solution.daily_rituals && solution.daily_rituals.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">{solution.protocol_name}</h4>
          <div className="space-y-4">
            {solution.daily_rituals.map((ritual, i) => (
              <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium shadow-sm">
                  {ritual.when.slice(0, 3)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ritual.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{ritual.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Environment Boost */}
      {solution.environment_boost && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <p className="text-sm font-medium text-blue-700 mb-3">
            Environment Boost: {solution.environment_boost.element_needed}
          </p>
          <ul className="space-y-2">
            {solution.environment_boost.tips?.map((tip, i) => (
              <li key={i} className="flex gap-2 text-base text-blue-800">
                <span className="text-blue-400">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Closing Message */}
      {solution.closing_message && (
        <p className="text-center text-lg text-gray-500 italic">"{solution.closing_message}"</p>
      )}
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-light text-gray-900">{title}</h2>
      {subtitle && <p className="text-lg text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}

function LockedSection({ title }: { title: string }) {
  return (
    <section className="flex flex-col items-center justify-center py-16 px-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center">Unlock the full report to view this section</p>
    </section>
  );
}

function CTASection({
  isPaid,
  reportId,
  email,
  onDownloadPDF,
  isGeneratingPDF,
  onUnlock,
  unlocking,
  onCodeSuccess,
}: {
  isPaid: boolean;
  reportId: string;
  email: string;
  onDownloadPDF: () => void;
  isGeneratingPDF: boolean;
  onUnlock: () => void;
  unlocking: boolean;
  onCodeSuccess: () => void;
}) {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemCode = async () => {
    if (!code.trim()) return;
    setCodeError("");
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase().trim(), reportId }),
      });
      const data = await res.json();
      if (data.success) {
        setCode("");
        onCodeSuccess();
      } else {
        setCodeError(data.message || "Failed to redeem code");
      }
    } catch {
      setCodeError("Network error. Please try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (!isPaid) {
    return (
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white">
        <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-6" />
        <span className="inline-block bg-amber-500/20 text-amber-300 px-4 py-1 text-xs font-medium rounded-full mb-4">
          BETA LAUNCH - 85% OFF
        </span>
        <h3 className="text-2xl md:text-3xl font-light mb-3">Unlock Your Full Blueprint</h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Get your complete analysis including OS diagnosis, friction points, and personalized action protocol.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-4xl font-light">$2.99</span>
          <span className="text-gray-500 line-through">$19.99</span>
        </div>

        <a
          href={`https://gumroad.com/l/bada-full-report?wanted=true&report_id=${reportId}&email=${encodeURIComponent(email || "")}`}
          className="inline-block w-full max-w-sm py-4 px-8 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          Unlock Full Report
        </a>

        <p className="text-xs text-gray-500 mt-4">Secure payment via Gumroad</p>

        {/* Code Redemption */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
            <Ticket className="w-4 h-4" />
            <span>Have a code?</span>
          </div>
          <div className="flex gap-2 max-w-xs mx-auto">
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setCodeError("");
              }}
              placeholder="Enter code"
              className="bg-gray-800 border-gray-700 text-white uppercase text-center font-mono placeholder:text-gray-600"
              maxLength={12}
              onKeyDown={(e) => e.key === "Enter" && handleRedeemCode()}
            />
            <Button
              onClick={handleRedeemCode}
              disabled={!code.trim() || isRedeeming}
              variant="secondary"
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
          {codeError && <p className="text-sm text-red-400 mt-2">{codeError}</p>}
        </div>

        {process.env.NODE_ENV === "development" && (
          <Button size="sm" variant="ghost" className="mt-4 text-gray-500" onClick={onUnlock} disabled={unlocking}>
            {unlocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
            Test Unlock
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 md:p-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm rounded-full mb-6">
        <Check className="w-5 h-5" />
        <span className="font-medium">Full Report Unlocked</span>
      </div>
      <h3 className="text-2xl font-light text-gray-900 mb-6">Your Blueprint is Ready</h3>
      <Button onClick={onDownloadPDF} disabled={isGeneratingPDF} size="lg" className="gap-2">
        {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {isGeneratingPDF ? "Generating PDF..." : "Download PDF Report"}
      </Button>
    </section>
  );
}
