import { motion, useScroll, useTransform } from "framer-motion";
import { ResultsData } from "./types";
import SymbolRenderer from "./SymbolRenderer";

export default function HeroSection({ data }: { data: ResultsData }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const scale = useTransform(scrollY, [0, 500], [1, 0.6]);
    const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    if (!data.page1_identity) return null;
    const overlayId = data.page1_identity.visual_concept?.overlay_id || "overlay_fire";

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background Symbol (Parallax) */}
            <motion.div style={{ y: y1, scale }} className="absolute inset-0 flex items-center justify-center z-0">
                <SymbolRenderer overlayId={overlayId} className="w-[90vw] h-[90vw] md:w-[40vw] md:h-[40vw]" />
            </motion.div>

            {/* Foreground Content */}
            <div className="relative z-10 text-center px-6 mt-[10vh]">
                <motion.p
                    className="text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase mb-4"
                    style={{ opacity: textOpacity }}
                >
                    BADA Analysis Complete
                </motion.p>
                <motion.h1
                    className="text-6xl md:text-9xl font-thin text-white mb-4 tracking-tighter"
                    style={{ opacity: textOpacity }}
                >
                    {data.userInput?.name || "User"}
                </motion.h1>
                <motion.h2
                    className="text-lg md:text-2xl text-white/80 font-light tracking-wide italic max-w-2xl mx-auto"
                    style={{ opacity: textOpacity }}
                >
                    "{data.page1_identity.sub_headline}"
                </motion.h2>
            </div>

            {/* Bottom Definition Card (Slides Up) */}
            <motion.div
                className="absolute bottom-12 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]`} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Core Identity</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-white mb-2">{data.page1_identity.title}</h3>
                <p className="text-sm md:text-base text-white/70 leading-relaxed font-light">{data.page1_identity.nature_snapshot.definition}</p>
            </motion.div>

            <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <span className="text-[10px] uppercase tracking-widest text-white">Scroll</span>
                <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
            </motion.div>
        </section>
    );
}
