import {
    OSMode,
    ThreatMode,
    AlignmentType,
    OperatingLevel,
    OperatingResult,
    OPERATING_LEVELS,
    ValidityResult
} from "../shared/operating_types";
import { HardwareAnalysis, SajuResult } from "./saju_calculator";

// Types for Survey Data
export interface SurveyScores {
    threatScore: number;        // 0-3
    threatClarity: number;      // 0 or 1
    environmentScore: number;   // 0-2
    environmentStable: number;  // 0 or 1
    agencyScore: number;        // 0-3
    agencyActive: number;       // 0 or 1
    // v2.1: Raw answers needed for ThreatMode
    answers: {
        q1: string; // Threat 1
        q2: string; // Threat 2
        q3: string; // Threat 3
        [key: string]: string;
    };
}

// 1. Determine OS Mode (3-stage: Active / Reactive / Passive)
export function determineOSMode(scores: SurveyScores): OSMode {
    const { agencyActive, environmentStable } = scores;

    // Active: High Agency (Intentional Action)
    // Even if environment is unstable, if agency is high, it's Active (Combat mode)
    if (agencyActive === 1) return 'active';

    // Reactive: Low Agency + Unstable Environment (Survival mode)
    if (agencyActive === 0 && environmentStable === 0) return 'reactive';

    // Passive: Low Agency + Stable Environment (Drifting mode)
    return 'passive';
}

// 2. Determine Threat Mode (Directionality)
export function determineThreatMode(answers: { q1: string; q2: string; q3: string }): ThreatMode {
    const threatAnswers = [answers.q1, answers.q2, answers.q3];

    // Assuming answers maps to 'A', 'B', 'C' concepts (need to verify mapping with frontend/survey)
    // Usually: A = Fight/Active, B = Flight/Emotional, C = Freeze/Avoid
    // Let's assume the raw values might be indices or labels. 
    // For now, let's implement based on checking the string content if it follows "A, B, C" pattern
    // Or simply count occurrences.

    // Note: We need to ensure the caller passes normalize answers (A, B, C).
    // If actual values are full text, we need mapping logic. 
    // Let's assume normalized input for this pure function.

    const aCount = threatAnswers.filter(a => a === 'A').length;
    // const bCount = threatAnswers.filter(a => a === 'B').length;
    const cCount = threatAnswers.filter(a => a === 'C').length;

    // Forward: Aggressive/Active response dominant
    if (aCount >= 2) return 'forward';

    // Freeze: Freeze response present and lack of aggression
    if (cCount >= 1 && aCount < 2) return 'freeze';

    // Emotional: Default fallthrough (usually B dominant or mixed)
    return 'emotional';
}

// 3. Calculate Normalized Intensity Bonus (with Damping & ThreatMode)
function calculateIntensityBonus(
    hardwareScore: number,
    osMode: OSMode,
    threatMode: ThreatMode
): number {
    const absScore = Math.abs(hardwareScore);
    let bonus = 0;

    // Step 1: Base Matched Bonus
    // Dynamic(>0) + Active OR Static(<0) + Passive
    const isHardwareDynamic = hardwareScore > 0;
    const isHardwareStatic = hardwareScore < 0; // or 0 treated as slight static bias? let's say < 0

    // Refined check: 0 score -> Moderately Dynamic (default bias in calc)
    const effectiveHardwareType = hardwareScore >= 0 ? 'dynamic' : 'static';

    if (
        (effectiveHardwareType === 'dynamic' && osMode === 'active') ||
        (effectiveHardwareType === 'static' && osMode === 'passive')
    ) {
        bonus = Math.min(10, absScore * 1.5); // Max +10
    } else if (osMode === 'reactive') {
        bonus = -Math.min(20, absScore * 2.5); // Reactive is harsh penalty
    } else {
        // Mismatched (Dynamic+Passive or Static+Active)
        bonus = -Math.min(15, absScore * 2); // Max -15
    }

    // Step 2: Extreme Value Damping (v2.1)
    // "Engine overheat protection"
    if (absScore > 6) {
        bonus *= 0.7; // 30% Damping
    } else if (absScore > 4) {
        bonus *= 0.85; // 15% Damping
    }

    // Step 3: ThreatMode Corrections
    if (threatMode === 'freeze' && effectiveHardwareType === 'dynamic') {
        bonus -= 5; // Engine wants to go, but brakes are on
    }
    if (threatMode === 'emotional' && effectiveHardwareType === 'static') {
        bonus -= 3; // Engine wants calm, but emotions are turbulent
    }
    if (threatMode === 'forward' && effectiveHardwareType === 'dynamic' && osMode === 'active') {
        bonus += 3; // Synergy bonus
    }

    return Math.round(bonus);
}

