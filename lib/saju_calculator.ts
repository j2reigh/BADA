import { Solar } from "lunar-typescript";
import { getCorrectedKST, formatDateForSaju, formatTimeForSaju } from "./time_utils";

// 1. Korean Mappings (십성: 한자 -> 한글)
const TEN_GODS_MAP: Record<string, string> = {
  "比肩": "비견", "劫財": "겁재",
  "食神": "식신", "傷官": "상관",
  "偏財": "편재", "正財": "정재",
  "七殺": "편관", "正官": "정관",
  "偏印": "편인", "正印": "정인"
};

// 2. Element Mappings Helper (오행: 글자 -> 영어)
const getElement = (char: string): string => {
  const WOOD = ["甲", "乙", "寅", "卯"];
  const FIRE = ["丙", "丁", "巳", "午"];
  const EARTH = ["戊", "己", "辰", "戌", "丑", "未"];
  const METAL = ["庚", "辛", "申", "酉"];
  const WATER = ["壬", "癸", "亥", "子"];

  if (WOOD.includes(char)) return "wood";
  if (FIRE.includes(char)) return "fire";
  if (EARTH.includes(char)) return "earth";
  if (METAL.includes(char)) return "metal";
  if (WATER.includes(char)) return "water";
  return "unknown";
};

interface PillarData {
  gan: string;
  ganElement: string;
  ganGod: string;
  zhi: string;
  zhiElement: string;
  zhiGod: string;
}

export interface SajuResult {
  fourPillars: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
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
  stats: {
    operatingRate: number;
  };
}

export const calculateSaju = (dateStr: string, timeStr: string, timezone?: string): SajuResult => {
  try {
    let year: number, month: number, day: number, hour: number, minute: number;

    if (timezone && timezone !== 'Asia/Seoul') {
      const corrected = getCorrectedKST(dateStr, timeStr, timezone);
      year = corrected.year;
      month = corrected.month;
      day = corrected.day;
      hour = corrected.hour;
      minute = corrected.minute;
      
      console.log('DST Correction Applied:', {
        original: { date: dateStr, time: timeStr, timezone },
        corrected: { year, month, day, hour, minute },
        isDstApplied: corrected.isDstApplied,
        debugInfo: corrected.debugInfo
      });
    } else {
      [year, month, day] = dateStr.split("-").map(Number);
      [hour, minute] = timeStr.split(":").map(Number);
    }

    // 1. Create Solar & Lunar objects using KST values
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 2. Get 'EightChar' (BaZi logic handler)
    // This automatically handles Jeolgi (Solar Terms) for correct Year/Month pillars
    const eightChar = lunar.getEightChar();

    // Set Sect to 2 (Standard Modern Saju - starts year at Ipchun, starts day at Midnight)
    eightChar.setSect(2); 

    // Helper to extract data for a pillar
    const getPillarData = (
      gan: string, 
      zhi: string, 
      ganGodChinese: string, 
      zhiGodChinese: string[]
    ): PillarData => {
      // zhiGodChinese is an array of hidden stems' gods. We take the first one (Main Qi usually depends on library, but taking first for now)
      const mainZhiGod = zhiGodChinese.length > 0 ? zhiGodChinese[0] : "";
      
      return {
        gan,
        ganElement: getElement(gan),
        ganGod: TEN_GODS_MAP[ganGodChinese] || ganGodChinese,
        zhi,
        zhiElement: getElement(zhi),
        zhiGod: TEN_GODS_MAP[mainZhiGod] || mainZhiGod
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
        hour: getPillarData(
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
      stats: { operatingRate: 0 }
    };

    // 4. Calculate Element Counts (Logic that updates the zeros!)
    const allElements = [
      result.fourPillars.year.ganElement, result.fourPillars.year.zhiElement,
      result.fourPillars.month.ganElement, result.fourPillars.month.zhiElement,
      result.fourPillars.day.ganElement, result.fourPillars.day.zhiElement,
      result.fourPillars.hour.ganElement, result.fourPillars.hour.zhiElement,
    ];

    allElements.forEach(el => {
      // If the element exists in our keys (wood, fire, etc.), increment the count
      if (el && result.elementCounts[el as keyof typeof result.elementCounts] !== undefined) {
        result.elementCounts[el as keyof typeof result.elementCounts]++;
      }
    });

    // 5. Calculate Ten Gods Analysis
    const tenGodsCount: Record<string, number> = {};
    [result.fourPillars.year.ganGod, result.fourPillars.month.ganGod, 
     result.fourPillars.day.ganGod, result.fourPillars.hour.ganGod].forEach(god => {
      if (god) {
        tenGodsCount[god] = (tenGodsCount[god] || 0) + 1;
      }
    });
    
    const dominantTenGod = Object.entries(tenGodsCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
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

    // 7. Calculate Operating Rate (Enhanced with Day Master consideration)
    const counts = Object.values(result.elementCounts);
    const maxCount = Math.max(...counts);
    const zeroCount = counts.filter(c => c === 0).length;
    
    // Penalize for excessive dominance and missing elements
    const imbalancePenalty = (maxCount > 3 ? (maxCount - 3) * 10 : 0) + (zeroCount * 5);
    // Bonus for balanced Day Master
    const balanceBonus = result.dayMasterCategory === 'balanced' ? 5 : 0;
    
    result.stats.operatingRate = Math.max(40, 100 - imbalancePenalty + balanceBonus);

    return result;

  } catch (error) {
    console.error("Saju Calculation Error:", error);
    throw new Error("Calculation Failed");
  }
};