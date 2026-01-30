
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { ResultsData } from "@/components/report-v2/types";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

// V2 Sections
import HeroSection from "@/components/report-v2/HeroSection";
import BlueprintSection from "@/components/report-v2/BlueprintSection";
import DiagnosticsSection from "@/components/report-v2/DiagnosticsSection";
import GlitchSection from "@/components/report-v2/GlitchSection";
import ProtocolSection from "@/components/report-v2/ProtocolSection";
import ChangeCardSection from "@/components/report-v2/ChangeCardSection";

// Hardcoded problematic data
const DEBUG_DATA: ResultsData = {
    "reportId": "5cb72fc2-761f-41ae-bd33-afab39baaf8a",
    "email": "ibwrhaspati@yahoo.com",
    "userInput": {
        "name": "ayas",
        "surveyScores": {
            "typeKey": "T1-E0-A0",
            "typeName": "Silent Sentinel"
        }
    },
    "sajuData": {
        "note": "Birth time simulated for Day Master extraction",
        "stats": {
            "operatingRate": 45
        },
        "operatingAnalysis": {
            "validity": {
                "validUntil": "2026-02-01T06:50:29.131Z"
            }
        }
    },
    "isPaid": true,
    "createdAt": "2026-01-18T06:41:14.130Z",
    "page1_identity": {
        "title": "The Inner Hearth",
        "sub_headline": "A gentle glow awaits its moment to illuminate the world.",
        "brain_snapshot": {
            "title": "Your Current Mind State",
            "definition": "A garden plot, resting and absorbing nutrients after a long season.",
            "explanation": "Your mind is rebuilding its foundations. Energy levels are low but steadily rising, allowing for gentle shifts in focus and new paths."
        },
        "visual_concept": {
            "overlay_id": "overlay_fire",
            "background_id": "bg_type_08"
        },
        "nature_snapshot": {
            "title": "Your Birth Pattern",
            "definition": "A steadfast, warm hearth in a cozy, hidden valley.",
            "explanation": "Like the hearth, you offer warmth and comfort, attracting others. Your concentrated focus can ignite, yet too much output risks burning low."
        },
        "efficiency_snapshot": {
            "label": "Current Operating State",
            "level": 2,
            "metaphor": "A quiet river, finding its calm flow after a turbulent period, gathering strength for its journey ahead.",
            "level_name": "Recovery"
        }
    },
    "page2_hardware": {
        "section_name": "Your Natural Blueprint",
        "locked": false,
        "nature_title": "The Steadfast Glow of Your Inner Hearth",
        "core_drive": {
            "one_liner": "You are a steady flame that warms the room.",
            "description": "Like a fireplace in winter, you provide consistent warmth. You don't burn wildly, but your presence is felt."
        }
    },
    "page3_os": {
        "section_name": "Your Current Operating System",
        "locked": false,
        "os_title": "Your Silent Sentinel",
        "threat_axis": {
            "level": "Alarm Mode",
            "description": "You are constantly scanning for threats. This hyper-vigilance drains your battery faster than any physical activity."
        },
        "environment_axis": {
            "level": "Processing Mode",
            "description": "You absorb every detail of your environment. This deep processing leads to innovation but risks system overload."
        },
        "agency_axis": {
            "level": "Drive Mode",
            "description": "Your engine is revving high to prove your worth. You are pushing hard, often ignoring your steady nature."
        }
    },
    "page4_mismatch": {
        "section_name": "The Core Tension",
        "locked": false,
        "friction_title": "When Your Inner Fire Meets Life's Winds",
        "career_friction": {
            "title": "Burnout at Work",
            "description": "You are trying to be a wildfire in a corporate structure that needs a steady stove. The mismatch causes constant exhaustion.",
            "quick_tip": "Take 5 minute breaks every hour."
        },
        "relationship_friction": {
            "title": "Misunderstanding in Love",
            "description": "Your partner expects a roaring mood, but you offer a steady glow. They mistake your calmness for indifference.",
            "quick_tip": "Express needs verbally, not just by presence."
        },
        "money_friction": {
            "title": "Financial Anxiety",
            "description": "You hoard resources like firewood for a harsh winter that might not come. This scarcity mindset limits your growth.",
            "quick_tip": "Invest in one small joy this week."
        }
    },
    "page5_solution": {
        "section_name": "Your Action Protocol",
        "locked": false,
        "protocol_name": "Silent Sentinel's Gentle Glow",
        "daily_rituals": [
            { "name": "5-Min Scan", "description": "Write down 3 things that worried you, then cross out ones you can't control." }, // For Alarm
            { "name": "Sensory Deprivation", "description": "Wear noise-cancelling headphones for 15 mins to reset processing." }, // For Processing
            { "name": "Idle Engine", "description": "Sit still for 10 minutes without checking your phone to practice non-doing." } // For Drive
        ]
    }
} as unknown as ResultsData; // Cast to bypass strict type checking if needed for partial debug data

export default function DebugResults() {
    const [showButton, setShowButton] = useState(true);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 100) {
            setShowButton(false);
        } else {
            setShowButton(true);
        }
    });

    return (
        <div className="relative min-h-screen bg-white text-[#402525] font-sans overflow-x-hidden">
            <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-50">DEBUG MODE</div>

            <HeroSection data={DEBUG_DATA} />
            <BlueprintSection data={DEBUG_DATA} />
            <DiagnosticsSection data={DEBUG_DATA} />
            <GlitchSection data={DEBUG_DATA} />
            <ProtocolSection data={DEBUG_DATA} />
            <ChangeCardSection data={DEBUG_DATA} />

            <AnimatePresence>
                {showButton && (
                    <motion.div
                        className="fixed bottom-8 right-8 z-50 pointer-events-auto"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <Button className="bg-[#233F64] text-white">
                            Debug Button
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
