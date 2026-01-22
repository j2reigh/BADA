import { motion } from "framer-motion";
import { ResultsData } from "./types";

export default function DiagnosticsSection({ data }: { data: ResultsData }) {
    if (!data.page3_os) return null;
    const os = data.page3_os;

    return (
        <section className="relative min-h-screen w-full bg-transparent py-24 px-6 md:px-20 border-t border-white/5 z-20 overflow-hidden">
            {/* Schematic Grid Background - Ocean Blue tint */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(rgba(74,123,167,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,123,167,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

            {/* Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/50 via-transparent to-[#0A1628]/50 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mb-20 text-center md:text-left"
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-4">Part 3. Your Mind</span>
                    <h2 className="text-3xl md:text-6xl font-thin text-white tracking-tight">{os.os_title}</h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    <AxisHUD axis={os.threat_axis} color="rose" index={0} />
                    <AxisHUD axis={os.environment_axis} color="emerald" index={1} />
                    <AxisHUD axis={os.agency_axis} color="blue" index={2} />
                </div>

                {/* OS Summary */}
                <motion.div
                    className="mt-24 max-w-3xl border-l-2 border-cyan-500/30 pl-8 py-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-lg md:text-xl text-gray-400 font-light italic leading-relaxed">"{os.os_summary}"</p>
                </motion.div>
            </div>
        </section>
    );
}

function AxisHUD({ axis, color, index }: { axis: any, color: string, index: number }) {
    if (!axis) return null;

    const colors = {
        rose: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
        emerald: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
        blue: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
    };

    return (
        <motion.div
            className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl relative group hover:border-white/20 transition-all duration-500 hover:bg-zinc-900/80"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{axis.title}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${colors[color as keyof typeof colors]}`} />
            </div>

            <h3 className="text-3xl text-white font-light tracking-tight mb-6">{axis.level}</h3>

            {/* Removed Progress Bar & Level Analysis Text as requested */}

            <p className="text-sm text-gray-400 font-light leading-relaxed group-hover:text-gray-300 transition-colors">
                {axis.description}
            </p>
        </motion.div>
    )
}
