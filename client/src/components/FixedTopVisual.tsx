import { OVERLAY_EMOJIS } from "./report-v2/SymbolRenderer";

interface FixedTopVisualProps {
  elementOverlay: string;
  title: string;
}

// 오행별 그라디언트 오버레이 색상
const ELEMENT_GRADIENTS: Record<string, string> = {
  overlay_wood: "from-emerald-900/60 via-teal-800/40 to-transparent",
  overlay_fire: "from-rose-900/60 via-orange-800/40 to-transparent",
  overlay_earth: "from-amber-900/60 via-yellow-800/40 to-transparent",
  overlay_metal: "from-slate-900/60 via-gray-800/40 to-transparent",
  overlay_water: "from-blue-900/60 via-indigo-800/40 to-transparent",
};

export default function FixedTopVisual({ elementOverlay, title, userName }: FixedTopVisualProps & { userName: string }) {
  const emoji = OVERLAY_EMOJIS[elementOverlay] || "🔥";
  const gradientClass = ELEMENT_GRADIENTS[elementOverlay] || ELEMENT_GRADIENTS.overlay_water;

  return (
    <div className="md:hidden fixed top-0 left-0 w-full h-[28vh] z-10 overflow-hidden">
      {/* 배경 Emoji Ambient */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span style={{ fontSize: "50vw", filter: "blur(40px)", opacity: 0.4, transform: "translateY(-10%)" }}>
          {emoji}
        </span>
      </div>

      {/* 하단 그라디언트 (텍스트 가독성) */}
      <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass}`} />

      {/* 텍스처 오버레이 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* 제목 영역 (Instagram-ready) */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-6 text-center">
        <h1 className="text-2xl font-bold text-white drop-shadow-2xl mb-2 leading-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-white/50" />
          <span className="text-[10px] text-white/90 font-medium tracking-[0.2em] uppercase truncate max-w-[200px]">
            {userName}'s Blueprint
          </span>
          <div className="h-px w-8 bg-white/50" />
        </div>
      </div>

      {/* 하단 곡선 (콘텐츠와 자연스럽게 연결) */}
      <div className="absolute -bottom-1 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
