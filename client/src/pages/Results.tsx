import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, RotateCcw, Share2, Shield, Home, Compass } from "lucide-react";

interface ResultsData {
  reportId: string;
  userInput: {
    name: string;
    gender: string;
    birthDate: string;
    birthTime: string | null;
    birthTimeUnknown: boolean;
    birthCity: string;
    surveyScores: {
      typeKey: string;
      typeName: string;
      threatScore: number;
      threatClarity: number;
      environmentScore: number;
      environmentStable: number;
      agencyScore: number;
      agencyActive: number;
    };
  };
  sajuData: any;
  reportData: string | { error?: string; note?: string };
  createdAt: string;
}

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<ResultsData>({
    queryKey: ['/api/results', reportId],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      const errorData = error as any;
      if (errorData?.redirectTo) {
        setLocation(errorData.redirectTo);
      }
    }
  }, [error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Unable to load results</h1>
          <p className="text-muted-foreground">Please verify your email to access your report.</p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { userInput, sajuData, reportData } = data;
  const reportContent = typeof reportData === 'string' ? reportData : reportData.note || reportData.error || "Report not available";
  const scores = userInput.surveyScores;

  return (
    <div className="min-h-screen bg-background py-12 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-muted-foreground mb-2">Hello, {userInput.name}!</p>
            <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Your Operating Pattern</span>
            <h1 className="text-5xl md:text-7xl font-bold text-primary mt-2 mb-6">
              {scores.typeName}
            </h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-primary/20 text-primary font-mono text-sm">
              Code: {scores.typeKey}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <div className="p-4 bg-blue-50 rounded-full mb-6 group-hover:bg-blue-100 transition-colors">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Threat Response</h3>
            <p className="text-4xl font-mono font-bold text-blue-600 mb-2">{scores.threatClarity === 1 ? "Focused" : "Fluid"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {scores.threatScore}/3
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
            <div className="p-4 bg-teal-50 rounded-full mb-6 group-hover:bg-teal-100 transition-colors">
              <Home className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Environment</h3>
            <p className="text-4xl font-mono font-bold text-teal-600 mb-2">{scores.environmentStable === 1 ? "Stable" : "Dynamic"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {scores.environmentScore}/2
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-500" />
            <div className="p-4 bg-violet-50 rounded-full mb-6 group-hover:bg-violet-100 transition-colors">
              <Compass className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Agency</h3>
            <p className="text-4xl font-mono font-bold text-violet-600 mb-2">{scores.agencyActive === 1 ? "Active" : "Passive"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {scores.agencyScore}/3
            </p>
          </div>
        </motion.div>

        {sajuData && !sajuData.error && !sajuData.note && sajuData.fourPillars && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl p-8 border border-border shadow-xl"
          >
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">Your Four Pillars (Saju)</h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              {['year', 'month', 'day', 'hour'].map((pillar) => (
                <div key={pillar} className="bg-gradient-to-b from-primary/10 to-transparent rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2">{pillar}</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {sajuData.fourPillars?.[pillar]?.gan || '-'}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {sajuData.fourPillars?.[pillar]?.zhi || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {reportContent && reportContent !== "Report not available" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-3xl p-8 border border-border shadow-xl"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Your Personalized Insights</h2>
            <div 
              className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap"
              data-testid="text-report"
            >
              {reportContent}
            </div>
          </motion.div>
        )}

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Birth: {userInput.birthDate} {userInput.birthTime || '(Time unknown)'} in {userInput.birthCity}</p>
          <p className="mt-1">Report generated on {new Date(data.createdAt).toLocaleDateString()}</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <Link href="/">
            <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Assessment
            </Button>
          </Link>
          <Button size="lg" className="rounded-full w-full sm:w-auto shadow-lg shadow-primary/20">
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
