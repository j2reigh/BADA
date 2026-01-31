import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

interface LockedBlurOverlayProps {
    partName: string;
    title: string;
    checkoutUrl?: string;
    reportId?: string;
    onUnlock?: () => void;
}

export default function LockedBlurOverlay({ partName, title, checkoutUrl, reportId, onUnlock }: LockedBlurOverlayProps) {
    const [showModal, setShowModal] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleUnlockClick = () => {
        if (onUnlock) {
            onUnlock();
            return;
        }
        setShowModal(true);
        setShowCodeInput(false);
        setCode("");
        setCodeError("");
    };

    const handleRedeemCode = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed || !reportId) return;

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
                setShowModal(false);
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
        <div className="relative w-full overflow-hidden rounded-3xl mt-8">
            {/* 1. Blurred Backdrop */}
            <div className="absolute inset-0 bg-[#402525]/5 blur-sm select-none pointer-events-none" aria-hidden="true">
                <div className="p-8 md:p-16 space-y-8 opacity-50">
                    <div className="h-8 w-1/3 bg-[#402525]/10 rounded mb-12" />
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="h-4 w-full bg-[#402525]/10 rounded" />
                            <div className="h-4 w-5/6 bg-[#402525]/10 rounded" />
                            <div className="h-4 w-4/6 bg-[#402525]/10 rounded" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-20 w-full bg-[#233F64]/5 rounded-xl border border-[#233F64]/10" />
                            <div className="h-20 w-full bg-[#233F64]/5 rounded-xl border border-[#233F64]/10" />
                        </div>
                    </div>
                    <div className="space-y-3 mt-12">
                        <div className="h-4 w-full bg-[#402525]/10 rounded" />
                        <div className="h-4 w-full bg-[#402525]/10 rounded" />
                        <div className="h-4 w-2/3 bg-[#402525]/10 rounded" />
                    </div>
                </div>
            </div>

            {/* 2. Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10" />

            {/* 3. Lock Card */}
            <div className="relative z-20 py-32 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-md border border-[#233F64]/10 p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full"
                >
                    <div className="w-12 h-12 bg-[#233F64]/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#233F64]">
                        <Lock className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#233F64] mb-3 block">
                        {partName} Locked
                    </span>

                    <h3 className="text-2xl font-light text-[#402525] mb-6">
                        {title}
                    </h3>

                    <p className="text-sm text-[#402525]/60 mb-8 leading-relaxed">
                        Detailed analysis, specific strategies, and your personalized rituals are available in the full report.
                    </p>

                    <Button
                        onClick={handleUnlockClick}
                        className="w-full bg-[#233F64] hover:bg-[#182339] text-white rounded-full py-6 text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                    >
                        Unlock Full Analysis
                    </Button>
                </motion.div>
            </div>

            {/* 4. Unlock Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-[#402525]/40 hover:text-[#402525] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-medium text-[#402525] mb-6 text-center">
                                Unlock Full Report
                            </h3>

                            {/* Purchase button — opens Gumroad in new tab so report page stays */}
                            {checkoutUrl && (
                                <Button
                                    onClick={() => window.open(checkoutUrl, '_blank', 'noopener')}
                                    className="w-full bg-[#233F64] hover:bg-[#182339] text-white rounded-full py-5 text-xs uppercase tracking-widest mb-6"
                                >
                                    Purchase Full Report
                                </Button>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-[#E8E3E3]" />
                                <span className="text-xs text-[#402525]/40 uppercase tracking-wider">or</span>
                                <div className="flex-1 h-px bg-[#E8E3E3]" />
                            </div>

                            {/* Code section */}
                            {!showCodeInput ? (
                                <button
                                    onClick={() => setShowCodeInput(true)}
                                    className="w-full flex items-center justify-center gap-2 text-sm text-[#233F64] hover:text-[#182339] transition-colors py-2"
                                >
                                    <Ticket className="w-4 h-4" />
                                    <span>Have a code?</span>
                                </button>
                            ) : (
                                <div className="space-y-3">
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
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
