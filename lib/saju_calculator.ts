import { Solar } from "lunar-typescript";
import { getCorrectedKST, calculateTrueSolarTime, formatDateForSaju, formatTimeForSaju } from "./time_utils";
import {
  TEN_GODS_MAP,
  ELEMENT_MAP,
  DYNAMIC_GODS,
  STATIC_GODS,
  DYNAMIC_ELEMENTS,
  STATIC_ELEMENTS
} from "./saju_constants";

// Helper to get element using the map
const getElement = (char: string): string => {
  return ELEMENT_MAP[char] || "unknown";
};

interface PillarData {
  gan: string;
  ganElement: string;
  ganGod: string;
  zhi: string;
  zhiElement: string;
  zhiGod: string;
}

export interface HardwareAnalysis {
  hardwareType: 'dynamic' | 'static';
  hardwareScore: number;
  interactionPenalty: number;
  details: {
    tenGodsScore: number;
    bodyStrengthScore: number;
  };
}

export interface SajuResult {
  fourPillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData | null;
  };
  elementCounts: {
    wood: number; fire: number; earth: number; metal: number; water: number;
  };
  dayMasterStrength: number; // 0-100 점수
  dayMasterCategory: 'strong' | 'weak' | 'balanced';
  tenGodsAnalysis: {
    dominant: string;
    distribution: Record<string, number>;
  };
  // Future: operatingRate will be calculated in routes.ts using alignment
  stats: {
    operatingRate: number; // Legacy support (rough estimate)
  };
  hardwareAnalysis: HardwareAnalysis;
  solarTimeDebug?: any; // True Solar Time debug metadata
}

// v2.2 Interaction Penalty Logic
function getInteractionPenalty(
  dayMasterCategory: 'strong' | 'weak' | 'balanced',
  tenGodsDistribution: Record<string, number>
): number {
  let penalty = 0;

  // 재성(財星) 개수 (Control)
  const jaeCount = (tenGodsDistribution['편재'] || 0) + (tenGodsDistribution['정재'] || 0);
  // 관성(官星) 개수 (Pressure)
  const gwanCount = (tenGodsDistribution['편관'] || 0) + (tenGodsDistribution['정관'] || 0);
  // 식상(食傷) 개수 (Output)
  const sikCount = (tenGodsDistribution['식신'] || 0) + (tenGodsDistribution['상관'] || 0);

  // 1. 신약 + 재성 과다 (≥2) → 번아웃 가속 (-3)
  // "목표는 큰데(재성), 내가 약해서(신약) 감당하기 힘듦"
  if (dayMasterCategory === 'weak' && jaeCount >= 2) {
    penalty -= 3;
  }

  // 2. 신강 + 관성 과다 (≥2) → 통제 충돌 (-2)
  // "나는 강한데(신강), 외부 압력도 강해서(관성) 갈등 발생"
  if (dayMasterCategory === 'strong' && gwanCount >= 2) {
    penalty -= 2;
  }

  // 3. 신약 + 식상 과다 (≥2) → 에너지 고갈 (-2)
  // "나는 약한데(신약), 너무 많이 쏟아내서(식상) 탈진"
  if (dayMasterCategory === 'weak' && sikCount >= 2) {
    penalty -= 2;
  }

  // 4. 신강 + 재성 과다 (≥2) → 추진력 보너스 (+2)
  // "나는 강하고(신강), 목표도 뚜렷해서(재성) 성취력 높음"
  if (dayMasterCategory === 'strong' && jaeCount >= 2) {
    penalty += 2;
  }

  return penalty;
}

export interface SajuOptions {
  latitude?: number;
  longitude?: number;
  timezone?: string;         // legacy fallback
  birthTimeUnknown?: boolean;
}

