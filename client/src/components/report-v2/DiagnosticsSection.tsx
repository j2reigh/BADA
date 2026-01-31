import { motion } from "framer-motion";
import { ResultsData } from "./types";
import ScrollRevealText from "../ui/ScrollRevealText";

export default function DiagnosticsSection({ data }: { data: ResultsData }) {
    if (!data.page3_os) return null;
    const os = data.page3_os;
    const isLocked = os.locked;

    return (
        <section className="relative w-full py-12 px-6 md:px-20 border-t border-[#402525]/10 z-20 overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mb-8 text-center md:text-left"
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-4">Part 3. Your Mind</span>
                    <h2 className="text-3xl md:text-5xl font-light text-[#402525] tracking-tight">{os.os_title}</h2>

                    {/* One-Liner Anchor (Always Visible) */}
                    {os.os_anchor && (
                        <div className="mt-8 max-w-3xl">
                            <ScrollRevealText
                                text={os.os_anchor}
                                className="text-xl md:text-2xl font-normal text-[#233F64]/90 justify-center md:justify-start"
                            />
                        </div>
                    )}
                </motion.div>

                {/* Skeleton hint when locked */}
                {isLocked && (
                    <div className="relative overflow-hidden rounded-2xl" aria-hidden="true">
                        <div className="grid md:grid-cols-3 gap-6 select-none pointer-events-none">
                            {[
                                { bg: "bg-[#402525]/8", border: "border-[#402525]/15", dot: "bg-[#402525]/25" },
                                { bg: "bg-[#233F64]/8", border: "border-[#233F64]/15", dot: "bg-[#233F64]/25" },
                                { bg: "bg-[#879DC6]/12", border: "border-[#879DC6]/25", dot: "bg-[#879DC6]/30" },
                            ].map((s, i) => (
                                <div key={i} className={`${s.bg} ${s.border} border p-6 rounded-2xl space-y-4`}>
                                    <div className="flex justify-between">
                                        <div className="h-3 w-20 bg-[#402525]/10 rounded" />
                                        <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    </div>
                                    <div className="h-5 w-2/3 bg-[#402525]/12 rounded" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-[#402525]/8 rounded" />
                                        <div className="h-3 w-4/5 bg-[#402525]/6 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
                    </div>
                )}

                {!isLocked && (
                    <>
                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            <AxisHUD axis={os.threat_axis} color="rose" index={0} />
                            <AxisHUD axis={os.environment_axis} color="emerald" index={1} />
                            <AxisHUD axis={os.agency_axis} color="blue" index={2} />
                        </div>

                        {/* Summary */}
                        <motion.div
                            className="mt-20 max-w-3xl border-l-2 border-[#233F64]/30 pl-8 py-2"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <p className="text-lg md:text-xl text-[#402525]/70 font-light italic leading-relaxed">"{os.os_summary}"</p>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
}

function AxisHUD({ axis, color, index }: { axis: any, color: string, index: number }) {
    if (!axis) return null;

    const colorStyles = {
        rose: { dot: "bg-[#402525]", bg: "bg-[#402525]/5", border: "border-[#402525]/10" },
        emerald: { dot: "bg-[#233F64]", bg: "bg-[#233F64]/5", border: "border-[#233F64]/10" },
        blue: { dot: "bg-[#879DC6]", bg: "bg-[#ABBBD5]/20", border: "border-[#879DC6]/30" }
    };

    const style = colorStyles[color as keyof typeof colorStyles];

    return (
        <motion.div
            className={`${style.bg} ${style.border} border p-8 rounded-2xl relative group hover:shadow-lg transition-all duration-300`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#402525]/50">{axis.title}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            </div>

            <h3 className="text-2xl text-[#402525] font-medium tracking-tight mb-6">{axis.level}</h3>

            <p className="text-sm text-[#402525]/70 font-light leading-relaxed">
                {axis.description}
            </p>
        </motion.div>
    )
}
