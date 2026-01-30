import { motion } from "framer-motion";

export const OVERLAY_EMOJIS: Record<string, string> = {
    overlay_fire: "🔥",
    overlay_water: "💧",
    overlay_wood: "🌳",
    overlay_metal: "⚔️",
    overlay_earth: "🏔️",
};

interface SymbolRendererProps {
    overlayId: string;
    className?: string; // Tailwind classes for sizing
    isGlitch?: boolean;
}

export default function SymbolRenderer({ overlayId, className = "", isGlitch = false }: SymbolRendererProps) {
    const emoji = OVERLAY_EMOJIS[overlayId] || OVERLAY_EMOJIS.overlay_fire;

    return (
        <span className={`${className} inline-block select-none`} role="img" aria-label="Identity Symbol">
            {emoji}
        </span>
    );
}
