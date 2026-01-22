import { motion } from "framer-motion";
import { ResultsData } from "./types";
import { Check, Sun, Moon, Clock, ArrowRight } from "lucide-react";

export default function ProtocolSection({ data }: { data: ResultsData }) {
    if (!data.page5_solution) return null;
    const sol = data.page5_solution;

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
        <section className="relative min-h-screen w-full bg-transparent py-32 px-6 md:px-20 z-30">
            <div className="max-w-5xl mx-auto space-y-32">
                {/* Header */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-6">Part 5. Your Guide</span>
                    <h2 className="text-5xl md:text-7xl font-thin mb-8 tracking-tighter text-white">{sol.protocol_name}</h2>
                    <p className="text-xl md:text-2xl text-white/60 font-light italic max-w-3xl mx-auto leading-relaxed">
                        "{sol.transformation_goal}"
                    </p>
                </motion.div>

                {/* Rituals Grid */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-white/50">Daily Rituals</h3>
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs text-white/40">Execution Mode</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {sol.daily_rituals?.map((ritual, i) => (
                            <motion.div
                                key={i}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <span className="text-sm font-bold">{i + 1}</span>
                                    </div>
                                    {i === 0 ? <Sun className="w-5 h-5 text-white/30" /> : i === 1 ? <Clock className="w-5 h-5 text-white/30" /> : <Moon className="w-5 h-5 text-white/30" />}
                                </div>

                                <h4 className="text-xl font-medium mb-3 text-white">{ritual.name}</h4>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-emerald-500/30" />
                                    {ritual.when}
                                </p>
                                <p className="text-sm text-white/60 leading-relaxed font-light">{ritual.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Environment Boost */}
                <motion.div
                    className="bg-[#0A1F1C] text-white p-10 md:p-16 rounded-[2rem] relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    {/* Background Element */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />

                    <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
                        <div className="md:col-span-2">
                            <span className="block text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 mb-6">Your Environment</span>
                            <h3 className="text-4xl font-light mb-2 capitalize">
                                {sol.environment_boost?.element_needed} Element
                            </h3>
                            <p className="text-emerald-100/50 text-sm font-mono">Restoring Balance...</p>
                        </div>

                        <div className="md:col-span-3">
                            <ul className="grid gap-6">
                                {sol.environment_boost?.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-4 text-lg text-emerald-50 font-light border-b border-emerald-500/20 pb-4 last:border-0 last:pb-0">
                                        <ArrowRight className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Closing Message - Rising to Surface */}
                <motion.div
                    className="bg-gradient-to-b from-[#E8F4F8] to-white text-gray-900 rounded-[2rem] p-12 md:p-16 text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="w-px h-12 bg-gradient-to-b from-[#4A7BA7] to-transparent mx-auto mb-8" />
                    <p className="text-2xl md:text-3xl text-gray-800 font-serif leading-relaxed italic">
                        "{sol.closing_message}"
                    </p>
                    <div className="mt-12 text-[10px] uppercase tracking-[0.25em] text-gray-400 space-y-2">
                        <p>BADA Report ID: {data.reportId.slice(0, 8)}</p>
                        <p>Analysis Valid Until: {expiredAtString}</p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
