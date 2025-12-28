import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { ScoringResult } from "@/lib/scoring";
import { Shield, Home, Compass, RotateCcw, Share2 } from "lucide-react";

export default function Results() {
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("surveyResult");
    if (!stored) {
      setLocation("/");
      return;
    }
    setResult(JSON.parse(stored));
  }, [setLocation]);

  if (!result) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Your Operating Pattern</span>
            <h1 className="text-5xl md:text-7xl font-bold text-primary mt-2 mb-6">
              {result.typeName}
            </h1>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-primary/20 text-primary font-mono text-sm">
              Code: {result.typeKey}
            </div>
          </motion.div>
        </div>

        {/* Detailed Scores Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Threat Card */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
            <div className="p-4 bg-blue-50 rounded-full mb-6 group-hover:bg-blue-100 transition-colors">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Threat Response</h3>
            <p className="text-4xl font-mono font-bold text-blue-600 mb-2">{result.threatClarity === 1 ? "Focused" : "Fluid"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {result.threatScore}/3
            </p>
          </div>

          {/* Environment Card */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
            <div className="p-4 bg-teal-50 rounded-full mb-6 group-hover:bg-teal-100 transition-colors">
              <Home className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Environment</h3>
            <p className="text-4xl font-mono font-bold text-teal-600 mb-2">{result.environmentStable === 1 ? "Stable" : "Dynamic"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {result.environmentScore}/2
            </p>
          </div>

          {/* Agency Card */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-indigo-50/50 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-500" />
            <div className="p-4 bg-violet-50 rounded-full mb-6 group-hover:bg-violet-100 transition-colors">
              <Compass className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Agency</h3>
            <p className="text-4xl font-mono font-bold text-violet-600 mb-2">{result.agencyActive === 1 ? "Active" : "Passive"}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Score: {result.agencyScore}/3
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <Link href="/">
            <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
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
