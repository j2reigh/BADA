import { Link } from "wouter";
import { Button } from "@/components/Button";
import { ArrowRight, Zap, Layout, Compass } from "lucide-react";
import { motion } from "framer-motion";
import logoSvg from "@assets/logo.svg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8 z-10"
      >
        <div className="inline-flex items-center justify-center mb-6">
          <img src={logoSvg} alt="BADA" className="h-8" />
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
          Discover Your <br />
          <span className="text-primary">Operating Pattern</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Understand how you respond to chaos, environment, and agency.
        </p>

        <div className="pt-6">
          <Link href="/survey">
            <Button size="lg" className="group text-base px-10 h-14 shadow-lg shadow-primary/20" data-testid="button-start">
              Start Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
          <div className="p-5 bg-card border border-border hover-elevate">
            <Zap className="w-6 h-6 text-accent mb-3" />
            <h3 className="text-base font-semibold mb-1">Threat Response</h3>
            <p className="text-sm text-muted-foreground">How you react when things get intense.</p>
          </div>
          <div className="p-5 bg-card border border-border hover-elevate">
            <Layout className="w-6 h-6 text-accent mb-3" />
            <h3 className="text-base font-semibold mb-1">Environment</h3>
            <p className="text-sm text-muted-foreground">What kind of surroundings help you thrive.</p>
          </div>
          <div className="p-5 bg-card border border-border hover-elevate">
            <Compass className="w-6 h-6 text-accent mb-3" />
            <h3 className="text-base font-semibold mb-1">Agency</h3>
            <p className="text-sm text-muted-foreground">How you shape your own destiny.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
