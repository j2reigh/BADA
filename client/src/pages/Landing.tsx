import { Link } from "wouter";
import { Button } from "@/components/Button";
import { ArrowRight, Waves, Compass, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
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
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-lg mb-6">
          <Waves className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
          Discover Your <br />
          <span className="text-primary">Operating Pattern</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
          Understand how you respond to chaos, environment, and agency.
        </p>

        <div className="pt-8">
          <Link href="/survey">
            <Button size="lg" className="group text-lg px-12 h-16 rounded-full shadow-xl shadow-primary/20">
              Start Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm">
            <Activity className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">Threat Response</h3>
            <p className="text-sm text-muted-foreground">How you react when things get intense.</p>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm">
            <Waves className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">Environment</h3>
            <p className="text-sm text-muted-foreground">What kind of surroundings help you thrive.</p>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm">
            <Compass className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-bold mb-2">Agency</h3>
            <p className="text-sm text-muted-foreground">How you shape your own destiny.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
