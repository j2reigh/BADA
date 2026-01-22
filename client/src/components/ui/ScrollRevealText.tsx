import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface ScrollRevealTextProps {
    text: string;
    className?: string; // For font sizing, margins, colors
    wordClassName?: string; // For specific word styling if different
}

export default function ScrollRevealText({ text, className = "", wordClassName = "" }: ScrollRevealTextProps) {
    const container = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start 0.9", "start 0.25"]
    });

    const words = text.split(" ");

    return (
        <p
            ref={container}
            className={`flex flex-wrap leading-tight ${className}`}
        >
            {words.map((word, i) => {
                const start = i / words.length;
                const end = start + (1 / words.length);
                return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]} className={wordClassName}>
                        {word}
                    </Word>
                );
            })}
        </p>
    );
}

interface WordProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
    className?: string;
}

const Word = ({ children, progress, range, className }: WordProps) => {
    const opacity = useTransform(progress, range, [0, 1]);
    return (
        <span className={`relative mr-[0.3em] mt-[0.2em] ${className}`}>
            {/* Shadow Layer (Always visible, low opacity) */}
            <span className="absolute opacity-[0.1] select-none">{children}</span>

            {/* Reveal Layer (Animates opacity) */}
            <motion.span style={{ opacity }}>
                {children}
            </motion.span>
        </span>
    );
};
