import { motion } from "framer-motion";
import { ResultsData } from "./types";
import ScrollRevealText from "../ui/ScrollRevealText";

import LockedBlurOverlay from "./LockedBlurOverlay";

export default function BlueprintSection({ data }: { data: ResultsData }) {
    if (!data.page2_hardware) return null;
    const isLocked = data.page2_hardware.locked;

    return (
        <section className="relative w-full py-12 px-6 md:px-20 z-20">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Part 2: Your Nature */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-6">Part 2. Your Nature</span>
                    <h2 className="text-3xl md:text-5xl font-light text-[#402525] leading-tight mb-8">
                        {data.page2_hardware.nature_title}
                    </h2>

                    {/* One-Liner Anchor (Always Visible) */}
                    {data.page2_hardware.core_drive && (
                        <div className="mb-12">
                            <ScrollRevealText
                                text={data.page2_hardware.core_drive}
                                className="text-xl md:text-2xl font-normal text-[#233F64]/90"
                            />
                        </div>
                    )}

                    {isLocked ? (
                        <LockedBlurOverlay
                            partName="Part 2"
                            title="Unlock Your Natural Blueprint"
                            reportId={data.reportId}
                            checkoutUrl={`https://gumroad.com/l/bada-full-report?wanted=true&report_id=${data.reportId}&email=${encodeURIComponent(data.email || "")}`}
                        />
                    ) : (
                        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                            <div className="text-[#402525]/80 font-light leading-relaxed text-lg">
                                <p className="whitespace-pre-wrap">{data.page2_hardware.nature_description}</p>
                            </div>

                            {/* Core Insights */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-medium text-[#233F64] uppercase tracking-widest border-b border-[#402525]/10 pb-4">Core Insights</h3>
                                <ul className="space-y-6">
                                    {data.page2_hardware.core_insights?.map((insight, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex gap-6 group"
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.2 }}
                                            viewport={{ once: true }}
                                        >
                                            <span className="text-[#879DC6] font-mono text-sm group-hover:text-[#233F64] transition-colors">0{i + 1}</span>
                                            <span className="text-[#402525]/70 font-light leading-relaxed group-hover:text-[#402525] transition-colors">{insight}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Shadow Side (Only if NOT locked) */}
                {!isLocked && (
                    <motion.div
                        className="bg-[#402525]/5 border border-[#402525]/10 rounded-3xl p-8 md:p-16 relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative z-10 max-w-2xl">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-[#402525] mb-4">The Shadow Side</span>
                            <h3 className="text-2xl md:text-4xl font-light text-[#402525] mb-6">{data.page2_hardware.shadow_title}</h3>
                            <p className="text-[#402525]/70 leading-relaxed text-lg font-light">{data.page2_hardware.shadow_description}</p>
                        </div>
                    </motion.div>
                )}

            </div>
        </section>
    )
}
