import { motion } from "framer-motion";
import { ResultsData } from "./types";
import { Check, Sun, Moon, Clock, ArrowRight } from "lucide-react";

export default function ProtocolSection({ data }: { data: ResultsData }) {
    if (!data.page5_solution) return null;
    const sol = data.page5_solution;

    return (
        <section className="relative min-h-screen w-full bg-white text-gray-900 py-32 px-6 md:px-20 z-30">
            <div className="max-w-5xl mx-auto space-y-32">
                {/* Header */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-emerald-600 mb-6">Act V : System Protocol</span>
                    <h2 className="text-5xl md:text-7xl font-thin mb-8 tracking-tighter text-gray-900">{sol.protocol_name}</h2>
                    <p className="text-xl md:text-2xl text-gray-500 font-light italic max-w-3xl mx-auto leading-relaxed">
                        "{sol.transformation_goal}"
                    </p>
                </motion.div>

                {/* Rituals Grid */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-gray-400">Daily Rituals</h3>
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-xs text-gray-400">Execution Mode</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {sol.daily_rituals?.map((ritual, i) => (
                            <motion.div
                                key={i}
                                className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <span className="text-sm font-bold">{i + 1}</span>
                                    </div>
                                    {i === 0 ? <Sun className="w-5 h-5 text-gray-300" /> : i === 1 ? <Clock className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-300" />}
                                </div>

                                <h4 className="text-xl font-medium mb-3 text-gray-900">{ritual.name}</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-emerald-500/30" />
                                    {ritual.when}
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed font-light">{ritual.description}</p>
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
                            <span className="block text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 mb-6">Environment Optimization</span>
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

                {/* Closing Message */}
                <div className="text-center max-w-3xl mx-auto pt-16">
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-auto mb-8" />
                    <p className="text-2xl md:text-3xl text-gray-800 font-serif leading-relaxed italic">
                        "{sol.closing_message}"
                    </p>
                    <div className="mt-12 text-[10px] uppercase tracking-[0.4em] text-gray-400">
                        BADA Blueprint ID: {data.reportId.slice(0, 8)}
                    </div>
                </div>
            </div>
        </section>
    )
}
