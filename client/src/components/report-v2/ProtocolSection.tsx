import { motion } from "framer-motion";
import { ResultsData } from "./types";
import { Check, Sun, Moon, Clock, ArrowRight } from "lucide-react";
import ScrollRevealText from "../ui/ScrollRevealText";

import LockedBlurOverlay from "./LockedBlurOverlay";

export default function ProtocolSection({ data }: { data: ResultsData }) {
    if (!data.page5_solution) return null;
    const sol = data.page5_solution;
    const isLocked = sol.locked;

    // Calculate Expiration Date
    // Prefer the calculated validity from backend (v2.3+), fallback to 1 year for legacy
    const sajuData = data.sajuData as any;
    const validityDate = sajuData?.operatingAnalysis?.validity?.validUntil;

    let expiredAtString = "";
    if (validityDate) {
        expiredAtString = new Date(validityDate).toLocaleDateString();
    } else {
        // Fallback to 1 Year from creation
        const createdAt = new Date(data.createdAt);
        const expiredAt = new Date(createdAt);
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);
        expiredAtString = expiredAt.toLocaleDateString();
    }

    return (
        <section className="relative w-full py-12 px-6 md:px-20 z-30">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <motion.div
                    className="text-center flex flex-col items-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-6">Part 5. Your Guide</span>
                    <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-tighter text-[#402525]">{sol.protocol_name}</h2>

                    {/* One-Liner Anchor (Always Visible) */}
                    {sol.protocol_anchor && (
                        <div className="mb-8 max-w-2xl">
                            <ScrollRevealText
                                text={sol.protocol_anchor}
                                className="text-2xl md:text-3xl font-medium text-[#233F64] justify-center"
                            />
                        </div>
                    )}

                    {!isLocked && (
                        <p className="text-lg md:text-xl text-[#402525]/60 font-light italic max-w-3xl mx-auto leading-relaxed">
                            "{sol.transformation_goal}"
                        </p>
                    )}
                </motion.div>

                {isLocked ? (
                    <LockedBlurOverlay
                        partName="Part 5"
                        title="Unlock Your Action Protocol"
                    />
                ) : (
                    <>
                        {/* Rituals Grid */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-[#402525]/10 pb-4">
                                <h3 className="text-sm font-medium uppercase tracking-widest text-[#402525]/50">Daily Rituals</h3>
                                <div className="h-px bg-[#402525]/10 flex-1" />
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {sol.daily_rituals?.map((ritual, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-[#ABBBD5]/10 p-8 rounded-2xl border border-[#879DC6]/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-10 h-10 bg-[#233F64] rounded-lg flex items-center justify-center text-white group-hover:bg-[#182339] transition-colors">
                                                <span className="text-sm font-bold">{i + 1}</span>
                                            </div>
                                            {i === 0 ? <Sun className="w-5 h-5 text-[#879DC6]" /> : i === 1 ? <Clock className="w-5 h-5 text-[#879DC6]" /> : <Moon className="w-5 h-5 text-[#879DC6]" />}
                                        </div>

                                        <h4 className="text-xl font-medium mb-3 text-[#402525]">{ritual.name}</h4>
                                        <p className="text-[10px] text-[#402525]/40 uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <div className="w-1 h-3 bg-[#233F64]/30" />
                                            {ritual.when}
                                        </p>
                                        <p className="text-sm text-[#402525]/70 leading-relaxed font-light">{ritual.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Environment Boost */}
                        <motion.div
                            className="bg-[#233F64]/5 border border-[#233F64]/10 p-10 md:p-16 rounded-[2rem] relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
                                <div className="md:col-span-2">
                                    <span className="block text-[10px] uppercase tracking-[0.2em] text-[#233F64] mb-6">Your Environment</span>
                                    <h3 className="text-3xl font-light text-[#402525] mb-2 capitalize">
                                        {sol.environment_boost?.element_needed} Element
                                    </h3>
                                    <p className="text-[#233F64]/50 text-sm">Restoring Balance...</p>
                                </div>

                                <div className="md:col-span-3">
                                    <ul className="grid gap-6">
                                        {sol.environment_boost?.tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-4 text-lg text-[#402525]/80 font-light border-b border-[#233F64]/20 pb-4 last:border-0 last:pb-0">
                                                <ArrowRight className="w-5 h-5 text-[#233F64] mt-1 shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Closing Message */}
                        <motion.div
                            className="text-center max-w-3xl mx-auto py-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="w-px h-12 bg-gradient-to-b from-[#879DC6] to-transparent mx-auto mb-8" />
                            <p className="text-2xl md:text-3xl text-[#402525] font-serif leading-relaxed italic">
                                "{sol.closing_message}"
                            </p>
                            <div className="mt-12 text-[10px] uppercase tracking-[0.25em] text-[#402525]/40 space-y-2">
                                <p>BADA Report ID: {data.reportId.slice(0, 8)}</p>
                                <p>Analysis Valid Until: {expiredAtString}</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    )
}
