import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockedBlurOverlayProps {
    partName: string; // e.g., "Part 2"
    title: string;    // e.g., "Unlock Your Nature"
    onUnlock?: () => void;
}

export default function LockedBlurOverlay({ partName, title, onUnlock }: LockedBlurOverlayProps) {
    const handleUnlock = () => {
        if (onUnlock) {
            onUnlock();
        } else {
            // Default behavior: Scroll to pricing or open payment modal
            // Ideally, this should trigger the same flow as the main CTA
            const pricingSection = document.getElementById("pricing");
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: "smooth" });
            } else {
                console.warn("Pricing section not found");
            }
        }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-3xl mt-8">
            {/* 1. Blurred Backdrop (Fake Content Skeleton) */}
            <div className="absolute inset-0 bg-[#402525]/5 blur-sm select-none pointer-events-none" aria-hidden="true">
                <div className="p-8 md:p-16 space-y-8 opacity-50">
                    {/* Fake Header */}
                    <div className="h-8 w-1/3 bg-[#402525]/10 rounded mb-12" />

                    {/* Fake Grid */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-[#402525]/10 rounded" />
                            <div className="h-4 w-5/6 bg-[#402525]/10 rounded" />
                            <div className="h-4 w-4/6 bg-[#402525]/10 rounded" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-20 w-full bg-[#233F64]/5 rounded-xl border border-[#233F64]/10" />
                            <div className="h-20 w-full bg-[#233F64]/5 rounded-xl border border-[#233F64]/10" />
                        </div>
                    </div>

                    {/* Fake Paragraph */}
                    <div className="space-y-3 mt-12">
                        <div className="h-4 w-full bg-[#402525]/10 rounded" />
                        <div className="h-4 w-full bg-[#402525]/10 rounded" />
                        <div className="h-4 w-2/3 bg-[#402525]/10 rounded" />
                    </div>
                </div>
            </div>

            {/* 2. Gradient Fade Overlay (Top to Bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10" />

            {/* 3. Lock Card (Centered) */}
            <div className="relative z-20 py-32 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-md border border-[#233F64]/10 p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full"
                >
                    <div className="w-12 h-12 bg-[#233F64]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#233F64]">
                        <Lock className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#233F64] mb-3 block">
                        {partName} Locked
                    </span>

                    <h3 className="text-2xl font-light text-[#402525] mb-6">
                        {title}
                    </h3>

                    <p className="text-sm text-[#402525]/60 mb-8 leading-relaxed">
                        Detailed analysis, specific strategies, and your personalized rituals are available in the full report.
                    </p>

                    <Button
                        onClick={handleUnlock}
                        className="w-full bg-[#233F64] hover:bg-[#182339] text-white rounded-full py-6 text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                    >
                        Unlock Full Analysis
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
