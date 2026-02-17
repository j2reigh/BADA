import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronDown, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface UnlockSectionProps {
    reportId: string;
    email: string;
}

const PART_DESCRIPTIONS = [
    { part: "Part 2 — Your Nature", desc: "Your innate strengths, shadow side, and core drive" },
    { part: "Part 3 — Your Mind", desc: "How you process threats, environments, and decisions" },
    { part: "Part 4 — Your Friction", desc: "Where your career, relationships, and money patterns clash" },
    { part: "Part 5 — Your Guide", desc: "Daily rituals, environment tips, and your action protocol" },
];

const FAQ_ITEMS = [
    {
        q: "What do I actually get?",
        a: "Parts 2–5 of your report unlock immediately: your natural blueprint, cognitive axes, friction analysis, and a personalized daily protocol. It's a full operating manual — not a summary.",
    },
    {
        q: "How is this different from MBTI?",
        a: "MBTI gives you a type. BADA maps the patterns unique to you — why you burn out, how you make decisions, what you keep repeating. No two reports are the same.",
    },
    {
        q: "Is my data safe?",
        a: "Yes. We don't sell your data. Your birth info is used only to generate your report. You can request deletion anytime at badathebrand@gmail.com.",
    },
];

export default function UnlockSection({ reportId, email }: UnlockSectionProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);

    const checkoutUrl = `https://gumroad.com/l/bada-full-report?wanted=true&report_id=${reportId}&email=${encodeURIComponent(email || "")}`;

    const handleRedeemCode = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        setCodeError("");
        setIsRedeeming(true);

        try {
            const res = await fetch("/api/codes/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: trimmed, reportId }),
            });
            const data = await res.json();

            if (data.success) {
                queryClient.invalidateQueries({ queryKey: [`/api/results/${reportId}`] });
            } else {
                setCodeError(data.message || "Invalid code");
            }
        } catch {
            setCodeError("Network error. Please try again.");
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <section className="relative w-full py-16 px-6 md:px-20 z-20">
            <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
            >
                {/* A. Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-12 h-12 bg-[#233F64]/5 rounded-full flex items-center justify-center mb-5 text-[#233F64]">
                        <Lock className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-[#402525]">
                        What's in your full report
                    </h2>
                </div>

                {/* B. Part Descriptions */}
                <ul className="space-y-4 mb-10">
                    {PART_DESCRIPTIONS.map((item, i) => (
                        <li key={i} className="flex items-start gap-4 text-left">
                            <span className="text-[#879DC6] font-mono text-sm mt-0.5 shrink-0">0{i + 2}</span>
                            <div>
                                <span className="text-[#402525] font-medium text-sm">{item.part}</span>
                                <p className="text-[#402525]/60 text-sm font-light">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* C. Inline FAQ Accordion */}
                <div className="border-t border-[#402525]/10 mb-10">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="border-b border-[#402525]/10">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between py-4 text-left group"
                            >
                                <span className="text-sm font-medium text-[#402525] group-hover:text-[#233F64] transition-colors">
                                    {item.q}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-[#402525]/40 transition-transform duration-200 shrink-0 ml-4 ${
                                        openFaq === i ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            <AnimatePresence initial={false}>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-sm text-[#402525]/60 font-light leading-relaxed pb-4">
                                            {item.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* D. CTA Button */}
                <div className="flex flex-col items-center">
                    <Button
                        onClick={() => window.open(checkoutUrl, "_blank", "noopener")}
                        className="w-full max-w-sm bg-[#233F64] hover:bg-[#182339] text-white rounded-full py-6 text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                    >
                        Unlock Full Report
                    </Button>
                </div>

                {/* E. "or" divider + inline code input */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-[#E8E3E3]" />
                    <span className="text-xs text-[#402525]/40 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-[#E8E3E3]" />
                </div>

                <div className="max-w-sm mx-auto space-y-3">
                    <div className="flex gap-2">
                        <input
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase());
                                setCodeError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleRedeemCode()}
                            placeholder="Enter code"
                            maxLength={20}
                            className="flex-1 px-4 py-2.5 border border-[#E8E3E3] rounded-lg text-center font-mono text-sm uppercase tracking-wider text-[#402525] placeholder:text-[#402525]/30 focus:outline-none focus:border-[#233F64] transition-colors"
                        />
                        <Button
                            onClick={handleRedeemCode}
                            disabled={!code.trim() || isRedeeming}
                            className="bg-[#233F64] hover:bg-[#182339] text-white rounded-lg px-5 text-sm"
                        >
                            {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                        </Button>
                    </div>
                    {codeError && (
                        <p className="text-xs text-red-500 text-center">{codeError}</p>
                    )}
                </div>

                {/* F. FAQ link */}
                <div className="mt-8 text-center">
                    <a
                        href="/faq"
                        className="inline-flex items-center gap-1.5 text-sm text-[#233F64] hover:text-[#182339] transition-colors"
                    >
                        More questions?
                        <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
