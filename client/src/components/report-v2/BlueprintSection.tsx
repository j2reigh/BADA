import { motion } from "framer-motion";
import { ResultsData } from "./types";

export default function BlueprintSection({ data }: { data: ResultsData }) {
    if (!data.page2_hardware) return null;

    return (
        <section className="relative min-h-screen w-full bg-transparent py-24 px-6 md:px-20 z-20">
            <div className="max-w-4xl mx-auto space-y-32">

                {/* Part 1: Nature */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-emerald-500 mb-6">Part 2. Your Nature</span>
                    <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-12">
                        {data.page2_hardware.nature_title}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12 md:gap-20">
                        <div className="prose prose-invert prose-lg text-gray-400 font-light leading-relaxed">
                            <p className="whitespace-pre-wrap">{data.page2_hardware.nature_description}</p>
                        </div>

                        {/* Core Insights */}
                        <div className="space-y-8">
                            <h3 className="text-sm font-medium text-white uppercase tracking-widest border-b border-white/10 pb-4">Core Insights</h3>
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
                                        <span className="text-emerald-500/50 font-mono text-sm group-hover:text-emerald-400 transition-colors">0{i + 1}</span>
                                        <span className="text-gray-400 font-light leading-relaxed group-hover:text-gray-200 transition-colors">{insight}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Part 2: Shadow Side (Darker Container) */}
                <motion.div
                    className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-3xl p-8 md:p-16 relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Dynamic Glow */}
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-900/30 blur-[120px] rounded-full mix-blend-screen animate-pulse" />

                    <div className="relative z-10 max-w-2xl">
                        <span className="block text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-4">The Shadow Side</span>
                        <h3 className="text-2xl md:text-4xl font-light text-white mb-6">{data.page2_hardware.shadow_title}</h3>
                        <p className="text-gray-400 leading-relaxed text-lg font-light">{data.page2_hardware.shadow_description}</p>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
