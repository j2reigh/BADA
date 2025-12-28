import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Sparkles, ArrowLeft, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center space-y-8 z-10"
      >
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your <span className="text-primary">Assessment</span> is Complete!
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
            Thank you for completing the BADA assessment and providing your birth pattern information.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm p-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">What's Next?</h2>
          </div>
          
          <p className="text-muted-foreground">
            We're preparing your personalized BADA report and payment processing. This includes:
          </p>
          
          <ul className="text-left space-y-3 text-muted-foreground">
            <li className="flex gap-3 items-start">
              <span className="text-primary font-bold">•</span>
              <span>Your detailed Operating Pattern analysis</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-primary font-bold">•</span>
              <span>Personalized insights based on your birth pattern</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-primary font-bold">•</span>
              <span>Actionable recommendations for your unique type</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-primary font-bold">•</span>
              <span>Secure payment portal for report access</span>
            </li>
          </ul>
        </div>

        <div className="pt-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Check your email for updates. You'll receive your report link shortly.
          </p>
          
          <Link href="/">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
