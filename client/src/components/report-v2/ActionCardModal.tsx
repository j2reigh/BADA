import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ArrowDown } from "lucide-react";
import { captureAndDownloadImage } from "@/lib/imageExport";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ActionCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  problemSummary?: string; // v12: Context
  actionName: string;
  actionDescription: string;
  category: "os" | "friction";
}

export default function ActionCardModal({
  isOpen,
  onClose,
  title,
  problemSummary,
  actionName,
  actionDescription,
  category,
}: ActionCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsSaving(true);
    try {
      const filename = `BADA_Action_${title.replace(/\s+/g, "_")}`;
      await captureAndDownloadImage(cardRef.current, filename);
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const bgGradient = category === "os"
    ? "from-[#233F64] via-[#2D4A6F] to-[#182339]"
    : "from-[#402525] via-[#4A2D2D] to-[#321C1C]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-fit mx-auto cursor-auto overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Action Card: {title}</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col items-center gap-6">
          {/* Action Card Content - Capture Target - 9:16 Aspect Ratio */}
          <div
            ref={cardRef}
            className={`relative bg-gradient-to-br ${bgGradient} text-white overflow-hidden shadow-2xl flex flex-col`}
            style={{
              width: "360px",
              height: "640px",
              borderRadius: "24px"
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 border border-white/20 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[0.5px] border-white/5 rounded-[20px] scale-90" />
              <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 border border-white/10 rounded-full bg-white/5 blur-3xl" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-6">

              {/* TOP: Context (Problem) */}
              <div className="flex-none flex flex-col justify-center pt-2 mb-4">
                <div className="mb-1 opacity-60 text-[10px] uppercase tracking-[0.2em] font-medium">Current State</div>
                <h3 className="text-2xl font-light tracking-tight mb-3 leading-snug">
                  {title}
                </h3>
                {problemSummary && (
                  <p className="text-white/80 text-xs font-light leading-relaxed border-l-2 border-white/20 pl-4 py-1 line-clamp-4">
                    "{problemSummary}"
                  </p>
                )}
              </div>

              {/* MIDDLE: Connection */}
              <div className="py-2 flex items-center justify-center opacity-50 shrink-0">
                <div className="h-px bg-white/30 w-12" />
                <div className="mx-3">
                  <ArrowDown className="w-3 h-3" />
                </div>
                <div className="h-px bg-white/30 w-12" />
              </div>

              {/* BOTTOM: Action (Solution) */}
              <div className="flex-1 flex flex-col justify-center min-h-0 mt-2">
                <div className="flex items-start gap-3 mb-2 shrink-0">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg shrink-0 backdrop-blur-sm">
                    💡
                  </div>
                  <div>
                    <div className="mb-0.5 opacity-60 text-[10px] uppercase tracking-[0.2em] font-medium">Next Step</div>
                    <h4 className="text-lg font-medium leading-tight text-white/95">
                      {actionName}
                    </h4>
                  </div>
                </div>

                {/* Action Description Box - Hug Content instad of Flex Grow */}
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 mt-1 flex flex-col justify-start">
                  <p className="text-white/90 text-xs leading-relaxed whitespace-pre-wrap">
                    {actionDescription}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 flex justify-between items-end border-t border-white/10 shrink-0">
                <div className="text-[9px] opacity-40 uppercase tracking-widest">
                  Calibration Loop
                </div>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-80">
                  BADA
                </span>
              </div>
            </div>
          </div>

          {/* Save Button (Outside Card) */}
          <Button
            onClick={handleSaveImage}
            disabled={isSaving}
            className="bg-white text-[#233F64] hover:bg-white/90 rounded-full px-8 py-6 h-auto cursor-pointer shadow-xl transition-transform hover:scale-105"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm font-bold uppercase tracking-widest">
              {isSaving ? "Saving..." : "Save Card"}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
