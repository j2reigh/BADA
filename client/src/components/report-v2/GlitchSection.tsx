import { motion } from "framer-motion";
import { ResultsData } from "./types";
import SymbolRenderer from "./SymbolRenderer";
import ScrollRevealText from "../ui/ScrollRevealText";

import LockedBlurOverlay from "./LockedBlurOverlay";

export default function GlitchSection({ data }: { data: ResultsData }) {
    if (!data.page4_mismatch) return null;
    const mm = data.page4_mismatch;
    const isLocked = mm.locked;

    return (
        <section className="relative w-full py-24 px-6 md:px-20 z-20 overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-16 relative z-10">
                <div className="text-center flex flex-col items-center">
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-[#402525] mb-4">Part 4. Your Friction</span>
                    <h2 className="text-3xl md:text-5xl font-light text-[#402525] mb-6">
                        {mm.friction_title}
                    </h2>

                    {/* One-Liner Anchor (Always Visible) */}
                    {mm.friction_anchor && (
                        <div className="mb-8 max-w-2xl">
                            <ScrollRevealText
                                text={mm.friction_anchor}
                                className="text-xl md:text-2xl font-normal text-[#233F64]/90 justify-center"
                            />
                        </div>
                    )}

                    {isLocked ? (
                        <div className="w-full">
                            <LockedBlurOverlay
                                partName="Part 4"
                                title="Unlock Your Friction Analysis"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Center Symbol */}
                            <div className="h-48 flex items-center justify-center my-8 opacity-20">
                                <SymbolRenderer overlayId={data.page1_identity?.visual_concept?.overlay_id || 'overlay_fire'} className="w-40 h-40" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 md:gap-8 w-full">
                                <FrictionCard data={mm.career_friction} title="Career Signal" />
                                <FrictionCard data={mm.relationship_friction} title="Relationship Signal" />
                                <FrictionCard data={mm.money_friction} title="Resource Signal" className="md:col-span-2" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

function FrictionCard({ data, title, className }: { data: any, title: string, className?: string }) {
    if (!data) return null;
    return (
        <motion.div
            className={`bg-[#402525]/5 border border-[#402525]/10 p-8 rounded-2xl relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}
            whileHover={{ scale: 1.01 }}
        >
            <h3 className="text-[#402525] text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#402525] rounded-full" />
                {title}
            </h3>

            <h4 className="text-xl text-[#402525] font-medium mb-3">{data.title}</h4>
            <p className="text-[#402525]/70 font-light leading-relaxed mb-8">{data.description}</p>

            <div className="bg-[#233F64]/5 p-4 rounded-lg border-l-2 border-[#233F64]">
                <span className="text-[10px] uppercase text-[#233F64] mb-1 block tracking-wider">Quick Tip</span>
                <p className="text-sm text-[#402525]/80">{data.quick_tip}</p>
            </div>
        </motion.div>
    )
}
