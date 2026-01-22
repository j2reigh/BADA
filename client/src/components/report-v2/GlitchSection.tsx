import { motion } from "framer-motion";
import { ResultsData } from "./types";
import SymbolRenderer from "./SymbolRenderer";

export default function GlitchSection({ data }: { data: ResultsData }) {
    if (!data.page4_mismatch) return null;
    const mm = data.page4_mismatch;

    return (
        <section className="relative min-h-screen w-full bg-transparent py-24 px-6 md:px-20 z-20 overflow-hidden">
            {/* Background Noise/Interference */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />

            <div className="max-w-4xl mx-auto space-y-20 relative z-10">
                <div className="text-center">
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-rose-500 mb-4 animate-pulse">Part 4. Your Friction</span>
                    <h2 className="text-4xl md:text-5xl font-light text-white mb-6 relative inline-block">
                        <span className="absolute -left-1 top-0 text-red-500 opacity-50 mix-blend-screen animate-pulse" style={{ clipPath: 'inset(40% 0 60% 0)' }}>{mm.friction_title}</span>
                        {mm.friction_title}
                        <span className="absolute -right-1 top-0 text-blue-500 opacity-50 mix-blend-screen animate-pulse" style={{ clipPath: 'inset(10% 0 30% 0)' }}>{mm.friction_title}</span>
                    </h2>

                    {/* Center Glitched Symbol */}
                    <div className="h-64 flex items-center justify-center my-12">
                        <SymbolRenderer overlayId={data.page1_identity?.visual_concept?.overlay_id || 'overlay_fire'} isGlitch={true} className="w-56 h-56 opacity-90" />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Removed ERROR text as requested */}
                    <FrictionCard data={mm.career_friction} title="Career Signal" />
                    <FrictionCard data={mm.relationship_friction} title="Relationship Signal" />
                    <FrictionCard data={mm.money_friction} title="Resource Signal" className="md:col-span-2" />
                </div>
            </div>
        </section>
    )
}

function FrictionCard({ data, title, className }: { data: any, title: string, className?: string }) {
    if (!data) return null;
    return (
        <motion.div
            className={`bg-black/80 border border-white/10 p-8 rounded-xl relative overflow-hidden group hover:border-rose-500/30 transition-colors duration-500 ${className}`}
            whileHover={{ scale: 1.01 }}
        >
            {/* Scanline */}
            <div className="absolute top-0 left-0 w-full h-px bg-rose-500/50 group-hover:top-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(244,63,94,0.5)]" />

            <h3 className="text-rose-400/80 text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                {title}
            </h3>

            <h4 className="text-xl text-white font-medium mb-3">{data.title}</h4>
            <p className="text-gray-400 font-light leading-relaxed mb-8">{data.description}</p>

            <div className="bg-zinc-900 p-4 rounded-lg border-l-2 border-emerald-500">
                <span className="text-[10px] uppercase text-emerald-500 mb-1 block tracking-wider">Quick Tip</span>
                <p className="text-sm text-gray-300 font-mono">{data.quick_tip}</p>
            </div>
        </motion.div>
    )
}
