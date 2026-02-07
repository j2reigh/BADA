import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X } from "lucide-react";

interface TimePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (time: string | null, unknown: boolean) => void;
    initialTime?: string;
    initialUnknown?: boolean;
    t: (key: string) => string;
}

export default function TimePickerModal({
    isOpen,
    onClose,
    onSelect,
    initialTime = "",
    initialUnknown = false,
    t,
}: TimePickerModalProps) {
    const [hour, setHour] = useState<number | "">(initialTime ? parseInt(initialTime.split(":")[0]) : "");
    const [minute, setMinute] = useState<number | "">(initialTime ? parseInt(initialTime.split(":")[1]) : "");

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialTime && !initialUnknown) {
                const [h, m] = initialTime.split(":");
                setHour(parseInt(h));
                setMinute(parseInt(m));
            } else {
                setHour("");
                setMinute("");
            }
        }
    }, [isOpen, initialTime, initialUnknown]);

    const handleConfirm = () => {
        if (hour !== "" && minute !== "") {
            const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            onSelect(timeStr, false);
        }
        onClose();
    };

    const handleUnknown = () => {
        onSelect(null, true);
        onClose();
    };

    const isValid = hour !== "" && minute !== "";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#182339] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white/80" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    {t('birth.time.modal.title') || "What time were you born?"}
                                </h3>
                                <p className="text-sm text-white/50">
                                    {t('birth.time.modal.subtitle') || "This helps improve accuracy"}
                                </p>
                            </div>
                        </div>

                        {/* Time Picker */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {/* Hour */}
                            <div className="flex flex-col items-center">
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-2">
                                    {t('birth.time.hour') || "Hour"}
                                </label>
                                <select
                                    value={hour}
                                    onChange={(e) => setHour(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    className="w-20 h-14 bg-white/5 border border-white/20 rounded-xl text-center text-2xl text-white font-mono focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#182339] text-white/50">--</option>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i} className="bg-[#182339] text-white">
                                            {String(i).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <span className="text-3xl text-white/60 font-light mt-6">:</span>

                            {/* Minute */}
                            <div className="flex flex-col items-center">
                                <label className="text-xs text-white/40 uppercase tracking-wider mb-2">
                                    {t('birth.time.minute') || "Min"}
                                </label>
                                <select
                                    value={minute}
                                    onChange={(e) => setMinute(e.target.value === "" ? "" : parseInt(e.target.value))}
                                    className="w-20 h-14 bg-white/5 border border-white/20 rounded-xl text-center text-2xl text-white font-mono focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#182339] text-white/50">--</option>
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i} className="bg-[#182339] text-white">
                                            {String(i).padStart(2, "0")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirm}
                            disabled={!isValid}
                            className="w-full bg-white text-[#182339] font-semibold py-4 rounded-full hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-3"
                        >
                            {t('birth.time.confirm') || "Confirm"}
                        </button>

                        {/* Don't Know Button */}
                        <button
                            onClick={handleUnknown}
                            className="w-full py-3 text-white/60 hover:text-white text-sm transition-colors"
                        >
                            {t('birth.time_unknown') || "I don't know my exact birth time"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
