import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { OVERLAY_EMOJIS } from "./report-v2/SymbolRenderer";

interface ParallaxBackgroundProps {
  elementOverlay: string;
}

// 오행별 그라디언트 오버레이 색상
const ELEMENT_GRADIENTS: Record<string, string> = {
  overlay_wood: "from-emerald-600/30 via-teal-500/20 to-cyan-400/10",
  overlay_fire: "from-rose-600/30 via-orange-500/20 to-amber-400/10",
  overlay_earth: "from-amber-600/30 via-yellow-500/20 to-orange-400/10",
  overlay_metal: "from-slate-600/30 via-gray-500/20 to-zinc-400/10",
  overlay_water: "from-blue-600/30 via-indigo-500/20 to-purple-400/10",
};

export default function ParallaxBackground({ elementOverlay }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // 스크롤에 따라 이미지가 위아래로 움직임 (더 큰 범위)
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.15, 1.1]);

  const emoji = OVERLAY_EMOJIS[elementOverlay] || "🔥";
  const gradientClass = ELEMENT_GRADIENTS[elementOverlay] || ELEMENT_GRADIENTS.overlay_water;

  return (
    <div
      ref={containerRef}
      className="hidden md:block fixed right-0 top-0 w-[40%] h-screen overflow-hidden"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      {/* 배경 Emoji Ambient */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none"
      >
        <span style={{ fontSize: "30vw", filter: "blur(60px)", opacity: 0.3 }}>
          {emoji}
        </span>
      </motion.div>

      {/* 오행별 그라디언트 오버레이 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />

      {/* 상단 페이드 (콘텐츠와 자연스럽게 연결) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />

      {/* 하단 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent" />

      {/* 텍스처 오버레이 (Pinterest 감성) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
