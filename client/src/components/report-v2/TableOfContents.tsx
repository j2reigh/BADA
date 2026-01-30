import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const sections = [
    { id: "part1", label: "Part 1. Your Essence" },
    { id: "part2", label: "Part 2. Your Nature" },
    { id: "part3", label: "Part 3. Your Mind" },
    { id: "part4", label: "Part 4. Your Friction" },
    { id: "part5", label: "Part 5. Your Guide" },
];

export default function TableOfContents() {
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -60% 0px", // Trigger when section is near top/middle
                threshold: 0,
            }
        );

        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-50">
            {sections.map(({ id, label }) => {
                const isActive = activeSection === id;

                return (
                    <div
                        key={id}
                        className="group flex items-center justify-end gap-3 cursor-pointer relative py-1"
                        onClick={() => scrollToSection(id)}
                    >
                        {/* Label (Slide out on hover) */}
                        <span
                            className={`
                text-xs font-medium tracking-wide transition-all duration-300
                ${isActive ? "text-[#402525] opacity-100 translate-x-0" : "text-[#402525]/40 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}
              `}
                        >
                            {label}
                        </span>

                        {/* Bar Indicator */}
                        <motion.div
                            className={`h-[2px] rounded-full transition-all duration-300 ${isActive ? "bg-[#402525]" : "bg-[#402525]/20 group-hover:bg-[#402525]/50"}`}
                            initial={false}
                            animate={{
                                width: isActive ? 24 : 12, // Active: Long, Inactive: Short
                                opacity: 1,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