// 4. Element Balance Ceiling (v2.2)
function getElementBalanceCeiling(elementCounts: { [key: string]: number }): number {
    const counts = Object.values(elementCounts);
    const zeroCount = counts.filter(c => c === 0).length;
    const maxCount = Math.max(...counts);

    // Perfect Balance (No missing, No excess > 3)
    if (zeroCount === 0 && maxCount <= 3) return 105;

    // Good Balance (No missing)
    if (zeroCount === 0) return 103;

    // Slight Imbalance (1 missing)
    if (zeroCount === 1) return 100;

    // Serious Imbalance (2+ missing) -> Limit performance
    return 97;
}

// 5. Operating Level Converter
function rateToLevel(rate: number): OperatingLevel {
    if (rate < 35) return 1; // Survival
    if (rate < 50) return 2; // Recovery
    if (rate < 65) return 3; // Stable
    if (rate < 80) return 4; // Aligned
    return 5;                // Flow
}

// 6. Validity Calculation (v2.3)
function calculateValidity(
    level: OperatingLevel,
    alignmentType: AlignmentType,
    osMode: OSMode,
    surveyDate: Date = new Date()
): ValidityResult {

    const BASE_WEEKS: Record<OperatingLevel, number> = {
        1: 4, 2: 6, 3: 12, 4: 16, 5: 8
    };

    const ALIGNMENT_MOD: Record<AlignmentType, number> = {
        aligned: 4, underutilized: 0, overdriven: -2, scattered: -4, depleted: -4
    };

    const OS_MOD: Record<OSMode, number> = {
        active: 0, reactive: -4, passive: 2
    };

    let weeks = BASE_WEEKS[level];
    weeks += ALIGNMENT_MOD[alignmentType];
    weeks += OS_MOD[osMode];

    weeks = Math.max(2, Math.min(20, weeks));

    const validUntil = new Date(surveyDate);
    validUntil.setDate(validUntil.getDate() + (weeks * 7));

    // Determine Reason Message
    let reAssessmentReason = "Re-assess in 3 months or when circumstances change.";
    if (level === 1) reAssessmentReason = "You're in survival mode. Track recovery closely.";
    else if (level === 5) reAssessmentReason = "Flow state is unsustainable. Check back soon.";
    else if (osMode === 'reactive') reAssessmentReason = "Reactive states shift quickly.";
    else if (alignmentType === 'aligned') reAssessmentReason = "Stable alignment. Re-assess after major changes.";

    return {
        validUntil: validUntil.toISOString(),
        validityWeeks: weeks,
        urgency: weeks <= 4 ? 'high' : weeks <= 8 ? 'medium' : 'low',
        reAssessmentReason
    };
}

// === MAIN ANALYZER FUNCTION ===
export function analyzeOperatingState(
    sajuResult: SajuResult,
    surveyScores: SurveyScores
): OperatingResult {
    const { hardwareAnalysis } = sajuResult;
    const { hardwareType, hardwareScore, interactionPenalty } = hardwareAnalysis;

    // 1. Analyze OS
    const osMode = determineOSMode(surveyScores);
    const threatMode = determineThreatMode({
        q1: surveyScores.answers.q1,
        q2: surveyScores.answers.q2,
        q3: surveyScores.answers.q3
    });

    // 2. Determine Alignment Type
    let alignmentType: AlignmentType;
    let baseRate: number;

    if (hardwareType === 'dynamic') {
        if (osMode === 'active') {
            alignmentType = 'aligned';
            baseRate = 90;
        } else if (osMode === 'reactive') {
            alignmentType = 'scattered'; // v2.1
            baseRate = 55;
        } else { // passive
            alignmentType = 'underutilized';
            baseRate = 60;
        }
    } else { // static
        if (osMode === 'passive') {
            alignmentType = 'aligned';
            baseRate = 90;
        } else if (osMode === 'reactive') {
            alignmentType = 'depleted'; // v2.1
            baseRate = 50;
        } else { // active
            alignmentType = 'overdriven';
            baseRate = 65;
        }
    }

    // 3. Calculate Rate Components
    const intensityBonus = calculateIntensityBonus(hardwareScore, osMode, threatMode);
    const elementCeiling = getElementBalanceCeiling(sajuResult.elementCounts);

    // 4. Final Operating Rate
    const rawRate = baseRate + intensityBonus + interactionPenalty;
    // Apply Floor (25%) and Ceiling (Element Balance)
    const finalRate = Math.min(Math.max(rawRate, 25), elementCeiling);

    // 5. Determine Level
    const level = rateToLevel(finalRate);
    const levelInfo = OPERATING_LEVELS[level];

    // 6. Calculate Validity
    const validity = calculateValidity(level, alignmentType, osMode);

    return {
        level,
        levelName: levelInfo.name,
        levelDescription: levelInfo.description,
        guidance: levelInfo.guidance,
        validity,
        _internal: {
            hardwareType,
            hardwareScore,
            osMode,
            threatMode,
            alignmentType,
            rawRate,
            baseRate,
            intensityBonus,
            interactionPenalty,
            elementBalanceCeiling: elementCeiling,
            finalRate
        }
    };
}
