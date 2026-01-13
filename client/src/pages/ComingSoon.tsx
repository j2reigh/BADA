import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Sparkles, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center space-y-6 z-10"
      >
        <div className="inline-flex items-center justify-center p-3 bg-card border border-border mb-4">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
            Your <span className="text-primary">Assessment</span> is Complete!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for completing the BADA assessment and providing your birth pattern information.
          </p>
        </div>

        <div className="bg-card border border-border p-6 space-y-4 text-left">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold text-foreground">What's Next?</h2>
          </div>
          
          <p className="text-muted-foreground text-sm">
            We're preparing your personalized BADA report. This includes:
          </p>
          
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex gap-2 items-start">
              <span className="text-accent font-bold">•</span>
              <span>Your detailed Operating Pattern analysis</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-accent font-bold">•</span>
              <span>Personalized insights based on your birth pattern</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-accent font-bold">•</span>
              <span>Actionable recommendations for your unique type</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Check your email for updates. You'll receive your report link shortly.
          </p>
          
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
