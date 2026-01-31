import { motion } from "framer-motion";
import { ResultsData } from "./types";
import { Sun, Moon, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import ScrollRevealText from "../ui/ScrollRevealText";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// Element Radar Chart Component
function ElementRadarChart({ elementCounts, birthTimeUnknown }: {
    elementCounts: { wood: number; fire: number; earth: number; metal: number; water: number };
    birthTimeUnknown?: boolean;
}) {
    const maxPossible = birthTimeUnknown ? 6 : 8;

    const radarData = [
        { element: 'Wood', count: elementCounts.wood, fullMark: maxPossible },
        { element: 'Fire', count: elementCounts.fire, fullMark: maxPossible },
        { element: 'Earth', count: elementCounts.earth, fullMark: maxPossible },
        { element: 'Metal', count: elementCounts.metal, fullMark: maxPossible },
        { element: 'Water', count: elementCounts.water, fullMark: maxPossible },
    ];

    const missingElements = radarData.filter(d => d.count === 0).map(d => d.element);
    const excessElements = radarData.filter(d => d.count >= 3).map(d => d.element);

    // Custom tick to show element name + count
    const renderPolarAngleAxis = (props: any) => {
        const { payload, x, y, cx, cy } = props;
        const item = radarData.find(d => d.element === payload.value);
        const count = item?.count ?? 0;
        const isMissing = count === 0;
        const isExcess = count >= 3;

        // Offset labels outward from center
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offsetX = dist > 0 ? x + (dx / dist) * 16 : x;
        const offsetY = dist > 0 ? y + (dy / dist) * 16 : y;

        return (
            <g>
                <text
                    x={offsetX}
                    y={offsetY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs"
                    fill={isMissing ? '#c44' : isExcess ? '#233F64' : '#402525'}
                    fontWeight={isMissing || isExcess ? 600 : 400}
                    opacity={isMissing ? 1 : 0.7}
                >
                    {payload.value} {count}
                    {isMissing && ' ⚠'}
                </text>
            </g>
        );
    };

    return (
        <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="rgba(64, 37, 37, 0.1)" />
                        <PolarAngleAxis dataKey="element" tick={renderPolarAngleAxis} />
                        <PolarRadiusAxis domain={[0, maxPossible]} tick={false} axisLine={false} />
                        <Radar
                            name="Elements"
                            dataKey="count"
                            stroke="#233F64"
                            fill="url(#radarGradient)"
                            fillOpacity={0.4}
                            strokeWidth={2}
                        />
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ABBBD5" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#233F64" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Missing/Excess Summary */}
            <div className="mt-4 space-y-2 text-center">
                {missingElements.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#c44]">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Missing: {missingElements.join(', ')}</span>
                    </div>
                )}
                {excessElements.length > 0 && (
                    <div className="text-sm text-[#233F64]/70">
                        Excess: {excessElements.join(', ')}
                    </div>
                )}
                {birthTimeUnknown && (
                    <div className="text-[10px] text-[#402525]/40 uppercase tracking-wider">
                        Based on 6 positions (birth time unknown)
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function ProtocolSection({ data }: { data: ResultsData }) {
    if (!data.page5_solution) return null;
    const sol = data.page5_solution;
    const isLocked = sol.locked;

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

    // Element data for radar chart
    const elementCounts = sajuData?.elementCounts;
    const birthTimeUnknown = sajuData?.birthTimeUnknown;

    return (
        <section className="relative w-full py-12 px-6 md:px-20 z-30">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <motion.div
                    className="text-center flex flex-col items-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-6">Part 5. Your Guide</span>
                    <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-tighter text-[#402525]">{sol.protocol_name}</h2>

                    {/* One-Liner Anchor (Always Visible) */}
                    {sol.protocol_anchor && (
                        <div className="mb-8 max-w-2xl">
                            <ScrollRevealText
                                text={sol.protocol_anchor}
                                className="text-2xl md:text-3xl font-medium text-[#233F64] justify-center"
                            />
                        </div>
                    )}

                    {!isLocked && (
                        <p className="text-lg md:text-xl text-[#402525]/60 font-light max-w-3xl mx-auto leading-relaxed">
                            {sol.transformation_goal}
                        </p>
                    )}
                </motion.div>

                {/* Skeleton hint when locked */}
                {isLocked && (
                    <div className="relative overflow-hidden rounded-2xl" aria-hidden="true">
                        <div className="grid md:grid-cols-3 gap-6 select-none pointer-events-none">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-[#ABBBD5]/12 border border-[#879DC6]/20 p-6 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-8 h-8 bg-[#233F64]/12 rounded-lg" />
                                        <div className="w-4 h-4 bg-[#879DC6]/15 rounded" />
                                    </div>
                                    <div className="h-5 w-3/4 bg-[#402525]/12 rounded" />
                                    <div className="h-3 w-1/2 bg-[#402525]/8 rounded" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-full bg-[#402525]/8 rounded" />
                                        <div className="h-3 w-5/6 bg-[#402525]/6 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
                    </div>
                )}

                {!isLocked && (
                    <>
                        {/* Rituals Grid */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-[#402525]/10 pb-4">
                                <h3 className="text-sm font-medium uppercase tracking-widest text-[#402525]/50">Daily Rituals</h3>
                                <div className="h-px bg-[#402525]/10 flex-1" />
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {sol.daily_rituals?.map((ritual, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-[#ABBBD5]/10 p-8 rounded-2xl border border-[#879DC6]/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-10 h-10 bg-[#233F64] rounded-lg flex items-center justify-center text-white group-hover:bg-[#182339] transition-colors">
                                                <span className="text-sm font-bold">{i + 1}</span>
                                            </div>
                                            {i === 0 ? <Sun className="w-5 h-5 text-[#879DC6]" /> : i === 1 ? <Clock className="w-5 h-5 text-[#879DC6]" /> : <Moon className="w-5 h-5 text-[#879DC6]" />}
                                        </div>

                                        <h4 className="text-xl font-medium mb-3 text-[#402525]">{ritual.name}</h4>
                                        <p className="text-[10px] text-[#402525]/40 uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <span className="w-1 h-3 bg-[#233F64]/30 inline-block" />
                                            {ritual.when}
                                        </p>
                                        <p className="text-sm text-[#402525]/70 leading-relaxed font-light">{ritual.description}</p>

                                        {/* Anti-Pattern Warning */}
                                        {ritual.anti_pattern && (
                                            <div className="mt-6 pt-4 border-t border-[#402525]/10">
                                                <p className="text-xs text-[#402525]/50 leading-relaxed">
                                                    <span className="font-medium text-[#402525]/70">⚠ If you skip this:</span>{' '}
                                                    {ritual.anti_pattern}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Element Radar Chart + Environment Boost */}
                        <motion.div
                            className="bg-[#233F64]/5 border border-[#233F64]/10 p-10 md:p-16 rounded-[2rem] relative overflow-hidden"
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative z-10">
                                {/* Title Row */}
                                <div className="mb-10">
                                    <span className="block text-[10px] uppercase tracking-[0.2em] text-[#233F64] mb-6">Your Environment</span>
                                    <h3 className="text-3xl font-light text-[#402525] mb-2 capitalize">
                                        {sol.environment_boost?.element_needed} Element
                                    </h3>
                                </div>

                                {/* Radar Chart + Tips Grid */}
                                <div className="grid md:grid-cols-2 gap-12 items-start">
                                    {/* Radar Chart */}
                                    {elementCounts && (
                                        <ElementRadarChart
                                            elementCounts={elementCounts}
                                            birthTimeUnknown={birthTimeUnknown}
                                        />
                                    )}

                                    {/* Tips */}
                                    <div>
                                        <ul className="grid gap-5">
                                            {sol.environment_boost?.tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-4 text-base text-[#402525]/80 font-light border-b border-[#233F64]/20 pb-4 last:border-0 last:pb-0">
                                                    <ArrowRight className="w-5 h-5 text-[#233F64] mt-0.5 shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Closing Message */}
                        <motion.div
                            className="text-center max-w-3xl mx-auto py-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="w-px h-12 bg-gradient-to-b from-[#879DC6] to-transparent mx-auto mb-8" />
                            <p className="text-xl md:text-2xl text-[#402525] leading-relaxed">
                                {sol.closing_message}
                            </p>
                            <div className="mt-12 text-[10px] uppercase tracking-[0.25em] text-[#402525]/40 space-y-2">
                                <p>BADA Report ID: {data.reportId.slice(0, 8)}</p>
                                <p>Analysis Valid Until: {expiredAtString}</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    )
}
