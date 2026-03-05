import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function BlendModeCursor() {
    const [isActive, setIsActive] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);

    // Mouse tracking values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs to trail the mouse
    const springX = useSpring(mouseX, { stiffness: 300, damping: 24, mass: 0.5 });
    const springY = useSpring(mouseY, { stiffness: 300, damping: 24, mass: 0.5 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        // Global listener to detect hover on specific elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // If the target has a specific class or tag, activate the cursor
            if (
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('cursor-hover-target')
            ) {
                setIsActive(true);
            } else {
                setIsActive(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY]);

    // Size base on hover state
    const size = isActive ? 120 : 24;
    const blur = isActive ? 6 : 0;

    // Transform values for centering the cursor
    const xOffset = useTransform(springX, (latest) => latest - size / 2);
    const yOffset = useTransform(springY, (latest) => latest - size / 2);

    return (
        <motion.div
            ref={cursorRef}
            className="fixed top-0 left-0 rounded-full mix-blend-difference pointer-events-none z-[100]"
            style={{
                x: xOffset,
                y: yOffset,
                width: size,
                height: size,
                backgroundColor: '#E7FF62',
                filter: `blur(${blur}px)`,
            }}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                width: size,
                height: size,
                filter: `blur(${blur}px)`
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                // specifically smooth out width/height/filter changes
                width: { duration: 0.3 },
                height: { duration: 0.3 },
                filter: { duration: 0.3 }
            }}
        />
    );
}
