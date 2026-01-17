import { motion } from "framer-motion";

export const OVERLAY_IMAGES: Record<string, string> = {
    overlay_fire: "/overlays/overlay_fire_1768551210595.png",
    overlay_water: "/overlays/overlay_water_1768551230367.png",
    overlay_wood: "/overlays/overlay_wood_1768551247466.png",
    overlay_metal: "/overlays/overlay_metal_1768551265004.png",
    overlay_earth: "/overlays/overlay_earth_1768551282633.png",
};

interface SymbolRendererProps {
    overlayId: string;
    className?: string; // Tailwind classes for sizing
    isGlitch?: boolean;
}

export default function SymbolRenderer({ overlayId, className = "w-64 h-64", isGlitch = false }: SymbolRendererProps) {
    const imagePath = OVERLAY_IMAGES[overlayId] || OVERLAY_IMAGES.overlay_water;

    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 bg-white/20 blur-[60px] rounded-full"
                animate={isGlitch ? { opacity: [0.2, 0.5, 0.2] } : { scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* The Symbol Image */}
            <motion.img
                src={imagePath}
                alt="Element Symbol"
                className="relative z-10 w-full h-full object-contain"
                animate={
                    isGlitch
                        ? { x: [0, -5, 5, -2, 2, 0], filter: ["contrast(1) hue-rotate(0deg)", "contrast(2) hue-rotate(90deg)", "contrast(1) hue-rotate(0deg)"] }
                        : { y: [0, -15, 0], rotate: [0, 5, -5, 0] }
                }
                transition={
                    isGlitch
                        ? { duration: 0.2, repeat: Infinity, repeatType: "mirror" }
                        : { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }
            />
        </div>
    );
}
