import React, { useState } from "react";
import { motion } from "framer-motion";
import { ResultsData, ChangeTargetType, ChangeTargetOption } from "./types";
import ActionCardModal from "./ActionCardModal";
import { AlertTriangle, Cpu, Zap, Briefcase, Heart, DollarSign } from "lucide-react";

interface ActionItemData {
  title: string;
  problemSummary: string; // v12: Context
  actionName: string;
  actionDescription: string;
  category: "os" | "friction";
}

export default function ChangeCardSection({ data }: { data: ResultsData }) {
  const [selectedTarget, setSelectedTarget] = useState<ChangeTargetType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const os = data.page3_os;
  const mismatch = data.page4_mismatch;
  const solution = data.page5_solution;

  // Skip if required data is missing or locked
  if (!os || !mismatch || !solution || os.locked || mismatch.locked || solution.locked) {
    return null;
  }

  // Helper to extract first sentence for summary
  const getSummary = (text?: string) => {
    if (!text) return "";
    const match = text.match(/.*?[.!?]/);
    return match ? match[0] : text.slice(0, 60) + "...";
  };

  // Build options dynamically from data
  const osOptions: ChangeTargetOption[] = [
    {
      type: "alarm",
      label: os.threat_axis?.level || "Alarm Mode",
      summary: getSummary(os.threat_axis?.description),
      category: "os"
    },
    {
      type: "processing",
      label: os.environment_axis?.level || "Processing Mode",
      summary: getSummary(os.environment_axis?.description),
      category: "os"
    },
    {
      type: "drive",
      label: os.agency_axis?.level || "Drive Mode",
      summary: getSummary(os.agency_axis?.description),
      category: "os"
    },
  ];

  const frictionOptions: ChangeTargetOption[] = [
    {
      type: "work",
      label: "At Work",
      summary: getSummary(mismatch.career_friction?.description),
      category: "friction"
    },
    {
      type: "relationship",
      label: "In Relationships",
      summary: getSummary(mismatch.relationship_friction?.description),
      category: "friction"
    },
    {
      type: "money",
      label: "With Money",
      summary: getSummary(mismatch.money_friction?.description),
      category: "friction"
    },
  ];

  // Map selection to action item data
  const getActionItemData = (target: ChangeTargetType): ActionItemData | null => {
    const rituals = solution.daily_rituals || [];

    switch (target) {
      case "alarm":
        return rituals[0] ? {
          title: os.threat_axis?.level || "Alarm Mode",
          problemSummary: getSummary(os.threat_axis?.description),
          actionName: rituals[0].name,
          actionDescription: rituals[0].description,
          category: "os",
        } : null;

      case "processing":
        return rituals[1] ? {
          title: os.environment_axis?.level || "Processing Mode",
          problemSummary: getSummary(os.environment_axis?.description),
          actionName: rituals[1].name,
          actionDescription: rituals[1].description,
          category: "os",
        } : null;

      case "drive":
        return rituals[2] ? {
          title: os.agency_axis?.level || "Drive Mode",
          problemSummary: getSummary(os.agency_axis?.description),
          actionName: rituals[2].name,
          actionDescription: rituals[2].description,
          category: "os",
        } : null;

      case "work":
        return mismatch.career_friction ? {
          title: "At Work",
          problemSummary: getSummary(mismatch.career_friction.description),
          actionName: mismatch.career_friction.title, // Use title as action name for friction
          actionDescription: mismatch.career_friction.quick_tip,
          category: "friction",
        } : null;

      case "relationship":
        return mismatch.relationship_friction ? {
          title: "In Relationships",
          problemSummary: getSummary(mismatch.relationship_friction.description),
          actionName: mismatch.relationship_friction.title,
          actionDescription: mismatch.relationship_friction.quick_tip,
          category: "friction",
        } : null;

      case "money":
        return mismatch.money_friction ? {
          title: "With Money",
          problemSummary: getSummary(mismatch.money_friction.description),
          actionName: mismatch.money_friction.title,
          actionDescription: mismatch.money_friction.quick_tip,
          category: "friction",
        } : null;

      default:
        return null;
    }
  };

  const handleCardClick = (target: ChangeTargetType) => {
    setSelectedTarget(target);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTarget(null);
  };

  const getIcon = (type: ChangeTargetType) => {
    switch (type) {
      case "alarm": return <AlertTriangle className="w-5 h-5" />;
      case "processing": return <Cpu className="w-5 h-5" />;
      case "drive": return <Zap className="w-5 h-5" />;
      case "work": return <Briefcase className="w-5 h-5" />;
      case "relationship": return <Heart className="w-5 h-5" />;
      case "money": return <DollarSign className="w-5 h-5" />;
    }
  };

  const selectedActionData = selectedTarget ? getActionItemData(selectedTarget) : null;

  return (
    <section className="relative w-full py-24 px-6 md:px-20 z-30 bg-gradient-to-b from-white to-[#ABBBD5]/10">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="block text-[10px] uppercase tracking-[0.3em] text-[#233F64] mb-6">
            Part 6. Your Next Step
          </span>
          <h2 className="text-3xl md:text-5xl font-light mb-4 tracking-tighter text-[#402525]">
            What would you like to change?
          </h2>
          <p className="text-[#402525]/60 font-light max-w-xl mx-auto">
            Choose one area to focus on. We'll give you a simple action to start with.
          </p>
        </motion.div>

        {/* OS Options */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-[#233F64]/70">
              Your Operating System
            </h3>
            <div className="h-px bg-[#233F64]/20 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {osOptions.map((option, i) => (
              <motion.button
                key={option.type}
                onClick={() => handleCardClick(option.type)}
                className="group relative bg-white border border-[#233F64]/20 rounded-xl p-6 text-left hover:border-[#233F64] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#233F64]/10 rounded-lg flex items-center justify-center text-[#233F64] group-hover:bg-[#233F64] group-hover:text-white transition-colors shrink-0">
                    {getIcon(option.type)}
                  </div>
                  <span className="text-lg font-medium text-[#402525] group-hover:text-[#233F64] transition-colors leading-tight">
                    {option.label}
                  </span>
                </div>
                {option.summary && (
                  <p className="text-xs text-[#402525]/60 line-clamp-2 mt-auto pt-2 border-t border-[#402525]/5 group-hover:border-[#233F64]/10 transition-colors">
                    {option.summary}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Friction Options */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-[#402525]/70">
              Where You Get Stuck
            </h3>
            <div className="h-px bg-[#402525]/20 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {frictionOptions.map((option, i) => (
              <motion.button
                key={option.type}
                onClick={() => handleCardClick(option.type)}
                className="group relative bg-white border border-[#402525]/20 rounded-xl p-6 text-left hover:border-[#402525] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#402525]/10 rounded-lg flex items-center justify-center text-[#402525] group-hover:bg-[#402525] group-hover:text-white transition-colors shrink-0">
                    {getIcon(option.type)}
                  </div>
                  <span className="text-lg font-medium text-[#402525] transition-colors leading-tight">
                    {option.label}
                  </span>
                </div>
                {option.summary && (
                  <p className="text-xs text-[#402525]/60 line-clamp-2 mt-auto pt-2 border-t border-[#402525]/5 group-hover:border-[#402525]/10 transition-colors">
                    {option.summary}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        </div>

      </div>

      {/* Action Card Modal */}
      {selectedActionData && (
        <ActionCardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedActionData.title}
          problemSummary={selectedActionData.problemSummary}
          actionName={selectedActionData.actionName}
          actionDescription={selectedActionData.actionDescription}
          category={selectedActionData.category}
        />
      )}
    </section>
  );
}