export const calculateSaju = (dateStr: string, timeStr: string, options?: SajuOptions): SajuResult => {
  // Support legacy 4-arg signature: calculateSaju(date, time, timezone?, birthTimeUnknown?)
  const opts: SajuOptions = options || {};
  const birthTimeUnknown = opts.birthTimeUnknown;

  try {
    let year: number, month: number, day: number, hour: number, minute: number;
    let solarTimeDebug: any = null;

    if (opts.latitude !== undefined && opts.longitude !== undefined) {
      // New path: True Solar Time from coordinates
      const tst = calculateTrueSolarTime(dateStr, timeStr, opts.latitude, opts.longitude);
      year = tst.year;
      month = tst.month;
      day = tst.day;
      hour = tst.hour;
      minute = tst.minute;
      solarTimeDebug = tst.debug;

      console.log('True Solar Time Applied:', {
        original: { date: dateStr, time: timeStr, lat: opts.latitude, lon: opts.longitude },
        result: { year, month, day, hour, minute },
        debug: tst.debug,
      });
    } else if (opts.timezone && opts.timezone !== 'Asia/Seoul') {
      // Legacy path: timezone-based KST conversion
      const corrected = getCorrectedKST(dateStr, timeStr, opts.timezone);
      year = corrected.year;
      month = corrected.month;
      day = corrected.day;
      hour = corrected.hour;
      minute = corrected.minute;

      console.log('DST Correction Applied (legacy):', {
        original: { date: dateStr, time: timeStr, timezone: opts.timezone },
        corrected: { year, month, day, hour, minute },
        isDstApplied: corrected.isDstApplied,
        debugInfo: corrected.debugInfo
      });
    } else {
      // Default: direct parse (Seoul)
      [year, month, day] = dateStr.split("-").map(Number);
      [hour, minute] = timeStr.split(":").map(Number);
    }

    // 1. Create Solar & Lunar objects using KST values
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 2. Get 'EightChar' (BaZi logic handler)
    const eightChar = lunar.getEightChar();
    eightChar.setSect(2); // Standard Modern Saju

    // Helper to extract data for a pillar
    const getPillarData = (
      gan: string,
      zhi: string,
      ganGodChinese: string,
      zhiGodChinese: string[]
    ): PillarData => {
      const mainZhiGod = zhiGodChinese.length > 0 ? zhiGodChinese[0] : "";

      // Map Chinese Ten Gods to Korean using logic found in existing calculator
      // Note: TEN_GODS_MAP in saju_constants.ts is English mapping. 
      // We need simple Chinese->Korean mapping here.
      // Since TEN_GODS_MAP structure changed, we'll redefine the simple map locally for now
      // or rely on a helper if available.
      // Let's create a local map for Chinese -> Korean as saju_constants seems to have English structures
      const CH2KO_GENERATOR: Record<string, string> = {
        // Traditional Chinese (번체)
        "比肩": "비견", "劫財": "겁재",
        "食神": "식신", "傷官": "상관",
        "偏財": "편재", "正財": "정재",
        "七殺": "편관", "正官": "정관",
        "偏印": "편인", "正印": "정인",
        // Simplified Chinese (간체) — lunar-typescript 지지 십신에서 리턴
        "劫财": "겁재",
        "伤官": "상관",
        "偏财": "편재", "正财": "정재",
        "七杀": "편관",
      };

      return {
        gan,
        ganElement: getElement(gan),
        ganGod: CH2KO_GENERATOR[ganGodChinese] || ganGodChinese,
        zhi,
        zhiElement: getElement(zhi),
        zhiGod: CH2KO_GENERATOR[mainZhiGod] || mainZhiGod
      };
    };

    // 3. Build Result (Initialize counts to 0)
    const result: SajuResult = {
      fourPillars: {
        year: getPillarData(
          eightChar.getYearGan(),
          eightChar.getYearZhi(),
          eightChar.getYearShiShenGan(),
          eightChar.getYearShiShenZhi()
        ),
        month: getPillarData(
          eightChar.getMonthGan(),
          eightChar.getMonthZhi(),
          eightChar.getMonthShiShenGan(),
          eightChar.getMonthShiShenZhi()
        ),
        day: getPillarData(
          eightChar.getDayGan(),
          eightChar.getDayZhi(),
          "비견", // Day Master is always Self
          eightChar.getDayShiShenZhi()
        ),
        hour: birthTimeUnknown ? null : getPillarData(
          eightChar.getTimeGan(),
          eightChar.getTimeZhi(),
          eightChar.getTimeShiShenGan(),
          eightChar.getTimeShiShenZhi()
        ),
      },
      elementCounts: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
      dayMasterStrength: 0,
      dayMasterCategory: 'balanced' as const,
      tenGodsAnalysis: {
        dominant: '',
        distribution: {}
      },
      stats: { operatingRate: 0 },
      hardwareAnalysis: { // Initial placeholder
        hardwareType: 'static',
        hardwareScore: 0,
        interactionPenalty: 0,
        details: { tenGodsScore: 0, bodyStrengthScore: 0 }
      }
    };

    // 4. Calculate Element Counts (6 or 8 elements depending on hour pillar)
    const allElements = [
      result.fourPillars.year.ganElement, result.fourPillars.year.zhiElement,
      result.fourPillars.month.ganElement, result.fourPillars.month.zhiElement,
      result.fourPillars.day.ganElement, result.fourPillars.day.zhiElement,
      ...(result.fourPillars.hour ? [result.fourPillars.hour.ganElement, result.fourPillars.hour.zhiElement] : []),
    ];

    allElements.forEach(el => {
      if (el && result.elementCounts[el as keyof typeof result.elementCounts] !== undefined) {
        result.elementCounts[el as keyof typeof result.elementCounts]++;
      }
    });

    // 5. Calculate Ten Gods Distribution (5 or 7 gods depending on hour pillar)
    const tenGodsCount: Record<string, number> = {};

    [
      result.fourPillars.year.ganGod, result.fourPillars.year.zhiGod,
      result.fourPillars.month.ganGod, result.fourPillars.month.zhiGod,
      result.fourPillars.day.zhiGod,
      ...(result.fourPillars.hour ? [result.fourPillars.hour.ganGod, result.fourPillars.hour.zhiGod] : []),
    ].forEach(god => {
      if (god && god !== "비견") { // Typically exclude Day Master's own self-element? No, 비견/겁재 are valid gods
        tenGodsCount[god] = (tenGodsCount[god] || 0) + 1;
      } else if (god === "비견") {
        tenGodsCount[god] = (tenGodsCount[god] || 0) + 1;
      }
    });

    const dominantTenGod = Object.entries(tenGodsCount).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    result.tenGodsAnalysis = {
      dominant: dominantTenGod,
      distribution: tenGodsCount
    };

    // 6. Calculate Day Master Strength
    const dayMasterElement = result.fourPillars.day.ganElement;
    const supportingElements = Object.entries(result.elementCounts)
      .filter(([element]) => element === dayMasterElement ||
        (dayMasterElement === 'wood' && element === 'water') ||
        (dayMasterElement === 'fire' && element === 'wood') ||
        (dayMasterElement === 'earth' && element === 'fire') ||
        (dayMasterElement === 'metal' && element === 'earth') ||
        (dayMasterElement === 'water' && element === 'metal'))
      .reduce((sum, [, count]) => sum + count, 0);

    const totalElements = Object.values(result.elementCounts).reduce((sum, count) => sum + count, 0);
    const strengthRatio = supportingElements / totalElements;

    result.dayMasterStrength = Math.round(strengthRatio * 100);
    result.dayMasterCategory =
      result.dayMasterStrength >= 60 ? 'strong' :
        result.dayMasterStrength <= 40 ? 'weak' : 'balanced';

    // 7. Calculate Hardware Score (v2.3 Core Logic)
    let tenGodsScore = 0;

    // Ten Gods Contribution
    Object.entries(tenGodsCount).forEach(([god, count]) => {
      if (DYNAMIC_GODS.includes(god)) tenGodsScore += count;
      if (STATIC_GODS.includes(god)) tenGodsScore -= count;
    });

    // Body Strength Contribution (Shin-gang/Shin-yak)
    // Strong body = More capacity for output/control (Dynamic bias) -> + Score
    // Weak body = Need for support/resource (Static bias) -> - Score
    let bodyStrengthScore = 0;
    if (result.dayMasterCategory === 'strong') bodyStrengthScore = 2;
    if (result.dayMasterCategory === 'weak') bodyStrengthScore = -2;

    const rawHardwareScore = tenGodsScore + bodyStrengthScore;

    // Determine Hardware Type based on raw score
    const hardwareType = rawHardwareScore >= 0 ? 'dynamic' : 'static';

    // Calculate Interaction Penalty (v2.2)
    const interactionPenalty = getInteractionPenalty(result.dayMasterCategory, tenGodsCount);

    // Save Analysis
    result.hardwareAnalysis = {
      hardwareType,
      hardwareScore: rawHardwareScore, // v2.3 uses raw score for intensity calc later
      interactionPenalty,
      details: {
        tenGodsScore,
        bodyStrengthScore
      }
    };

    // 8. Legacy Operating Rate (Rough Estimation for backward compatibility)
    // We can just set a default here, or use the old logic.
    // Let's keep it simple for now, as the real calc happens in routes.ts with Survey data
    result.stats.operatingRate = 50;

    // Attach True Solar Time debug if available
    if (solarTimeDebug) {
      result.solarTimeDebug = solarTimeDebug;
    }

    return result;

  } catch (error) {
    console.error("Saju Calculation Error:", error);
    throw new Error("Calculation Failed");
  }
};