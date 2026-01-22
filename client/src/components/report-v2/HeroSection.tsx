import { motion, useScroll, useTransform } from "framer-motion";
import { ResultsData } from "./types";
import SymbolRenderer from "./SymbolRenderer";

export default function HeroSection({ data }: { data: ResultsData }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const scale = useTransform(scrollY, [0, 500], [1, 0.6]);
    const textOpacity = useTransform(scrollY, [0, 200], [1, 0]); // Fade out faster

    if (!data.page1_identity) return null;
    const overlayId = data.page1_identity.visual_concept?.overlay_id || "overlay_fire";
    const identity = data.page1_identity;

    return (
        <section className="relative h-screen w-full flex flex-col items-center overflow-hidden">
            {/* Background Symbol (Parallax) */}
            <motion.div style={{ y: y1, scale }} className="absolute inset-0 flex items-center justify-center z-0">
                <SymbolRenderer overlayId={overlayId} className="w-[90vw] h-[90vw] md:w-[40vw] md:h-[40vw]" />
            </motion.div>

            {/* Foreground Content - Adjusted for Mobile to be Top-aligned */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-32 md:justify-center md:pt-0 pointer-events-none">
                <motion.div className="text-center px-6" style={{ opacity: textOpacity }}>
                    <p className="text-xs md:text-sm text-white/50 tracking-[0.3em] uppercase mb-4">
                        Analysis Complete
                    </p>
                    <h1 className="text-5xl md:text-9xl font-thin text-white mb-4 tracking-tighter">
                        {data.userInput?.name || "User"}
                    </h1>
                    <h2 className="text-lg md:text-xl text-white/70 font-light tracking-wide italic max-w-2xl mx-auto">
                        "{identity.sub_headline}"
                    </h2>
                </motion.div>
            </div>

            {/* Bottom Content Grid (Slides Up) */}
            <motion.div
                className="absolute bottom-0 w-full bg-gradient-to-t from-[#0A1628] via-[#0A1628]/95 to-transparent pt-24 pb-12 px-6 z-20"
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16">
                    {/* Act I: The Core Identity */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold">Part 1. Who You Are</span>
                        </div>
                        <h3 className="text-xl text-white font-light">{identity.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                            {identity.nature_snapshot.explanation || identity.nature_snapshot.definition}
                        </p>
                    </div>

                    {/* Act I: Operating System */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold">Current State</span>
                            </div>
                            {identity.efficiency_snapshot.level_name && (
                                <span className="text-[9px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider">
                                    {identity.efficiency_snapshot.level_name}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl text-white font-light">{identity.efficiency_snapshot.metaphor ? "Finding Balance" : "Your Flow"}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                            {identity.efficiency_snapshot.metaphor || identity.efficiency_snapshot.label}
                        </p>
                    </div>
                </div>

                <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-30 hidden md:block" // Hide scroll indicator on mobile to save space
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-px h-6 bg-white" />
                </motion.div>
            </motion.div>
        </section>
    );
}
