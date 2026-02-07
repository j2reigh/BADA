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
        <section className="relative min-h-screen w-full flex flex-col items-center overflow-hidden py-20">
            <motion.div className="text-center px-6" style={{ opacity: textOpacity }}>
                <p className="text-xs md:text-sm text-[#879DC6] tracking-[0.3em] uppercase mb-4">
                    Analysis Complete
                </p>
                <div className="text-6xl mb-6">
                    <SymbolRenderer overlayId={overlayId} className="w-auto h-auto" />
                </div>
                <h1 className="text-5xl md:text-8xl font-thin text-[#402525] mb-4 tracking-tighter">
                    {data.userInput?.name || "User"}
                </h1>
                <h2 className="text-lg md:text-xl text-[#402525]/70 font-light tracking-wide italic max-w-2xl mx-auto">
                    "{identity.sub_headline}"
                </h2>

                {identity.one_line_diagnosis && (
                    <p className="mt-6 text-sm md:text-base text-[#233F64]/70 font-light max-w-xl mx-auto tracking-wide">
                        {identity.one_line_diagnosis}
                    </p>
                )}
            </motion.div>


            {/* Bottom Content Grid */}
            <motion.div
                className="w-full max-w-5xl mx-auto mt-20 px-6 z-20"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Part 1: Who You Are */}
                    <div className="relative group overflow-hidden bg-white/40 backdrop-blur-md border border-[#233F64]/10 p-8 md:p-10 rounded-[2rem] hover:shadow-xl transition-all duration-500 hover:border-[#233F64]/20">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <SymbolRenderer overlayId={overlayId} className="w-24 h-24" />
                        </div>

                        <div className="relative z-10">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-6">Part 1. Your Essence</span>
                            <h3 className="text-2xl md:text-3xl text-[#402525] font-light mb-4">{identity.title}</h3>
                            <p className="text-sm md:text-base text-[#402525]/70 leading-relaxed font-light">
                                {identity.nature_snapshot.definition}
                            </p>
                            <div className="w-12 h-px bg-[#233F64]/20 my-6" />
                            <p className="text-sm text-[#402525]/60 italic">
                                "{identity.nature_snapshot.explanation}"
                            </p>
                        </div>
                    </div>

                    {/* Current State */}
                    <div className="relative group overflow-hidden bg-[#233F64]/5 backdrop-blur-md border border-[#233F64]/10 p-8 md:p-10 rounded-[2rem] hover:shadow-xl transition-all duration-500 hover:bg-[#233F64]/10">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64]">Operating Efficiency</span>
                                {identity.efficiency_snapshot.level_name && (
                                    <span className="text-[10px] bg-[#233F64] text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Level {identity.efficiency_snapshot.level || "?"}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl md:text-3xl text-[#402525] font-light mb-2">
                                {identity.efficiency_snapshot.label}
                            </h3>
                            <p className="text-lg text-[#233F64] font-serif italic mb-6">
                                "{identity.efficiency_snapshot.metaphor}"
                            </p>

                            <p className="text-sm text-[#402525]/70 leading-relaxed font-light">
                                Current System Check: <strong className="font-medium text-[#402525]">{identity.efficiency_snapshot.level_name}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section >
    );
}
