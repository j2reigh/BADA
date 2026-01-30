export type OSMode = 'active' | 'reactive' | 'passive';

export type ThreatMode = 'forward' | 'emotional' | 'freeze';

export type AlignmentType =
    | 'aligned'        // Optimal match
    | 'underutilized'  // Dynamic + Passive
    | 'overdriven'     // Static + Active
    | 'scattered'      // Dynamic + Reactive (v2.1)
    | 'depleted';      // Static + Reactive (v2.1)

export type OperatingLevel = 1 | 2 | 3 | 4 | 5;

export interface ValidityResult {
    validUntil: string; // ISO Date string
    validityWeeks: number;
    urgency: 'low' | 'medium' | 'high';
    reAssessmentReason: string;
}

export interface OperatingResult {
    // User-facing
    level: OperatingLevel;
    levelName: string;
    levelDescription: string;
    guidance: string[];

    // Validity Info (v2.3)
    validity: ValidityResult;

    // System-facing (internal only - for debugging/logging)
    _internal: {
        hardwareType: 'dynamic' | 'static';
        hardwareScore: number;
        osMode: OSMode;
        threatMode: ThreatMode;
        alignmentType: AlignmentType;
        rawRate: number;
        baseRate: number;
        intensityBonus: number;
        interactionPenalty: number;
        elementBalanceCeiling: number;
        finalRate: number;
    };
}

// Operating Level constants
export const OPERATING_LEVELS: Record<OperatingLevel, { name: string; description: string; guidance: string[] }> = {
    1: {
        name: "Survival",
        description: "Energy leaking. System overloaded.",
        guidance: [
            "Prioritize recovery, no expansion",
            "Minimize decision-making",
            "Maintain basic routines only"
        ]
    },
    2: {
        name: "Recovery",
        description: "Restoring core functions. Pivot possible.",
        guidance: [
            "Avoid overambitious goals",
            "Stack small wins",
            "Energy recharge routine essential"
        ]
    },
    3: {
        name: "Stable",
        description: "System running normally. Optimal for routine.",
        guidance: [
            "Maintain current pace",
            "Small-scale expansion possible",
            "Approach big changes carefully"
        ]
    },
    4: {
        name: "Aligned",
        description: "Engine and OS aligned. High-efficiency output possible.",
        guidance: [
            "Good timing for important decisions",
            "Long-term projects can begin",
            "Optimal period for expanding relationships"
        ]
    },
    5: {
        name: "Flow",
        description: "Peak energy utilization. Optimal zone for creation and expansion.",
        guidance: [
            "Short-term breakthroughs possible",
            "Set ambitious goals",
            "Not sustainable — plan recharge cycles"
        ]
    }
};
