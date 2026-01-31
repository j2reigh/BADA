import { motion } from "framer-motion";
import { ResultsData } from "./types";
import ScrollRevealText from "../ui/ScrollRevealText";

import LockedBlurOverlay from "./LockedBlurOverlay";

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

                {isLocked ? (
                    <LockedBlurOverlay
                        partName="Part 3"
                        title="Unlock Your Operating System"
                        reportId={data.reportId}
                        checkoutUrl={`https://gumroad.com/l/bada-full-report?wanted=true&report_id=${data.reportId}&email=${encodeURIComponent(data.email || "")}`}
                    />
                ) : (
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
